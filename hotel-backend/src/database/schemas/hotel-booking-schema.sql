-- Hotel Booking System Database Schema
-- File: src/database/schemas/hotel-booking-schema.sql

-- Drop existing database if it exists (for clean recreation)
DROP DATABASE IF EXISTS hotel_booking_system;
CREATE DATABASE hotel_booking_system;
USE hotel_booking_system;

-- ==========================================
-- 1. MAIN TABLES CREATION
-- ==========================================

-- Users table (Parent table for user hierarchy)
CREATE TABLE Users (
    UserID INT PRIMARY KEY AUTO_INCREMENT,
    Email VARCHAR(255) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    PhoneNumber VARCHAR(20),
    DateOfBirth DATE,
    Address TEXT,
    RegistrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UserType ENUM('Guest', 'HotelStaff', 'Administrator') NOT NULL,
    IsActive BOOLEAN DEFAULT TRUE,
    LastLoginDate TIMESTAMP NULL,
    INDEX idx_email (Email),
    INDEX idx_user_type (UserType)
);

-- Guests table (Specialization of Users)
CREATE TABLE Guests (
    GuestID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT UNIQUE NOT NULL,
    Nationality VARCHAR(100),
    PreferredLanguage VARCHAR(50) DEFAULT 'English',
    LoyaltyPoints INT DEFAULT 0,
    MembershipLevel ENUM('Bronze', 'Silver', 'Gold', 'Platinum') DEFAULT 'Bronze',
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    INDEX idx_loyalty_points (LoyaltyPoints)
);

-- Hotel Staff table (Specialization of Users)
CREATE TABLE HotelStaff (
    StaffID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT UNIQUE NOT NULL,
    Position VARCHAR(100) NOT NULL,
    HireDate DATE NOT NULL,
    Salary DECIMAL(10,2),
    Department VARCHAR(100),
    IsManager BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    INDEX idx_position (Position),
    INDEX idx_hire_date (HireDate)
);

-- Administrator table (Specialization of Users)
CREATE TABLE Administrators (
    AdminID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT UNIQUE NOT NULL,
    Department VARCHAR(100) NOT NULL,
    AccessLevel ENUM('Basic', 'Intermediate', 'Advanced', 'Super') DEFAULT 'Basic',
    LastAccessDate TIMESTAMP NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    INDEX idx_access_level (AccessLevel)
);

-- Hotels table
CREATE TABLE Hotels (
    HotelID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    StarRating DECIMAL(2,1) CHECK (StarRating >= 1 AND StarRating <= 5),
    CheckInTime TIME DEFAULT '15:00:00',
    CheckOutTime TIME DEFAULT '11:00:00',
    Address TEXT NOT NULL,
    City VARCHAR(100) NOT NULL,
    State VARCHAR(100),
    Country VARCHAR(100) NOT NULL,
    PostalCode VARCHAR(20),
    PhoneNumber VARCHAR(20),
    Email VARCHAR(255),
    WebsiteURL VARCHAR(500),
    RegistrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IsActive BOOLEAN DEFAULT TRUE,
    TotalRooms INT DEFAULT 0,
    INDEX idx_city_country (City, Country),
    INDEX idx_star_rating (StarRating),
    INDEX idx_active_hotels (IsActive)
);

-- Room Types table
CREATE TABLE RoomTypes (
    RoomTypeID INT PRIMARY KEY AUTO_INCREMENT,
    HotelID INT NOT NULL,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    Capacity INT NOT NULL CHECK (Capacity > 0),
    BedType VARCHAR(50),
    SizeInSqFt INT,
    BasePrice DECIMAL(10,2) NOT NULL CHECK (BasePrice > 0),
    RoomImages JSON,
    MaxOccupancy INT,
    IsActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (HotelID) REFERENCES Hotels(HotelID) ON DELETE CASCADE,
    INDEX idx_hotel_room_type (HotelID, Name),
    INDEX idx_capacity (Capacity),
    INDEX idx_base_price (BasePrice)
);

