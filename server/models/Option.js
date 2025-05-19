import mongoose from 'mongoose';

const optionSchema = new mongoose.Schema({
  optionText: {
    type: String,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
});

const Option = mongoose.model('Option', optionSchema);

export default Option;
