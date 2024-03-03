const jwt=require("jsonwebtoken")
const generateToken=(user)=>jwt.sign({id:user.id},process.env.SECRER_KEY,{expiresIn:'2m'})

module.exports=generateToken