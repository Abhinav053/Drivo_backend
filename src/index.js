const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");

const { PORT } = require("./config/serverConfig");
const connectDB = require("./config/dbConfig");
const {connectRedis} = require("./config/redisConfig");
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
    origin: "http://127.0.0.1:/5055",
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

server.listen(PORT, async () => {
  console.log(`🚀 Server is listening on port http://localhost:${PORT}`);
  connectDB();
  connectRedis();
});

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on("registerDriver", async (driverId) => {
    await locationService.setDriverSocket(driverId, socket.id);
  });

  socket.on("disconnect", async (driverId) => {
    const id = await locationService.getDriverSocket(
      `driver:${driverId}`,
    );
    if (id) {
      await locationService.delDriverSocket(id);
    }
  });
});
