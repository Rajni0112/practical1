
const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyToken = async (token) => {
    if (!token) {
        throw new Error('Token is required.');
    }
    try {
        return jwt.verify(token, process.env.SECRET_KEY);
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token.');
        } else if (error.name === 'TokenExpiredError') {
            throw new Error('Token has expired.');
        }
        throw new Error('Invalid token.');
    }
};


module.exports = {verifyToken};
