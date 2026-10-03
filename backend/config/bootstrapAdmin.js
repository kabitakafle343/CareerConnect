const bcrypt = require("bcryptjs");
const User = require("../schema/userSchema");

module.exports = async () => {
  const isProduction = process.env.NODE_ENV === "production";
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase() || (isProduction ? undefined : "admin@careerconnect.local");
  const password = process.env.ADMIN_PASSWORD || (isProduction ? undefined : "admin@123456789");

  if (!email || !password) {
    throw new Error("Both ADMIN_EMAIL and ADMIN_PASSWORD must be configured.");
  }
  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters long.");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser && existingUser.role !== "admin") {
    throw new Error("ADMIN_EMAIL is already assigned to a non-admin account.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  if (existingUser) {
    existingUser.name = process.env.ADMIN_NAME?.trim() || "CareerConnect Admin";
    existingUser.password = hashedPassword;
    await existingUser.save();
    return;
  }

  await User.create({
    name: process.env.ADMIN_NAME?.trim() || "CareerConnect Admin",
    email,
    password: hashedPassword,
    role: "admin",
  });
};