import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { PORT, MONGO_URI } from './config.js';
import quizRoutes from './routes/quizzes.js';
import questionRoutes from './routes/questions.js';
import optionRoutes from './routes/options.js';
import resultRoutes from './routes/results.js';
import userRoutes from './routes/users.js';
import requestRoutes from './routes/requests.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route-ok használata
app.use('/quizzes', quizRoutes);
app.use('/questions', questionRoutes);
app.use('/options', optionRoutes);
app.use('/results', resultRoutes);
app.use('/users', userRoutes);
app.use('/requests', requestRoutes);

let server;

// MongoDB + szerver kapcsolat
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Sikeres kapcsolat a MongoDB-hez.');
        server = app.listen(PORT, () => {
            console.log(`A szerver a ${PORT} porton fut.`);
        });
    })
    .catch(err => {
        console.error('Hiba a MongoDB-hez való kapcsolódás során:', err);
    });

export { app, server };
