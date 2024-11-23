const Product = require('../models/product')
const asyncHandler = require("express-async-handler")
const slugify = require('slugify')
const makeSku = require('uniqid')
const User = require('../models/user')


const createProduct = asyncHandler(async(req, res)=>{
    const {title, price, description, category, color, colorCode, provider_id} = req.body
    const thumb = req.files?.thumb[0]?.path
    const image = req.files?.images?.map(el => el.path)

    if(!category){
        throw new Error("Missing category")
    }
    if(!title || !price || !description || !color|| !provider_id || !colorCode){
        throw new Error("Missing input")
    }
    req.body.slug = slugify(title)
    if(thumb) req.body.thumb = thumb
    if(image) req.body.image = image
    const newProduct = await Product.create(req.body)
    return res.status(200).json({
        success: newProduct ? true : false,
        mes: newProduct ? 'Created successfully' : "Cannot create new product"
    })
})

const getProduct = asyncHandler(async(req, res)=>{
    const {pid} = req.params
    const product = await Product.findById(pid).populate({
        path: 'rating',
        populate: {
            path: 'postedBy',
            select: 'firstName lastName avatar',
        }
    })
    return res.status(200).json({
        success: product ? true : false,
        product: product ? product : "Cannot find product"
    })
})


// Filter  - Sorting - Pagination
const getAllProduct = asyncHandler(async(req, res)=>{
    const queries = { ...req.query };

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
    let colorFinish = {}
    //Filtering
    if (queries?.title) formatedQueries.title = { $regex: queries.title, $options: 'i' };
    if (queries?.category) formatedQueries.category = { $regex: queries.category, $options: 'i' };
    if (queries?.color){
        delete formatedQueries.color
        const colorArray = queries.color?.split(',')
        const colorQuery = colorArray.map(el => ({
            color: {$regex: el, $options: 'i' }
        }))
        colorFinish = {$or: colorQuery}
    }
    let queryFinish = {}
    if(queries?.q){
        delete formatedQueries.q
        queryFinish = {
            $or: [
                {color: {$regex: queries.q, $options: 'i' }},
                {title: {$regex: queries.q, $options: 'i' }},
                {category: {$regex: queries.q, $options: 'i' }},
            ]
        }
    }
    const qr = {...colorFinish, ...formatedQueries, ...queryFinish,
        $and: [
            queryFinish || {}, // Điều kiện tìm kiếm từ queries.q (nếu có)
            {
                $or: [
                    { isHidden: false },
                    { isHidden: { $exists: false } },
                ],
            },
        ],
    }
    let queryCommand =  Product.find(qr)
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


        const products = await queryCommand
        const counts = await Product.countDocuments(qr);
        return res.status(200).json({
            success: true,
            counts: counts,
            products: products,
            });
        
    } catch (error) {
        // Xử lý lỗi nếu có
        return res.status(500).json({
        success: false,
        error: 'Cannot get products',
        });
    }
})


const getAllProductByAdmin = asyncHandler(async(req, res)=>{
    const {_id} = req.user
    const {provider_id} = await User.findById({_id}).select('provider_id')
    const queries = { ...req.query };

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
    let colorFinish = {}
    //Filtering
    if (queries?.title) formatedQueries.title = { $regex: queries.title, $options: 'i' };
    if (queries?.category) formatedQueries.category = { $regex: queries.category, $options: 'i' };
    if (queries?.color){
        delete formatedQueries.color
        const colorArray = queries.color?.split(',')
        const colorQuery = colorArray.map(el => ({
            color: {$regex: el, $options: 'i' }
        }))
        colorFinish = {$or: colorQuery}
    }
    let queryFinish = {}
    if(queries?.q){
        delete formatedQueries.q
        queryFinish = {
            $or: [
                {color: {$regex: queries.q, $options: 'i' }},
                {title: {$regex: queries.q, $options: 'i' }},
                {category: {$regex: queries.q, $options: 'i' }},
            ]
        }
    }
    const qr = {...colorFinish, ...formatedQueries, ...queryFinish, provider_id}
    let queryCommand =  Product.find(qr)
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


        const products = await queryCommand
        const counts = await Product.countDocuments(qr);
        return res.status(200).json({
            success: true,
            counts: counts,
            products: products,
            });
        
    } catch (error) {
        // Xử lý lỗi nếu có
        return res.status(500).json({
        success: false,
        error: 'Cannot get products',
        });
    }
})


