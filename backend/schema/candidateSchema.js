const mongoose=require("mongoose");
const candidateSchema=mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    phone:{
        type:String
    },
    address:{
        type:String,
    },
    bio:{
        type:String
    },
    skills: [
      {
        type: String,
      },
    ],
    resume:{
        type:String
    },
    savedJobs:[
      {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Job"
      }
    ],
  education:[
    {
        degree:String,
        institution:String,
        year:Number
    }
  ],
  position:[
    {
        company:String,
        position:String,
        year:Number
    }
  ]
},{timestamps:true});
module.exports=mongoose.model("candidateProfile",candidateSchema)