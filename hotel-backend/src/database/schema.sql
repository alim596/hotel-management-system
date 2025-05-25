-- Hotel Management System Database Schema
-- This schema supports both PostgreSQL and MySQL

-- Drop existing types if they exist
DO $$ BEGIN
    DROP TYPE IF EXISTS user_role CASCADE;
    DROP TYPE IF EXISTS room_type CASCADE;
    DROP TYPE IF EXISTS booking_status CASCADE;
    DROP TYPE IF EXISTS payment_status CASCADE;
EXCEPTION
    WHEN others THEN null;
END $$;

-- Create enum types (PostgreSQL)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('guest', 'hotel_manager', 'admin');
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded', 'failed');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- For MySQL, we'll use standard ENUM types in table definitions

-- Drop existing tables if they exist
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TABLE IF EXISTS hotels CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role user_role NOT NULL DEFAULT 'guest',
  phone_number VARCHAR(20),
  date_of_birth DATE,
  address TEXT,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create hotels table
CREATE TABLE hotels (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  country VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20),
  phone_number VARCHAR(20),
  email VARCHAR(255),
  website_url VARCHAR(500),
  star_rating DECIMAL(2,1) CHECK (star_rating >= 1 AND star_rating <= 5),
  amenities TEXT[],
  images TEXT[],
  manager_id INTEGER REFERENCES users(id),
  total_rooms INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create room types table
CREATE TABLE room_types (
  id SERIAL PRIMARY KEY,
  hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  base_price DECIMAL(10,2) NOT NULL CHECK (base_price > 0),
  bed_type VARCHAR(50),
  size_sq_ft INTEGER,
  amenities TEXT[],
  images TEXT[],
  max_occupancy INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (hotel_id, name)
);

-- Create rooms table
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE,
  room_type_id INTEGER REFERENCES room_types(id) ON DELETE CASCADE,
  room_number VARCHAR(20) NOT NULL,
  floor VARCHAR(10),
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance', 'out_of_order')),
  is_available BOOLEAN DEFAULT TRUE,
  special_notes TEXT,
  last_cleaning_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (hotel_id, room_number)
);

-- Create bookings table
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  room_id INTEGER REFERENCES rooms(id) ON DELETE SET NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  number_of_guests INTEGER NOT NULL CHECK (number_of_guests > 0),
  total_price DECIMAL(10,2) NOT NULL CHECK (total_price >= 0),
  status booking_status DEFAULT 'pending',
  payment_status payment_status DEFAULT 'pending',
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_dates CHECK (check_out > check_in)
);

-- Create reviews table
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  hotel_id INTEGER REFERENCES hotels(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
); 

-- Create indexes
CREATE INDEX idx_hotel_city ON hotels(city);
CREATE INDEX idx_hotel_country ON hotels(country);
CREATE INDEX idx_room_hotel ON rooms(hotel_id);
CREATE INDEX idx_booking_dates ON bookings(check_in, check_out);
CREATE INDEX idx_booking_status ON bookings(status);
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_review_hotel ON reviews(hotel_id); 