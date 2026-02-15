import User from "../models/user.js"
import bcrypt from "bcrypt"

const registerUser = async(req , res) =>{
    try {
        const {name , email , password} = req.body
        const existingUser = await User.findOne({email})
        if(existingUser){
            res.status(400).json({
                message : "email address already in use",
            })
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password , salt)

        const newUser = await User.create({
            email , password : hashedPassword , name
        })

        // TODO SEND EMAIL

        res.status(201).json({
            message : "Verification email sent to your email. Please check and verify account.",

        })
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message : "Internal server error"
        })
    }
}
const loginUser = async(req , res) =>{
    try {
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            message : "Internal server error"
        })
    }
}
export {registerUser , loginUser}