const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const prisma = require('../prisma');

const router = express.Router();

// storage destination: projectRoot/uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext).replace(/\s+/g, '-').toLowerCase();
    const unique = Date.now() + '-' + crypto.randomBytes(4).toString('hex');
    cb(null, `${name}-${unique}${ext}`);
  }
});

// Only accept images, limit size to 5MB
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed!'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

// POST /api/upload
// form fields: 'username' (text), 'image' (file)
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'username is required' });
    }
    if (!req.file) return res.status(400).json({ error: 'image is required' });

    // save to DB (store filename)
    const user = await prisma.userInfo.create({
      data: {
        username,
        image: req.file.filename
      }
    });

    // return created record + accessible image URL
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ user, imageUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users - list users with image URL
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.userInfo.findMany({ orderBy: { createdAt: 'desc' } });
    const mapped = users.map(u => ({
      ...u,
      imageUrl: u.image ? `${req.protocol}://${req.get('host')}/uploads/${u.image}` : null
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
