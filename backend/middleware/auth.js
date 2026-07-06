// middleware/auth.js
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');

const authMiddleware = async (req, res, next) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No authentication token, access denied' 
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
        
        // Find student
        const student = await Student.findById(decoded.id).select('-password');
        
        if (!student) {
            return res.status(401).json({ 
                success: false, 
                message: 'Student not found' 
            });
        }

        if (!student.isActive) {
            return res.status(401).json({ 
                success: false, 
                message: 'Account is inactive' 
            });
        }

        // Attach student to request
        req.student = student;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ 
            success: false, 
            message: 'Token is not valid' 
        });
    }
};

module.exports = authMiddleware;