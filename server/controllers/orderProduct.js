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
    const { provider_id, limit } = await User.findById(_id).select('provider_id');
    const {startDate, endDate, searchTerm} = req.query;

    if (!limit || limit < 0) {
        return res.status(200).json({
            success: true,
            counts: 0,
            order: [],
        });  
    }

    try {
        const filterConfig = {
            'products.provider': provider_id
        };

        if (startDate && endDate) {
            filterConfig['createdAt'] = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        let orders = await OrderProduct.find(filterConfig)
            .populate({
                path: 'orderBy',
                select: 'firstName lastName email mobile',
            })
            .populate({
                path: 'products',
                match: { provider: provider_id },
                populate: {
                    path: 'product',
                    select: 'title color thumb category provider_id quantity soldQuantity'
                },
            });

        orders.forEach(order => {
            order.products = order.products.filter(product => product.provider_id?._id.equals(provider_id));
        });

        if (searchTerm?.length) {
            orders = orders.filter(order => {
                return order.orderBy?.firstName.indexOf(searchTerm) > -1
                        || order.orderBy?.lastName.indexOf(searchTerm) > -1
                        || order.orderBy?.email.indexOf(searchTerm) > -1;
            });
        }

        return res.status(200).json({
            success: true,
            counts: limit,
            order: orders.slice(0, limit),
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