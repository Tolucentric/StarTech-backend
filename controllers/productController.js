const Product = require("../models/product")
const { validateProduct } = require("../validator")

exports.createProduct = async(req, res)=>{
    try {
        const {error} = validateProduct(req.body)
        if (error) {
            re.json(error.details[0].message)
        }

        const product = new Product({
            category: req.body.category,
            name: req.body.name,
            img: req.file.path,
            price: req.body.price,
            featured: req.body.featured,
            topSelling: req.body.topSelling

        });

        const productItem = await product.save()
        res.json(productItem)
    } catch (error) {
        res.json({message: error.message})
    }
}

exports.getAllProduct = async (req, res)=>{
    try {
        const products = await Product.find().populate("category")
        res.json(products)
    } catch (error) {
        console.log(error);
    }
}