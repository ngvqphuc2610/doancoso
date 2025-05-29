-- Improve seat_locks table for hybrid approach
-- Run this to enhance the existing seat_locks table

-- Add indexes for better performance
ALTER TABLE seat_locks 
ADD INDEX idx_session_expires (session_id, expires_at),
ADD INDEX idx_showtime_expires (id_showtime, expires_at),
ADD INDEX idx_expires_cleanup (expires_at);

-- Add constraint to prevent duplicate locks
ALTER TABLE seat_locks 
ADD CONSTRAINT uk_showtime_seat UNIQUE (id_showtime, id_seats);

-- Add lock_type column for different types of locks
ALTER TABLE seat_locks 
ADD COLUMN lock_type ENUM('temporary', 'booking', 'admin') DEFAULT 'temporary' AFTER session_id;

-- Add user_id column for better tracking (optional)
ALTER TABLE seat_locks 
ADD COLUMN user_id INT NULL AFTER session_id,
ADD FOREIGN KEY fk_seat_locks_user (user_id) REFERENCES users(id_user) ON DELETE SET NULL;

-- Create cleanup procedure for expired locks
DELIMITER //
CREATE PROCEDURE CleanupExpiredSeatLocks()
BEGIN
    DELETE FROM seat_locks 
    WHERE expires_at <= NOW() 
    AND lock_type = 'temporary';
    
    SELECT ROW_COUNT() as cleaned_locks;
END //
DELIMITER ;

-- Create event to auto-cleanup expired locks every minute
CREATE EVENT IF NOT EXISTS cleanup_expired_seat_locks
ON SCHEDULE EVERY 1 MINUTE
DO CALL CleanupExpiredSeatLocks();

-- Enable event scheduler
SET GLOBAL event_scheduler = ON;
