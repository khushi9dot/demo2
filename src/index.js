import dotenv from "dotenv"
import { dbconnect } from "./db/dbconnection.js";
import {app} from "./app.js"

dotenv.config({path:"./.env"})

dbconnect()
.then(()=>{
    app.listen(process.env.PORT || 7000,()=>{
        console.log(`server is running at: ${process.env.PORT}`)
    })
})
.catch((error)=>{
    console.log("mongodb connection failed...",error)
})