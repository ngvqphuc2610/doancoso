import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { handleContactForm, getContacts, getContactById, replyContact, deleteContact, testDatabaseConnection } from './services/MailAPI'; // TypeScript will resolve the extension
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
// Route handlers with proper types
app.get('/api/test-db', (req, res) => testDatabaseConnection(req, res));
app.post('/api/contact', (req, res) => handleContactForm(req, res));
app.get('/api/contacts', (req, res) => getContacts(req, res));
app.get('/api/contacts/:id', (req, res) => getContactById(req, res));
app.post('/api/contacts/:id/reply', (req, res) => replyContact(req, res));
app.delete('/api/contacts/:id', (req, res) => deleteContact(req, res));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server đang chạy ở http://localhost:${PORT}`);
});
