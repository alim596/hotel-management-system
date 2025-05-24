-- Additional Views for Business Intelligence
CREATE VIEW vw_revenue_by_hotel AS
SELECT 
    h.HotelID,
    h.Name AS HotelName,
    h.City,
    COUNT(DISTINCT r.ReservationID) AS TotalReservations,
    SUM(r.FinalAmount) AS TotalRevenue,
    AVG(r.FinalAmount) AS AverageReservationValue,
    SUM(CASE WHEN r.Status = 'Cancelled' THEN r.FinalAmount ELSE 0 END) AS CancelledRevenue,
    COUNT(DISTINCT CASE WHEN r.Status = 'Cancelled' THEN r.ReservationID END) AS CancellationCount
FROM Hotels h
LEFT JOIN Rooms rm ON h.HotelID = rm.HotelID
LEFT JOIN ReservationDetails rd ON rm.RoomID = rd.RoomID
LEFT JOIN Reservations r ON rd.ReservationID = r.ReservationID
WHERE h.IsActive = true
GROUP BY h.HotelID, h.Name, h.City;

CREATE VIEW vw_guest_loyalty_status AS
SELECT 
    g.GuestID,
    u.FirstName,
    u.LastName,
    u.Email,
    g.LoyaltyPoints,
    COUNT(DISTINCT r.ReservationID) AS TotalStays,
    SUM(r.FinalAmount) AS TotalSpent,
    CASE 
        WHEN g.LoyaltyPoints >= 10000 THEN 'Platinum'
        WHEN g.LoyaltyPoints >= 5000 THEN 'Gold'
        WHEN g.LoyaltyPoints >= 1000 THEN 'Silver'
        ELSE 'Bronze'
    END AS LoyaltyTier
FROM Guests g
JOIN Users u ON g.UserID = u.UserID
LEFT JOIN Reservations r ON g.GuestID = r.GuestID
WHERE r.Status = 'Checked-Out'
GROUP BY g.GuestID, u.FirstName, u.LastName, u.Email, g.LoyaltyPoints;

CREATE VIEW vw_room_occupancy_stats AS
SELECT 
    h.HotelID,
    h.Name AS HotelName,
    rt.RoomTypeID,
    rt.Name AS RoomTypeName,
    COUNT(r.RoomID) AS TotalRooms,
    COUNT(CASE WHEN r.Status = 'Available' THEN 1 END) AS AvailableRooms,
    COUNT(CASE WHEN r.Status = 'Occupied' THEN 1 END) AS OccupiedRooms,
    ROUND((COUNT(CASE WHEN r.Status = 'Occupied' THEN 1 END) * 100.0 / COUNT(r.RoomID)), 2) AS OccupancyRate
FROM Hotels h
JOIN RoomTypes rt ON h.HotelID = rt.HotelID
JOIN Rooms r ON rt.RoomTypeID = r.RoomTypeID
GROUP BY h.HotelID, h.Name, rt.RoomTypeID, rt.Name;

-- Additional Triggers for Business Logic
DELIMITER //

-- Automatically update room status when reservation status changes
CREATE TRIGGER after_reservation_status_change
AFTER UPDATE ON Reservations
FOR EACH ROW
BEGIN
    IF NEW.Status != OLD.Status THEN
        -- Update room status based on reservation status
        UPDATE Rooms r
        JOIN ReservationDetails rd ON r.RoomID = rd.RoomID
        SET r.Status = 
            CASE 
                WHEN NEW.Status = 'Checked-In' THEN 'Occupied'
                WHEN NEW.Status IN ('Checked-Out', 'Cancelled') THEN 'Available'
                ELSE r.Status
            END
        WHERE rd.ReservationID = NEW.ReservationID;
        
        -- Create notification for guest
        INSERT INTO Notifications (UserID, Message, Type)
        SELECT 
            g.UserID,
            CONCAT('Your reservation #', NEW.ReservationID, ' is now ', NEW.Status),
            'Booking'
        FROM Guests g
        WHERE g.GuestID = NEW.GuestID;
    END IF;
END//

-- Automatically handle loyalty points for cancellations
CREATE TRIGGER before_reservation_cancel
BEFORE UPDATE ON Reservations
FOR EACH ROW
BEGIN
    IF NEW.Status = 'Cancelled' AND OLD.Status != 'Cancelled' THEN
        -- Deduct loyalty points if cancellation is within 24 hours of check-in
        IF NEW.CheckInDate <= DATE_ADD(NOW(), INTERVAL 24 HOUR) THEN
            UPDATE Guests g
            SET g.LoyaltyPoints = GREATEST(0, g.LoyaltyPoints - 100)
            WHERE g.GuestID = NEW.GuestID;
            
            -- Create penalty notification
            INSERT INTO Notifications (UserID, Message, Type)
            SELECT 
                g.UserID,
                'Late cancellation penalty: -100 loyalty points',
                'System'
            FROM Guests g
            WHERE g.GuestID = NEW.GuestID;
        END IF;
    END IF;
END//

-- Automatically create review reminder notification
CREATE TRIGGER after_checkout_review_reminder
AFTER UPDATE ON Reservations
FOR EACH ROW
BEGIN
    IF NEW.Status = 'Checked-Out' AND OLD.Status = 'Checked-In' THEN
        -- Create review reminder notification after 24 hours
        INSERT INTO Notifications (UserID, Message, Type, ExpiresAt)
        SELECT 
            g.UserID,
            CONCAT('How was your stay? Leave a review for your recent visit to ', h.Name),
            'Review',
            DATE_ADD(NOW(), INTERVAL 7 DAY)
        FROM Guests g
        JOIN ReservationDetails rd ON NEW.ReservationID = rd.ReservationID
        JOIN Rooms r ON rd.RoomID = r.RoomID
        JOIN Hotels h ON r.HotelID = h.HotelID
        WHERE g.GuestID = NEW.GuestID
        LIMIT 1;
    END IF;
END//

DELIMITER ;

-- Additional Constraints for Data Integrity
ALTER TABLE Reservations
ADD CONSTRAINT chk_reservation_dates 
CHECK (CheckInDate < CheckOutDate AND BookingDate <= CheckInDate);

ALTER TABLE RoomTypes
ADD CONSTRAINT chk_room_capacity 
CHECK (Capacity > 0 AND MaxOccupancy >= Capacity);

ALTER TABLE Payments
ADD CONSTRAINT chk_payment_amount 
CHECK (Amount > 0 AND RefundAmount <= Amount);

-- Additional Indexes for Performance
CREATE INDEX idx_reservation_dates_status ON Reservations(CheckInDate, CheckOutDate, Status);
CREATE INDEX idx_room_hotel_type ON Rooms(HotelID, RoomTypeID, Status);
CREATE INDEX idx_guest_loyalty ON Guests(LoyaltyPoints);
CREATE INDEX idx_payment_status_date ON Payments(Status, PaymentDate);
CREATE INDEX idx_notification_user_read ON Notifications(UserID, IsRead, ExpiresAt);
CREATE INDEX idx_hotel_location ON Hotels(City, State, Country);
CREATE INDEX idx_review_rating_date ON Reviews(Rating, ReviewDate);

-- Full Text Search Indexes
ALTER TABLE Hotels ADD FULLTEXT INDEX ft_hotel_search(Name, Description);
ALTER TABLE RoomTypes ADD FULLTEXT INDEX ft_roomtype_search(Name, Description); 