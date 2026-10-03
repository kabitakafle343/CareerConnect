const mongoose=require("mongoose");
const applicationSchema=mongoose.Schema({
    job:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Job",
        required:true
    },

    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
   resume: {
      type: String,
    },

    coverLetter: {
      type: String,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "reviewing",
        "shortlisted",
        "rejected",
        "hired",
      ],
      default: "pending",
    },
  },
  { timestamps: true }
);
module.exports=mongoose.model("Application",applicationSchema)