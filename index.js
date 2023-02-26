require('dotenv').config()
const express=require('express')
const bodyparser=require('body-parser')
const mongoose=require('mongoose')
const cors=require('cors')
const routes = require('./routes/routes')

const app=express()

mongoose.set('strictQuery',false)
mongoose.connect('mongodb+srv://daniel:Kailali123@cluster0.rqi7w.mongodb.net/kheti?retryWrites=true&w=majority')
.then(()=>console.log('database is ready to use'))
.catch((err)=>console.log(err))


//middleware

app.use(cors())
app.use(bodyparser.json())
//end


//routes

app.use('/kheti',routes)
//end

app.use((req,res,next)=>{
    next({code:404,message:'requested url not found'})
})

app.use((err,req,res,next)=>{

    const err_code= err.code ?? 500
    const err_msg= err.message ?? err

    res.status(err_code).json({
        status:false,
        message:err_msg
    })
})



app.listen(2000,()=>{
    console.log('server is running on port 2000')
})