-- Rooms table
CREATE TABLE Rooms (
    RoomID INT PRIMARY KEY AUTO_INCREMENT,
    HotelID INT NOT NULL,
    RoomTypeID INT NOT NULL,
    RoomNumber VARCHAR(20) NOT NULL,
    Floor INT,
    Status ENUM('Available', 'Occupied', 'Maintenance', 'Out of Order') DEFAULT 'Available',
    SpecialNotes TEXT,
    LastMaintenanceDate DATE,
    FOREIGN KEY (HotelID) REFERENCES Hotels(HotelID) ON DELETE CASCADE,
    FOREIGN KEY (RoomTypeID) REFERENCES RoomTypes(RoomTypeID),
    UNIQUE KEY unique_room_per_hotel (HotelID, RoomNumber),
    INDEX idx_room_status (Status),
    INDEX idx_hotel_floor (HotelID, Floor)
);

-- Amenities table
CREATE TABLE Amenities (
    AmenityID INT PRIMARY KEY AUTO_INCREMENT,
    Name VARCHAR(100) UNIQUE NOT NULL,
    Description TEXT,
    Category ENUM('Room', 'Hotel', 'Spa', 'Dining', 'Recreation', 'Business', 'Transportation') NOT NULL,
    Icon VARCHAR(100),
    IsActive BOOLEAN DEFAULT TRUE,
    INDEX idx_category (Category)
);

-- Hotel Amenities (Many-to-Many relationship)
CREATE TABLE HotelAmenities (
    HotelID INT,
    AmenityID INT,
    IsComplimentary BOOLEAN DEFAULT TRUE,
    AdditionalCost DECIMAL(8,2) DEFAULT 0,
    AvailabilityHours VARCHAR(50),
    PRIMARY KEY (HotelID, AmenityID),
    FOREIGN KEY (HotelID) REFERENCES Hotels(HotelID) ON DELETE CASCADE,
    FOREIGN KEY (AmenityID) REFERENCES Amenities(AmenityID) ON DELETE CASCADE
);

-- Room Type Amenities (Many-to-Many relationship)
CREATE TABLE RoomTypeAmenities (
    RoomTypeID INT,
    AmenityID INT,
    IsIncluded BOOLEAN DEFAULT TRUE,
    AdditionalCost DECIMAL(8,2) DEFAULT 0,
    PRIMARY KEY (RoomTypeID, AmenityID),
    FOREIGN KEY (RoomTypeID) REFERENCES RoomTypes(RoomTypeID) ON DELETE CASCADE,
    FOREIGN KEY (AmenityID) REFERENCES Amenities(AmenityID) ON DELETE CASCADE
);

-- Promotions table
CREATE TABLE Promotions (
    PromotionID INT PRIMARY KEY AUTO_INCREMENT,
    Code VARCHAR(50) UNIQUE NOT NULL,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    DiscountType ENUM('Percentage', 'Fixed Amount') DEFAULT 'Percentage',
    DiscountValue DECIMAL(8,2) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    TermsAndConditions TEXT,
    MaxUses INT,
    CurrentUses INT DEFAULT 0,
    MinBookingAmount DECIMAL(10,2) DEFAULT 0,
    IsActive BOOLEAN DEFAULT TRUE,
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CHECK (EndDate > StartDate),
    CHECK (DiscountValue > 0),
    INDEX idx_promo_dates (StartDate, EndDate),
    INDEX idx_promo_code (Code)
);

