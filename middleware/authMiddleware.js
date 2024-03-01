const jwt= require("jsonwebtoken");
require ("dotenv").config()

const JWT_KEY= process.env.JWT_KEY;

const authMiddleware= (req,res,next)=>{

   const authHeader = req.headers.authorization;
   
   if (!authHeader || authHeader.startsWith('Bearer ')){
    return res.status(403).json({
        message:"Invalid headers of token"
    });
   }

   const token = authHeader.split(' ')[1];

   try {

    const decoded= jwt.verify(token, JWT_KEY);

    req.userId= decoded.userId;
    next();
   }catch(err){

    return res.status(403).json({
        message:"invalid user"
    })
   }


}

module.exports={
    authMiddleware
}