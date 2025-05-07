-- Tạo bảng SYNC_LOGS để theo dõi quá trình đồng bộ dữ liệu
CREATE TABLE IF NOT EXISTS SYNC_LOGS (
  id_log INT AUTO_INCREMENT PRIMARY KEY,
  action VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,
  description TEXT,
  error TEXT,
  started_at DATETIME NOT NULL,
  completed_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;