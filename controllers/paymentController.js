const { v4: uuidv4 } = require("uuid");
const Cart = require("../models/cart");
const Order = require("../models/order"); // Fixed capitalization of "Order"

const FLW_SECRET_KEY = process.env.FLW_SECRET_KEY;

exports.initiatePayment = async (req, res) => {
  const { user } = req;
  const { amount, currency, firstName, lastName, phone, address } = req.body;

  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "products.product"
    );
    if (!cart || cart.products.length === 0) {
      return res.json("Your cart is empty");
    }

    const orderId = uuidv4();

    const paymentData = {
      tx_ref: orderId,
      amount,
      currency,
      redirect_url: "http://localhost:5173/thank-you",
      customer: {
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      },
      meta: {
        firstName,
        lastName,
        phone,
        address,
      },
      customizations: {
        title: "Star Tech Purchase",
        description: "Payment for items in cart",
      },
    };

    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FLW_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    const data = await response.json();
    if (data.status === "success") {
      res.json({ link: data.data.link, orderId });
    } else {
      res.json("Payment initiation failed");
    }
  } catch (error) {
    console.log(error);
  }
};

exports.verifyPayment = async (req, res) => {
  const { transaction_id, orderId } = req.body;

  try {
    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${FLW_SECRET_KEY}`,
        },
      }
    );

    const data = await response.json(); // Added missing data extraction

    if (data.status === "success") {
      const cart = await Cart.findOne({ user: req.user.id }).populate(
        "products.product"
      );

      console.log(cart);

      const order = new Order({
        user: req.user.id,
        orderId,
        firstName: data.data.meta.firstName,
        lastName: data.data.meta.lastName,
        phone: data.data.meta.phone,
        address: data.data.meta.address,
        products: cart.products,
        amount: data.data.amount,
        status: "completed",
        transactionId: transaction_id,
      });

      await order.save();
      await Cart.findOneAndDelete({ user: req.user.id });

      res.json({ msg: "Payment Successful", order });
    } else {
      res.json({ msg: "Payment verification failed" });
    }
  } catch (error) {
    console.log(error);
  }
};
