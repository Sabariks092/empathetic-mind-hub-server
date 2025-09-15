import bcrypt from "bcryptjs";
const hash = await bcrypt.hash("enladduS0409#", 10);
console.log(hash);
