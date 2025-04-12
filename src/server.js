const express = require('express');
const cors = require('cors');
const {
  handleContactForm,
  getContacts,
  getContactById,
  replyContact,  // Thay đổi từ updateContactStatus
  deleteContact
} = require('./services/MailAPI');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes cho form liên hệ
app.post('/api/contact', handleContactForm);
app.get('/api/contacts', getContacts);
app.get('/api/contacts/:id', getContactById);
app.post('/api/contacts/:id/reply', replyContact);  // Thay đổi từ PUT sang POST
app.delete('/api/contacts/:id', deleteContact);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy ở http://localhost:${PORT}`);
});
