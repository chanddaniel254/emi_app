const mongoose=require('mongoose')

const schema= mongoose.Schema({
  farmer_level:{
    type:String,
    enum:['platinum','gold','silver','none'],
    required:true
  },
  loan_limit:{
    type:Number,
    required:true
  },
  condition:{
    type:String,
    required:true
  }
},{timestamps:true})

const Grade=mongoose.model("Grade",schema)
module.exports=Grade