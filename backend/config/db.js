const mongoose=require("mongoose")

exports.connectDB=async()=>{
    await mongoose.connect(process.env.MONGO_URL)
    console.log("Connected to db successfully")
}