import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import {
  handleContactForm,
  getContacts,
  getContactById,
  replyContact,
  deleteContact,
  testDatabaseConnection
} from './services/MailAPI.tsx';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Route kiểm tra kết nối database
app.get('/api/test-db', testDatabaseConnection);

// Routes cho form liên hệ
app.post('/api/contact', handleContactForm);
app.get('/api/contacts', getContacts);
app.get('/api/contacts/:id', getContactById);
app.post('/api/contacts/:id/reply', replyContact);
app.delete('/api/contacts/:id', deleteContact);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy ở http://localhost:${PORT}`);
});
