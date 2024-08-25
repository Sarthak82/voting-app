const express = require('express')
const router = express.Router()
const User = require('./../models/user')
const {jwtAuthMiddleware, genrateToken} = require('./../jwt')


router.post('/signup', async(req,res)=>{
    try{
        const userData = req.body
        
        const adminUser = await User.findOne({role: 'admin'})
        
        if(userData.role==='admin' && adminUser){
            return res.status(400).json({message: 'Admin user already exists'})
        }

        const newUser = new User(userData)
        const response = await newUser.save()
        console.log("data saved Successfully")

        const payload = {
            id: response.id,
        }

        const token = genrateToken(payload)
        res.status(200).json({response: response, token: token})

    }catch(error){
        console.log(error)
        res.status(500).send('Internal Server Error')
    }
})

router.post('/login', async(req,res)=>{
    try{
        const {aadharCardNumber, password} = req.body
        const user = await User.findOne({aadharCardNumber: aadharCardNumber}) 

        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({message: 'Invalid username or password'})
        }

        const payload = {
            id: user.id
        }

        const token = genrateToken(payload)
        res.status(200).json({token})

    }catch(error){
        console.log(error)
        res.status(500).send('Internal Server Error')
    }
})


router.get('/profile', jwtAuthMiddleware, async(req,res)=>{
    try{

        const profileData = req.user
        const profileID = profileData.id
        const response = await User.findById(profileID)
        if(!response){
            return res.status(404).json({message: 'User not found'})
        }
        console.log("file fetched successfully")
        return res.status(200).json({user: response})

    }catch(error){
        console.log(error)
        res.status(500).send('Internal Server Error')
    }
})

router.put('/profile/password' , jwtAuthMiddleware ,async(req,res)=>{
    try{
        const userID = req.user.id
        const {currentPassword, newPassword} = req.body

        const user = await User.findById(userID)

        if(!(await user.comparePassword(currentPassword))){
            return res.status(401).json({message: 'Invalid password'})
        }

        user.password = newPassword
        await user.save()
        res.status(200).json({message: 'Password updated successfully'})

    }catch(error){
        console.log(error)
        res.status(500).json({message: 'Internal Server Error'})
    }
})


module.exports= router