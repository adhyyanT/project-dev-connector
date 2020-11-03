const express=require('express');
const router= express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../../models/Users');
const gravatar=require('gravatar');
const bcrypt = require('bcryptjs');
const jwt =require('jsonwebtoken');
const config=require('config');

// @route post api/users
// @desc  register user
// access public
router.post('/',[

    body('name','Name is required').not().isEmpty(),
    body('email','Provide valid email').isEmail(),
    body('password','minimum length for password is 6 characters').isLength({min:6}) 

],async (req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {name,email,password} =req.body;    // extract all 3 things from the body just 1 time.
    try{

        
        //see if user exist ??
        let user=await User.findOne({email: email});
        if (user){
            return res.status(400).json({ errors: [{msg:'user already exist'}] });
        }

        //get users gravatar
        const avatar = gravatar.url(email,{
            s:'200',
            r:'pg',
            d:'mm'
        })

        //instance of user
        user = new User({
            name,
            email,
            avatar,
            password
        })        

        //encrypting password with bcrypt
        const salt=await bcrypt.genSalt(10);
        user.password=await bcrypt.hash(password,salt);

        await user.save();

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
        console.log(req.body);  //body needs to be parsed

    }catch(e){
        console.error(e.message);
        return res.status(500).send('server error');
    }
});

module.exports=router;