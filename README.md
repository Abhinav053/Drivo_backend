# 🚗 Uber Backend - Ride-Sharing Platform API

A full-featured **ride-sharing backend service** built with Node.js, Express, MongoDB, Redis, and WebSockets. This project implements a modern Uber-like system that matches passengers with nearby drivers in real-time.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Architecture](#project-architecture)
4. [Installation & Setup](#installation--setup)
5. [Environment Variables](#environment-variables)
6. [API Endpoints](#api-endpoints)
7. [WebSocket Events](#websocket-events)
8. [Database Models](#database-models)
9. [Key Features](#key-features)
10. [Folder Structure](#folder-structure)
11. [How It Works](#how-it-works)
12. [Services Explained](#services-explained)
13. [Redis Caching Strategy](#redis-caching-strategy)

---

## 🎯 Project Overview

This is a **production-ready backend API** for a ride-sharing application similar to Uber. It handles:

- **User Authentication** (Passengers & Drivers)
- **Real-time Booking System** (WebSocket-based)
- **Driver-Passenger Matching** (Geolocation-based within 5km radius)
- **Booking Management** (Status tracking: pending → confirmed → completed/canceled)
- **Location Tracking** (Real-time driver location updates)
- **Passenger Feedback & Ratings** (After ride completion)
- **Fare Calculation** (Distance-based dynamic pricing)

The platform is designed for **low-latency, real-time communication** between drivers and passengers using Socket.io.

---

## 🛠 Tech Stack

| Technology | Purpose |
|------------|---------|
| **Node.js & Express** | RESTful API framework and HTTP server |
| **MongoDB (Mongoose)** | NoSQL database for persistent data storage |
| **Redis** | In-memory cache for real-time data (driver locations, socket IDs, notifications) |
| **Socket.io** | Real-time bidirectional communication between clients and server |
| **JWT (JSON Web Tokens)** | Secure user authentication and authorization |
| **Bcrypt** | Password hashing and encryption |
| **Nodemon** | Development tool for auto-restarting server on file changes |

---

## 🏗 Project Architecture

The project follows a **layered architecture pattern** for clean code organization:

```
Request Flow:
   Client (Frontend/Postman)
         ↓
    Express Routes
         ↓
   Middleware (Auth, Validation)
         ↓
    Controllers (Request Handling)
         ↓
    Services (Business Logic)
         ↓
    Repositories (Database Operations)
         ↓
   MongoDB/Redis (Data Storage)
```

### Layer Descriptions:

**Routes** → Define API endpoints and HTTP methods
**Controllers** → Handle HTTP requests/responses
**Services** → Contain core business logic
**Repositories** → Database abstraction layer
**Models** → Database schema definitions

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (Local or Atlas)
- Redis Server (Local or Remote)
- npm or yarn

### Step 1: Clone & Install Dependencies

```bash
cd c:\Users\VICTUS\DRIVO_backend\Uber-backend
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=5500
ATLAS_DB_URL=mongodb+srv://username:password@cluster.mongodb.net/database_name
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRY=7d
REDIS_PORT=6379
SALT_ROUND=10
```

### Step 3: Start the Server

```bash
npm start
```

The server will start on `http://localhost:5500` and display:
```
🚀 Server is listening on port http://localhost:5500
✅ Connected to MongoDB successfully!
✅ Connected to Redis successfully!
```

---

## 🔑 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port number | 5500 |
| `ATLAS_DB_URL` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/uber-db` |
| `JWT_SECRET` | Secret key for JWT signing | `your_secret_key_123` |
| `JWT_EXPIRY` | JWT token expiration time | `7d` |
| `REDIS_PORT` | Redis server port | 6379 |
| `SALT_ROUND` | Bcrypt salt rounds for password hashing | 10 |

---

## 📡 API Endpoints

### Authentication Routes (`/api/v1/auth`)

#### 1. **Register User**
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "role": "passenger"  // or "driver"
}

Response (201):
{
  "success": true,
  "data": {
    "user": { _id, name, email, role, location, timestamps },
    "token": "jwt_token_here"
  },
  "error": {},
  "message": "User registered successfully"
}
```

#### 2. **Login User**
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepass123"
}

Response (201):
{
  "success": true,
  "data": {
    "user": { _id, name, email, role, location, timestamps },
    "token": "jwt_token_here"
  },
  "error": {},
  "message": "User loggedIn successfully"
}
```

---

### Booking Routes (`/api/v1/bookings`) [🔐 Protected]

#### 1. **Create Booking (Passenger)**
```
POST /api/v1/bookings
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "source": {
    "latitude": 28.6139,
    "longitude": 77.2090
  },
  "destination": {
    "latitude": 28.6329,
    "longitude": 77.2197
  }
}

Response (200):
{
  "success": true,
  "data": {
    "_id": "booking_id",
    "passenger": "passenger_id",
    "driver": null,
    "source": { latitude, longitude },
    "destination": { latitude, longitude },
    "fare": 150.50,
    "status": "pending",
    "createdAt": "2024-03-31T10:30:00Z"
  },
  "msg": "booking create successfully!",
  "error": null
}
```

**What Happens Behind the Scenes:**
1. Calculates **distance** using Haversine formula
2. Computes **fare** = Base ($50) + (Distance × $12)
3. Finds **nearby drivers** within 5km radius
4. **Notifies drivers** via WebSocket `newBooking` event
5. Stores **notified driver IDs** in Redis for later reference

#### 2. **Confirm Booking (Driver Accepts)**
```
POST /api/v1/bookings/confirm
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "bookingId": "booking_id_here"
}

Response (200):
{
  "success": true,
  "data": {
    "_id": "booking_id",
    "driver": "driver_id",
    "status": "confirmed",
    ...
  },
  "msg": "Successfully confirmed booking!",
  "error": null
}
```

**What Happens Behind the Scenes:**
1. Updates booking **driver reference** from null to driver's ID
2. Changes booking **status** from "pending" to "confirmed"
3. Emits WebSocket events:
   - `rideConfirmed` to the accepting driver
   - `removeBooking` to other notified drivers (to remove from their screens)

---

### Driver Routes (`/api/v1/drivers`) [🔐 Protected]

#### 1. **Update Driver Location**
```
POST /api/v1/drivers/location
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "latitude": 28.6139,
  "longitude": 77.2090
}

Response (200):
{
  "success": true,
  "data": {},
  "msg": "Successfully update the location",
  "error": null
}
```

**What Happens Behind the Scenes:**
1. Validates latitude/longitude coordinates
2. Updates **Redis geospatial index** with driver's location
3. Updates **MongoDB** user document with location point
4. Allows system to find nearby drivers for new bookings

#### 2. **Get Driver Bookings** (Under Development)
```
GET /api/v1/drivers/bookings
Authorization: Bearer <jwt_token>

Response: [Endpoint structure ready, logic pending]
```

---

### Passenger Routes (`/api/v1/passengers`) [🔐 Protected]

#### 1. **Get Passenger Details**
```
GET /api/v1/passengers/bookings
Authorization: Bearer <jwt_token>

Response (200):
{
  "success": true,
  "data": {
    "_id": "passenger_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "passenger",
    "location": { type: "Point", coordinates: [28.6139, 77.2090] },
    "createdAt": "2024-03-31T10:00:00Z"
  },
  "error": {},
  "message": "Successfully fetched passenger details"
}
```

#### 2. **Submit Feedback & Rating (After Ride)**
```
POST /api/v1/passengers/feedback
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "bookingId": "booking_id_here",
  "rating": 5,
  "feedback": "Great drive, very professional driver!"
}

Response (200):
{
  "success": true,
  "data": {
    "_id": "booking_id",
    "rating": 5,
    "feedback": "Great drive, very professional driver!",
    "status": "completed"
  },
  "error": {},
  "message": "Feedback submitted successfully"
}
```

---

## 🔌 WebSocket Events

The application uses **Socket.io** for real-time communication between clients and server.

### Server-Side WebSocket Setup

```javascript
io.on("connection", (socket) => {
  // When driver registers their socket
  socket.on("registerDriver", (driverId) => { ... });
  
  // When user disconnects
  socket.on("disconnect", (driverId) => { ... });
});
```

### Key WebSocket Events

#### **Driver Registration**
```javascript
// Client (Driver) sends when they login
socket.emit("registerDriver", driverId);

// Server stores mapping: driver:${driverId} → socketId (in Redis)
// This allows the system to send notifications to specific drivers
```

#### **New Booking Notification (Server → Nearby Drivers)**
```javascript
// When passenger creates a booking, server emits to all nearby drivers
io.to(driverSocketId).emit("newBooking", {
  bookingId: "booking_id",
  source: { latitude, longitude },
  destination: { latitude, longitude },
  fare: 150.50
});

// Drivers receive this and show popup/notification on their UI
```

#### **Ride Confirmed (Server → Driver)**
```javascript
// When driver accepts booking
io.to(driverSocketId).emit("rideConfirmed", {
  bookingId: "booking_id",
  driverId: "driver_id"
});

// Driver knows ride is confirmed, can start navigation
```

#### **Remove Booking from Other Drivers (Server → Other Drivers)**
```javascript
// When one driver accepts, notify other drivers to remove this booking
io.to(otherDriverSocketId).emit("removeBooking", {
  bookingId: "booking_id"
});

// Other drivers remove this booking from their available bookings list
```

#### **Disconnect**
```javascript
// When driver goes offline
socket.on("disconnect", async (driverId) => {
  // Remove driver socket mapping from Redis
  await locationService.delDriverSocket(driverId);
});
```

---

## 📊 Database Models

### User Model

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique, lowercase, trimmed),
  password: String (hashed with bcrypt),
  role: Enum ["passenger", "driver"],
  location: {
    type: "Point" (GeoJSON),
    coordinates: [longitude, latitude]
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Key Features:**
- Password is automatically hashed before saving (pre-save middleware)
- Has `comparePassword()` method to verify passwords during login
- GeoJSON location enables geospatial queries
- Role determines access to certain endpoints

---

### Booking Model

```javascript
{
  _id: ObjectId,
  passenger: ObjectId (reference to User),
  driver: ObjectId (reference to User, initially null),
  source: {
    latitude: Number,
    longitude: Number
  },
  destination: {
    latitude: Number,
    longitude: Number
  },
  fare: Number (calculated based on distance),
  status: Enum ["pending", "confirmed", "completed", "canceled"],
  rating: Number (0-5, added after ride),
  feedback: String (passenger's feedback after ride),
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Booking Lifecycle:**
1. **pending** → Created by passenger, awaiting driver acceptance
2. **confirmed** → Driver accepted, ride in progress
3. **completed** → Ride finished, passenger can leave feedback
4. **canceled** → Either party canceled

---

## ✨ Key Features

### 1. **Real-time Driver-Passenger Matching**
- When passenger creates booking, system finds drivers within 5km radius
- Uses **Redis GEORADIUS** command for efficient geospatial queries
- Notifies all nearby drivers via WebSocket

### 2. **Dynamic Fare Calculation**
```
Fare = Base Price ($50) + (Distance × Rate Per KM ($12))
Example: 10km ride = $50 + (10 × $12) = $170
```

### 3. **Secure Authentication**
- Passwords hashed with Bcrypt (10 salt rounds)
- JWT tokens for stateless authentication
- All protected endpoints require valid JWT token in Authorization header

### 4. **Real-time Location Tracking**
- Drivers can update their location continuously
- Stored in both MongoDB (permanent) and Redis (for fast queries)

### 5. **Booking Notification Management**
- Stores list of notified drivers in Redis
- When driver accepts, other notified drivers are notified to remove booking
- Prevents duplicate bookings

### 6. **Feedback & Rating System**
- Passengers can rate driver (1-5 stars) after ride
- Leave textual feedback for improvement
- Helps build driver reputation

---

## 📁 Folder Structure

```
Uber-backend/
│
├── src/
│   ├── index.js                    # Main server entry point
│   │
│   ├── config/                     # Configuration files
│   │   ├── dbConfig.js             # MongoDB connection
│   │   ├── redisConfig.js          # Redis connection
│   │   └── serverConfig.js         # Environment variables
│   │
│   ├── controllers/                # Request handlers (HTTP logic)
│   │   ├── authController.js       # Register, Login
│   │   ├── bookingController.js    # Create, Confirm bookings
│   │   ├── driverController.js     # Update location, Get bookings
│   │   └── passengerController.js  # Get details, Submit feedback
│   │
│   ├── services/                   # Business logic layer
│   │   ├── authService.js          # Auth logic (register, login)
│   │   ├── bookingService.js       # Booking logic (create, assign)
│   │   ├── driverService.js        # Driver logic (location update)
│   │   ├── passengerService.js     # Passenger logic (feedback)
│   │   └── locationService.js      # Location & geospatial logic
│   │
│   ├── repositories/               # Database abstraction layer
│   │   ├── authRepository.js       # User CRUD operations
│   │   ├── bookingRepository.js    # Booking CRUD operations
│   │   ├── driverRepository.js     # Driver-specific queries
│   │   └── passengerRepository.js  # Passenger-specific queries
│   │
│   ├── models/                     # Mongoose schemas
│   │   ├── userModel.js            # User schema (Passenger/Driver)
│   │   ├── bookingModel.js         # Booking schema
│   │   └── index.js                # Model exports
│   │
│   ├── routes/                     # API endpoints
│   │   ├── authRoutes.js           # /api/v1/auth/*
│   │   ├── bookingRoutes.js        # /api/v1/bookings/*
│   │   ├── driverRoutes.js         # /api/v1/drivers/*
│   │   ├── passengerRoutes.js      # /api/v1/passengers/*
│   │   └── index.js                # Route exports
│   │
│   ├── middlewares/                # Express middlewares
│   │   └── authMiddleware.js       # JWT token verification
│   │
│   └── utils/                      # Utility functions
│       ├── constants.js            # App constants (fare rates)
│       ├── distance.js             # Haversine distance formula
│       └── generateJwtToken.js     # JWT token generation
│
├── public/                         # Frontend files
│   └── driver.html                 # Driver UI (Socket.io client)
│
├── tests/                          # Test files
│   └── api/
│       └── api.http                # API endpoint tests
│
├── .gitignore                      # Git ignore file
├── package.json                    # Dependencies & scripts
├── Notes.md                        # Project planning notes
└── README.md                       # This file
```

---

## 🔄 How It Works - Complete Flow

### **Scenario: Passenger Books a Ride**

#### Step 1: Passenger Registration & Login
```
Client                         Server                        Database
  │                              │                              │
  ├─ POST /auth/register ──────> │ Hash password (bcrypt)      │
  │                              ├─ Create user doc ──────────> │
  │                              ├─ Generate JWT token          │
  │ <────── User + Token ─────── │                              │
```

#### Step 2: Driver Registration & Location Tracking
```
Driver                         Server                        Redis/DB
  │                              │                              │
  ├─ WebSocket: registerDriver ─> │ Store socket mapping        │
  │  (driverId)                   ├─ driver:${id} → socketId ─> │
  │                              │                              │
  ├─ POST /drivers/location ────> │ Update location             │
  │  (lat, long)                  ├─ Add to GEOSPATIAL index ─> │
  │                              ├─ Update MongoDB ───────────> │
```

#### Step 3: Passenger Creates Booking
```
Client                         Server                        Redis/Database
  │                              │                              │
  ├─ POST /bookings ────────────> │ Calculate distance          │
  │  (source, destination)        ├─ Calculate fare             │
  │                              ├─ Save booking ────────────> │
  │                              │  (status: pending)           │
  │                              │                              │
  │                              ├─ Find nearby drivers         │
  │                              │  (GEORADIUS in Redis)        │
  │                              │                              │
  │                              ├─ For each nearby driver:     │
  │                              │  1. Get socket ID ─────────> │
  │                              │  2. Emit "newBooking" event  │
  │                              │  3. Store in Redis ────────> │
  │                              │                              │
  │ <─ Booking created ────────── │                              │
```

#### Step 4: Nearby Drivers Receive Notification
```
Driver 1                       Server                        
  │ <─ WebSocket "newBooking" ──── │ (shows popup with booking details)
  │                                │
Driver 2                           │
  │ <─ WebSocket "newBooking" ──── │
  │                                │
Driver 3                           │
  │ <─ WebSocket "newBooking" ──── │
```

#### Step 5: Driver Accepts Booking
```
Driver 1                       Server                        Database
  │                              │                              │
  ├─ POST /bookings/confirm ────> │ Update booking              │
  │  (bookingId)                  ├─ driver = driver1 ───────> │
  │                              ├─ status = confirmed ────--> │
  │                              │                              │
  │ <─ "rideConfirmed" ────────── │                              │
  │                              │                              │
  │                              ├─ To other drivers:           │
Driver 2                          │  Emit "removeBooking"       │
  │ <─ "removeBooking" ────────── │  (remove from their list)   │
  │                              │                              │
Driver 3                          │                              │
  │ <─ "removeBooking" ────────── │                              │
```

#### Step 6: Ride Completes & Passenger Leaves Feedback
```
Passenger                      Server                        Database
  │                              │                              │
  ├─ POST /passengers/feedback ──> │ Update booking              │
  │  (rating, feedback)            ├─ rating = 5 ────────────> │
  │                              ├─ feedback = text ────────--> │
  │                              ├─ status = completed ──────> │
  │                              │                              │
  │ <─ "Feedback submitted" ───── │                              │
```

---

## 🧩 Services Explained

### **authService.js** - Authentication Logic
```javascript
register(userData)    // Create new user account
login(userDetails)    // Verify email/password, return user + JWT
```

**Flow:**
1. Validate input (name, email, password, role)
2. Check if user already exists
3. Create new user (password auto-hashed)
4. Generate JWT token
5. Return user object + token

---

### **bookingService.js** - Booking Logic
```javascript
createBooking(bookingDetails)        // Create new booking
findNearByDrivers(location, radius)  // Find drivers within radius
assignDriver(bookingId, driverId)    // Assign driver to booking
```

**Fare Calculation Formula:**
```
Distance = Haversine(source, destination)  // in km
Fare = $50 + (Distance × $12)
```

---

### **locationService.js** - Geospatial Logic
```javascript
setDriverSocket(driverId, socketId)        // Map driver to socket
getDriverSocket(driverId)                  // Get socket ID for driver
addDriverLocation(driverId, lat, lon)      // Add to Redis geospatial index
findNearByDrivers(latitude, longitude, radiusKm)  // GEORADIUS query
storeNotifiedDrivers(bookingId, driverIds)        // Store in Redis set
getNotifiedDrivers(bookingId)                     // Retrieve from Redis set
```

**Redis Geospatial Commands:**
```
GEOADD drivers lat lon driver_id          # Add driver location
GEORADIUS drivers lat lon 5 km            # Find nearby drivers within 5km
GEOPOS drivers driver_id                  # Get driver coordinates
```

---

### **driverService.js** - Driver Logic
```javascript
updateLocation(driverId, location)  // Update driver location
```

Updates both:
1. **Redis** - for fast geospatial queries
2. **MongoDB** - for persistent storage

---

### **passengerService.js** - Passenger Logic
```javascript
getPassengerById(passengerId)                           // Get passenger details
createPassengerFeedback(passengerId, bookingId, rating, feedback)  // Submit feedback
```

---

## 💾 Redis Caching Strategy

Redis stores temporary, high-frequency-access data for fast queries:

### **Data Stored in Redis:**

| Key Pattern | Type | Purpose | TTL |
|-------------|------|---------|-----|
| `driver:${driverId}` | String | Maps driver ID to their Socket.io connection ID | No expiry |
| `drivers` | Geospatial Set | Stores all active drivers with coordinates | No expiry |
| `notifiedDrivers:${bookingId}` | Set | Stores driver IDs notified about a booking | No expiry |

### **Redis Commands Used:**

```javascript
// String operations
redisClient.set(key, value)                      // Set driver socket ID
redisClient.get(key)                             // Get driver socket ID
redisClient.del(key)                             // Remove driver socket ID

// Geospatial operations
redisClient.sendCommand(['GEOADD', 'drivers', lat, lon, driverId])
redisClient.sendCommand(['GEORADIUS', 'drivers', lat, lon, radius, 'km'])

// Set operations
redisClient.sAdd(`notifiedDrivers:${bookingId}`, driverId)
redisClient.sMembers(`notifiedDrivers:${bookingId}`)
```

**Why Redis?**
- ⚡ **Extremely fast** - In-memory access (microseconds vs milliseconds in DB)
- 🔄 **Real-time data** - Perfect for active driver tracking
- 📍 **Geospatial indexing** - Built-in GEORADIUS for location queries
- 🌐 **Temporary data** - Socket connections are temporary anyway

---

## 🔐 Security Features

### Password Hashing
```javascript
// Pre-save middleware in User model
userSchema.pre("save", async function() {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, SALT_ROUND);
});
```

### JWT Authentication
```javascript
// Middleware checks every protected endpoint
const token = req.header("Authorization")?.replace("Bearer ", "");
const decoded = jwt.verify(token, JWT_SECRET);
const user = await userRepository.findUserById(decoded._id);
```

### Protected Routes
All sensitive endpoints (bookings, driver, passenger) have `authMiddleware`:
```javascript
bookingRouter.use(authMiddleware);
driverRouter.use(authMiddleware);
passengerRouter.use(authMiddleware);
```

---

## 🧪 Testing the API

### Using REST Client (api.http file):

```http
### 1. Register User
POST http://localhost:5500/api/v1/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "passenger"
}

### 2. Login
POST http://localhost:5500/api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

### 3. Update Driver Location
POST http://localhost:5500/api/v1/drivers/location
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "latitude": 28.6139,
  "longitude": 77.2090
}

### 4. Create Booking
POST http://localhost:5500/api/v1/bookings
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "source": {
    "latitude": 28.6139,
    "longitude": 77.2090
  },
  "destination": {
    "latitude": 28.6329,
    "longitude": 77.2197
  }
}
```

---

## 📈 Performance Considerations

- **Redis GEORADIUS** - O(N+log(M)) complexity, extremely efficient for location queries
- **Socket.io** - Connection pooling for handling thousands of concurrent connections
- **Indexes** - MongoDB indexes on `email`, `_id`, `passenger`, `driver`
- **Caching** - Frequently accessed driver data cached in Redis

---

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB/Mongoose Docs](https://mongoosejs.com/)
- [Redis Commands](https://redis.io/commands/)
- [Socket.io Guide](https://socket.io/docs/)
- [JWT Introduction](https://jwt.io/introduction)
- [Haversine Distance Formula](https://en.wikipedia.org/wiki/Haversine_formula)

---

## 📝 Notes & Future Enhancements

### Currently Under Development:
- ✅ Core booking system
- ✅ Real-time notifications
- ⏳ **getDriverBookings()** - Fetch driver's booking history
- ⏳ Ride completion tracking
- ⏳ Payment integration
- ⏳ Advanced analytics dashboard

### Potential Improvements:
1. Add ride cancellation penalty system
2. Implement driver ratings & verification
3. Add surge pricing algorithm
4. Implement emergency SOS feature
5. Add ride sharing (multiple passengers)
6. Implement driver availability schedule
7. Add messaging between driver and passenger
8. Implement coupon/promo code system

---

## 📞 Support & Contact

For questions or issues, refer to the [Notes.md](Notes.md) file or check the project planning documentation.

---

**Happy Coding! 🚀**
