import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
    handleContactForm,
    getContacts,
    getContactById,
    replyContact,
    deleteContact,
    testDatabaseConnection
} from './services/MailAPI';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Middleware xử lý lỗi async
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
};

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: "Đã xảy ra lỗi trong quá trình xử lý yêu cầu."
    });
});

// API routes
app.get('/api/test-db', asyncHandler(testDatabaseConnection));
app.post('/api/contact', asyncHandler(handleContactForm));
app.get('/api/contacts', asyncHandler(getContacts));
app.get('/api/contacts/:id', asyncHandler(getContactById));
app.post('/api/contacts/:id/reply', asyncHandler(replyContact));
app.delete('/api/contacts/:id', asyncHandler(deleteContact));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy ở http://localhost:${PORT}`);
});