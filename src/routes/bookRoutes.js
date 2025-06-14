import express from 'express';
import cloudinary from '../lib/cloudinary.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Book from '../models/book.js';
import { protectRoute } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', protectRoute, async (req, res) => {
    try {
        const { title, caption, rating, image } = req.body;
        if (!image || !title || !caption || !rating)
            return res
                .status(400)
                .json({ message: 'Please provide all fields' });

        const uploadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = uploadResponse.secure_url;

        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user.secure_urlid,
        });

        await newBook.save();
        res.status(201).json(newBook);
    } catch (error) {
        console.log('Error in book route', error);
        res.status(500).json('Internal server error');
    }
});

router.get('/', protectRoute, (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 5;
        const skip = (page - 1) * limit;
        const books = Book.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'username profileImage');

        const totalBooks = Book.countDocuments();
        res.send({
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit),
        });
    } catch (error) {
        res.status(500).json('Internal server error');
    }
});

router.get('/user', protectRoute, async (req, res) => {
    try {
        const books = await Book.find({ user: req.user._id }).sort({
            createdAt: -1,
        });
        res.json(books);
    } catch (error) {
        res.status(500).json('Internal server error');
    }
});

router.delete('/:id'.protectRoute, async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) return res.status(404).json({ message: 'Book not found' });

        if (book.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Unauhtorized' });
        }

        if (book.image && book.image.includes('cloudinary')) {
            try {
                const publicId = book.image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (error) {
                console.log('Error deleting image', error);
            }
        }

        await book.deleteOne();

        res.json({ message: 'Book deleted successfuly' });
    } catch (error) {
        res.status(500).json('Internal server error');
    }
});

export default router;
