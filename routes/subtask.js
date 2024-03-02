const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma= new PrismaClient();
const router = express.Router();
const zod = require ("zod");
const {authMiddleware}= require ("../middleware/authMiddleware")


router.use(authMiddleware);

router.post("/newsubtask", async (req,res)=>{


const taskId= req.body.taskId;
try{
    const userId= req.userId;
    const subTask= await prisma.subTask.create({
        data:{
            taskId:taskId
        }

   })
   res.status(200).json({
    message:"Subtask created successfully"
   })
}
catch(err){

    res.status(500).json({
        message:"Unable to add the subtask"
    })
}



})


module.exports= router;

router.get("/allSubTasks",async(req,res)=>{
 
    const taskId = req.body.taskId;

    try {
        const userId = req.userId;
        const task = await prisma.task.findUnique({
            where: {
                id: taskId
            }
        });

        if (!task) {
            return res.status(404).json({
                message: "No task found for the taskId"
            })
        }else {

            const subtasks= await prisma.task.findMany({
                where:{
                    id:taskId
                }
            })
            return res.status(200).res.json({
                subtasks
            })
        }}
        catch(err){
            res.status(500).json({
                message:"error in getting subtasks"
            })
        }


})

router.put("updateSubtask", async(req,res)=>{
   const {id,status}= req.body;

   try {
        
    const subtask = await prisma.subTask.findUnique({
        where: {
            id: id
        }
    });

    if (!subtask) {
        return res.status(404).json({
            message: "No subtask found for the id provided"
        })
    }
    const subtaskUpdated= await prisma.subTask.update({
        where :{
            id:id,
        },
        data:{
            status:status
        }
       
    })
    res.status(200).json({
        message:"Subtask updated successfully"
    })
   
    }
    catch(err) {
        return res.status(500).json({
            message:"Unable to update the subtask"
        })
    }



})

router.delete("deleteSubTask", async(req,res)=>{
 const {id} = req.body.id;
 try{

    await prisma.subTask.update({
        where :{
            id:id
        },
        data:{
            deleted_at: new Date()
        }
    })
   

res.status(200).json({
    message:"subtask deleted successfully"
})}catch(err){
    res.status(500).json({
        message:"Error in removing the subtask"
    })
}


})

