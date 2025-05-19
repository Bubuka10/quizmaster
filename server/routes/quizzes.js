import express from 'express';
import Quiz from '../models/Quiz.js';
import Question from '../models/Question.js';
import Option from '../models/Option.js';
import Result from '../models/Result.js';
import Request from '../models/Request.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 1. Új kvíz létrehozása (kérdések nélkül is) - Csak adminok számára
router.post('/add', requireAuth, requireAdmin, async (req, res) => {
  const { title, questions, questionCount } = req.body;

  if (!title || title.trim().length === 0) {
    return res.status(400).json({ error: 'A kvíz címe kötelező.' });
  }

  if (title.length < 3 || title.length > 50) {
    return res.status(400).json({ error: 'A kvíz címe legalább 3, de legfeljebb 50 karakter hosszú lehet.' });
  }

  for (const question of questions) {
    if (!question.questionText || question.questionText.trim().length === 0) {
      return res.status(400).json({ error: 'Minden kérdéshez meg kell adni a kérdés szövegét.' });
    }
  }
  
  const uniqueQuestions = new Set(questions.map(q => q.questionText));
  if (uniqueQuestions.size !== questions.length) {
    return res.status(400).json({ error: 'A kérdések között nem lehetnek ismétlődőek.' });
  }

  if (questionCount !== 5 && questionCount !== 10 && questionCount !== 20) {
    return res.status(400).json({ error: 'A kérdések száma csak 5, 10 vagy 20 lehet.' });
  }

  if (questions.length < 2 * questionCount) {
    return res.status(400).json({ error: 'Legalább kétszer annyi kérdést kell megadni, mint a kérdések száma.' });
  }

  for (const question of questions) {
    let hasCorrectOption = false;
    const uniqueOptions = new Set();
    for (const option of question.options) {
      if (!option.optionText || option.optionText.trim().length === 0) {
        return res.status(400).json({ error: 'Minden kérdéshez meg kell adni minden opció szövegét.' });
      }
      if (option.isCorrect) {
        hasCorrectOption = true;
      }
      if (uniqueOptions.has(option.optionText.trim())) {
        return res.status(400).json({ error: 'Egy kérdés opciói között nem lehetnek ismétlődőek.' });
      }
      uniqueOptions.add(option.optionText.trim());
    }
    if (!hasCorrectOption) {
      return res.status(400).json({ error: 'Minden kérdéshez ki kell választani egy helyes opciót.' });
    }
  }

  try {
    const existingQuiz = await Quiz.findOne({ title });
    if (existingQuiz) {
      return res.status(400).json({ error: 'Már létezik ilyen nevű kvíz.' });
    }


    const savedQuestions = await Promise.all(
      questions.map(async (question) => {
        const savedOptions = await Promise.all(
          question.options.map(async (option) => {
            const newOption = new Option({
              optionText: option.optionText,
              isCorrect: option.isCorrect,
            });
            return await newOption.save();
          })
        );

        const newQuestion = new Question({
          questionText: question.questionText,
          options: savedOptions.map(opt => opt._id),
        });
        return await newQuestion.save();
      })
    );

    const newQuiz = new Quiz({
      title,
      questions: savedQuestions.map(q => q._id),
      questionCount,
    });

    const savedQuiz = await newQuiz.save();

    await Request.deleteMany({ title });

    res.status(201).json(savedQuiz);
  } catch (err) {
    console.error("Hiba a kvíz létrehozásakor:", err);
    res.status(500).json({ error: 'Hiba történt a kvíz létrehozásakor.' });
  }
});


// 2. Kvíz lekérése ID alapján (a kérdésekkel és válaszokkal együtt) - Csak bejelentkezett felhasználók számára
router.get('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const quiz = await Quiz.findById(id).populate({
      path: 'questions',
      populate: {
        path: 'options',
      }
    });

    if (!quiz) {
      return res.status(404).json({ error: 'A kvíz nem található.' });
    }

    res.json(quiz);
  } catch (err) {
    console.log("Hiba: ", err);
    res.status(500).json({ error: 'Nem sikerült lekérni a kvízt.' });
  }
});


