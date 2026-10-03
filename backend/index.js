const express = require("express");
require("dotenv").config();
const cors=require("cors")
const {connectDB
  
}=require("./config/db")
const companyRoute=require("./routes/company")
const app = express();
const userRoutes=require("./routes/auth")
const jobRoute=require("./routes/job")
const candidateRoute=require("./routes/candidate")
const adminRoute=require("./routes/admin")
const bootstrapAdmin=require("./config/bootstrapAdmin")
const cookie=require("cookie-parser")
app.use(cookie())
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173", credentials: true }))
app.use(express.json());

app.use("/api/auth",userRoutes)
app.use("/api/company/job",jobRoute)
app.use("/api/company",companyRoute)
app.use("/api/candidate",candidateRoute)
app.use("/api/admin",adminRoute)
const port = process.env.PORT || 4000;

connectDB()
  .then(bootstrapAdmin)
  .then(() => {
    app.listen(port, () => {
      console.log("server is running on port ", port);
    });
  })
  .catch((error) => {
    console.error("MongoDB connection failed:", error.message);
    process.exitCode = 1;
  });


