import mongoose from 'mongoose';

const resultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  score: {
    type: Number,
    required: true,
  },
  answers: { 
    type: Map, 
    of: mongoose.Schema.Types.ObjectId,
  },
  completionTime: {
    type: Number,
    required: true,
  },
  selectedQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
  }],
  orderedOptions: {
    type: Map,
    of: [mongoose.Schema.Types.ObjectId],
  },
});

const Result = mongoose.model('Result', resultSchema);

export default Result;