// 3. Összes kvíz lekérése (a kérdések és válaszok nélkül) - Bárki számára elérhető
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find().select('title');
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ error: 'Nem sikerült lekérni a kvízeket.' });
  }
});


// 4. Kvíz módosítása ID alapján - Csak adminok számára
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { title, questions, questionCount } = req.body;

  if (!title || title.trim().length === 0) {
    return res.status(400).json({ error: 'A kvíz címe kötelező.' });
  }

  for (const question of questions) {
    if (!question.questionText || question.questionText.trim().length === 0) {
      return res.status(400).json({ error: 'Minden kérdéshez meg kell adni a kérdés szövegét.' });
    }
  }

  const uniqueQuestions = new Set(questions.map(q => q.questionText));
  if (uniqueQuestions.size !== questions.length) {
    return res.status(400).json({ error: 'A kérdések között nem lehetnek ismétlődőek.' });
  }

  if (questionCount !== 5 && questionCount !== 10 && questionCount !== 20) {
    return res.status(400).json({ error: 'A kérdések száma csak 5, 10 vagy 20 lehet.' });
  }

  if (questions.length < 2 * questionCount) {
    return res.status(400).json({ error: 'Legalább kétszer annyi kérdést kell megadni, mint a kérdések száma.' });
  }

  for (const question of questions) {
    let hasCorrectOption = false;
    const uniqueOptions = new Set();
    for (const option of question.options) {
      if (!option.optionText || option.optionText.trim().length === 0) {
        return res.status(400).json({ error: 'Minden kérdéshez meg kell adni minden opció szövegét.' });
      }
      if (option.isCorrect) {
        hasCorrectOption = true;
      }
      if (uniqueOptions.has(option.optionText.trim())) {
        return res.status(400).json({ error: 'Egy kérdés opciói között nem lehetnek ismétlődőek.' });
      }
      uniqueOptions.add(option.optionText.trim());
    }
    if (!hasCorrectOption) {
      return res.status(400).json({ error: 'Minden kérdéshez ki kell választani egy helyes opciót.' });
    }
  }

  try {
    const updatedQuestions = await Promise.all(
      questions.map(async (question) => {
        const updatedOptions = await Promise.all(
          question.options.map(async (option) => {
            if (option._id) {
              return await Option.findByIdAndUpdate(
                option._id,
                { optionText: option.optionText, isCorrect: option.isCorrect },
                { new: true }
              );
            } else {
              const newOption = new Option({ optionText: option.optionText, isCorrect: option.isCorrect });
              return await newOption.save();
            }
          })
        );

        if (question._id) {
          return await Question.findByIdAndUpdate(
            question._id,
            { questionText: question.questionText, options: updatedOptions.map(opt => opt._id) },
            { new: true }
          );
        } else {
          const newQuestion = new Question({
            questionText: question.questionText,
            options: updatedOptions.map(opt => opt._id)
          });
          return await newQuestion.save();
        }
      })
    );

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
      { title, questions: updatedQuestions.map(q => q._id), questionCount },
      { new: true }
    ).populate({
      path: 'questions',
      populate: { path: 'options' }
    });

    if (!updatedQuiz) {
      return res.status(404).json({ error: 'A kvíz nem található.' });
    }

    res.json(updatedQuiz);
  } catch (err) {
    res.status(500).json({ error: 'Nem sikerült módosítani a kvízt.' });
  }
});


