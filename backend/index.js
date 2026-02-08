import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import mongoose from "mongoose"
import morgan from "morgan"

dotenv.config()

const app = express()
app.use(cors({
    origin:process.env.FRONTEND_URL,
    method : ["GET" ,"POST" ,"DELETE","PUT"],
    allowedHeaders:["Content-Type" , "Authorization"],
}))
app.use(morgan("dev"))


//dbconnection
mongoose.connect(process.env.MONGODB_URI)
.then(()=>console.log("DB Connected sucessfully.")).catch((err)=>{
    console.log("failed to connect to DB" , err)
})

app.use(express.json())


app.get("/" ,async (req , res)=>{
    res.status(200).json({
        message : "Welcome to Task Management API"
    })
})

//error middleware
app.use((err , req , res , next)=>{
    console.log(err.stack)
    res.status(500).json({
        message:"Internal server error"
    })
})

//not found middleware
app.use((req , res)=>{
    res.status(404).json({
        message : "Not found"
    })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})