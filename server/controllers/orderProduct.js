const mongoose = require('mongoose');

const OrderProduct = require('../models/orderProduct')
const Product = require('../models/product')
const User = require('../models/user')
const Coupon = require('../models/coupon')
const asyncHandler = require('express-async-handler')
const Staff = require('../models/staff')

const createNewOrder = asyncHandler(async (req, res) => {
    console.log('testt')
    const { _id } = req.user; // Lấy ID của người dùng từ request
    const { products, shippingPrice, totalProductPrice, savingPrice, totalPrice, statusPayment, statusShipping, provider, discountCode} = req.body;

    console.log(products)
    if (!products || products.length === 0) {
        return res.status(400).json({
            success: false,
            message: "No products in the order"
        });
    }
    console.log(discountCode?._id)

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
        discountCode : discountCode?._id
    });

    // Cập nhật số lượng sản phẩm trong kho
    for (const product of products) {
        // Tìm sản phẩm trong cơ sở dữ liệu để lấy thông tin variants
        const fullProduct = await Product.findById(product?.productId).lean();
    
        if (!fullProduct) {
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
               // console.log(`Variant with ID ${product.variantId} not found in product ${product.productId}`);
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
    const queries = { ...req.query };
    const { _id } = req.user;
    const { provider_id } = await User.findById(_id).select('provider_id');


    const excludeFields = ['limit', 'sort', 'page', 'fields'];
    excludeFields.forEach((el) => delete queries[el]);

    // Format lại các toán tử cho đúng cú pháp của mongoose
    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
    );

    // chuyen tu chuoi json sang object
    const formatedQueries = JSON.parse(queryString);
    //Filtering
    // let queryFinish = {}
    // if(queries?.q){
    //     delete formatedQueries.q
    //     queryFinish = {
    //         $or: [
    //             {color: {$regex: queries.q, $options: 'i' }},
    //             // {title: {$regex: queries.q, $options: 'i' }},
    //             // {category: {$regex: queries.q, $options: 'i' }},
    //             // {brand: {$regex: queries.q, $options: 'i' }},
               
    //         ]
    //     }
    // }
    if (queries?.shippingStatus) {
        // Xóa shippingStatus nếu nó đã tồn tại trong formatedQueries
        delete formatedQueries.shippingStatus;

        if (queries.shippingStatus.toLowerCase() === 'all') {
            // Không thêm điều kiện, lấy tất cả
        } else {
            // Thêm điều kiện lọc theo shippingStatus với regex
            formatedQueries.statusShipping = { $regex: queries.shippingStatus, $options: 'i' }; // Tìm kiếm không phân biệt chữ hoa thường
        }
    }

    const qr = {...formatedQueries, provider: provider_id}
    let queryCommand =  OrderProduct.find(qr).populate({
        path: 'orderBy',
        select: 'firstName lastName avatar email mobile',
    })
    .populate({
        path: 'products',
        populate: {
            path: 'productId',
            select: 'title color thumb category provider_id'
        },
    });

    try {
        // sorting
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ')
            queryCommand.sort(sortBy)
        }
        else{
            queryCommand.sort('-createdAt')
        }

        //filtering
        if(req.query.fields){
            const fields = req.query.fields.split(',').join(' ')
            queryCommand.select(fields)
        }

        //pagination
        //limit: so object lay ve 1 lan goi API
        //skip: n, nghia la bo qua n cai dau tien
        //+2 -> 2
        //+dgfbcxx -> NaN
        const page = +req.query.page || 1
        const limit = +req.query.limit || process.env.LIMIT_PRODUCT
        const skip = (page-1)*limit
        queryCommand.skip(skip).limit(limit)


        const orders = await queryCommand
        const counts = await OrderProduct.countDocuments(qr);
        return res.status(200).json({
            success: true,
            counts: counts,
            order: orders,
            });
        
    } catch (error) {
        // Xử lý lỗi nếu có
        return res.status(500).json({
            success: false,
            error: 'Cannot get orders',
        });
    }
});

