const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");

const { PORT } = require("./config/serverConfig");
const connectDB = require("./config/dbConfig");
const { connectRedis } = require("./config/redisConfig");
const locationService = require("./services/locationService");
const {
  bookingRouter,
  authRouter,
  driverRouter,
  passengerRouter,
} = require("./routes");

const corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
};

const socketOptions = {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, socketOptions);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.send("hello");
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/drivers", driverRouter);
app.use("/api/v1/bookings", bookingRouter(io));
app.use("/api/v1/passengers", passengerRouter(io));

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on("registerDriver", async (driverId) => {
    try {
      socket.driverId = driverId;
      await locationService.setDriverSocket(driverId, socket.id);
    } catch (error) {
      socket.emit("socket-error", { message: error.message });
    }
  });

  socket.on("registerPassenger", async (passengerId) => {
    try {
      socket.passengerId = passengerId;
      await locationService.setPassengerSocket(passengerId, socket.id);
    } catch (error) {
      socket.emit("socket-error", { message: error.message });
    }
  });

  socket.on("driver-location", async ({ driverId, latitude, longitude }) => {
    try {
      const id = driverId || socket.driverId;

      await locationService.addDriverLocation(
        id,
        parseFloat(latitude),
        parseFloat(longitude),
      );
    } catch (error) {
      socket.emit("socket-error", { message: error.message });
    }
  });

  socket.on("disconnect", async () => {
    try {
      if (socket.driverId) {
        await locationService.delDriverSocket(socket.driverId);
      }

      if (socket.passengerId) {
        await locationService.delPassengerSocket(socket.passengerId);
      }
    } catch (error) {
      console.log("Socket disconnect cleanup failed", error);
    }
  });
});

const startServer = async () => {
  await connectDB();
  await connectRedis();

  server.listen(PORT, () => {
    console.log(`Server is listening on port http://localhost:${PORT}`);
  });
};

startServer();

module.exports = { app, server, io };
