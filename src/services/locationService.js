const { redisClient } = require("../config/redisConfig");

class LocationService {
  constructor() {}

  // set driver socket
  async setDriverSocket(driverId, socketId) {
    try {
      await redisClient.set(`driver:${driverId}`, socketId);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // get driver socket
  async getDriverSocket(driverId) {
    try {
      const driverDetails = await redisClient.get(`driver:${driverId}`);
      return driverDetails;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  // Remove driver socket
  async delDriverSocket(driverId) {
    try {
      await redisClient.del(`driver:${driverId}`);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async findNearByDrivers(latitude, longitude, radiusKm) {
    try {
      const nearByDrivers = await redisClient.sendCommand([
        "GEORADIUS",
        "drivers",
        latitude.toString(),
        longitude.toString(),
        radiusKm.toString(),
        "km",
        "WITHCOORD",
      ]);
      return nearByDrivers;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async addDriverLocation(driverId, latitude, longitude) {
    try {
      await redisClient.sendCommand([
        "GEOADD",
        "drivers",
        latitude.toString(),
        longitude.toString(),
        driverId.toString(),
      ]);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async storeNotifiedDrivers(bookingId, driverIds) {
    try {
      for (let driverId of driverIds) {
        // [notifiedDrivers:bkg1 => [1, 4, 5]]
        const addedCount = await redisClient.sAdd(
          `notifiedDrivers:${bookingId}`,
          driverId,
        );
      }
    } catch (error) {
      console.log(error);
      throw error;
    }
  }

  async getNotifiedDrivers(bookingId) {
    try {
      return await redisClient.sMembers(`notifiedDrivers:${bookingId}`);
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
}

module.exports = new LocationService();
