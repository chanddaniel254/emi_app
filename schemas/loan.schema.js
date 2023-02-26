const mongoose=require('mongoose')

const schema= mongoose.Schema({
    farmer_id:{
        type:mongoose.Types.ObjectId,
        ref:'Farmer',
        required:true
    },
    interest_id:{
        type:mongoose.Types.ObjectId,
        ref:'Interest',
        required:true
    },
    status:{
        type:String,
        required:true,
        enum:['paid','due','late']
    },
    loan_duration:{
        type:Number,
        min:3,
        max:24,
        required:true
    },
    loan_amount:{
        type:Number,
        required:true
    },
    emi_amount:{
        type:Number,
        required:true
    }
},{timestamps:true})

const Loan=mongoose.model("Loan",schema)
module.exports=Loan