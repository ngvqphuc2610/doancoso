// start-with-ngrok.js
import { spawn } from 'child_process';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import fs from 'fs/promises';

// Tải biến môi trường
dotenv.config();

// Xác định đường dẫn thư mục gốc
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Kiểm tra xem ngrok có sẵn chưa
async function checkNgrokInstalled() {
    try {
        const ngrokProcess = spawn('ngrok', ['--version']);
        return new Promise((resolve) => {
            ngrokProcess.on('close', (code) => {
                resolve(code === 0);
            });
        });
    } catch (error) {
        return false;
    }
}

// Tạo file .env hoặc cập nhật nếu đã tồn tại
async function updateEnvFile(ngrokUrl) {
    try {
        const envPath = join(rootDir, '.env');
        let envContent = '';

        try {
            envContent = await fs.readFile(envPath, 'utf8');
        } catch (error) {
            // File không tồn tại - sẽ tạo mới
        }

        // Cập nhật hoặc thêm NGROK_URL
        if (envContent.includes('NGROK_URL=')) {
            envContent = envContent.replace(/NGROK_URL=.*$/m, `NGROK_URL=${ngrokUrl}`);
        } else {
            envContent += `\nNGROK_URL=${ngrokUrl}\n`;
        }

        // Cập nhật hoặc thêm NEXT_PUBLIC_API_URL
        if (envContent.includes('NEXT_PUBLIC_API_URL=')) {
            envContent = envContent.replace(/NEXT_PUBLIC_API_URL=.*$/m, `NEXT_PUBLIC_API_URL=${ngrokUrl}`);
        } else {
            envContent += `\n# URL API cho frontend sử dụng\nNEXT_PUBLIC_API_URL=${ngrokUrl}\n`;
        }

        await fs.writeFile(envPath, envContent);
        console.log(`Đã cập nhật .env với NGROK_URL=${ngrokUrl} và NEXT_PUBLIC_API_URL=${ngrokUrl}`);
    } catch (error) {
        console.error('Lỗi khi cập nhật file .env:', error);
    }
}

// Hàm chính để khởi động ngrok và server
async function startWithNgrok() {
    console.log('🚀 Đang khởi động server với ngrok...');

    const isNgrokInstalled = await checkNgrokInstalled();
    if (!isNgrokInstalled) {
        console.error('❌ Không tìm thấy ngrok! Vui lòng cài đặt ngrok từ https://ngrok.com/download');
        console.error('Sau khi cài đặt, đảm bảo ngrok có trong PATH của bạn');
        process.exit(1);
    }

    const PORT = process.env.PORT || 5000;

    // Khởi động ngrok trong một tiến trình riêng
    console.log(`📡 Đang khởi động ngrok cho port ${PORT}...`);
    console.log('⏳ Quá trình này có thể mất vài giây, vui lòng đợi...');

    const ngrokProcess = spawn('ngrok', ['http', PORT.toString(), '--log=stdout']);

    // Thiết lập timeout để tránh đợi quá lâu
    let ngrokStartTimeout = setTimeout(() => {
        console.error('❌ Ngrok khởi động quá lâu! Có thể có vấn đề với kết nối hoặc tài khoản ngrok của bạn.');
        console.log('💡 Thử các cách sau:');
        console.log('  1. Kiểm tra kết nối internet');
        console.log('  2. Khởi động lại ngrok thủ công (ngrok http ' + PORT + ')');
        console.log('  3. Đảm bảo tài khoản ngrok của bạn được cấu hình đúng');
        ngrokProcess.kill();
        process.exit(1);
    }, 30000); // Timeout sau 30 giây

    // Lắng nghe output từ ngrok để lấy URL
    let ngrokUrl = null;
    ngrokProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`ngrok debug: ${output}`);

        // Kiểm tra URL trong output - hỗ trợ định dạng ngrok-free.app mới
        const urlMatch = output.match(/https:\/\/[a-zA-Z0-9\-]+\.ngrok-free\.app/);
        if (urlMatch && urlMatch[0]) {
            ngrokUrl = urlMatch[0];
            console.log(`✅ ngrok URL: ${ngrokUrl}`);

            // Hủy timeout vì đã tìm thấy URL
            clearTimeout(ngrokStartTimeout);

            // Cập nhật biến môi trường
            process.env.NGROK_URL = ngrokUrl;

            // Cập nhật file .env
            updateEnvFile(ngrokUrl);

            // Khởi động server Express
            console.log('🚀 Đang khởi động server Express...');
            const serverProcess = spawn('node', ['--loader', 'ts-node/esm', join(rootDir, 'src/server.ts')], {
                stdio: 'inherit',
                env: { ...process.env, NGROK_URL: ngrokUrl }
            });

            // Xử lý khi server kết thúc
            serverProcess.on('close', (code) => {
                console.log(`Server đã kết thúc với mã: ${code}`);
                ngrokProcess.kill();
                process.exit(code);
            });
        }
    });

    // Xử lý lỗi ngrok
    ngrokProcess.stderr.on('data', (data) => {
        console.error(`ngrok error: ${data}`);
    });

    // Xử lý khi ngrok kết thúc
    ngrokProcess.on('close', (code) => {
        clearTimeout(ngrokStartTimeout);
        if (code !== 0) {
            console.error(`ngrok đã thoát với mã lỗi ${code}`);
            process.exit(code);
        }
    });

    // Xử lý các tín hiệu để tắt mọi tiến trình
    process.on('SIGINT', () => {
        console.log('Đang dừng tất cả các tiến trình...');
        clearTimeout(ngrokStartTimeout);
        ngrokProcess.kill();
        process.exit(0);
    });
}

// Khởi động
startWithNgrok().catch(error => {
    console.error('Lỗi:', error);
    process.exit(1);
});