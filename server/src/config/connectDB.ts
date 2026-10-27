import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI
        if (!mongoUri) {
            throw new Error("MONGODB_URI is not defined")
        }
        await mongoose.connect(mongoUri)
        console.log("Connected to DB")
    } catch (error) {
        console.log("error in mongoDB connection.", error)
    }
}

export default connectDB