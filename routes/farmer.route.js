const farmer_route = require('express').Router()
const jwt = require('jsonwebtoken')
const Loan =require('../schemas/loan.schema')
const Farmer =require('../schemas/farmer.schema')
const { validate_blacklist_data, validate_loan_data,validate_account_data } = require('../validations/data.validation')
const Grade = require('../schemas/grade.schema')
const Interest = require('../schemas/interest.schema')

const accounts = [
        { account_no: '1', mobile_no: '11', blacklisted: false },
        { account_no: '3', mobile_no: '33', blacklisted: false },
        { account_no: '2', mobile_no: '22', blacklisted: true }

]


 const SECRET= process.env.SECRET

const validate_account = async(req, res, next) => {

    try {
       
        const data=req.body

        await validate_account_data(data)
        const account= accounts.filter(f=>f.account_no===data.account_no)
        if(account.length <=0)
        return next({code:400,message:'account number not found'})

        if(account[0].mobile_no != data.mobile_no)
        return next({code:402,message:'mobile number not recognized'})

        const token= jwt.sign({
            account_no:account[0].account_no,
            mobile_no:account[0].mobile_no
        },SECRET,{expiresIn:'1d'})

        res.status(200).json({
            status:true,
            token
        })
        
    } catch (error) {
        next({code:400,message:error})
    }
}


const check_token=async(req,res,next)=>{
    try {
        var token= req.headers['authorization']
        if(!token) return next({code:402,message:'token not provided'})

        token= token.split(' ')[1]

        const response= jwt.verify(token,SECRET)
        req.account_no = response.account_no
        req.mobile_no= response.mobile_no
        next()

    } catch (error) {
        next({code:400,message:error})
    }
}

const pass_eligibility= async(req,res,next)=>{
    try {
        let remaining_balance;
        let total_borrowed;
        let message='your are not eligible for the loan. reason: account blacklisted';

        if(!req.data.blacklisted){
            const loan= await Loan.find()
            const prev_loan= loan.filter(f=>f.account_no===req.account_no)
            if(prev_loan <=0){
                remaining_balance = req.data.loan_limit
            }else{
                total_borrowed= prev_loan.reduce((ac,cur)=>ac + cur.loan_amount,0)
                remaining_balance= (req.data.loan_limit - total_borrowed).toFixed(2)
            }
            message='you are eligible fo the loan'
        }
        
        const farmer_data={
            farmer_name: req.data.farmer_name,
            mobile_no: req.data.mobile_no,
            account_no: req.data.account_no,
            identification_no: req.data.identification_no,
            score: req.data.score,
            loan_limit:req.data.loan_limit,
            blacklisted:req.data.blacklisted
        }

        // const farmer= await Farmer.findOne({account_no:req.data.account_no})

        // if(!farmer){
            const data= new Farmer(farmer_data)
            await data.save()
            if(!data) return next({code:500,message:'internal server error occurred while registering farmer detail'})
        // }else{
        //     Farmer.findByIdAndUpdate({_id:farmer._id},farmer_data,function(err){
        //         if(err) return next({code:500,message:'internal server error occurred while updating farmer detail'})
        //     })
        // }

        res.status(200).json({
            status:true,
            message,
            loan_limit:req.data.loan_limit,
            remaining_balance,
            total_borrowed,
            farmer_level:req.farmer_level,
            blacklisted:req.data.blacklisted
        })
    } catch (error) {
        next({code:500,message:error})
    }
}

const check_black_list=async(req,res,next)=>{
    try {
        const data=req.body
        data.mobile_no=req.mobile_no,
        data.account_no=req.account_no

        await validate_blacklist_data(data)

        const account= accounts.filter(f=>f.account_no===data.account_no)
        if(account.length <=0)
        return next({code:400,message:'account number not found'})
        if(account.length > 0 && account[0].blacklisted ===true){
            data.blacklisted=true
            data.loan_limit=0
            data.farmer_level='none'
        }else{
            data.blacklisted=false
            const point=data.score

            const grades= await Grade.find()

            const grade= grades.filter(f=>
                (new Function(`const point = arguments[0]; return ${f.condition}`))(point))

            if(grade.length <=0) return next({code:400,message:'score range must be between 0 and 3'})
           
            data.loan_limit=grade[0].loan_limit
            data.farmer_level=grade[0].farmer_level
        }

        req.data= data
        next()

    } catch (error) {
        next({code:400,message:error})
    }
}

