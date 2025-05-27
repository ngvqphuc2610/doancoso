-- Create payment_methods table
DROP TABLE IF EXISTS `payment_methods`;
CREATE TABLE `payment_methods` (
  `id_payment_method` int NOT NULL AUTO_INCREMENT,
  `method_code` varchar(20) NOT NULL,
  `method_name` varchar(100) NOT NULL,
  `description` text,
  `icon_url` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `processing_fee` decimal(10,2) DEFAULT '0.00',
  `min_amount` decimal(10,2) DEFAULT '0.00',
  `max_amount` decimal(10,2) DEFAULT NULL,
  `display_order` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_payment_method`),
  UNIQUE KEY `UQ_MethodCode` (`method_code`),
  CONSTRAINT `chk_processing_fee` CHECK ((`processing_fee` >= 0)),
  CONSTRAINT `chk_min_amount` CHECK ((`min_amount` >= 0)),
  CONSTRAINT `chk_max_amount` CHECK (((`max_amount` is null) or (`max_amount` >= `min_amount`)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert payment methods data
INSERT INTO `payment_methods` (`method_code`, `method_name`, `description`, `icon_url`, `is_active`, `processing_fee`, `min_amount`, `max_amount`, `display_order`) VALUES
('momo', 'Thanh toán qua Momo', 'Thanh toán nhanh chóng và an toàn qua ví điện tử Momo', '📱', 1, 0.00, 10000.00, 50000000.00, 1),
('domestic_card', 'Thanh toán qua Thẻ nội địa', 'Thanh toán bằng thẻ ATM/Debit nội địa (Napas)', '💳', 1, 0.00, 10000.00, 50000000.00, 2),
('international_card', 'Thanh toán qua Thẻ quốc tế', 'Thanh toán bằng thẻ Visa/Mastercard/JCB', '🌍', 1, 0.00, 10000.00, 50000000.00, 3),
('bank_transfer', 'Chuyển khoản ngân hàng', 'Chuyển khoản trực tiếp qua ngân hàng', '🏦', 1, 0.00, 10000.00, NULL, 4),
('cash', 'Thanh toán tại quầy', 'Thanh toán bằng tiền mặt tại rạp', '💵', 1, 0.00, 0.00, NULL, 5);

-- Update payments table to include foreign key to payment_methods
ALTER TABLE `payments` ADD COLUMN `id_payment_method` int DEFAULT NULL AFTER `id_booking`;
ALTER TABLE `payments` ADD KEY `fk_payment_method` (`id_payment_method`);
ALTER TABLE `payments` ADD CONSTRAINT `fk_payment_method` FOREIGN KEY (`id_payment_method`) REFERENCES `payment_methods` (`id_payment_method`);

-- Show created data
SELECT * FROM payment_methods ORDER BY display_order;
