const express = require('express');
const router= express.Router()
const taskRouter = require("./task");
const subtaskRouter = require("./subtask");
const userRouter= require("./user")

router.use("/task", taskRouter);
router.use("/subtask", subtaskRouter);
router.use("/user",userRouter);



module.exports = router;
