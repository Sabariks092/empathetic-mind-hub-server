import bcrypt from "bcryptjs";
const hash = await bcrypt.hash("admin@123", 10);
console.log(hash);
const user = req.user;
    conole.log(user);