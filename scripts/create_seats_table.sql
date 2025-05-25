-- Create SEATS table
CREATE TABLE IF NOT EXISTS SEATS (
    id_seat INT AUTO_INCREMENT PRIMARY KEY,
    id_screen INT NOT NULL,
    seat_row VARCHAR(2) NOT NULL,
    seat_number INT NOT NULL,
    seat_type ENUM('regular', 'couple', 'vip') DEFAULT 'regular',
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_screen) REFERENCES SCREEN(id_screen),
    UNIQUE KEY unique_seat (id_screen, seat_row, seat_number)
);

-- Insert sample seats for each screen
-- Helper procedure to generate seats
DELIMITER //
CREATE PROCEDURE GenerateSeats(IN p_screen_id INT)
BEGIN
    DECLARE row CHAR(1);
    DECLARE seat_num INT;
    DECLARE row_counter INT DEFAULT 0;
    
    -- Generate seats for rows A through H (8 rows)
    WHILE row_counter < 8 DO
        SET row = CHAR(65 + row_counter); -- ASCII: A=65, B=66, etc.
        
        -- Generate 12 seats per row
        SET seat_num = 1;
        WHILE seat_num <= 12 DO
            -- Insert regular seats
            INSERT IGNORE INTO SEATS (id_screen, seat_row, seat_number, seat_type, price)
            VALUES (
                p_screen_id, 
                row, 
                seat_num,
                CASE 
                    -- Make some seats VIP or couple seats based on position
                    WHEN row IN ('E', 'F') AND seat_num BETWEEN 6 AND 8 THEN 'couple'
                    WHEN row IN ('D', 'E') AND seat_num BETWEEN 4 AND 9 THEN 'vip'
                    ELSE 'regular'
                END,
                CASE 
                    WHEN row IN ('E', 'F') AND seat_num BETWEEN 6 AND 8 THEN 160000 -- couple seats
                    WHEN row IN ('D', 'E') AND seat_num BETWEEN 4 AND 9 THEN 120000 -- vip seats
                    ELSE 90000 -- regular seats
                END
            );
            
            SET seat_num = seat_num + 1;
        END WHILE;
        
        SET row_counter = row_counter + 1;
    END WHILE;
    
    -- Generate special row I with only 4 seats (I01-I04)
    SET seat_num = 1;
    WHILE seat_num <= 4 DO
        INSERT IGNORE INTO SEATS (id_screen, seat_row, seat_number, seat_type, price)
        VALUES (p_screen_id, 'I', seat_num, 'regular', 90000);
        
        SET seat_num = seat_num + 1;
    END WHILE;
END //
DELIMITER ;

-- Get all screen IDs and generate seats for each screen
INSERT INTO SEATS (id_screen, seat_row, seat_number, seat_type, price)
SELECT DISTINCT 
    id_screen,
    'A',
    1,
    'regular',
    90000
FROM SCREEN
WHERE id_screen NOT IN (SELECT DISTINCT id_screen FROM SEATS)
LIMIT 1;

-- Call the procedure for each screen
SET @sql = CONCAT(
    'SELECT DISTINCT id_screen FROM SCREEN WHERE id_screen NOT IN ',
    '(SELECT DISTINCT id_screen FROM SEATS)'
);

SET @procedure_calls = '';
PREPARE stmt FROM @sql;
EXECUTE stmt;

WHILE ROW_COUNT() > 0 DO
    SET @screen_id = (
        SELECT id_screen 
        FROM SCREEN 
        WHERE id_screen NOT IN (SELECT DISTINCT id_screen FROM SEATS) 
        LIMIT 1
    );
    CALL GenerateSeats(@screen_id);
END;

DEALLOCATE PREPARE stmt;
DROP PROCEDURE IF EXISTS GenerateSeats;
