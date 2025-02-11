import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import  errorHandler  from "./middlewares/errorHandler.middlewares.js"

const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"50kb"}))
app.use(express.urlencoded({extended:true,limit:"50kb"}))
app.use(express.static("public"))

app.use(cookieParser())

import userRoutes from "./routes/user.routes.js"
app.use("/api/v1/users",userRoutes)

app.use(errorHandler)


export {app}