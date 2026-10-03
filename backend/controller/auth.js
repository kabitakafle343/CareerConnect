const User = require("../schema/userSchema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
exports.userLogin = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    const isPassword = await bcrypt.compare(password, user.password);
    if (!isPassword) {
      return res.status(401).json({ message: "invalid password" });
    }
  const refreshToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      },
    );
      const accessToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: "7d",
      },
    );
   
     

        res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role:user.role
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.userSignUp = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;
    if (!new Set(["candidate", "employer"]).has(role)) {
      return res.status(400).json({ message: "Invalid account type" });
    }
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(409).json({ message: "Email already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone,
      profileImage: req.file?.path || "",
    });

    return res
      .status(201)
      .json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Signup failed:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.userLogout = (_req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
  return res.status(200).json({ message: "Logout successful" });
};
