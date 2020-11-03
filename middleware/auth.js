const jwt=require('jsonwebtoken');
const config=require('config');


module.exports=(req,res,next)=>{
    //get token from header
    const token = req.header('x-auth-token');

    //check if token is recieved
    if (!token){
        return res.json({msg:'No token, authorization denied'});
    }

    //verify token
    try{
        const decoded=jwt.verify(token,config.get('jwtSecret'));
        req.user=decoded.user;
        next(); //every middleware calls next();

    }catch(e){
        res.status(401).json({msg:'Token is invalid'});
    }

}