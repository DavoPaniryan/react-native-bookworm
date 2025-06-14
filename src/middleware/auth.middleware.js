import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        if (!token)
            return res
                .status(400)
                .json({ message: 'No authentication token, access denied' });

        const decoded = await jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(400).json({
                message: ' authentication token invalid, access denied',
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json('Internal server error');
    }
};
