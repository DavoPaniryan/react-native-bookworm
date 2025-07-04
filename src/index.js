import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import job from './lib/cron.js';

import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import { connectDB } from './lib/db.js';

const app = express();

job.start();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());

const PORT = process.env.PORT || 3000;

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);

app.listen(PORT, () => {
    console.log('server is running', PORT);
    connectDB();
});
