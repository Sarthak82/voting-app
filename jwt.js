const jwt = require('jsonwebtoken');

const jwtAuthMiddleware =(req,res,next)=>{
    const authorization = req.headers.authorization;
    if(!authorization){
        return res.status(401).json({msg: 'No token provided'})
    }

    const token = req.headers.authorization.split(' ')[1] 
    if(!token){
        return res.status(401).json({message: 'Invalid token'})
    }
    
    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET)
        req.user = decoded
        next()
    }catch(error){
        console.log(error)
        res.status(401).json({message: 'Invalid token'})
    }
}

const genrateToken = (userData)=>{
    return jwt.sign(userData, process.env.JWT_SECRET)
}

module.exports = {jwtAuthMiddleware, genrateToken}