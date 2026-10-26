import jwt from "jsonwebtoken";

const generateToken = (userId: any) => {
    const jwt_secret = process.env.JWT_SECRET
    if(!jwt_secret){
        throw new Error("jwt secret is missing.")
    }
  return jwt.sign({ userId }, jwt_secret, {
    expiresIn: "7d",
  });
};

export default generateToken;
