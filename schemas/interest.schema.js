const mongoose=require('mongoose')

const schema= mongoose.Schema({
  interest_type:{
    type:String,
    enum:['fixed','float'],
    required:true
  },
  base_rate:{
    type:Number,
    required:true
  },
  premium_rate:{
    type:Number,
    required:true
  },
  service_fee:{
    type:Number,
    required:true
  }
},{timestamps:true})

const Interest=mongoose.model("Interest",schema)
module.exports=Interest