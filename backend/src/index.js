const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const multer = require('multer'); // used in error handler below

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// ensure uploads folder exists at project root: /uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// serve uploaded images statically at /uploads/*
app.use('/uploads', express.static(uploadsDir));

// mount API routes
const userRouter = require('./routes/user');
app.use('/api', userRouter);

// simple global error handler (handles multer errors too)
app.use((err, req, res, next) => {
  console.error(err);
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
