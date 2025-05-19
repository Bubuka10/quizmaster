import express from 'express';
import Request from '../models/Request.js';
import Quiz from '../models/Quiz.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 1. Új kérés hozzáadása
router.post('/add', requireAuth, async (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'A kvíz témájának megadása kötelező.' });
  }

  if (!title || title.trim().length < 3 || title.trim().length > 50) {
    return res.status(400).json({ error: 'A kvíz témájának legalább 3 és legfeljebb 50 karakter hosszúnak kell lennie.' });
  }

  try {
    const existingQuiz = await Quiz.findOne({ title });
    if (existingQuiz) {
      return res.status(400).json({ error: 'Már létezik ilyen kvíz.' });
    }

    const existingRequest = await Request.findOne({ title });
    if (existingRequest) {
      return res.status(400).json({ error: 'Már létezik ilyen kérelem.' });
    }

    const newRequest = new Request({
      title,
      user: req.user.id,
    });

    const savedRequest = await newRequest.save();
    return res.status(201).json(savedRequest);
  } catch (err) {
    return res.status(500).json({ error: 'Hiba történt a kérés létrehozásakor.' });
  }
});


// 2. Összes kérés lekérése
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find().populate('user', 'username');
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: 'A kérelmek lekérése nem sikerült.' });
  }
});

// 3. Upvote hozzáadása egy kéréshez
router.put('/:id/upvote', requireAuth, async (req, res) => {
  const { id } = req.params;
  
  try {
    const request = await Request.findById(id);
    if (!request) {
      return res.status(404).json({ error: 'A kérelem nem található.' });
    }

    if (request.user.toString() === req.user.id) {
      return res.status(400).json({ error: 'Nem szavazhat a saját kérelmére.' });
    }

    if (request.upvotes.includes(req.user.id)) {
      return res.status(400).json({ error: 'Már szavazott erre a kérelemre.' });
    }

    request.upvotes.push(req.user.id);
    await request.populate('user', 'username');
    await request.save();

    res.json({ message: 'Sikeres szavazás', request });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'A szavazás sikertelen.' });
  }
});

// 4. Kérelem törlése ID alapján - Csak adminok számára
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const request = await Request.findByIdAndDelete(id);
    if (!request) {
      return res.status(404).json({ error: 'A kérelem nem található.' });
    }
    res.json({ message: 'A kérelem sikeresen törölve lett.' });
  } catch (err) {
    res.status(500).json({ error: 'Nem sikerült törölni a kérelmet.' });
  }
});

export default router;
