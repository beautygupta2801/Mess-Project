const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());//Backend receives raw data, not usable directly so do this
app.use(express.urlencoded({ extended: true }));//Data is encoded like a URL extended:true it fetch data from complex
//parsing of complex nested form data into objects.

// ==================== REQUEST LOGGER ====================
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.path}`);
  next();
});

// ==================== DATABASE ====================
mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log("MongoDB Connection Error:", err));

// ==================== STATIC ====================
app.use('/uploads', express.static('uploads'));
//It makes your uploads folder publicly accessible
// ==================== ROUTES IMPORT ====================
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/student');
const messOffRoutes = require('./routes/messOff');
const feedbackRoutes = require('./routes/feedback');
const menuRoutes = require('./routes/menu');
const billRoutes = require('./routes/bill');
const munshiRoutes = require('./routes/munshi');
const clerkRoutes = require('./routes/clerk');
const extraItemRoutes = require('./routes/extraItemRoutes');
const addBillRoutes = require('./routes/addBill');
const menuController = require("./controllers/menuPageController");


const { getPublicMenu, upsertPublicMenu } = require('./controllers/menuPageController');

console.log('[Server] Registering routes...');

// ==================== PUBLIC ====================
app.get("/api/menu/public", menuController.getPublicMenu);

console.log('[Server] Registered /api/menu/public');

// ==================== MAIN ROUTES ====================
app.use('/api/auth', authRoutes);
console.log('[Server] Registered /api/auth');

app.use('/api/student', studentRoutes);
console.log('[Server] Registered /api/student');

app.use('/api/mess-off', messOffRoutes);
console.log('[Server] Registered /api/mess-off');

app.use('/api/feedback', feedbackRoutes);
console.log('[Server] Registered /api/feedback');

app.use('/api/extra-items', extraItemRoutes);
console.log('[Server] Registered /api/extra-items');

app.use('/api/bill', billRoutes);
console.log('[Server] Registered /api/bill');

// ==================== ROLE BASED ====================

// Munshi
app.use('/api/munshi/menu', menuRoutes);
app.use('/api/munshi/bill', addBillRoutes);
app.use('/api/munshi', munshiRoutes);
console.log('[Server] Registered /api/munshi');

// Clerk
app.use('/api/clerk', clerkRoutes);
console.log('[Server] Registered /api/clerk');

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==================== SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});