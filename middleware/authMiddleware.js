const jwt= require("jsonwebtoken");
const { CallContextImpl } = require("twilio/lib/rest/api/v2010/account/call");
require ("dotenv").config()

const JWT_SECRET= process.env.JWT_SECRET;

const authMiddleware=  (req,res,next)=>{

   const authHeader = req.headers.authorization;
   
   if (!authHeader || !authHeader.startsWith("Bearer ")){
    return res.status(403).json({
        message:"Invalid headers of token"
    });
   }
   //console.log(authHeader);
   const token = authHeader.split(' ')[1];
   //console.log(token);

   try {

    const decoded=  jwt.verify(token, JWT_SECRET);

    req.userId= decoded.userId;
    next();
   }catch(err){
    console.log(err);
    return res.status(403).json({
        message:"invalid user"
    })
   }


}


module.exports={
    authMiddleware
}