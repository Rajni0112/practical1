const { pool } = require('../config/db.js');
const { verifyToken } = require('../common/auth.js'); // Adjust the path as needed
const { transporter } = require('../common/mailer.js'); // Adjust the path as needed

const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();


// const transporter = nodemailer.createTransport({
//     service: process.env.EMAIL_SERVICE,
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS,
//     },
// });
// const transporter = nodemailer.createTransport({
//     service: 'Gmail', // Change this to your email service (e.g., 'Outlook', 'Yahoo', etc.)
//     auth: {
//         user: 'rajanirupareliya60@gmail.com', // Your email address
//         pass: 'irqp dxqc hmqg vush', // Your email password
//     },
// });
exports.registerUser = async (req, res) => {
    try{
    const { firstName, lastName, email, password, role } = req.body;

    if (!['customer', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role specified.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
   const result= await pool.query('INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)', [firstName,lastName, email, hashedPassword, role]) 
   if (result.affectedRows === 0) {
    return res.status(400).json({ error: 'User registration failed.' });
  }
  const token = jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: '1h' });

  const mailOptions = {
    from:process.env.EMAIL_SERVICE,
    to:email,
    subject: 'Email Verification',
    text: `Please verify your email by clicking this link: http://localhost:3000/api/verify/${token}`,
};

transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return res.status(500).json({ error: 'Email sending failed: ' + error.message });
    }
    res.status(201).json({ message: 'User registered successfully, please check your email to verify your account.' });
});

 // return res.status(201).json({ message: 'User registered successfully!',token:token });

}catch(error){
    return res.status(500).json({ error: 'Internal server error.',error });
}

}


exports.verifyEmail  = async (req, res) => {
    const { token } = req.params;
    
    try{
        const decoded =await verifyToken(token);
    const result= await pool.query('UPDATE users SET verified = 1 WHERE email = ?', [decoded.email]) 

    if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'User not found or already verified.' });
    }
    return res.json({ message: 'Email verified successfully!' });

}catch(error){
    
    return res.status(500).json({ error: 'Internal server error.',message:error.message});

}


}


exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;

    const results= await pool.query('SELECT * FROM users WHERE email = ?', [email]) 
    if (results.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const user = results[0][0];
    console.log('Password from database:', user.password); // Log password specifically
    if (user.role === 'customer') {
        return res.status(403).json({ error: 'You are not allowed to login from here.' });
    }
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials.' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.SECRET_KEY, { expiresIn: '1h' });
    return res.json({ message: 'Login successful', token });

}


