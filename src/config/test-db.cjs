"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var db_1 = require("./db.tsx");

// Pool không có phương thức connect(), thay vào đó sử dụng getConnection()
const testConnection = async () => {
    try {
        const connection = await db_1.default.getConnection();
        console.log("Kết nối đến cơ sở dữ liệu thành công!");
        connection.release(); // Quan trọng: Giải phóng connection sau khi sử dụng
        return true;
    } catch (err) {
        console.error("Không thể kết nối đến cơ sở dữ liệu:", err);
        return false;
    }
};

// Thực hiện kiểm tra kết nối
testConnection().then(result => {
    if (result) {
        console.log("Kiểm tra kết nối hoàn tất, kết nối thành công!");

        // Thực hiện một truy vấn đơn giản để kiểm tra thêm
        db_1.default.execute("SELECT 1 + 1 AS result")
            .then(([rows]) => {
                console.log("Kết quả truy vấn:", rows);
                console.log("Kết nối và truy vấn hoạt động bình thường!");
                process.exit(0); // Kết thúc chương trình thành công
            })
            .catch(err => {
                console.error("Lỗi khi thực hiện truy vấn:", err);
                process.exit(1); // Kết thúc chương trình với lỗi
            });
    } else {
        console.log("Kiểm tra kết nối hoàn tất, kết nối thất bại!");
        process.exit(1); // Kết thúc chương trình với lỗi
    }
});