const updateProduct = asyncHandler(async(req, res)=>{
    const {pid} = req.params

    const files = req?.files
    if(files?.thumb){
        req.body.thumb = files?.thumb[0]?.path
    }
    if(files?.images){
        req.body.image = files?.images?.map(el => el.path)
    }
    if(req.body && req.body.title){
        req.body.slug = slugify(req.body.title)
    }
    const product = await Product.findByIdAndUpdate(pid, req.body, {new: true})
    return res.status(200).json({
        success: product ? true : false,
        mes: product ? 'Updated successfully' : "Cannot update product"
    })
})

const deleteProduct = asyncHandler(async(req, res)=>{
    const {pid} = req.params
    const product = await Product.findByIdAndDelete(pid)
    return res.status(200).json({
        success: product ? true : false,
        mes: product ? 'Deleted successfully' : "Cannot delete product"
    })
})

const ratings = asyncHandler(async(req, res)=>{
    const {_id} = req.user
    const {star, comment, pid, updatedAt} = req.body

    if(!star || !pid){
        throw new Error("Missing input")
    }
    const ratingProduct = await Product.findById(pid)
    
    //alreadyRating tra ve element trong Rating neu co
    const alreadyRating = ratingProduct?.rating?.find(e1 => e1.postedBy.toString() === _id)

    if(alreadyRating){
        await Product.updateOne(
            {rating: {$elemMatch: alreadyRating}},
            {$set: {"rating.$.star": star, "rating.$.comment": comment,  "rating.$.updatedAt": updatedAt}}
            )
    }
    else{
        await Product.findByIdAndUpdate(
            pid,
            {$push:{rating :{star, comment, postedBy: _id, updatedAt}}},
            {new: true})
    }

    // Average rating
    const updatedProduct = await Product.findById(pid)
    console.log(updatedProduct)
    const totalRatings = updatedProduct.rating.length
    
    // reduce: 2 doi so (callback + initial value)
    const totalScores = updatedProduct.rating.reduce((sum,ele) => sum + (+ele.star),0)

    console.log(totalScores)
    console.log(totalRatings)
    console.log(Math.round((+totalScores)/ (+totalRatings)))
    updatedProduct.totalRatings = Math.round((+totalScores)/ (+totalRatings))

    try {
        console.log("Before saving totalRatings: ", updatedProduct.totalRatings); // Log giá trị
        await updatedProduct.save();
        console.log("After saving: ", updatedProduct); // Log lại để xác minh
    } catch (error) {
        console.error("Error while saving:", error);
    }

    return res.status(200).json({
        success: true,
        updatedProduct
    })
})

const uploadImage = asyncHandler(async(req, res)=>{
    const {pid} = req.params
    if(!req.files){
        throw new Error("Missing input")
    }
    else{
        const response = await Product.findByIdAndUpdate(pid, {$push: {image: {$each: req.files.map(e1 => e1.path)}}},{new: true})
        return res.status(200).json({
            success: response? true : false,
            uploadImage: response? response : "Cannot upload image"
        })
    }
})

const addVariant = asyncHandler(async (req, res) => {
    const { pid } = req.params;
    const { title, color, quantity, colorCode } = req.body;
    const thumb = req.files?.thumb[0]?.path;
    const image = req.files?.images?.map(el => el.path);

    if (!title || !color || !quantity || !colorCode) {
        throw new Error("Missing input");
    }

    // Kiểm tra xem title hoặc colorCode đã tồn tại trong variants chưa
    const product = await Product.findById(pid);
    if (!product) {
        return res.status(404).json({ success: false, mes: "Product not found" });
    }

    if(product?.colorCode === colorCode){
        return res.status(400).json({ success: false, mes: "Color already exists" });
    }

    const isDuplicate = product.variants.some(
        variant => variant?.colorCode === colorCode
    );

    if (isDuplicate) {
        return res.status(400).json({ success: false, mes: "Color already exists" });
    }

    // Nếu không trùng, thêm variant mới
    const response = await Product.findByIdAndUpdate(
        pid,
        { $push: { variants: { title, color, quantity, colorCode, thumb, image } } },
        { new: true }
    );

    return res.status(200).json({
        success: response ? true : false,
        mes: response ? 'Add variant successfully' : "Cannot add variant"
    });
});

