const express=require('express')
const bodyparser=require("body-parser")
const {connectToDatabase}=require('./config/db.js')
const userroutes=require('./routes/userRoutes.js')

const app=express()


app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: true }))

app.use('/api',userroutes)


 connectToDatabase();


  app.listen(process.env.PORT,()=>{
    console.log(`server running on port ${process.env.PORT}`)
})