-- Insert sample seat data for testing
-- Make sure seat_type table has data first

-- Insert seat types if not exists
INSERT IGNORE INTO seat_type (id_seattype, type_name, price_multiplier, description) VALUES
(1, 'Regular', 1.00, 'Standard seat'),
(2, 'VIP', 1.50, 'Comfortable VIP seat'),
(3, 'Couple', 2.00, 'Double seat for couples'),
(4, 'IMAX', 2.50, 'Premium IMAX seat');

-- Insert ticket types if not exists (STRICT MATCHING)
INSERT IGNORE INTO ticket_type (id_tickettype, type_name, description, price_multiplier) VALUES
(1, 'Vé Regular', 'Vé dành cho ghế thường', 1.00),
(2, 'Vé Couple', 'Vé dành cho ghế đôi', 2.00),
(3, 'Vé VIP', 'Vé dành cho ghế VIP', 1.50),
(4, 'Vé IMAX', 'Vé dành cho ghế IMAX', 2.50);

-- Insert STRICT ticket-seat compatibility constraints
-- Each ticket type can ONLY use its corresponding seat type
INSERT IGNORE INTO ticket_seat_constraint (id_tickettype, id_seattype) VALUES
-- Vé Regular (ID: 1) can ONLY use Regular seats
(1, 1), -- Regular only

-- Vé Couple (ID: 2) can ONLY use Couple seats
(2, 3), -- Couple only

-- Vé VIP (ID: 3) can ONLY use VIP seats
(3, 2), -- VIP only

-- Vé IMAX (ID: 4) can ONLY use IMAX seats
(4, 4); -- IMAX only

-- Clear existing seats for screen 1 (optional)
-- DELETE FROM seat WHERE id_screen = 1;

-- Insert seats for screen 1
-- Hàng A (12 ghế thường)
INSERT INTO seat (id_screen, id_seattype, seat_row, seat_number, status) VALUES
(1, 1, 'A', 1, 'active'),
(1, 1, 'A', 2, 'active'),
(1, 1, 'A', 3, 'active'),
(1, 1, 'A', 4, 'active'),
(1, 1, 'A', 5, 'active'),
(1, 1, 'A', 6, 'active'),
(1, 1, 'A', 7, 'active'),
(1, 1, 'A', 8, 'active'),
(1, 1, 'A', 9, 'active'),
(1, 1, 'A', 10, 'active'),
(1, 1, 'A', 11, 'active'),
(1, 1, 'A', 12, 'active'),

-- Hàng B (12 ghế thường)
(1, 1, 'B', 1, 'active'),
(1, 1, 'B', 2, 'active'),
(1, 1, 'B', 3, 'active'),
(1, 1, 'B', 4, 'active'),
(1, 1, 'B', 5, 'active'),
(1, 1, 'B', 6, 'active'),
(1, 1, 'B', 7, 'active'),
(1, 1, 'B', 8, 'active'),
(1, 1, 'B', 9, 'active'),
(1, 1, 'B', 10, 'active'),
(1, 1, 'B', 11, 'active'),
(1, 1, 'B', 12, 'active'),

-- Hàng C (12 ghế thường)
(1, 1, 'C', 1, 'active'),
(1, 1, 'C', 2, 'active'),
(1, 1, 'C', 3, 'active'),
(1, 1, 'C', 4, 'active'),
(1, 1, 'C', 5, 'active'),
(1, 1, 'C', 6, 'active'),
(1, 1, 'C', 7, 'active'),
(1, 1, 'C', 8, 'active'),
(1, 1, 'C', 9, 'active'),
(1, 1, 'C', 10, 'active'),
(1, 1, 'C', 11, 'active'),
(1, 1, 'C', 12, 'active'),

-- Hàng D (12 ghế thường)
(1, 1, 'D', 1, 'active'),
(1, 1, 'D', 2, 'active'),
(1, 1, 'D', 3, 'active'),
(1, 1, 'D', 4, 'active'),
(1, 1, 'D', 5, 'active'),
(1, 1, 'D', 6, 'active'),
(1, 1, 'D', 7, 'active'),
(1, 1, 'D', 8, 'active'),
(1, 1, 'D', 9, 'active'),
(1, 1, 'D', 10, 'active'),
(1, 1, 'D', 11, 'active'),
(1, 1, 'D', 12, 'active'),

