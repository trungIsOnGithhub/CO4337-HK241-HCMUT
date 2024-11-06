const mongoose = require('mongoose');

const OrderProduct = require('../models/orderProduct')
const Product = require('../models/product')
const User = require('../models/user')
const Coupon = require('../models/coupon')
const asyncHandler = require('express-async-handler')
const Staff = require('../models/staff')

const createNewOrder = asyncHandler(async(req, res)=>{
    const {_id} = req.user
    const {products, total, address} = req.body
    if(address){
        await User.findByIdAndUpdate(_id, {address, cart_product:[]})
    }

    const response = await OrderProduct.create({products, total, orderBy: _id, status: 'Successful'})
    if (response) {
        for (const product of products) {
            await Product.findByIdAndUpdate(product?.product, {
                $inc: { quantity: -product.quantity }
            });
        }
    }
    return res.status(200).json({
        success: response ? true : false,
        rs: response ? response : "Something went wrong",
    })
})

const getOrdersProductByAdmin = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { provider_id } = await User.findById(_id).select('provider_id');

    try {
        const orders = await OrderProduct.find({
            'products.provider': provider_id
        })
        .select('orderBy createdAt updatedAt')
        .populate({
            path: 'orderBy',
            select: 'firstName lastName avatar email mobile',
        })
        .populate({
            path: 'products',
            match: { provider: provider_id },
            populate: {
                path: 'product',
                select: 'title color thumb category provider_id quantity soldQuantity'
            },
        });

        // Lọc các sản phẩm của nhà cung cấp cụ thể trong mỗi đơn hàng
        orders.forEach(order => {
            order.products = order.products.filter(product => product.provider.equals(provider_id));
        });

        return res.status(200).json({
            success: true,
            counts: orders.length,
            order: orders,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            error: 'Cannot get orderProducts',
        });
    }
});






module.exports = {
    createNewOrder,
    getOrdersProductByAdmin
}