const updateVariant = asyncHandler(async (req, res) => {
    const {productId, variantId} = req.params
    const files = req?.files
    if(files?.thumb){
        req.body.thumb = files?.thumb[0]?.path
    }
    if(files?.images){
        req.body.image = files?.images?.map(el => el.path)
    }
    const { title, color, quantity, colorCode } = req.body;
    if (!title || !color || !quantity || !colorCode) {
        throw new Error("Missing input");
    }
    const product = await Product.findById(productId)

    if(product?.colorCode === colorCode){
        return res.status(400).json({ success: false, mes: "Color already exists" });
    }

    const isDuplicate = product.variants.some(
        variant => (variant?.colorCode === colorCode && variant?._id.toString() !== variantId)
    );

    if (isDuplicate) {
        return res.status(400).json({ success: false, mes: "Color already exists" });
    }
    else{
        const response = await Product.updateOne(
            { _id: productId, "variants._id": variantId },
            {
                $set: {
                    "variants.$.title": title,
                    "variants.$.color": color,
                    "variants.$.quantity": quantity,
                    "variants.$.colorCode": colorCode,
                    "variants.$.thumb": req.body.thumb,
                    "variants.$.image": req.body.image
                }
            }
        );
        return res.status(200).json({
            success: response ? true : false,
            mes: response ? 'Updated variant successfully' : "Cannot update variant"
        });
    }

    
})

const getAllProductByProviderId = asyncHandler(async(req, res)=>{
    const {provider_id} = req.params
    const queries = { ...req.query };

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
    let colorFinish = {}
    //Filtering
    if (queries?.title) formatedQueries.title = { $regex: queries.title, $options: 'i' };
    if (queries?.category) formatedQueries.category = { $regex: queries.category, $options: 'i' };
    if (queries?.color){
        delete formatedQueries.color
        const colorArray = queries.color?.split(',')
        const colorQuery = colorArray.map(el => ({
            color: {$regex: el, $options: 'i' }
        }))
        colorFinish = {$or: colorQuery}
    }
    let queryFinish = {}
    if(queries?.q){
        delete formatedQueries.q
        queryFinish = {
            $or: [
                {color: {$regex: queries.q, $options: 'i' }},
                {title: {$regex: queries.q, $options: 'i' }},
                {category: {$regex: queries.q, $options: 'i' }},
            ]
        }
    }
    
    const qr = {
        ...colorFinish,
        ...formatedQueries,
        provider_id,
        $and: [
            queryFinish || {}, // Điều kiện tìm kiếm từ queries.q (nếu có)
            {
                $or: [
                    { isHidden: false },
                    { isHidden: { $exists: false } },
                ],
            },
        ],
    };
    
    let queryCommand =  Product.find(qr)
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


        const products = await queryCommand
        const counts = await Product.countDocuments(qr);
        return res.status(200).json({
            success: true,
            counts: counts,
            products: products,
            });
        
    } catch (error) {
        // Xử lý lỗi nếu có
        return res.status(500).json({
        success: false,
        error: 'Cannot get products',
        });
    }
})

const updateHiddenStatus = asyncHandler(async (req, res) => {
    const {productId} = req.params
    const {status} = req.query
   
    //status la false -> falsy -> !status return true 
    if (!productId || status === undefined) {
        throw new Error("Missing input");
    }

    // Kiểm tra giá trị status phải là true hoặc false
    const isValidStatus = status === "true" || status === "false";
    if (!isValidStatus) {
        throw new Error("Invalid status value. Use 'true' or 'false'.");
    }

    // Chuyển đổi giá trị status thành boolean
    const isHidden = status === "true";

    // Cập nhật thuộc tính isHidden
    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { isHidden }, // Cập nhật isHidden
        { new: true, upsert: false } // Trả về document sau khi update + upsert:false de khong tao moi
    );

    if (!updatedProduct) {
        throw new Error("Product not found");
    }

    res.status(200).json({
        success: true,
        mes: "Product updated successfully",
    });
})


module.exports = {
    createProduct,
    getProduct,
    getAllProduct,
    updateProduct,
    deleteProduct,
    ratings,
    uploadImage,
    addVariant,
    getAllProductByAdmin,
    getAllProductByProviderId,
    updateVariant,
    updateHiddenStatus
}