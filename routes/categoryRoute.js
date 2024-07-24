const express = require("express")
const categoryController = require("../controllers/categoryController")
const {auth, admin} = require("../middleware/auth")

const router = express.Router()

router.post("/api/category", auth, admin, categoryController.createCategory)


module.exports = router