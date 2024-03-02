const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma= new PrismaClient();
const router = express.Router();
const zod = require ("zod");
const jwt = require("jsonwebtoken");

const {authMiddleware}= require ("../middleware/authMiddleware")
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;

const signupBody= zod.object({
    phone_number : zod.string().length(10),
    priority: zod.number()
});


router.post("/signup", async (req,res)=>{
    const { success } = signupBody.safeParse(req.body);

    if (!success) {
        return res
          .status(411)
          .json({ message: "Incorrect inputs." });
      }
      try{
        const user = await prisma.user.create({
            data: {
                phone_number: req.body.phone_number,
                priority: req.body.priority,
            }
        });

   
     const userId= user.id;
     const token= jwt.sign({userId}, JWT_SECRET);
     res.status(200).json({
        message:"User created successfully",
        token:token
     })
    }catch(err){
        console.log(err);
        res.status(500).json({
            message:"Error in signing up"
        })
    }

})

const signinBody= zod.object({
    id: zod.number(),
    phone_number : zod.string().length(10),
    priority: zod.number()
});

router.post("/signin", async (req,res)=>{

    const { success } = signinBody.safeParse(req.body);
    if (!success) {
      return res.status(411).json({
        message: "Incorrect inputs",
      });
    }

    try{
        const { id } = req.body;
      const user= prisma.user.findUnique({
        where:{
            id:id
        }
      })
      if (!user){
        return res.status(404).json({
            message:"No such user found"
        })
      }
      const token= jwt.sign({
        userId:id
      }, JWT_SECRET);
      return res.status(200).json({
        message:"Successfully signed in",
        token:token
      })
    }catch(err){
        console.log(err);
        res.status(500).json({
            message:"Unable to signin"
        })
    }

})

module.exports=router;