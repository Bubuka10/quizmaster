import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  questions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
    }
  ],
  questionCount: {
    type: Number,
    required: true,
    enum: [5, 10, 20],
  },
});

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
