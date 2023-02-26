const { default: mongoose } = require('mongoose')
const Interest = require('../schemas/interest.schema')
const { validate_interest_data } = require('../validations/data.validation')

const interest_route= require('express').Router()


const get_all_interests=async(req,res,next)=>{
    const interests= await Interest.find()
    if(!interests) return next({code:500,message:'something went wrong while fetching interest list'})
    res.status(200).json({
        status:true,
        interests
    })
}

const post_interest=async(req,res,next)=>{

    try {
        const data= req.body
        await validate_interest_data(data)
        const interest= new Interest(data)
        await interest.save()
        res.status(200).json({
            status:true,
            message:'new interest added',
            interest
        })
    } catch (error) {
        next({code:400,message:error})
    }
}

const update_interest=async(req,res,next)=>{
    const isValid= mongoose.isValidObjectId(req.params.id)
    if(!isValid) return next({code:400,message:'provided id is not valid'})

    Interest.findByIdAndUpdate(req.params.id,{
        interest_type:req.body.interest_type,
        base_rate:req.body.base_rate,
        premium_rate:req.body.premium_rate,
        service_fee:req.body.service_fee
    },function(err){
        if(err) return next({code:500,message:err})
        res.status(200).json({
            status:true,
            message:'interest updated',
        })
    })
}

const delete_interest=async(req,res,next)=>{
    const isValid= mongoose.isValidObjectId(req.params.id)
    if(!isValid) return next({code:400,message:'provided id is not valid'})

    try {
        await Interest.findByIdAndDelete(req.params.id)
        res.status(200).json({
            status:true,
            message:'interest deleted',
        })
    } catch (error) {
        next({code:500,message:error})
    }
}


interest_route.route('')
.get(get_all_interests)
.post(post_interest)

interest_route.route('/:id')
.put(update_interest)
.delete(delete_interest)

module.exports=interest_route