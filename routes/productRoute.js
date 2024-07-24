const express = require("express")
const productController = require("../controllers/productController")
const multer = require("multer")
const {auth, admin} = require("../middleware/auth")

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "uploads/")
    },
    filename: function(req, file, cb){
        cb(null, file.originalname)
    }

})

const upload = multer({storage: storage})

const router = express.Router()

router.post("/api/product",upload.single("img"), auth, admin, productController.createProduct)
router.get("/api/product", productController.getAllProduct)

module.exports = router