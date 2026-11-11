# Sports Booking - MongoDB Schema Documentation

## Overview
This document describes the MongoDB schema for the Sports Booking application. The database uses Mongoose ODM for schema definition and validation.

## Collections

### Users Collection
**Model:** `User`
**File:** `backend/models/User.js`

**Schema Fields:**
- `_id`: ObjectId (auto-generated)
- `name`: String (required, trimmed)
- `email`: String (required, unique, lowercase, trimmed)
- `phone`: String (optional, trimmed)
- `password`: String (required, hashed)
- `role`: Enum ['user', 'admin'] (default: 'user')
- `status`: Enum ['active', 'inactive'] (default: 'active')
- `createdAt`: Date (auto-generated)
- `updatedAt`: Date (auto-generated)

**Indexes:**
- `email` (unique)
- `status`

---

### Facilities Collection
**Model:** `Facility`
**File:** `backend/models/Facility.js`

**Schema Fields:**
- `_id`: ObjectId (auto-generated)
- `name`: String (required, trimmed)
- `sport_type`: Enum ['football', 'cricket', 'basketball', 'badminton', 'tennis', 'multi-sport'] (required)
- `location`: String (required, trimmed)
- `description`: String (optional, trimmed)
- `price_per_hour`: Number (required)
- `image`: String (optional, trimmed)
- `status`: Enum ['active', 'inactive'] (default: 'active')
- `createdAt`: Date (auto-generated)
- `updatedAt`: Date (auto-generated)

**Indexes:**
- `sport_type`
- `status`
- Text index on `location`, `name`, `description`

---

### Time Slots Collection
**Model:** `TimeSlot`
**File:** `backend/models/TimeSlot.js`

**Schema Fields:**
- `_id`: ObjectId (auto-generated)
- `facility_id`: ObjectId (ref: Facility, required, indexed)
- `date`: Date (required, indexed)
- `start_time`: String (required, format: HH:MM)
- `end_time`: String (required, format: HH:MM)
- `status`: Enum ['available', 'booked', 'unavailable'] (default: 'available', indexed)
- `createdAt`: Date (auto-generated)
- `updatedAt`: Date (auto-generated)

**Indexes:**
- `facility_id`
- `date`
- `status`
- Compound unique index on `facility_id`, `date`, `start_time`, `end_time`

---

### Bookings Collection
**Model:** `Booking`
**File:** `backend/models/Booking.js`

**Schema Fields:**
- `_id`: ObjectId (auto-generated)
- `booking_id`: String (required, unique, format: BK{timestamp}{random})
- `user_id`: ObjectId (ref: User, required, indexed)
- `facility_id`: ObjectId (ref: Facility, required, indexed)
- `slot_id`: ObjectId (ref: TimeSlot, required)
- `booking_date`: Date (required, indexed)
- `start_time`: String (required, format: HH:MM)
- `end_time`: String (required, format: HH:MM)
- `amount`: Number (required)
- `booking_status`: Enum ['confirmed', 'cancelled', 'completed'] (default: 'confirmed', indexed)
- `payment_status`: Enum ['paid', 'pending', 'refunded'] (default: 'paid')
- `createdAt`: Date (auto-generated)
- `updatedAt`: Date (auto-generated)

**Indexes:**
- `user_id`
- `facility_id`
- `booking_date`
- `booking_status`
- `booking_id` (unique)

---

### Reviews Collection
**Model:** `Review`
**File:** `backend/models/Review.js`

**Schema Fields:**
- `_id`: ObjectId (auto-generated)
- `user_id`: ObjectId (ref: User, required, indexed)
- `facility_id`: ObjectId (ref: Facility, required, indexed)
- `rating`: Number (required, min: 1, max: 5)
- `comment`: String (optional, trimmed)
- `createdAt`: Date (auto-generated)
- `updatedAt`: Date (auto-generated)

**Indexes:**
- `user_id`
- `facility_id`
- Compound unique index on `user_id`, `facility_id` (one review per user per facility)

---

## Relationships

### User Relationships
- A User can have many Bookings (one-to-many)
- A User can have many Reviews (one-to-many)

### Facility Relationships
- A Facility can have many TimeSlots (one-to-many)
- A Facility can have many Bookings (one-to-many)
- A Facility can have many Reviews (one-to-many)

### TimeSlot Relationships
- A TimeSlot belongs to one Facility (many-to-one)
- A TimeSlot can have one Booking (one-to-one)

### Booking Relationships
- A Booking belongs to one User (many-to-one)
- A Booking belongs to one Facility (many-to-one)
- A Booking belongs to one TimeSlot (many-to-one)

### Review Relationships
- A Review belongs to one User (many-to-one)
- A Review belongs to one Facility (many-to-one)

---

## Environment Configuration

Update your `.env` file with the MongoDB connection string:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/sports_booking
JWT_SECRET=your_jwt_secret_key_here
```

For MongoDB Atlas (cloud), use:
```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/sports_booking
```

---

## Migration Notes

### Key Differences from MySQL

1. **Auto-increment IDs**: MongoDB uses ObjectId instead of auto-increment integers
2. **Foreign Keys**: MongoDB uses references (ObjectId) instead of explicit foreign keys
3. **Transactions**: MongoDB supports multi-document transactions for ACID operations
4. **Joins**: MongoDB uses `$lookup` aggregation or Mongoose `populate()` instead of SQL JOINs
5. **Dates**: MongoDB stores dates as Date objects, not strings
6. **Indexes**: MongoDB indexes are defined in the schema, not separate CREATE INDEX statements

### Data Migration

To migrate existing MySQL data to MongoDB:

1. Export data from MySQL tables
2. Transform data to match MongoDB schema
3. Import using MongoDB import tools or custom scripts
4. Update auto-increment IDs to ObjectIds
5. Rebuild indexes

---

## Performance Considerations

1. **Indexes**: All frequently queried fields are indexed
2. **Compound Indexes**: Used for common query combinations
3. **Population**: Use `populate()` sparingly as it adds query overhead
4. **Aggregation**: Use aggregation pipelines for complex queries instead of multiple queries
5. **Transactions**: Use transactions only when necessary (e.g., booking operations)