const calculate_emi= async (req,res,next)=>{
    if(req.tenure < 3 || req.tenure > 24 || req.tenure % 3 !=0)
    return next({code:400,message:'allowded loan durations: 3, 6, 9, 12, 15, 18, 21, 24'})

    if(req.tenure <12 && req.interest_type ==='float')
    return next({code:400,message:'interest type must be fixed when loan term is less than 12 months'})

    const interest= await Interest.findOne({interest_type:req.interest_type})

    if(!interest) return next({code:400,message:'interest type must be fixed or float'})
    const c_interest= interest.base_rate + interest.premium_rate

    const loan_data={
        loan_amount:req.loan_amount,
        interest_id:interest._id.toString(),
        status:'due',
        loan_duration:req.tenure,
        farmer_id:req.farmer_id
    }

    const emi= (loan_data.loan_amount * (c_interest/1200) * Math.pow((1+(c_interest/1200)),loan_data.loan_duration))/ (Math.pow((1+(c_interest/1200)),loan_data.loan_duration)-1)
    loan_data.emi_amount= emi.toFixed(2)

    try {
        const data= loan_data
        await validate_loan_data(data)
        const loan= new Loan(data)
        await loan.save()
        res.status(200).json({
            status:true,
            message:'loan submitted'
        })
    } catch (error) {
        next({code:400,message:error})
    }
}

const calculate_interest= async(req,res,next)=>{
      const loan_amount= req.params.loan_amount
      const tenure= req.params.tenure
      const interest_type=req.params.interest_type

      if(tenure < 3 || tenure > 24 || tenure % 3 !=0)
      return next({code:400,message:'allowded loan durations: 3, 6, 9, 12, 15, 18, 21, 24'})
  
      if(tenure <12 && interest_type ==='float')
      return next({code:400,message:'interest type must be fixed when loan term is less than 12 months'})
  
      const interest= await Interest.findOne({interest_type:interest_type})
  
      if(!interest) return next({code:400,message:'interest type must be fixed or float'})
      const c_interest= interest.base_rate + interest.premium_rate
  
  
      const emi= ((loan_amount * (c_interest/1200) * Math.pow((1+(c_interest/1200)),tenure))/ (Math.pow((1+(c_interest/1200)),tenure)-1)).toFixed(2)
      
      res.status(200).json({
         emi,
         interest:c_interest,
         loan_amount,
         interest_type,
         tenure,
         total_cost: (emi * tenure).toFixed(2)
      })
  
}


const get_loan_history= async(req,res,next)=>{
    const farmer= await Farmer.findOne({account_no:req.account_no})
    if(!farmer) return next({code:404,message:'token generated from invalid account'})

    const loan= await Loan.find()
    const prev_loan= loan.filter(f=>f.farmer_id.toString()===farmer._id.toString())

    let remaining_balance=0;
    let total_borrowed=0;

    if(prev_loan.length <=0){
        remaining_balance= farmer.loan_limit
    }else{
        total_borrowed= prev_loan.reduce((ac,cur)=> ac + cur.loan_amount,0)
        remaining_balance= farmer.loan_limit - total_borrowed
    }

    res.status(200).json({
       status:true,
       prev_loan,
       total_limit:farmer.loan_limit,
       total_utilized:total_borrowed,
       remaining_balance
    })
}

const check_remaining_balance=async(req,res,next)=>{

    const {loan_amount,tenure,interest_type}= req.body

    if(!loan_amount) return next({code:400,message:'loan amount required'})
    if(!tenure) return next({code:400,message:'tenure required'})
    if(!interest_type) return next({code:400,message:'interest_type required'})

    const farmer= await Farmer.findOne({account_no:req.account_no})
    if(!farmer) return next({code:404,message:'token generated from invalid account, check for eligibility before applying for loan'})

    if(farmer.blacklisted) return next({code:402,message:'sorry you cannot proceed, your account is blacklisted'})
    if(farmer.loan_limit <=0) return next({code:402,message:'sorry you cannot proceed, loan limit not assigned'})

    const loan= await Loan.find()
    if(!loan) return next({code:500,message:'something went wrong, while checking previous loan data'})

    const farmer_loan= loan.filter(f=>f.farmer_id.toString()===farmer._id.toString())

    if(farmer.loan_limit < loan_amount) return next({code:400,message:'loan amount more than loan limit is not allowded'})

    if(farmer_loan.length >0){
        let total_borrowed= farmer_loan.reduce((ac,cur)=> ac + cur.loan_amount,0)
        let remaining_balance= (farmer.loan_limit - total_borrowed).toFixed(2)
        if(remaining_balance <=0) return next({code:400,message:'total balance already utilized'})
        if(remaining_balance < loan_amount) return next({code:400,message:'loan amount more than remaining balance is not allowded'})

    }
    req.loan_amount= loan_amount,
    req.tenure=tenure,
    req.interest_type=interest_type,
    req.farmer_id=farmer._id.toString()
    next()
    
}

const already_cleared=async(req,res,next)=>{

      const farmer= await Farmer.findOne({account_no:req.account_no})

        if(farmer)
        return   res.status(200).json({
                message:'you already cleared the eligibility test',
                status:true,
                loan_limit:farmer.loan_limit
            })
        
            next()

}

farmer_route.post('/validate_account',validate_account)
farmer_route.post('/eligibility',check_token,already_cleared,check_black_list,pass_eligibility)
farmer_route.get('/history',check_token,get_loan_history)
farmer_route.get('/interest/:tenure/:loan_amount/:interest_type',calculate_interest)
farmer_route.post('/apply_loan',check_token,check_remaining_balance,calculate_emi)

module.exports= farmer_route