-- Hàng E (6 ghế couple ở giữa, 6 ghế thường ở 2 bên)
(1, 1, 'E', 1, 'active'),
(1, 1, 'E', 2, 'active'),
(1, 1, 'E', 3, 'active'),
(1, 3, 'E', 4, 'active'), -- Couple seat
(1, 3, 'E', 5, 'active'), -- Couple seat
(1, 3, 'E', 6, 'active'), -- Couple seat
(1, 3, 'E', 7, 'active'), -- Couple seat
(1, 3, 'E', 8, 'active'), -- Couple seat
(1, 3, 'E', 9, 'active'), -- Couple seat
(1, 1, 'E', 10, 'active'),
(1, 1, 'E', 11, 'active'),
(1, 1, 'E', 12, 'active'),

-- Hàng F (6 ghế couple ở giữa, 6 ghế thường ở 2 bên)
(1, 1, 'F', 1, 'active'),
(1, 1, 'F', 2, 'active'),
(1, 1, 'F', 3, 'active'),
(1, 3, 'F', 4, 'active'), -- Couple seat
(1, 3, 'F', 5, 'active'), -- Couple seat
(1, 3, 'F', 6, 'active'), -- Couple seat
(1, 3, 'F', 7, 'active'), -- Couple seat
(1, 3, 'F', 8, 'active'), -- Couple seat
(1, 3, 'F', 9, 'active'), -- Couple seat
(1, 1, 'F', 10, 'active'),
(1, 1, 'F', 11, 'active'),
(1, 1, 'F', 12, 'active'),

-- Hàng G (12 ghế VIP)
(1, 2, 'G', 1, 'active'),
(1, 2, 'G', 2, 'active'),
(1, 2, 'G', 3, 'active'),
(1, 2, 'G', 4, 'active'),
(1, 2, 'G', 5, 'active'),
(1, 2, 'G', 6, 'active'),
(1, 2, 'G', 7, 'active'),
(1, 2, 'G', 8, 'active'),
(1, 2, 'G', 9, 'active'),
(1, 2, 'G', 10, 'active'),
(1, 2, 'G', 11, 'active'),
(1, 2, 'G', 12, 'active'),

-- Hàng H (12 ghế VIP)
(1, 2, 'H', 1, 'active'),
(1, 2, 'H', 2, 'active'),
(1, 2, 'H', 3, 'active'),
(1, 2, 'H', 4, 'active'),
(1, 2, 'H', 5, 'active'),
(1, 2, 'H', 6, 'active'),
(1, 2, 'H', 7, 'active'),
(1, 2, 'H', 8, 'active'),
(1, 2, 'H', 9, 'active'),
(1, 2, 'H', 10, 'active'),
(1, 2, 'H', 11, 'active'),
(1, 2, 'H', 12, 'active'),

-- Hàng I (4 ghế IMAX đặc biệt)
(1, 4, 'I', 1, 'active'),
(1, 4, 'I', 2, 'active'),
(1, 4, 'I', 3, 'active'),
(1, 4, 'I', 4, 'active');

-- Thêm một số ghế đã được đặt để test
-- UPDATE seat SET status = 'booked' WHERE
-- (seat_row = 'E' AND seat_number IN (4, 5, 6, 7, 8)) OR
-- (seat_row = 'F' AND seat_number IN (5, 6, 7, 8));

-- Create trigger to check ticket-seat compatibility
DELIMITER //
CREATE TRIGGER check_ticket_seat_compatibility
    BEFORE INSERT ON detail_booking
    FOR EACH ROW
BEGIN
    DECLARE seat_type_id INT;
    DECLARE constraint_count INT;

    -- Get the seat type for the selected seat
    SELECT s.id_seattype INTO seat_type_id
    FROM seat s
    WHERE s.id_seats = NEW.id_seats;

    -- Check if this ticket type can use this seat type
    SELECT COUNT(*) INTO constraint_count
    FROM ticket_seat_constraint tsc
    WHERE tsc.id_tickettype = NEW.id_tickettype
    AND tsc.id_seattype = seat_type_id;

    -- If no matching constraint found, raise error
    IF constraint_count = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Loại vé này không thể sử dụng cho loại ghế đã chọn';
    END IF;
END//
DELIMITER ;

-- Verify the data
SELECT
    s.seat_row,
    s.seat_number,
    st.type_name,
    s.status
FROM seat s
JOIN seat_type st ON s.id_seattype = st.id_seattype
WHERE s.id_screen = 1
ORDER BY s.seat_row, s.seat_number;
