import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const dbconnect=async ()=>{
    try {
        const dbInstance=await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        console.log(`mongodb connection success...${dbInstance.connection.host}`)
    } catch (error) {
        console.log("mongodb connection failed",error)
        process.exit(1)
    }
}

export {dbconnect}