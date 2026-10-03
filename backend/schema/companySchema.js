const mongoose=require("mongoose")

const companySchema=mongoose.Schema({
  name:{
    type:String,
    required:true
  },
  description:{
    type:String
  },
  location:{
    type:String
  },
  website:{
    type:String
  },
  owner:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
        required: true,
  },
  isApproved:{
    type:Boolean,
    default:false
  }
},{timestamps:true})

module.exports=mongoose.model("Company",companySchema)