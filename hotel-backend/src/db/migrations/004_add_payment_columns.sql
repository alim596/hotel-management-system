-- Add payment-related columns to users table
ALTER TABLE users
ADD COLUMN stripe_customer_id VARCHAR(255);

-- Add payment-related columns to bookings table
ALTER TABLE bookings
ADD COLUMN payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
ADD COLUMN stripe_payment_intent_id VARCHAR(255);

-- Create index for faster payment lookups
CREATE INDEX idx_bookings_payment_intent ON bookings(stripe_payment_intent_id);
CREATE INDEX idx_users_stripe_customer ON users(stripe_customer_id); 