-- Reservations table
CREATE TABLE Reservations (
    ReservationID INT PRIMARY KEY AUTO_INCREMENT,
    GuestID INT NOT NULL,
    BookingDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CheckInDate DATE NOT NULL,
    CheckOutDate DATE NOT NULL,
    NumberOfGuests INT NOT NULL CHECK (NumberOfGuests > 0),
    SpecialRequests TEXT,
    Status ENUM('Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled', 'NoShow') DEFAULT 'Pending',
    TotalPrice DECIMAL(12,2) NOT NULL,
    DiscountAmount DECIMAL(10,2) DEFAULT 0,
    TaxAmount DECIMAL(10,2) DEFAULT 0,
    FinalAmount DECIMAL(12,2) NOT NULL,
    PromotionID INT NULL,
    CancellationDate TIMESTAMP NULL,
    CancellationReason TEXT,
    FOREIGN KEY (GuestID) REFERENCES Guests(GuestID),
    FOREIGN KEY (PromotionID) REFERENCES Promotions(PromotionID),
    CHECK (CheckOutDate > CheckInDate),
    INDEX idx_guest_reservations (GuestID),
    INDEX idx_reservation_dates (CheckInDate, CheckOutDate),
    INDEX idx_reservation_status (Status)
);

-- Reservation Details (Rooms booked in each reservation)
CREATE TABLE ReservationDetails (
    ReservationDetailID INT PRIMARY KEY AUTO_INCREMENT,
    ReservationID INT NOT NULL,
    RoomID INT NOT NULL,
    CheckInDate DATE NOT NULL,
    CheckOutDate DATE NOT NULL,
    DailyRate DECIMAL(10,2) NOT NULL,
    TotalNights INT NOT NULL,
    SubTotal DECIMAL(12,2) NOT NULL,
    FOREIGN KEY (ReservationID) REFERENCES Reservations(ReservationID) ON DELETE CASCADE,
    FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID),
    INDEX idx_reservation_rooms (ReservationID),
    INDEX idx_room_bookings (RoomID, CheckInDate, CheckOutDate)
);

-- Payments table
CREATE TABLE Payments (
    PaymentID INT PRIMARY KEY AUTO_INCREMENT,
    ReservationID INT NOT NULL,
    Amount DECIMAL(12,2) NOT NULL CHECK (Amount > 0),
    Currency VARCHAR(3) DEFAULT 'USD',
    PaymentMethod ENUM('Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Cash', 'Crypto') NOT NULL,
    TransactionID VARCHAR(255),
    Status ENUM('Pending', 'Completed', 'Failed', 'Refunded', 'Cancelled') DEFAULT 'Pending',
    PaymentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ProcessedDate TIMESTAMP NULL,
    RefundAmount DECIMAL(12,2) DEFAULT 0,
    RefundDate TIMESTAMP NULL,
    GatewayResponse JSON,
    FOREIGN KEY (ReservationID) REFERENCES Reservations(ReservationID),
    INDEX idx_payment_status (Status),
    INDEX idx_payment_date (PaymentDate),
    INDEX idx_reservation_payments (ReservationID)
);

-- Reviews table
CREATE TABLE Reviews (
    ReviewID INT PRIMARY KEY AUTO_INCREMENT,
    GuestID INT NOT NULL,
    HotelID INT NOT NULL,
    ReservationID INT,
    Rating DECIMAL(2,1) NOT NULL CHECK (Rating >= 1 AND Rating <= 5),
    Comment TEXT,
    ReviewDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IsVerified BOOLEAN DEFAULT FALSE,
    HelpfulVotes INT DEFAULT 0,
    IsActive BOOLEAN DEFAULT TRUE,
    ResponseFromHotel TEXT,
    ResponseDate TIMESTAMP NULL,
    FOREIGN KEY (GuestID) REFERENCES Guests(GuestID),
    FOREIGN KEY (HotelID) REFERENCES Hotels(HotelID),
    FOREIGN KEY (ReservationID) REFERENCES Reservations(ReservationID),
    INDEX idx_hotel_reviews (HotelID, Rating),
    INDEX idx_guest_reviews (GuestID),
    INDEX idx_review_date (ReviewDate)
);

