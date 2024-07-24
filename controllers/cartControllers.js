const Cart = require("../models/cart");
const Product = require("../models/product");

exports.addToCart = async (req, res)=> {
    const { productId, quantity } = req.body;
    try {
        let cart = await Cart.findOne({ user: req.user.id });

        if (!cart) {
            cart = new Cart({ user: req.user.id, products: [] })
        }
        
        const product = await Product.findById(productId);
        if (!product) {
            return res.json("product not found");
        }

        const productIndex = cart.products.findIndex(
            (item) => item.product.toString() === productId
        );

        //product != products
        if (productIndex !== -1) {
            cart.products[productIndex].quantity += quantity;
            cart.products[productIndex].amount = product.price * cart.products[productIndex].quantity;
        }else{
            cart.products.push({
                product: productId,
                quantity,
                amount: product.price * quantity
            })
        }

        await cart.save();

      res.json(cart);
    } catch (error) {
        console.log(error);
    }
};

// populate method allows you to get the model
exports.getCart = async (req, res)=> {
    try {
        const cart = await Cart.findOne({user: req.user.id}).populate("products.product")
        if (!cart) {
            return res.json("Cart not found")
        }

        res.json(cart)
    } catch (error) {
        console.log(error);
    }
}
//created a route for cart

//updating product quantity
exports.updateQuantity = async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        const cartItem = cart.products.find(
            (item) => item.product.toString() === productId
        );
        const product = await Product.findById(productId);

        if (cartItem) {
            cartItem.quantity = quantity;
            cartItem.amount = product.price * cartItem.quantity;
            await cart.save();
            const updatedCart = await Cart.findOne({ user: req.user.id }).populate(
                "products.product"
            );
            res.json(updatedCart)
        } else {
            res.json("Product not found")
        }
    } catch (error) {
        console.log(error)
    }
};

exports.removeItem = async (req, res) => {
    const { productId } = req.body;
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        cart.products = cart.products.filter(
            (item) => item.product.toString() !== productId
        );
        await cart.save();
        const updatedCart = await Cart.findOne({ user: req.user.id }).populate(
            "products.product"
        );
        res.json(updatedCart)
    } catch (error) {
        console.log(error);
    }
};