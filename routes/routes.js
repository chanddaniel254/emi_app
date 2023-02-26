const farmer_route = require('./farmer.route');
const grade_route = require('./grade.route');
const interest_route = require('./interest.route');
const routes= require('express').Router()


routes.use('/grade',grade_route)
routes.use('/interest',interest_route)
routes.use('/farmer',farmer_route)
module.exports=routes;