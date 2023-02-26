const { default: mongoose } = require('mongoose');
const Grade = require('../schemas/grade.schema');
const { validate_grade_data } = require('../validations/data.validation');

const grade_route= require('express').Router()


const get_all_grade=async(req,res,next)=>{

    const grades=await Grade.find();

    if(!grades) return next({code:500,message:'internal server error occurred while fetching grades '})
    res.status(200).json({
        status:true,
        grades
    })

}

const post_grade=async(req,res,next)=>{
   
    try {
        const data=req.body
        await validate_grade_data(data)
        if(!data.condition.startsWith('point')) return next({code:400,message:'invalid condition format, string must start with "point"'})
     
        const regex= /\bpoint\s+(?:=|<|>|<=|>=|)\s*\d+/;
        if(!regex.test(data.condition))
        return next({code:400,message:'invalid condition format, string must contain comparative operator and then number after point. example: point < 1'})
     
        const grade= new Grade(data)
        await grade.save()
        res.status(200).json({
            status:true,
            data,
            message:'new grade added'
        })
        
    } catch (error) {
        next({code:400,message:error})
    }

}


const update_grade=async(req,res,next)=>{
    const isValid= mongoose.isValidObjectId(req.params.id)
    if(!isValid) return next({code:400,message:'provided id doesnt exist'})

    Grade.findByIdAndUpdate(req.params.id,{
        farmer_level:req.body.farmer_level,
        loan_limit:req.body.loan_limit,
        condition:req.body.condition
    },function(err){
        if(err) return next({code:500,message:err})
        res.status(200).json({
            status:true,
            message:'grade updated'
        })
    })
}

const delete_grade=async(req,res,next)=>{

    try {

        await Grade.findByIdAndDelete(req.params.id)
        res.status(200).json({
            status:true,
            message:'grade deleted'
        })
        
    } catch (error) {
        next({code:500,message:error})
       
    }
}

grade_route.route('')
.get(get_all_grade)
.post(post_grade)


grade_route.route('/:id')
.put(update_grade)
.delete(delete_grade)

module.exports=grade_route