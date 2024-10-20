const express = require('express');
const userControllers=require('../controllers/userController.js')
const router = express.Router();


router.post('/register/customer',userControllers.registerUser)
router.post('/register/admin',userControllers.registerUser)
router.get('/verify/:token', userControllers.verifyEmail);
router.post('/login/admin', userControllers.loginAdmin);



module.exports=router