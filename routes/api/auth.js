const express=require('express');
const router= express.Router();
const auth = require('../../middleware/auth');
const User = require('../../models/Users');
const { body, validationResult } = require('express-validator');
const jwt =require('jsonwebtoken');
const config=require('config');
const bcrypt=require('bcryptjs');

// @route GEt api/auth
// @desc  test route
// access public
router.get('/',auth,async (req,res)=> {
    try{
        const user_data= await User.findById(req.user.id).select('-password');
        res.json(user_data);
    }catch(e){
        console.error(e.message);
        res.status(500).send('server error');
    }
});

// @route post api/auth
// @desc  authenticate user and get token
// access public
router.post('/',[

    body('email','Provide valid email').isEmail(),
    body('password','Password is required').exists() 

],async (req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {email,password} =req.body;    // extract all 2 things from the body just 1 time.

    try{

        //see if user exist ??
        let user=await User.findOne({email: email});
        if (!user){
            return res.status(400).json({ errors: [{msg:'Invalid Credentials'}] });
        }

        const isMatch= await bcrypt.compare(password,user.password);
        if (!isMatch){
            return res.status(400).json({ errors: [{msg:'Invalid Credentials'}] });
        }

        //return jsonwebtoken jwt
        const payload={
            user:{
                id:user.id
            }
        }
        jwt.sign(payload,config.get('jwtSecret'),{
            expiresIn:'3600000'},
            (err,token)=>{
                if(err) throw err;
                res.json({token});
            }
        );

    }catch(e){
        console.error(e.message);
        return res.status(500).send('server error');
    }
});

module.exports=router;