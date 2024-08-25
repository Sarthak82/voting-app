const express = require('express');
const router = express.Router();
const Candidate = require('./../models/candidate')
const {jwtAuthMiddleware, genrateToken} = require('./../jwt')
const User = require('./../models/user')


const checkAdminRole = async(userID)=>{
    try{
        const user = await User.findById(userID)
        return user.role==='admin'
    }catch(err){
        return false
    }
} 

router.post('/add', jwtAuthMiddleware ,async(req,res)=>{

    try{
        if(!(await checkAdminRole(req.user.id))){
            return res.status(403).json({message: 'Access Forbidden'})
        }
        const candidateData = req.body
        const newCandidate = new Candidate(candidateData)
        const response = await newCandidate.save()
        if(!response){
            res.status(500).json({error: 'Internal Server Error'})
        }else{
            res.status(200).json(response)
        }
        
    }catch(err){
        console.log(err)
        res.status(500).json({error: 'Internal Server Error'})
    }
})

router.put('/update/:candidateID', jwtAuthMiddleware ,async(req,res)=>{
    try{
        if(!(await checkAdminRole(req.user.id))){
            return res.status(403).json({message: 'Access Forbidden'})
        }        
        const candidateID = req.params.candidateID
        const updatedData = req.body

        const response = await Candidate.findByIdAndUpdate(candidateID,updatedData,{
            new:true,
            runValidators:true
        } ) 

        if(!response){
            res.status(404).json({error: 'Candidate not found'})
        }else{
            res.status(200).json(response)
        }

    }catch(error){
        console.log(error)
        res.status(500).json({error: 'Internal Server Error'})
    }
})

router.delete('/remove/:candidateID', jwtAuthMiddleware ,async(req, res)=>{
    try{
        if(!(await checkAdminRole(req.user.id))){
            return res.status(403).json({message: 'Access Forbidden'})
        }

        const candidateID = req.params.candidateID

        const response = await Candidate.findByIdAndDelete(candidateID)

        if(!response){
            res.status(404).json({error: 'Candidate not found'})
        }else{
            res.status(200).json({message: 'Candidate deleted successfully'})
        }

    }catch(error){
        console.log(error)
        res.status(500).json({error: 'Internal Server Error'})
    }
})

// voting part
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req,res)=>{
    
    try{
        const candidateID = req.params.candidateID
        const candidate = await Candidate.findById(candidateID)
        if(!candidate){
            return res.status(404).json({message: 'Candidate not found'})
        }

        const userID = req.user.id
        const user = await User.findById(userID)
        
        if(!user){
            return res.status(404).json({message: 'User not found'})
        }
        
        if(user.isVoted){
            return res.status(400).json({message: 'You have already voted'})
        }
        
        if(user.role === 'admin'){
            return res.status(403).json({message: 'Admin cannot vote'})
        }

        candidate.votes.push({user: userID})
        candidate.voteCount++
        await candidate.save()

        user.isVoted = true
        await user.save()

        res.status(200).json({message: 'Vote recorded successfully'})

    }catch(error){
        console.log(error)
        res.status(500).json({error: 'Internal Server Error'})
    }
})

router.get('/vote/count', async(req,res)=>{
    try{
        const candidate = await Candidate.find().sort({voteCount: 'desc'})
        
        const voteRecorded = candidate.map((data)=>{
            return{
                party: data.party,
                count: data.voteCount
            }
        })

        res.status(200).json(voteRecorded)
    }catch(error){
        console.log(error)
        res.status(500).json({error: 'Internal Server Error'})
    }
})

router.get('/list', async(req,res)=>{
    try{
        const candidates = await Candidate.find()
        const allCandidates = candidates.map((data)=>{
            return{
                name: data.name,
                party: data.party,
                votes: data.voteCount
            }
        })

        res.status(200).json(allCandidates)
    }catch(error){
        console.log(error)
        res.status(500).json({error: 'Internal Server Error'})
    }
})

module.exports= router