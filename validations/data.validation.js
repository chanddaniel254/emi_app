const joi=require('joi')

const validate_account_data=async(data)=>{
    const schema= joi.object({
        account_no:joi.string().required(),
        mobile_no:joi.string().required()
    })
    const response= schema.validate(data)
    if(response.error)
    throw response.error.details[0].message
}

const validate_grade_data=async(data)=>{
    const schema= joi.object({
        farmer_level:joi.string().valid('platinum','gold','silver','none').required(),
        loan_limit:joi.number().required(),
        condition:joi.string().required()
    })
    const response= schema.validate(data)
    if(response.error)
    throw response.error.details[0].message
}

const validate_interest_data=async(data)=>{
    const schema= joi.object({
        interest_type:joi.string().valid('fixed','float').required(),
        base_rate:joi.number().required(),
        premium_rate:joi.number().required(),
        service_fee:joi.number().required()
        
    })
    const response= schema.validate(data)
    if(response.error)
    throw response.error.details[0].message
}


const validate_loan_data=async(data)=>{
    const schema= joi.object({
        farmer_id:joi.string().required(),
        interest_id:joi.string().required(),
        status:joi.string().valid('paid','late','due').required(),
        loan_duration:joi.number().required(),
        loan_amount:joi.number().required(),
        emi_amount:joi.number().required(),
        
        
    })
    const response= schema.validate(data)
    if(response.error)
    throw response.error.details[0].message
}


const validate_blacklist_data=async(data)=>{
    const schema= joi.object({
        farmer_name:joi.string().required(),
        account_no:joi.string().required(),
        mobile_no:joi.string().required(),
        identification_no:joi.string().required(),
        dob:joi.string().required(),
        father_name:joi.string().required(),
        grand_father_name:joi.string().required(),
        gender:joi.string().valid('male','female','other').required(),
        mother_name:joi.string().required(),
        score:joi.number().required(),
        
        
    })
    const response= schema.validate(data)
    if(response.error)
    throw response.error.details[0].message
}


module.exports={
    validate_account_data,
    validate_blacklist_data,
    validate_grade_data,
    validate_interest_data,
    validate_loan_data
}