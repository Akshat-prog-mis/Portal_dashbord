import bcrypt from "bcryptjs";

const newPassword = "Akshat@123";
const hashedPassword = await bcrypt.hash(newPassword, 12);

console.log(hashedPassword);