-- Notifications table
CREATE TABLE Notifications (
    NotificationID INT PRIMARY KEY AUTO_INCREMENT,
    UserID INT NOT NULL,
    Title VARCHAR(255) NOT NULL,
    Message TEXT NOT NULL,
    Type ENUM('Booking', 'Payment', 'Promotion', 'System', 'Review', 'Reminder') NOT NULL,
    IsRead BOOLEAN DEFAULT FALSE,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ReadAt TIMESTAMP NULL,
    ExpiryDate TIMESTAMP NULL,
    Priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    RelatedEntityType VARCHAR(50),
    RelatedEntityID INT,
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    INDEX idx_user_notifications (UserID, IsRead),
    INDEX idx_notification_type (Type),
    INDEX idx_created_date (CreatedAt)
);

-- Staff Hotel Assignments (Many-to-Many relationship)
CREATE TABLE StaffHotelAssignments (
    AssignmentID INT PRIMARY KEY AUTO_INCREMENT,
    StaffID INT NOT NULL,
    HotelID INT NOT NULL,
    AssignmentDate DATE NOT NULL,
    AccessLevel ENUM('Basic', 'Manager', 'Administrator') DEFAULT 'Basic',
    IsActive BOOLEAN DEFAULT TRUE,
    StartDate DATE NOT NULL,
    EndDate DATE NULL,
    FOREIGN KEY (StaffID) REFERENCES HotelStaff(StaffID),
    FOREIGN KEY (HotelID) REFERENCES Hotels(HotelID),
    INDEX idx_staff_assignments (StaffID),
    INDEX idx_hotel_staff (HotelID)
);

-- Admin Hotel Supervision (Many-to-Many relationship)
CREATE TABLE AdminHotelSupervision (
    SupervisionID INT PRIMARY KEY AUTO_INCREMENT,
    AdminID INT NOT NULL,
    HotelID INT NOT NULL,
    AssignmentDate DATE NOT NULL,
    ResponsibilityLevel ENUM('Basic', 'Full', 'Limited') DEFAULT 'Basic',
    IsActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (AdminID) REFERENCES Administrators(AdminID),
    FOREIGN KEY (HotelID) REFERENCES Hotels(HotelID),
    INDEX idx_admin_supervision (AdminID),
    INDEX idx_supervised_hotels (HotelID)
);

-- Insert sample data for testing
INSERT INTO Users (Email, Password, FirstName, LastName, PhoneNumber, UserType) VALUES
('john.doe@email.com', SHA2('password123', 256), 'John', 'Doe', '+1-555-0101', 'Guest'),
('jane.smith@email.com', SHA2('password123', 256), 'Jane', 'Smith', '+1-555-0102', 'Guest'),
('admin@hotel.com', SHA2('admin123', 256), 'Hotel', 'Admin', '+1-555-0001', 'Administrator'),
('staff@hotel.com', SHA2('staff123', 256), 'Hotel', 'Staff', '+1-555-0002', 'HotelStaff');

INSERT INTO Guests (UserID, Nationality, PreferredLanguage, LoyaltyPoints) VALUES
(1, 'American', 'English', 500),
(2, 'Canadian', 'English', 1200);

INSERT INTO Hotels (Name, Description, StarRating, Address, City, Country, PhoneNumber, Email) VALUES
('Grand Plaza Hotel', 'Luxury hotel in downtown', 4.5, '123 Main St', 'New York', 'USA', '+1-555-1000', 'info@grandplaza.com'),
('Seaside Resort', 'Beautiful beachfront resort', 4.0, '456 Ocean Ave', 'Miami', 'USA', '+1-555-2000', 'info@seaside.com');

INSERT INTO Amenities (Name, Description, Category) VALUES
('WiFi', 'Free wireless internet', 'Room'),
('Swimming Pool', 'Outdoor swimming pool', 'Hotel'),
('Gym', 'Fitness center', 'Hotel'),
('Room Service', '24/7 room service', 'Room'),
('Spa', 'Full service spa', 'Spa');

SELECT 'Database schema created successfully!' AS Status;