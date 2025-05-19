import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { JWT_SECRET } from '../config.js';

const router = express.Router();

// 1. Új felhasználó regisztrálása
router.post('/register', async (req, res) => {
  const { username, password, email, isAdmin = false } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Minden mező kitöltése kötelező.' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Az email cím formátuma érvénytelen.' });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error: 'A jelszónak legalább 8 karakter hosszúnak, tartalmaznia kell egy nagybetűt, egy kisbetűt, egy számot és egy speciális karaktert.',
    });
  }

  try {
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'Ez a felhasználónév már foglalt.' });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Ez az email cím már regisztrálva van.' });
    }

    const newUser = new User({ username, password, email, isAdmin });
    const savedUser = await newUser.save();

    const token = jwt.sign(
      { id: savedUser._id, username: savedUser.username, email: savedUser.email, isAdmin: savedUser.isAdmin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ message: 'Sikeres regisztráció', token });
  } catch (err) {
    res.status(500).json({ error: 'Hiba történt a regisztráció során.' });
  }
});

// 2. Felhasználó bejelentkezése
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'A felhasználónév és a jelszó megadása kötelező.' });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Helytelen felhasználónév' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Helytelen jelszó' });

    const token = jwt.sign(
      { id: user._id, username: user.username, isAdmin: user.isAdmin }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({ message: 'Sikeres bejelentkezés', token });
  } catch (err) {
    res.status(500).json({ error: 'Sikertelen bejelentkezés' });
  }
});


export default router;
