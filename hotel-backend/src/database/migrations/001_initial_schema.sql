-- Users and Authentication
CREATE TABLE Users (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Email VARCHAR(255) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    FirstName VARCHAR(100) NOT NULL,
    LastName VARCHAR(100) NOT NULL,
    PhoneNumber VARCHAR(20),
    DateOfBirth DATE,
    Address TEXT,
    RegistrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UserType ENUM('Guest', 'HotelStaff', 'Administrator') NOT NULL,
    IsActive BOOLEAN DEFAULT true,
    LastLoginDate TIMESTAMP,
    CONSTRAINT chk_email CHECK (Email REGEXP '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_phone CHECK (PhoneNumber REGEXP '^\+?[0-9]{10,15}$')
);

CREATE TABLE Guests (
    GuestID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL UNIQUE,
    Nationality VARCHAR(100),
    PreferredLanguage VARCHAR(50),
    LoyaltyPoints INT DEFAULT 0,
    PassportNumber VARCHAR(50),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE,
    CONSTRAINT chk_loyalty_points CHECK (LoyaltyPoints >= 0)
);

CREATE TABLE HotelStaff (
    StaffID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL UNIQUE,
    Position VARCHAR(100) NOT NULL,
    HireDate DATE NOT NULL,
    Department VARCHAR(100),
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

CREATE TABLE Administrators (
    AdminID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL UNIQUE,
    Department VARCHAR(100) NOT NULL,
    AccessLevel ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Low',
    FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE CASCADE
);

-- Hotels and Rooms
CREATE TABLE Hotels (
    HotelID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    StarRating DECIMAL(2,1),
    CheckInTime TIME DEFAULT '15:00:00',
    CheckOutTime TIME DEFAULT '11:00:00',
    Address TEXT NOT NULL,
    City VARCHAR(100) NOT NULL,
    State VARCHAR(100),
    Country VARCHAR(100) NOT NULL,
    PostalCode VARCHAR(20),
    PhoneNumber VARCHAR(20),
    Email VARCHAR(255),
    WebsiteURL VARCHAR(255),
    RegistrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    IsActive BOOLEAN DEFAULT true,
    TotalRooms INT DEFAULT 0,
    CONSTRAINT chk_star_rating CHECK (StarRating >= 0 AND StarRating <= 5),
    CONSTRAINT chk_total_rooms CHECK (TotalRooms >= 0)
);

CREATE TABLE RoomTypes (
    RoomTypeID INT AUTO_INCREMENT PRIMARY KEY,
    HotelID INT NOT NULL,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    Capacity INT NOT NULL,
    BedType VARCHAR(50),
    SizeInSqFt INT,
    BasePrice DECIMAL(10,2) NOT NULL,
    RoomImages JSON,
    MaxOccupancy INT,
    IsActive BOOLEAN DEFAULT true,
    FOREIGN KEY (HotelID) REFERENCES Hotels(HotelID),
    CONSTRAINT chk_capacity CHECK (Capacity > 0),
    CONSTRAINT chk_base_price CHECK (BasePrice >= 0),
    UNIQUE KEY uk_hotel_roomtype (HotelID, Name)
);

CREATE TABLE Rooms (
    RoomID INT AUTO_INCREMENT PRIMARY KEY,
    HotelID INT NOT NULL,
    RoomTypeID INT NOT NULL,
    RoomNumber VARCHAR(20) NOT NULL,
    Floor VARCHAR(10),
    Status ENUM('Available', 'Occupied', 'Maintenance', 'OutOfOrder') DEFAULT 'Available',
    SpecialNotes TEXT,
    LastCleaningDate TIMESTAMP,
    FOREIGN KEY (HotelID) REFERENCES Hotels(HotelID),
    FOREIGN KEY (RoomTypeID) REFERENCES RoomTypes(RoomTypeID),
    UNIQUE KEY uk_hotel_room (HotelID, RoomNumber)
);

-- Amenities
CREATE TABLE Amenities (
    AmenityID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Description TEXT,
    Category ENUM('Room', 'Hotel', 'Spa', 'Dining', 'Recreation', 'Business', 'Transportation') NOT NULL,
    IconURL VARCHAR(255),
    IsActive BOOLEAN DEFAULT true
);

CREATE TABLE HotelAmenities (
    HotelID INT NOT NULL,
    AmenityID INT NOT NULL,
    IsComplimentary BOOLEAN DEFAULT true,
    Description TEXT,
    PRIMARY KEY (HotelID, AmenityID),
    FOREIGN KEY (HotelID) REFERENCES Hotels(HotelID),
    FOREIGN KEY (AmenityID) REFERENCES Amenities(AmenityID)
);

CREATE TABLE RoomTypeAmenities (
    RoomTypeID INT NOT NULL,
    AmenityID INT NOT NULL,
    IsComplimentary BOOLEAN DEFAULT true,
    Description TEXT,
    PRIMARY KEY (RoomTypeID, AmenityID),
    FOREIGN KEY (RoomTypeID) REFERENCES RoomTypes(RoomTypeID),
    FOREIGN KEY (AmenityID) REFERENCES Amenities(AmenityID)
);

-- Bookings and Payments
CREATE TABLE Promotions (
    PromotionID INT AUTO_INCREMENT PRIMARY KEY,
    Code VARCHAR(50) UNIQUE NOT NULL,
    Name VARCHAR(255) NOT NULL,
    Description TEXT,
    DiscountType ENUM('Percentage', 'Fixed Amount') NOT NULL,
    DiscountValue DECIMAL(8,2) NOT NULL,
    StartDate DATE NOT NULL,
    EndDate DATE NOT NULL,
    TermsAndConditions TEXT,
    MaxUses INT,
    CurrentUses INT DEFAULT 0,
    MinBookingAmount DECIMAL(10,2) DEFAULT 0,
    IsActive BOOLEAN DEFAULT true,
    CreatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_dates CHECK (EndDate >= StartDate),
    CONSTRAINT chk_discount CHECK (DiscountValue > 0),
    CONSTRAINT chk_uses CHECK (CurrentUses <= MaxUses OR MaxUses IS NULL)
);

CREATE TABLE Reservations (
    ReservationID INT AUTO_INCREMENT PRIMARY KEY,
    GuestID INT NOT NULL,
    BookingDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CheckInDate DATE NOT NULL,
    CheckOutDate DATE NOT NULL,
    NumberOfGuests INT NOT NULL,
    SpecialRequests TEXT,
    Status ENUM('Pending', 'Confirmed', 'Checked-In', 'Checked-Out', 'Cancelled') DEFAULT 'Pending',
    TotalPrice DECIMAL(12,2) NOT NULL,
    DiscountAmount DECIMAL(10,2) DEFAULT 0,
    TaxAmount DECIMAL(10,2) DEFAULT 0,
    FinalAmount DECIMAL(12,2) NOT NULL,
    PromotionID INT,
    CancellationDate TIMESTAMP NULL,
    CancellationReason TEXT,
    FOREIGN KEY (GuestID) REFERENCES Guests(GuestID),
    FOREIGN KEY (PromotionID) REFERENCES Promotions(PromotionID),
    CONSTRAINT chk_dates CHECK (CheckOutDate >= CheckInDate),
    CONSTRAINT chk_guests CHECK (NumberOfGuests > 0),
    CONSTRAINT chk_amounts CHECK (
        TotalPrice >= 0 AND 
        DiscountAmount >= 0 AND 
        TaxAmount >= 0 AND 
        FinalAmount >= 0
    )
);

CREATE TABLE ReservationDetails (
    ReservationDetailID INT AUTO_INCREMENT PRIMARY KEY,
    ReservationID INT NOT NULL,
    RoomID INT NOT NULL,
    DailyRate DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (ReservationID) REFERENCES Reservations(ReservationID),
    FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID),
    CONSTRAINT chk_daily_rate CHECK (DailyRate >= 0)
);

CREATE TABLE Payments (
    PaymentID INT AUTO_INCREMENT PRIMARY KEY,
    ReservationID INT NOT NULL,
    Amount DECIMAL(12,2) NOT NULL,
    Currency VARCHAR(3) DEFAULT 'USD',
    PaymentMethod ENUM('Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Cash', 'Crypto') NOT NULL,
    TransactionID VARCHAR(100),
    Status ENUM('Pending', 'Completed', 'Failed', 'Refunded') DEFAULT 'Pending',
    PaymentDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    RefundAmount DECIMAL(12,2) DEFAULT 0,
    RefundDate TIMESTAMP NULL,
    FOREIGN KEY (ReservationID) REFERENCES Reservations(ReservationID),
    CONSTRAINT chk_amount CHECK (Amount > 0),
    CONSTRAINT chk_refund CHECK (RefundAmount <= Amount)
);

-- Reviews and Notifications
CREATE TABLE Reviews (
    ReviewID INT AUTO_INCREMENT PRIMARY KEY,
    GuestID INT NOT NULL,
    HotelID INT NOT NULL,
    Rating INT NOT NULL,
    Comment TEXT,
    ReviewDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Response TEXT,
    ResponseDate TIMESTAMP NULL,
    IsVisible BOOLEAN DEFAULT true,
    FOREIGN KEY (GuestID) REFERENCES Guests(GuestID),
    FOREIGN KEY (HotelID) REFERENCES Hotels(HotelID),
    CONSTRAINT chk_rating CHECK (Rating >= 1 AND Rating <= 5)
);

CREATE TABLE Notifications (
    NotificationID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    Message TEXT NOT NULL,
    Type ENUM('Booking', 'Payment', 'System', 'Promotion', 'Review') NOT NULL,
    IsRead BOOLEAN DEFAULT false,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ExpiresAt TIMESTAMP NULL,
    FOREIGN KEY (UserID) REFERENCES Users(UserID)
);

-- Views
CREATE VIEW vw_available_rooms AS
SELECT 
    r.RoomID,
    r.RoomNumber,
    r.Floor,
    h.Name AS HotelName,
    rt.Name AS RoomTypeName,
    rt.BasePrice,
    rt.Capacity
FROM Rooms r
JOIN Hotels h ON r.HotelID = h.HotelID
JOIN RoomTypes rt ON r.RoomTypeID = rt.RoomTypeID
WHERE r.Status = 'Available'
AND h.IsActive = true
AND rt.IsActive = true;

CREATE VIEW vw_hotel_statistics AS
SELECT 
    h.HotelID,
    h.Name,
    COUNT(DISTINCT r.RoomID) AS TotalRooms,
    COUNT(DISTINCT CASE WHEN r.Status = 'Available' THEN r.RoomID END) AS AvailableRooms,
    AVG(rev.Rating) AS AverageRating,
    COUNT(DISTINCT rev.ReviewID) AS TotalReviews
FROM Hotels h
LEFT JOIN Rooms r ON h.HotelID = r.HotelID
LEFT JOIN Reviews rev ON h.HotelID = rev.HotelID
WHERE h.IsActive = true
GROUP BY h.HotelID, h.Name;

CREATE VIEW vw_guest_reservations AS
SELECT 
    r.ReservationID,
    CONCAT(u.FirstName, ' ', u.LastName) AS GuestName,
    h.Name AS HotelName,
    r.CheckInDate,
    r.CheckOutDate,
    r.Status,
    r.FinalAmount,
    GROUP_CONCAT(rm.RoomNumber) AS RoomNumbers
FROM Reservations r
JOIN Guests g ON r.GuestID = g.GuestID
JOIN Users u ON g.UserID = u.UserID
JOIN ReservationDetails rd ON r.ReservationID = rd.ReservationID
JOIN Rooms rm ON rd.RoomID = rm.RoomID
JOIN Hotels h ON rm.HotelID = h.HotelID
GROUP BY r.ReservationID;

-- Triggers
DELIMITER //

-- Update hotel total rooms count
CREATE TRIGGER after_room_insert
AFTER INSERT ON Rooms
FOR EACH ROW
BEGIN
    UPDATE Hotels 
    SET TotalRooms = TotalRooms + 1
    WHERE HotelID = NEW.HotelID;
END//

CREATE TRIGGER after_room_delete
AFTER DELETE ON Rooms
FOR EACH ROW
BEGIN
    UPDATE Hotels 
    SET TotalRooms = TotalRooms - 1
    WHERE HotelID = OLD.HotelID;
END//

-- Update promotion usage count
CREATE TRIGGER after_reservation_insert
AFTER INSERT ON Reservations
FOR EACH ROW
BEGIN
    IF NEW.PromotionID IS NOT NULL THEN
        UPDATE Promotions 
        SET CurrentUses = CurrentUses + 1
        WHERE PromotionID = NEW.PromotionID;
    END IF;
END//

-- Create notification on reservation status change
CREATE TRIGGER after_reservation_update
AFTER UPDATE ON Reservations
FOR EACH ROW
BEGIN
    IF NEW.Status != OLD.Status THEN
        INSERT INTO Notifications (UserID, Message, Type)
        SELECT 
            g.UserID,
            CONCAT('Your reservation #', NEW.ReservationID, ' status has been updated to: ', NEW.Status),
            'Booking'
        FROM Guests g
        WHERE g.GuestID = NEW.GuestID;
    END IF;
END//

-- Update loyalty points on successful payment
CREATE TRIGGER after_payment_complete
AFTER UPDATE ON Payments
FOR EACH ROW
BEGIN
    IF NEW.Status = 'Completed' AND OLD.Status != 'Completed' THEN
        UPDATE Guests g
        JOIN Reservations r ON r.GuestID = g.GuestID
        SET g.LoyaltyPoints = g.LoyaltyPoints + FLOOR(NEW.Amount / 10)
        WHERE r.ReservationID = NEW.ReservationID;
    END IF;
END//

DELIMITER ;

-- Indexes for better performance
CREATE INDEX idx_hotel_city ON Hotels(City);
CREATE INDEX idx_hotel_country ON Hotels(Country);
CREATE INDEX idx_room_status ON Rooms(Status);
CREATE INDEX idx_reservation_dates ON Reservations(CheckInDate, CheckOutDate);
CREATE INDEX idx_promotion_dates ON Promotions(StartDate, EndDate);
CREATE INDEX idx_payment_status ON Payments(Status);
CREATE INDEX idx_review_rating ON Reviews(Rating);
CREATE INDEX idx_notification_user ON Notifications(UserID, IsRead); 