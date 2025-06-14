import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ messag: 'All fields are required' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User does not exists' });
        }

        const passwordMatching = await bcrypt.compare(password, user.password);
        if (!passwordMatching) {
            return res
                .status(400)
                .json({ message: 'invalid password or email' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '15d',
        });
        res.status(201).json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
            },
        });
    } catch (error) {
        console.log('Error in register route', error);
        res.status(500).json('Internal server error');
    }
});

router.post('/register', async (req, res) => {
    try {
        const { email, username, password } = req.body;

        if (!email || !username || !password) {
            res.status(400).json({ message: 'All fields are required' });
        }

        if (password.length < 6) {
            res.status(400).json({
                message: 'Password at least must have 6 characters',
            });
        }

        if (username.length < 3) {
            res.status(400).json({
                message: 'Username at least must have 3 characters',
            });
        }

        const existingUser = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (existingUser) {
            res.status(400).json({
                message: 'User already exists',
            });
        }

        const profileImage = `https://api.dicebear.com/9.x/adventurer/svg?seed=${username}`;

        const salt = await bcrypt.genSalt(10);
        const newPassword = await bcrypt.hash(password, salt);

        const user = new User({
            email,
            username,
            password: newPassword,
            profileImage,
        });

        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '15d',
        });
        res.status(201).json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                profileImage: user.profileImage,
            },
        });
    } catch (error) {
        console.log('Error in register route', error);
        res.status(500).json('Internal server error');
    }
});

export default router;
