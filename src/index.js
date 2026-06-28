const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");

const { PORT, CLIENT_URL } = require("./config/serverConfig");
const connectDB = require("./config/dbConfig");
const { connectRedis, redisClient } = require("./config/redisConfig");
const locationService = require("./services/locationService");
const { startBookingWorker } = require("./workers/bookingWorker");
const {
  bookingRouter,
  authRouter,
  driverRouter,
  passengerRouter,
} = require("./routes");

const corsOptions = {
  origin: CLIENT_URL,
  optionsSuccessStatus: 200,
};

const socketOptions = {
  cors: {
    origin: CLIENT_URL,
    methods: ["GET", "POST"],
  },
};

const app = express();
const server = http.createServer(app);
const io = new Server(server, socketOptions);
let bookingWorker;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));
app.use(cors(corsOptions));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Drivo backend is running",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      uptime: process.uptime(),
      redis: redisClient.isOpen ? "connected" : "disconnected",
    },
    message: "OK",
  });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/drivers", driverRouter);
app.use("/api/v1/bookings", bookingRouter(io));
app.use("/api/v1/passengers", passengerRouter(io));

app.use((req, res) => {
  res.status(404).json({
    success: false,
    data: {},
    error: "Route not found",
    message: `${req.method} ${req.originalUrl} is not available`,
  });
});

app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    data: {},
    error: error.message || "Internal server error",
    message: "Request failed",
  });
});

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
        await locationService.removeDriverLocation(socket.driverId);
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
  bookingWorker = startBookingWorker(io);

  server.listen(PORT, () => {
    console.log(`Server is listening on port http://localhost:${PORT}`);
  });
};

if (require.main === module) {
  startServer();
}

const shutdown = async () => {
  try {
    if (bookingWorker) {
      await bookingWorker.close();
    }

    if (redisClient.isOpen) {
      await redisClient.quit();
    }

    server.close(() => {
      process.exit(0);
    });
  } catch (error) {
    console.error("Graceful shutdown failed", error);
    process.exit(1);
  }
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

module.exports = { app, server, io };
