const cron= require('node-cron');
const {PrismaClient}= require('@prisma/client');
const prisma= new PrismaClient();

cron.schedule('0 0 * * *', async () => {
    try {
      const tasks = await prisma.task.findMany({
        where: {
          due_date: {
            equals: new Date().toISOString().split('T')[0], // Today's date
          },
        },
      });
  
      
      await Promise.all(
        tasks.map(async (task) => {
         
          await prisma.task.update({
            where: { id: task.id },
            data: { priority: calculatePriority(task.due_date) },
          });
        })
      );
    } catch (err) {
    
    }
  });

  function calculatePriority(due_date){

    const today = new Date();
    const priority=0; 
    
    const timeDiff = due_date.getTime() - today.getTime();
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

    return priority;
  }