// 5. Kvíz törlése ID alapján - Csak adminok számára
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ error: 'A kvíz nem található.' });
    }

    for (const questionId of quiz.questions) {
      const question = await Question.findById(questionId);
      if (question) {
        for (const optionId of question.options) {
          await Option.findByIdAndDelete(optionId);
        }
        await Question.findByIdAndDelete(questionId);
      }
    }

    await Result.deleteMany({ quiz: id });

    await Quiz.findByIdAndDelete(id);

    res.json({ message: 'A kvízt és a hozzá tartozó adatokat sikeresen töröltük.' });
  } catch (err) {
    console.error('Hiba történt a kvíz törlésekor:', err);
    res.status(500).json({ error: 'Nem sikerült törölni a kvízt.' });
  }
});



// 6. Kvíz beküldése és eredmény kiszámítása
router.post('/:id/submit', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { answers, completionTime, selectedQuestions, orderedOptions } = req.body;
  const user = req.user.id;

  try {
    const quiz = await Quiz.findById(id).populate({
      path: 'questions',
      populate: { path: 'options' }
    });

    if (!quiz) {
      return res.status(404).json({ error: 'A kvíz nem található.' });
    }

    const existingResult = await Result.findOne({ quiz: id, user });

    let correctAnswers = 0;
    const correctOptions = selectedQuestions.map((question) => {
      const correctOption = question.options.find((option) => option.isCorrect);
      return {
        questionId: question._id,
        correctOptionId: correctOption._id,
      };
    });

    selectedQuestions.forEach((question) => {
      const userAnswer = answers[question._id.toString()];
      const correctOption = question.options.find((option) => option.isCorrect);

      if (userAnswer && userAnswer === correctOption._id.toString()) {
        correctAnswers++;
      }
    });

    const currentAttemptScore = correctAnswers;

    if (existingResult) {
      const isNewScoreBetter =
        currentAttemptScore > existingResult.score ||
        (currentAttemptScore === existingResult.score && completionTime < existingResult.completionTime);

      existingResult.latestScore = currentAttemptScore;
      existingResult.latestCompletionTime = completionTime;

      if (isNewScoreBetter) {
        existingResult.score = currentAttemptScore;
        existingResult.completionTime = completionTime;
      }

      existingResult.answers = answers;
      existingResult.selectedQuestions = selectedQuestions;
      existingResult.orderedOptions = orderedOptions;

      await existingResult.save();

      return res.status(200).json({
        message: isNewScoreBetter
          ? 'Az eredmény frissítve lett, mert az új eredmény jobb volt.'
          : 'Az új eredmény nem jobb a korábbinál, de a válaszok frissítve lettek.',
        correctOptions,
        actualScore: currentAttemptScore,
        completionTime,
      });
    }

    const newResult = new Result({
      user,
      quiz: id,
      score: currentAttemptScore,
      answers,
      completionTime,
      selectedQuestions,
      orderedOptions,
    });

    await newResult.save();

    res.status(201).json({
      message: 'A kvízt sikeresen beküldtük és az eredmény rögzítve lett.',
      correctOptions,
      actualScore: currentAttemptScore,
      completionTime,
    });
  } catch (err) {
    res.status(500).json({ error: 'Nem sikerült beküldeni a kvízt.' });
  }
});


// 7. Ellenőrzés, hogy a felhasználó már kitöltötte-e a kvízt, és korábbi válaszok lekérése
router.get('/:id/completed', requireAuth, async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await Result.findOne({ quiz: id, user: userId }).populate({
      path: 'selectedQuestions',
      populate: { path: 'options' }
    });

    if (result) {
      const correctOptions = result.selectedQuestions.map((question) => {
        const correctOption = question.options.find((option) => option.isCorrect);
        return {
          questionId: question._id,
          correctOptionId: correctOption._id,
        };
      });

      return res.json({
        completed: true,
        score: result.latestScore,
        userAnswers: result.answers,
        correctOptions,
        selectedQuestions: result.selectedQuestions,
        orderedOptions: result.orderedOptions,
      });
    } else {
      return res.json({ completed: false });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Nem sikerült ellenőrizni a kvíz kitöltöttségét.' });
  }
});


export default router;
