import express from 'express';
import Option from '../models/Option.js';
import Question from '../models/Question.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 1. Új válaszopció hozzáadása egy kérdéshez - Csak adminok számára
router.post('/add', requireAuth, requireAdmin, async (req, res) => {
  const { questionId, optionText, isCorrect } = req.body;

  if (!questionId || !optionText || typeof isCorrect !== 'boolean') {
    return res.status(400).json({ error: 'Hibás adatbevitel. Kérjük, adja meg a kérdés azonosítóját, az opció szövegét és hogy helyes-e az opció.' });
  }

  try {
    const newOption = new Option({
      optionText,
      isCorrect,
    });

    const savedOption = await newOption.save();

    const updatedQuestion = await Question.findByIdAndUpdate(
      questionId,
      { $push: { options: savedOption._id } },
      { new: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({ error: 'A kérdés nem található.' });
    }

    res.status(201).json(savedOption);
  } catch (err) {
    res.status(500).json({ error: 'Nem sikerült hozzáadni az opciót.' });
  }
});

// 2. Válaszopció lekérése ID alapján - Bárki számára elérhető, de adminon kívül elrejtjük az isCorrect mezőt
router.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    let option = await Option.findById(id);
    if (!option) {
      return res.status(404).json({ error: 'Az opció nem található.' });
    }

    if (!req.user.isAdmin) {
      option = option.toObject();
      delete option.isCorrect;
    }

    res.json(option);
  } catch (err) {
    res.status(500).json({ error: 'Nem sikerült lekérni az opciót.' });
  }
});

// 3. Válaszopció módosítása ID alapján - Csak adminok számára
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { optionText, isCorrect } = req.body;

  try {
    const updatedOption = await Option.findByIdAndUpdate(
      id,
      { optionText, isCorrect },
      { new: true }
    );

    if (!updatedOption) {
      return res.status(404).json({ error: 'Az opció nem található.' });
    }

    res.json(updatedOption);
  } catch (err) {
    res.status(500).json({ error: 'Nem sikerült módosítani az opciót.' });
  }
});

// 4. Válaszopció törlése ID alapján - Csak adminok számára
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    await Question.updateMany(
      { options: id },
      { $pull: { options: id } }
    );

    const deletedOption = await Option.findByIdAndDelete(id);

    if (!deletedOption) {
      return res.status(404).json({ error: 'Az opció nem található.' });
    }

    res.json({ message: 'Az opció sikeresen törölve.' });
  } catch (err) {
    res.status(500).json({ error: 'Nem sikerült törölni az opciót.' });
  }
});

export default router;
