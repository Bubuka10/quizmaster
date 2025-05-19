import express from 'express';
import Question from '../models/Question.js';
import Option from '../models/Option.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 1. Új kérdés hozzáadása (opcionálisan válaszopciók nélkül) - Csak adminok számára
router.post('/add', requireAuth, requireAdmin, async (req, res) => {
  const { questionText, options } = req.body;

  if (!questionText || typeof questionText !== 'string' || questionText.trim() === '') {
    return res.status(400).json({ error: 'Érvénytelen vagy hiányzó kérdés szöveg.' });
  }

  if (options && !Array.isArray(options)) {
    return res.status(400).json({ error: 'Az opcióknak tömbben kell lenniük.' });
  }

  if (options && new Set(options.map(option => option.optionText)).size !== options.length) {
    return res.status(400).json({ error: 'Az opciók nem lehetnek ismétlődőek.' });
  }

  try {
    let optionDocs = [];

    if (options && options.length > 0) {
      optionDocs = await Option.insertMany(options);
    }

    const newQuestion = new Question({
      questionText,
      options: optionDocs.map(option => option._id),
    });

    const savedQuestion = await newQuestion.save();
    res.status(201).json(savedQuestion);
  } catch (err) {
    res.status(500).json({ error: 'Nem sikerült létrehozni a kérdést.' });
  }
});

// 2. Kérdés lekérése ID alapján (a válaszokkal együtt) - Csak adminok láthatják az isCorrect mezőt
router.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const question = await Question.findById(id).populate('options');
    if (!question) {
      return res.status(404).json({ error: 'A kérdés nem található.' });
    }

    if (!req.user.isAdmin) {
      question.options = question.options.map(option => {
        const optionObj = option.toObject();
        delete optionObj.isCorrect;
        return optionObj;
      });
    }

    res.json(question);
  } catch (err) {
    res.status(500).json({ error: 'Nem sikerült lekérni a kérdést.' });
  }
});

// 3. Összes kérdés lekérése (csak a kérdés szövege, opciók nélkül) - Bárki számára elérhető
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find().select('questionText');
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: 'Nem sikerült lekérni a kérdéseket.' });
  }
});

// 4. Kérdés szerkesztése ID alapján - Csak adminok számára
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { questionText, options } = req.body;

  if (!questionText || typeof questionText !== 'string' || questionText.trim() === '') {
    return res.status(400).json({ error: 'Érvénytelen vagy hiányzó kérdés szöveg.' });
  }

  if (options && !Array.isArray(options)) {
    return res.status(400).json({ error: 'Az opcióknak tömbben kell lenniük.' });
  }

  if (options && new Set(options.map(option => option.optionText)).size !== options.length) {
    return res.status(400).json({ error: 'Az opciók nem lehetnek ismétlődőek.' });
  }

  try {
    let optionDocs = [];

    if (options && options.length > 0) {
      optionDocs = await Option.insertMany(options);
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      id,
      { questionText, options: optionDocs.map(option => option._id) },
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ error: 'A kérdés nem található.' });
    }

    res.json(updatedQuestion);
  } catch (err) {
    res.status(500).json({ error: 'Nem sikerült módosítani a kérdést.' });
  }
});

// 5. Kérdés törlése ID alapján - Csak adminok számára
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedQuestion = await Question.findByIdAndDelete(id);

    if (!deletedQuestion) {
      return res.status(404).json({ error: 'A kérdés nem található.' });
    }

    await Option.deleteMany({ _id: { $in: deletedQuestion.options } });

    res.json({ message: 'A kérdés sikeresen törölve.' });
  } catch (err) {
    res.status(500).json({ error: 'Nem sikerült törölni a kérdést.' });
  }
});

export default router;
