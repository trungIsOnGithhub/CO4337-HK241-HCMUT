const mongoose = require('mongoose');

const OrderProduct = require('../models/orderProduct')
const Product = require('../models/product')
const User = require('../models/user')
const Coupon = require('../models/coupon')
const asyncHandler = require('express-async-handler')
const Staff = require('../models/staff')

const createNewOrder = asyncHandler(async (req, res) => {
    const { _id } = req.user; // Lấy ID của người dùng từ request
    const { products, shippingPrice, totalProductPrice, savingPrice, totalPrice, statusPayment, statusShipping, provider, discountCode} = req.body;

    if (!products || products.length === 0) {
        return res.status(400).json({
            success: false,
            message: "No products in the order"
        });
    }

    // Tạo một đơn hàng mới
    const newOrder = await OrderProduct.create({
        products,
        shippingPrice,
        totalProductPrice,
        totalPrice,
        savingPrice,
        statusPayment: statusPayment || 'Pending',
        statusShipping: statusShipping || 'Pending',
        orderBy: _id,
        provider,
        discountCode
    });

    // Cập nhật số lượng sản phẩm trong kho
    for (const product of products) {
        // Tìm sản phẩm trong cơ sở dữ liệu để lấy thông tin variants
        const fullProduct = await Product.findById(product?.productId).lean();
    
        if (!fullProduct) {
            console.log(`Product with ID ${product.productId} not found.`);
            continue;
        }
    
        // Kiểm tra nếu có variantId
        if (product?.variantId) {
            // Tìm biến thể trong mảng variants
            const variant = fullProduct?.variants?.find(
                variant => variant?._id.toString() === product?.variantId.toString()
            );
    
            if (variant) {
                // Cập nhật số lượng và số lượng đã bán cho biến thể
                await Product.findOneAndUpdate(
                    { _id: product.productId, "variants._id": product.variantId },
                    {
                        $inc: {
                            "variants.$.quantity": -(+product.quantity),
                            "variants.$.soldQuantity": +product.quantity
                        }
                    }
                );
            } else {
                console.log(`Variant with ID ${product.variantId} not found in product ${product.productId}`);
            }
        } else {
            // Nếu không có variantId, cập nhật số lượng và số lượng đã bán cho sản phẩm chính
            await Product.findByIdAndUpdate(product.productId, {
                $inc: {
                    quantity: -(+product.quantity),
                    soldQuantity: +product.quantity
                }
            });
        }
    }
    await User.findByIdAndUpdate(_id, {cart_product:[]})
    return res.status(200).json({
        success: true,
        order: newOrder
    });
});

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
                select: 'title color thumb category provider_id'
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