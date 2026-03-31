# Uber Backend Project


## Tech
- ExpressJs
- MongoDB
- Redis Cache
- Socket.io


2. Model
- user -> role -> enum {}
  - passenger and driver



- Booking -> not always accepted by the driver

- Booking -> Pending  -> accepted by the driver -> canceled -> pending....(10 mins)....canceled.


## Redis DB

> redisClient.add("key", "value")
> redisClient.remove("key")

- where we need to import and use the redis client
  - passenger  => redisClient.add()
  - booking  => redisClient.add()
  - driver  => redisClient.add()


- best way to use redis client -> make a wrapper class and implement CRUD and needed function and exports and use it.




# Sockets
----------

- 2 PASSENGER
   - passenger1 login -> /createBooking -> booking object create -> pending state -> driver: null (update -> assigned) -> notify nearby driver (5km radius)
        > Only 3 driver founds -> all 3 notified
        > 1 driver accepts booking -> /confirmBooking api
        > Booking notification should be removed from the rest of the drivers
        > driverID update


- 5 DRIVER
   - driver1 login -> means available to take booking -> unique socketConnection open
   - driver2 login -> means available to take booking -> unique socketConnection open
   - driver3 login -> means available to take booking -> unique socketConnection open
   - driver4 login -> means available to take booking -> unique socketConnection open
   - driver5 login -> means available to take booking -> unique socketConnection open