const getUserOrderProduct = asyncHandler(async(req, res)=>{
    const queries = { ...req.query };
    const {_id} = req.user
    // Loại bỏ các trường đặc biệt ra khỏi query
    const excludeFields = ['limit', 'sort', 'page', 'fields'];
    excludeFields.forEach((el) => delete queries[el]);

    // Format lại các toán tử cho đúng cú pháp của mongoose
    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
    );

    // chuyen tu chuoi json sang object
    const formatedQueries = JSON.parse(queryString);
    //Filtering
    // let queryFinish = {}
    // if(queries?.q){
    //     delete formatedQueries.q
    //     queryFinish = {
    //         $or: [
    //             {color: {$regex: queries.q, $options: 'i' }},
    //             // {title: {$regex: queries.q, $options: 'i' }},
    //             // {category: {$regex: queries.q, $options: 'i' }},
    //             // {brand: {$regex: queries.q, $options: 'i' }},
               
    //         ]
    //     }
    // }
    if (queries?.shippingStatus) {
        // Xóa shippingStatus nếu nó đã tồn tại trong formatedQueries
        delete formatedQueries.shippingStatus;

        if (queries.shippingStatus.toLowerCase() === 'all') {
            // Không thêm điều kiện, lấy tất cả
        } else {
            // Thêm điều kiện lọc theo shippingStatus với regex
            formatedQueries.statusShipping = { $regex: queries.shippingStatus, $options: 'i' }; // Tìm kiếm không phân biệt chữ hoa thường
        }
    }

    const qr = {...formatedQueries, orderBy: _id}
    let queryCommand =  OrderProduct.find(qr)
    try {
        // sorting
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ')
            queryCommand.sort(sortBy)
        }

        //filtering
        if(req.query.fields){
            const fields = req.query.fields.split(',').join(' ')
            queryCommand.select(fields)
        }

        //pagination
        //limit: so object lay ve 1 lan goi API
        //skip: n, nghia la bo qua n cai dau tien
        //+2 -> 2
        //+dgfbcxx -> NaN
        const page = +req.query.page || 1
        const limit = +req.query.limit || process.env.LIMIT_PRODUCT
        const skip = (page-1)*limit
        queryCommand.skip(skip).limit(limit)


        const orders = await queryCommand
        const counts = await OrderProduct.countDocuments(qr);
        return res.status(200).json({
            success: true,
            counts: counts,
            orderProducts: orders,
            });
        
    } catch (error) {
        // Xử lý lỗi nếu có
        return res.status(500).json({
            success: false,
            error: 'Cannot get orders',
        });
    }
})

const getUserOrderProductByUserId = asyncHandler(async(req, res)=>{
    const queries = { ...req.query };
    const {userId} = req.params
    // Loại bỏ các trường đặc biệt ra khỏi query
    const excludeFields = ['limit', 'sort', 'page', 'fields'];
    excludeFields.forEach((el) => delete queries[el]);

    // Format lại các toán tử cho đúng cú pháp của mongoose
    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        (matchedEl) => `$${matchedEl}`
    );

    // chuyen tu chuoi json sang object
    const formatedQueries = JSON.parse(queryString);
    //Filtering
    // let queryFinish = {}
    // if(queries?.q){
    //     delete formatedQueries.q
    //     queryFinish = {
    //         $or: [
    //             {color: {$regex: queries.q, $options: 'i' }},
    //             // {title: {$regex: queries.q, $options: 'i' }},
    //             // {category: {$regex: queries.q, $options: 'i' }},
    //             // {brand: {$regex: queries.q, $options: 'i' }},
               
    //         ]
    //     }
    // }
    if (queries?.shippingStatus) {
        // Xóa shippingStatus nếu nó đã tồn tại trong formatedQueries
        delete formatedQueries.shippingStatus;

        if (queries.shippingStatus.toLowerCase() === 'all') {
            // Không thêm điều kiện, lấy tất cả
        } else {
            // Thêm điều kiện lọc theo shippingStatus với regex
            formatedQueries.statusShipping = { $regex: queries.shippingStatus, $options: 'i' }; // Tìm kiếm không phân biệt chữ hoa thường
        }
    }

    const qr = {...formatedQueries, orderBy: userId}
    let queryCommand =  OrderProduct.find(qr)
    try {
        // sorting
        if(req.query.sort){
            const sortBy = req.query.sort.split(',').join(' ')
            queryCommand.sort(sortBy)
        }

        //filtering
        if(req.query.fields){
            const fields = req.query.fields.split(',').join(' ')
            queryCommand.select(fields)
        }

        //pagination
        //limit: so object lay ve 1 lan goi API
        //skip: n, nghia la bo qua n cai dau tien
        //+2 -> 2
        //+dgfbcxx -> NaN
        const page = +req.query.page || 1
        const limit = +req.query.limit || process.env.LIMIT_PRODUCT
        const skip = (page-1)*limit
        queryCommand.skip(skip).limit(limit)


        const orders = await queryCommand
        const counts = await OrderProduct.countDocuments(qr);
        return res.status(200).json({
            success: true,
            counts: counts,
            orderProducts: orders,
            });
        
    } catch (error) {
        // Xử lý lỗi nếu có
        return res.status(500).json({
            success: false,
            error: 'Cannot get orders',
        });
    }
})



