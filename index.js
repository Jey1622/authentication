const express=require("express")
const mongoose=require("mongoose")
const routes=require("./router/router")
require("dotenv").config()
const cors=require("cors")

const app=express();

app.use(express.json())
app.use(cors())

const DB_URI=process.env.DB_URI

app.use('/api',routes)

mongoose.connect(DB_URI).then(()=>{
    app.listen(3000,()=>{
        console.log("DB is Connected")
        console.log("App running in port 3000")
    })
}).catch((error)=>{
    console.log("Error while connecting :"+error.message)
})

