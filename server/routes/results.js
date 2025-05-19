import express from 'express';
import Result from '../models/Result.js';
import Quiz from '../models/Quiz.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// 1. Új eredmény hozzáadása egy adott kvízhez - Bármely bejelentkezett felhasználó létrehozhatja
router.post('/quiz/:quizId', requireAuth, async (req, res) => {
  const { quizId } = req.params;
  const { score, completionTime } = req.body;
  const user = req.user.id;

  if (!score || !completionTime) {
    return res.status(400).json({ error: 'A pontszám (score) és a kitöltési idő (completionTime) megadása kötelező.' });
  }

  if (typeof score !== 'number' || score < 0 || typeof completionTime !== 'number' || completionTime <= 0) {
    return res.status(400).json({ error: 'A pontszám és a kitöltési idő csak pozitív szám lehet.' });
  }

  try {
    const quizExists = await Quiz.findById(quizId);
    if (!quizExists) {
      return res.status(404).json({ error: 'A megadott kvíz nem található.' });
    }

    const newResult = new Result({ user, quiz: quizId, score, completionTime });
    const savedResult = await newResult.save();
    res.status(201).json(savedResult);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json({ error: 'Hibás adatbevitel: ' + err.message });
    } else if (err.name === 'CastError') {
      res.status(400).json({ error: 'Érvénytelen azonosító formátum: ' + err.message });
    } else {
      res.status(500).json({ error: 'Nem sikerült hozzáadni az eredményt: ' + err.message });
    }
  }
});

// 2. Eredmények lekérése egy adott felhasználóhoz - Csak a bejelentkezett felhasználó férhet hozzá a saját eredményeihez
router.get('/user/:userId', requireAuth, async (req, res) => {
  const { userId } = req.params;

  if (req.user.id !== userId && !req.user.isAdmin) {
    return res.status(403).json({ error: 'Hozzáférés megtagadva.' });
  }

  try {
    const results = await Result.find({ user: userId }).populate('quiz');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Nem sikerült lekérni az eredményeket.' });
  }
});

// 3. Eredmények lekérése egy adott kvízhez - Bejelentkezett felhasználók számára elérhető
router.get('/quiz/:quizId', async (req, res) => {
  const { quizId } = req.params;

  try {
    const results = await Result.find({ quiz: quizId })
      .populate('user', 'username')
      .populate('quiz', 'title');

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Nem sikerült lekérni az eredményeket.' });
  }
});

export default router;