const getOneOrderProductById = asyncHandler(async(req, res)=>{
    // console.log('aaaa')
    const {oid} = req.params

    const orderProduct = await OrderProduct.findById(oid).populate({
        path: 'provider',
    }).populate({
        path: 'orderBy',
        select: 'firstName lastName avatar email mobile address'
    }).populate({
        path: 'discountCode',
    })
    
    return res.status(200).json({
        success: orderProduct ? true : false,
        order: orderProduct ? orderProduct : "Cannot find order"
    })
})


const updateShippingStatusOrderProduct = asyncHandler(async (req, res) => {
    const {orderId, status} = req.body
    if(!orderId || !status){
        throw new Error("Missing input");
    }
    const updatedOrder = await OrderProduct.findByIdAndUpdate(orderId, { statusShipping: status }, { new: true });
    
    return res.status(200).json({
        success: updatedOrder ? true : false,
        mes: updatedOrder ? 'Updated status successfully' : "Cannot find OrderProduct"
    });
})

const updatePaymentStatusOrderProduct = asyncHandler(async (req, res) => {
    const { orderId, status } = req.body;

    // Kiểm tra đầu vào
    if (!orderId || !status) {
        throw new Error("Missing input");
    }

    // Nếu status khác 'Cancelled', chỉ cần cập nhật trạng thái
    if (status !== 'Cancelled') {
        const updatedOrder = await OrderProduct.findByIdAndUpdate(orderId, { statusPayment: status }, { new: true });
        return res.status(200).json({
            success: !!updatedOrder,
            mes: updatedOrder ? 'Updated status successfully' : "Cannot find OrderProduct",
        });
    } else {
        // Trường hợp status === 'Cancelled'
        const order = await OrderProduct.findById(orderId);

        // Kiểm tra nếu không tìm thấy order
        if (!order) {
            return res.status(404).json({
                success: false,
                mes: "Cannot find OrderProduct",
            });
        }

        // Lặp qua từng product trong order
        const { products } = order;

        for (const item of products) {
            const { productId, variantId, quantity } = item;

            if (!productId) continue;

            // Tìm sản phẩm trong bảng Product
            const product = await Product.findById(productId);

            if (!product) continue;

            if (variantId) {
                // Nếu có variantId, tìm variant tương ứng
                const variant = product?.variants?.find(v => v._id.toString() === variantId);

                if (variant) {
                    // Cập nhật soldQuantity và quantity của variant
                    variant.soldQuantity = Math.max(0, variant.soldQuantity - quantity);
                    variant.quantity += quantity;
                }
            } else {
                // Nếu không có variantId, cập nhật soldQuantity và quantity của sản phẩm
                product.soldQuantity = Math.max(0, product.soldQuantity - quantity);
                product.quantity += quantity;
            }

            // Lưu lại sản phẩm sau khi cập nhật
            await product.save();
        }

        // Cập nhật trạng thái đơn hàng sau khi xử lý xong
        const updatedOrder = await OrderProduct.findByIdAndUpdate(orderId, { statusPayment: status }, { new: true });

        return res.status(200).json({
            success: !!updatedOrder,
            mes: 'Order cancelled and inventory updated successfully',
        });
    }
});

module.exports = {
    createNewOrder,
    getOrdersProductByAdmin,
    getUserOrderProduct,
    getOneOrderProductById,
    updateShippingStatusOrderProduct,
    updatePaymentStatusOrderProduct,
    getUserOrderProductByUserId
}