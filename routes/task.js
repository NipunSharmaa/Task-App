const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma= new PrismaClient();
const router = express.Router();
const zod = require ("zod");
const {authMiddleware}= require ("../middleware/authMiddleware")

const taskBody=zod.object({
    title : zod.string().min(1),
    description: zod.string().min(1),
    due_date: zod.string().datetime()

})

router.use(authMiddleware);

router.post("/newtask", async (req,res)=>{
   const {success}= taskBody.safeParse(req.body);

   if (!success){

    return res.status(411).json({
        message:"Invalid task inputs"
    })}

    const { title, description, due_date } = req.body; 
    let priority;
    const today = new Date();
    const dueDate = new Date(due_date);
    
    const timeDiff = dueDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)); 

    if (daysDiff === 0) {
        priority = 0;
    } else if (daysDiff <= 2) {
        priority = 1;
    } else if (daysDiff <= 4) {
        priority = 2;
    } else {
        priority = 3;
    }

    try {
        const createdTask = await prisma.task.create({
            data: {
                title,
                description,
                due_date,
                priority
            }
        });
        res.status(201).json({
            message:"task created sunccessfully"
    });
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.get("/alltasks",async (req,res)=>{
    
    const {due_date,status, page, limit}= req.body;
    const {take,skip}=req.query;
    const id = req.userId;
   
   try {const alltasks= await prisma.task.findMany({

        where:{
            AND:[
            {userId:id},
            {priority:priority},
            {due_date: new Date(due_date)},
            ]

        },
        orderBy:{
            priority:'asc'
        },
        take:parseInt(take),
        skip:parseInt(skip)
    })
    return res.status(200).json(alltasks);
}catch(err){

    res.status(500).json({
        message:"Unable to get the task"
    })
}


})

router.put("updateTask", async (req,res)=>{

const {taskId,due_date}= req.body;


try{

    const status="TODO";
    const subtasks= await prisma.subTask.findMany({
        where :{
            taskId: taskId
        }
    })
    let count=0;
    for (let i =0; i< subtasks.length ; i++){
        if (subtasks[i].status==1){
            count++;
        }
    }
    if (count==array.length){
        status="DONO";
    }else if (count>0){
        status="IN_PROGRESS"
    }
const taskUpdated= await prisma.task.update({
    where :{
        id:taskId,
    },
    data:{
        due_date: due_date,
        status:status
    }
   
})
res.status(200).json({
    message:"Task updated successfully"
})
}catch(err){
    res.status(500).json({
        message:"Unable to update"
    })
}


})

router.delete("/remove", async (req,res)=>{

    const taskId= req.body.taskId;
    try{

        await prisma.subTask.updateMany({
            where :{
                taskId:taskId
            },
            data:{
                deleted_at: new Date()
            }
        })
        await prisma.task.update({
            where :{
                id :taskId
            },
            data:{
                deleted_at: new Date()
            }
        })
   
    res.status(200).json({
        message:"task and its related subtasks deleted successfully"
    })}catch(err){
        res.status(500).json({
            message:"Error in removing task"
        })
    }


})

module.exports=router;