const mongoose=require('mongoose')

const schema= mongoose.Schema({
    farmer_name:{
        type:String,
        required:true
    },
    account_no:{
        type:String,
        required:true,
        unique:true
    },
    mobile_no:{
        type:String,
        required:true
    },
    identification_no:{
        type:String,
        required:true
    },
    score:{
        type:Number,
        required:true
    },
    loan_limit:{
        type:Number,
        required:true
    },
    blacklisted:{
        type:Boolean,
        required:true
    }
},{timestamps:true})

const Farmer=mongoose.model("Farmer",schema)
module.exports=Farmer