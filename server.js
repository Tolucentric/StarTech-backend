const express = require("express")
const dotenv = require("dotenv")
const cors = require("cors")
const connectDB = require("./config/db")
const categoryRoute = require("./routes/categoryRoute")
const productRoute = require("./routes/productRoute")
const authRoute = require("./routes/authRoute")
const cartRoute = require("./routes/cartRoute")
const paymentRoute = require("./routes/paymentRoute")
const app = express()

connectDB()
dotenv.config()

app.use(cors({
    origin: "http://localhost:5173", 
    allowedHeaders: ["Content-Type", "Authorization", "auth-token"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true
}))

app.use(express.json())
app.use("/uploads", express.static("uploads"))
app.use("/", categoryRoute)
app.use("/", productRoute)
app.use("/", authRoute)
app.use("/", cartRoute)
app.use("/", paymentRoute)

const port = process.env.PORT || 3000

app.listen(port, ()=> console.log(`You are listening on port ${port}`))
