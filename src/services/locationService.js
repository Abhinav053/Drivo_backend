const { redisClient } = require("../config/redisConfig");

class LocationService {
  async setDriverSocket(driverId, socketId) {
    try {
      if (!driverId || !socketId) {
        throw new Error("driverId and socketId are required");
      }

      await redisClient.set(`driver:${driverId}`, socketId);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getDriverSocket(driverId) {
    try {
      if (!driverId) {
        return null;
      }

      return await redisClient.get(`driver:${driverId}`);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async delDriverSocket(driverId) {
    try {
      if (!driverId) {
        return;
      }

      await redisClient.del(`driver:${driverId}`);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async setPassengerSocket(passengerId, socketId) {
    try {
      if (!passengerId || !socketId) {
        throw new Error("passengerId and socketId are required");
      }

      await redisClient.set(`passenger:${passengerId}`, socketId);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getPassengerSocket(passengerId) {
    try {
      if (!passengerId) {
        return null;
      }

      return await redisClient.get(`passenger:${passengerId}`);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async delPassengerSocket(passengerId) {
    try {
      if (!passengerId) {
        return;
      }

      await redisClient.del(`passenger:${passengerId}`);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findNearByDrivers(latitude, longitude, radiusKm) {
    try {
      this.validateCoordinates(latitude, longitude);
      this.validateRadius(radiusKm);

      return await redisClient.sendCommand([
        "GEORADIUS",
        "drivers",
        longitude.toString(),
        latitude.toString(),
        radiusKm.toString(),
        "km",
        "WITHCOORD",
      ]);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async addDriverLocation(driverId, latitude, longitude) {
    try {
      if (!driverId) {
        throw new Error("driverId is required");
      }

      this.validateCoordinates(latitude, longitude);

      await redisClient.sendCommand([
        "GEOADD",
        "drivers",
        longitude.toString(),
        latitude.toString(),
        driverId.toString(),
      ]);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async storeNotifiedDrivers(bookingId, driverIds) {
    try {
      if (!bookingId) {
        throw new Error("bookingId is required");
      }

      if (!Array.isArray(driverIds) || driverIds.length === 0) {
        return;
      }

      await redisClient.sAdd(
        `notifiedDrivers:${bookingId}`,
        driverIds.map((driverId) => driverId.toString()),
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getNotifiedDrivers(bookingId) {
    try {
      if (!bookingId) {
        return [];
      }

      return await redisClient.sMembers(`notifiedDrivers:${bookingId}`);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async isDriverNotified(bookingId, driverId) {
    try {
      if (!bookingId || !driverId) {
        return false;
      }

      return await redisClient.sIsMember(
        `notifiedDrivers:${bookingId}`,
        driverId.toString(),
      );
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  validateCoordinates(latitude, longitude) {
    if (
      Number.isNaN(latitude) ||
      Number.isNaN(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      throw new Error("Invalid latitude or longitude");
    }
  }

  validateRadius(radiusKm) {
    if (Number.isNaN(radiusKm) || radiusKm <= 0) {
      throw new Error("Invalid radius");
    }
  }
}

module.exports = new LocationService();
