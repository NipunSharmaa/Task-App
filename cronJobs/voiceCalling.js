const cron= require('node-cron');
const twilio = require('twilio');
const {PrismaClient}= require('@prisma/client');
const express = require('express');
const router = express.Router();
const prisma= new PrismaClient();
require("dotenv").config();

const sID= process.env.accountSid;
const token= process.env.authToken;
const number= process.env.number;

cron.schedule('0 0 * * *', async () => {
  try {
      const missedTasks = await prisma.task.findMany({
          where: {
              due_date: {
                  lt: new Date(),
              },
              OR: [
                  { status: 'TODO' },
                  { status: 'IN_PROGRESS' },
              ],
          },
      });

      for (const task of missedTasks) {
          const user = await prisma.user.findFirst({
              where: { id: task.userId },
              orderBy: { priority: 'asc' },
          });

          if (user) {
            
              const callSuccessful = await makeTwilioVoiceCall(user.phone_number);

              if (!callSuccessful) {
                  
                  continue;
              } else {
                  // If the call was successful (answered), break the loop
                  break;
              }
          }
      }
  } catch (error) {
      console.error('Error making voice calls:', error);
  }
});

async function makeTwilioVoiceCall(phone_number) {
  try {
      const accountSid = sID;
      const authToken = token;

      const client = twilio(accountSid, authToken);

      const call = await client.calls.create({
          url: 'http://demo.twilio.com/docs/voice.xml', 
          to: phone_number, 
          from: number, 
          statusCallback: 'https://localhost:4040/twilio/status_callback', 
          statusCallbackEvent: ['completed', 'no-answer'], 
      });

      return true; 
  } catch (error) {
      console.error(error);
      return false; 
  }
}

router.post('/twilio/status_callback', (req, res) => {
  const callStatus = req.body.CallStatus;

  if (callStatus === 'completed') {
      
      const callDuration = req.body.CallDuration;
      const answeredThreshold = 3; 

      if (callDuration && parseInt(callDuration) > answeredThreshold) {
          console.log('Call was successfully answered');
     
      } else {
          console.log('Call was not answered');
        
      }
  } else if (callStatus === 'no-answer') {
      console.log('Call was not answered');
    
  } else if (callStatus === 'in-progress') {

  } else {
      console.log(`Call status: ${callStatus}`);
  }

  res.sendStatus(200); 
});
