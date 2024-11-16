const User = require('../models/user')
const Order = require('../models/order')
const asyncHandler = require("express-async-handler")
const {generateAccessToken, generateRefreshToken} = require('../middlewares/jwt')
const jwt = require('jsonwebtoken')
const sendMail = require('../ultils/sendMail')
const crypto = require('crypto')
const makeToken = require('uniqid')
const {users} = require('../ultils//constant')
// const mongoose = require('mongoose');
const Staff = require('../models/staff')

const makeTokenNumber = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Tạo mã 6 chữ số
};

// const register = asyncHandler(async(req, res)=>{
//     const {email, password, firstName, lastName} = req.body
//     if(!email || !password || !firstName || !lastName){
//         return res.status(400).json({
//             success: false,
//             mes: "Missing input"
//         })}
    
//     const user = await User.findOne({email})
//     if(user){
//         throw new Error("User has existed already")
//     }
//     else{
//         const newUser = await User.create(req.body)
//         return res.status(200).json({
//             success: newUser ? true : false,
//             mes: newUser ? "Register is successful" : "Something went wrong"
//         })
//     }
// })

const register = asyncHandler(async(req, res) => {
    const {email, password, firstName, lastName, mobile, role} = req.body;
    const avatar = req.files?.avatar[0]?.path

    if(avatar){
        req.body.avatar = avatar
    }
    if(req.body?.role && req.body.role !== 202 && req.body.role !== 1411) {
        return res.status(400).json({
            success: false,
            mes: "Bad Request User Role"
        })
    }

    if (!role) {
        req.body.role = 202;
    }

    if(!email || !password || !firstName || !lastName || !mobile){
        return res.status(400).json({
            success: false,
            mes: "Missing input"
        })}
    
    const user = await User.findOne({email})
    if(user){
        throw new Error("User has existed already")
    }
    else{
        const token = makeTokenNumber()
        const email_edit = btoa(email) + '@' + token
        const newUser = await User.create({
            email:email_edit,password,firstName,lastName,mobile, avatar
        })
        // res.cookie('dataregister', {...req.body, token}, {httpOnly: true, maxAge: 15*60*1000})

        if (newUser) {
            const html = `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 10px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);">
                    <h2 style="color: #0a66c2; text-align: center;">Complete Your Registration</h2>
                    <p style="font-size: 16px;">Hello,</p>
                    <p style="font-size: 16px;">Thank you for registering with us! To complete your registration, please use the following verification code:</p>
                    <div style="text-align: center; margin: 20px 0;">
                        <span style="font-size: 24px; font-weight: bold; color: #0a66c2; padding: 10px 20px; background-color: #f7f7f7; border: 2px solid #0a66c2; border-radius: 8px; display: inline-block;">
                            ${token}
                        </span>
                    </div>
                    <p style="font-size: 16px;">This code is valid for 15 minutes. If you didn’t request this, please ignore this email.</p>
                    <p style="font-size: 16px;">Best regards,<br>Your Company Team</p>
                </div>
            `;
            await sendMail({ email, html, subject: 'Complete Registration' });
        }
        setTimeout(async()=>{
            await User.deleteOne({email: email_edit})
        },[15*60*1000])
        return res.json({
            success: newUser ? true : false,
            mes: newUser? "Please check your email to active accout!" : "Something went wrong"
        })
    }
})

const finalRegister = asyncHandler(async(req, res)=>{
    const {token} = req.params
    const notActiveEmail = await User.findOne({email:new RegExp(`${token}$`)})
    if(notActiveEmail){
        notActiveEmail.email = atob(notActiveEmail?.email?.split("@")[0])
        notActiveEmail.save()
    }
    return res.json({
        success: notActiveEmail ? true : false,
        mes: notActiveEmail? "Successfully" : "Something went wrong"
    })
})


//Refresh_token => de cap moi access token
//Access_token => de xac thuc + phan quyen nguoi dung
const login = asyncHandler(async(req, res)=>{
    const {email, password} = req.body
    if(!email || !password){
        return res.status(400).json({
            success: false,
            mes: "Missing input"
        })}
    
    
    const response = await User.findOne({email})
    if(response && await response.isCorrectPassword(password)){
        const {isBlocked} = response.toObject()
        if(isBlocked){
            return res.status(400).json({
                success: false,
                mes: "Account is blocked"
            })}
        const {password, role, refresh_token, ...userData} = response.toObject()
        const accessToken = generateAccessToken(response._id, role)
        const refreshToken = generateRefreshToken(response._id)

        //Luu refresh token vao database
        await User.findByIdAndUpdate(response._id, {refresh_token: refreshToken}, {new: true})

        //Luu refresh token vao cookie
        res.cookie('refreshToken', refreshToken, {httpOnly: true, maxAge: 7*24*60*60*1000})
        return res.status(200).json({
            success: true,
            accessToken,
            userData
        })
    }
    else{
        throw new Error ("Login failed")
    }
})

const getOneUser = asyncHandler(async(req, res)=>{
    const {_id} = req.user
    // const _id = new mongoose.Types.ObjectId("6630a109a7e022636a2d2f38")
    const user = await User.findById({_id}).select('-refresh_token -password').populate({
        path: 'cart_service',
        populate:{
            path: 'service',
            select: 'name duration'
        },
    }).populate({
        path: 'cart_service',
        populate:{
            path: 'provider',
            select: 'bussinessName address'
        },
    }).populate({
        path: 'cart_service',
        populate:{
            path: 'staff',
            select: 'firstName lastName'
        },
    }).populate('provider_id')
    .populate({
        path: 'cart_product',
        populate:{
            path: 'provider'
        }
    })

    return res.status(200).json({
        success: user? true : false,
        res: user? user : "User not found"
    })
})

const refreshAccessToken = asyncHandler(async(req, res) => {
    const cookie = req.cookies
    if(!cookie && !cookie.refreshToken){
        throw new Error("No refresh token in cookie")
    }
    const rs = await jwt.verify(cookie.refreshToken, process.env.JWT_SECRET) // Neu co loi se quang ngay tai day
    const response = await User.findOne({_id: rs._id, refresh_token: cookie.refreshToken})
    return res.status(200).json({
        success: response ? true : false,
        newAccessToken: response ? generateAccessToken(response._id, response.role) : "Refressh token not matched" 
    })
})

const logout = asyncHandler(async(req, res) => {
    const cookie = req.cookies
    if(!cookie || !cookie.refreshToken) {
        throw new Error("No refresh token in cookie")
    }
    //xoa refresh token trong database
    await User.findOneAndUpdate({refresh_token: cookie.refreshToken},{refresh_token: ''}, {new: true})

    //xoa refresh token trong cookies
    res.clearCookie('refreshToken',{
        httpOnly: true,
        secure: true
    })
    return res.status(200).json({
        success: true,
        mes: "Logout is successful"
    })
})

// Client gui email -> Server kiem tra email co hop le khong? -> Gui email kem theo link (password change token)
// Client check email -> click link
// Client gui api kem theo token
// Check token co giong token ma server gui hay khong
// Thay doi mat khau

const forgotPassword = asyncHandler(async(req, res)=>{
    const {email} = req.body
    if(!email){
        throw new Error("Missing email")
    }
    else{
        const user = await User.findOne({email})
        if(!user){
            throw new Error("User not found")
        }
        const resetToken = user.createPasswordResetToken()
        await user.save()

        const html = `Xin vui long click vao link ben duoi de doi mat khau. Link nay se het han sau 15 phut.<a href= ${process.env.CLIENT_URL}/reset_password/${resetToken}>Click here</a>`

        const data = {
            email,
            html,
            subject:'Forgot Password'
        }
        const rs = await sendMail(data)
        return res.status(200).json({
            success: rs.response?.includes('OK')? true: false,
            mes: rs.response?.includes('OK')? "Please check your email": "Something went wrong"
        })
        //
    }
})

const resetPassword = asyncHandler(async (req, res) => {
    const {password, token} = req.body
    if(!password || !token) {
        throw new Error("Missing input")
    }
    const passwordResetToken = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({passwordResetToken, passwordResetExpires:{$gt: Date.now()}})
    if(!user){
        throw new Error("Invalid reset password token")
    }
    else{
        user.password = password
        user.passwordResetToken = undefined
        user.passwordChangedAt = Date.now()
        user.passwordResetExpires = undefined
        await user.save()
        return res.status(200).json({
            success: user ? true : false,
            mes: user ? "User updated successfully": "Something went wrong"
        })
    }

})

// get all users
const getAllUsers = asyncHandler(async (req, res) => {
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
    // Filtering
    if (queries?.name) formatedQueries.name = { $regex: queries.name, $options: 'i' };  
    if (req.query.q){
        delete formatedQueries.q
        formatedQueries['$or'] = [
            {firstName : { $regex: req.query.q, $options: 'i' }},
            {lastName : { $regex: req.query.q, $options: 'i' }},
            {email : { $regex: req.query.q, $options: 'i' }},
        ]
    }
    let queryCommand =  User.find(formatedQueries)
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


        const users = await queryCommand
        const counts = await User.countDocuments(formatedQueries);
        return res.status(200).json({
            success: true,
            counts: counts,
            users: users,
            });
        
    } catch (error) {
        // Xử lý lỗi nếu có
        return res.status(500).json({
        success: false,
        error: 'Cannot get products',
        });
    }
})


//get all customer from admin
const getAllCustomers = asyncHandler(async (req, res) => {
    const {_id} = req.user;
    const user = await User.findById(_id).select('provider_id');
    const providerId = user.provider_id;

    // Prepare queries for filtering, sorting, and pagination
    const queries = { ...req.query };
    const excludeFields = ['limit', 'sort', 'page', 'fields'];
    excludeFields.forEach(el => delete queries[el]);

    let queryString = JSON.stringify(queries);
    queryString = queryString.replace(
        /\b(gte|gt|lt|lte)\b/g,
        matchedEl => `$${matchedEl}`
    );
    const formatedQueries = JSON.parse(queryString);

    if (queries?.name) formatedQueries.name = { $regex: queries.name, $options: 'i' };
    if (req.query.q) {
        delete formatedQueries.q;
        formatedQueries['$or'] = [
            { firstName: { $regex: req.query.q, $options: 'i' } },
            { lastName: { $regex: req.query.q, $options: 'i' } },
            { email: { $regex: req.query.q, $options: 'i' } },
            { $expr: { $regexMatch: { input: { $concat: ["$firstName", " ", "$lastName"] }, regex: req.query.q, options: 'i' } } },
            { $expr: { $regexMatch: { input: { $concat: ["$lastName", " ", "$firstName"] }, regex: req.query.q, options: 'i' } } },
            { $expr: { $regexMatch: { input: { $concat: ["$firstName", "", "$lastName"] }, regex: req.query.q, options: 'i' } } },
            { $expr: { $regexMatch: { input: { $concat: ["$lastName", "", "$firstName"] }, regex: req.query.q, options: 'i' } } },
        ];
    }

    try {
        // Find all orders where the first element in the info array matches the provider_id
        const orders = await Order.find({ 'info.0.provider': providerId }).populate('orderBy').exec();

        // Extract unique user IDs from the orders
        const userIds = [...new Set(orders.map(order => order.orderBy._id.toString()))];

        // Apply additional queries, filtering, sorting, and pagination to the user list
        formatedQueries._id = { $in: userIds };

        let queryCommand = User.find(formatedQueries);

        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            queryCommand.sort(sortBy);
        }

        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            queryCommand.select(fields);
        }

        const page = +req.query.page || 1;
        const limit = +req.query.limit || process.env.LIMIT_PRODUCT;
        const skip = (page - 1) * limit;
        queryCommand.skip(skip).limit(limit);

        const users = await queryCommand;
        const counts = await User.countDocuments(formatedQueries);

        return res.status(200).json({
            success: true,
            counts: counts,
            users: users,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Cannot get users',
        });
    }
});

// delete user
const deleteUser = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!userId){
        throw new Error("Missing input")
    }
    else{
        const response = await User.findByIdAndDelete(userId)  
        return res.status(200).json({
            success: response ? true : false,
            mes: response ? `User with email ${response.email} deleted successfully` : "Something went wrong"
        })
    }
})

//update user
const updateUser = asyncHandler(async (req, res) => {
    const {_id} = req.user

    const {firstName, lastName, email, mobile, address, latitude, longitude} = req.body
    const data = {firstName, lastName, email, mobile, address, latitude, longitude}
    
    if(req.file){
        data.avatar = req.file.path
    }
    if(!_id || Object.keys(req.body).length === 0){
        throw new Error("Missing input")
    }
    else{
        const response = await User.findByIdAndUpdate(_id, data, {new: true}).select('-refresh_token -password -role')
        return res.status(200).json({
            success: response ? true : false,
            mes: response ? `User with email ${response.email} updated successfully` : "Something went wrong"
        })
    }
})

//update user by admin
const updateUserByAdmin = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if(!userId || Object.keys(req.body).length === 0){
        throw new Error("Missing input")
    }
    else{
        const response = await User.findByIdAndUpdate(userId, req.body, {new: true}).select('-refresh_token -password -role')
        return res.status(200).json({
            success: response ? true : false,
            mes: response ? `User with email ${response.email} updated successfully` : "Something went wrong"
        })
    }
})

//update address
const updateUserAddress = asyncHandler(async (req, res) => {
    const {_id} = req.user
    if(!req.body.address){
        throw new Error("Missing input")
    }
    else{
        const response = await User.findByIdAndUpdate(_id, {$push: {address: req.body.address}}, {new: true})
        return res.status(200).json({
            success: response ? true : false,
            mes: response ? response : "Something went wrong"
        })
    }
})



function convertH2MInexact(timeInHour){
    let timeParts = timeInHour.split(":");
    return Number(timeParts[0]) * 60 + Number(timeParts[1]);
}
// update cart_service
const updateCartService = asyncHandler(async (req, res) => {
    const {_id} = req.user;
    const {service, provider, staff, time, date, duration, originalPrice, discountPrice, dateTime, coupon=null} = req.body;
    
    if (!service || !provider || !staff || !time || !date || !duration || !originalPrice || !dateTime) {
        throw new Error("Request missing input data!");
    } else {
        const user = await User.findById(_id).select('cart_service');
        let response;

        const thisStaff = await Staff.findById(staff);
        // console.log('???????????????????'+thisStaff.work);
        // console.log('???????????????????======='+time);

        const overlapped = thisStaff.work.some(work => {
            if (work.date !== date) {
                return false;
            }

            const wStartMMI = convertH2MInexact(work.time);
            const startMMI = convertH2MInexact(time);
            if (startMMI + duration <= wStartMMI) {
                return false;
            }

            const wEndMMI = wStartMMI + work.duration;
            if (startMMI >= wEndMMI) {
                return false;
            }

            return true;
        });

        console.log('.>>>>>>>>', overlapped);

        if (overlapped) {
            return res.status(409).json({
                success: false,
                mes: 'Your times and staff options has overlapped booking, please book new slot!'
            });
        }

        // Xóa hết tất cả các phần tử trong mảng 'cart'
        await User.findByIdAndUpdate(_id, {$set: {cart_service: []}}, {new: true});

        try {
            // Thêm một phần tử mới vào mảng 'cart'
            response = await User.findByIdAndUpdate(_id, {$push: {cart_service: {service, provider, staff, time, date, duration, originalPrice, discountPrice, dateTime, coupon}}}, {new: true});
        } catch (error) {
            // Xử lý lỗi nếu có
            return res.status(500).json({ success: false, mes: "Something went wrong" });
        }

        return res.status(200).json({
            success: response ? true : false,
            mes: response ? 'Updated your cart' : "Something went wrong"
        });
    }
});

// update cart_product
const updateCartProduct = asyncHandler(async (req, res) => {
    const {_id} = req.user
    const {pid, quantity=1, color, colorCode, price, thumb, title, provider, variantId} = req.body
    console.log(req.body)
    if(!pid || !color || !price || !thumb|| !title|| !provider || !colorCode) {
        throw new Error("Missing input")
    }
    else{
        const user = await User.findById(_id).select('cart_product')
        if(!user){
            throw new Error("User not found")
        }
        else{
           if(!variantId){
            const alreadyProduct = user?.cart_product?.find(el => el?.productId?.toString() === pid && el?.colorCode === colorCode)

            if(alreadyProduct){
                const response = await User.updateOne({cart_product:{$elemMatch: alreadyProduct}}, {$set: {"cart_product.$.quantity": quantity, "cart_product.$.price": price, "cart_product.$.thumb": thumb, "cart_product.$.title": title,  "cart_product.$.provider": provider, "cart_product.$.color": color}},{new:true})
                return res.status(200).json({
                    success: response ? true : false,
                    mes: response ? 'Updated your cart' : "Something went wrong"
                })     
            }
    
            // neu sp chua them vao gio hang || sp da them nhung khac color
            else {
                const response = await User.findByIdAndUpdate(_id,{$push:{cart_product:{productId:pid, quantity, color, colorCode, price, thumb, title, provider}}},{new: true})
                return res.status(200).json({
                    success: response ? true : false,
                    mes: response ? 'Updated your cart' : "Something went wrong"
                })
            }
           }
           else{
            console.log('aaaa')
            const alreadyProduct = user?.cart_product?.find(el => el?.variantId?.toString() === variantId && el?.colorCode === colorCode)

            if(alreadyProduct){
                const response = await User.updateOne({cart_product:{$elemMatch: alreadyProduct}}, {$set: {"cart_product.$.quantity": quantity, "cart_product.$.price": price, "cart_product.$.thumb": thumb, "cart_product.$.title": title,  "cart_product.$.provider": provider, "cart_product.$.color": color}},{new:true})
                return res.status(200).json({
                    success: response ? true : false,
                    mes: response ? 'Updated your cart' : "Something went wrong"
                })     
            }
    
            // neu sp chua them vao gio hang || sp da them nhung khac color
            else {
                const response = await User.findByIdAndUpdate(_id,{$push:{cart_product:{variantId:variantId, productId:pid, quantity, color, colorCode, price, thumb, title, provider}}},{new: true})
                return res.status(200).json({
                    success: response ? true : false,
                    mes: response ? 'Updated your cart' : "Something went wrong"
                })
            }

           }
        }
    }
})


const createUsers = asyncHandler(async(req, res)=>{
    const response = await User.create(users)
    return res.status(200).json({
        success: response ? true : false,
        user: response ? response : 'Something went wrong!'
    })
})

const updateWishlist = asyncHandler(async(req, res)=>{
    const {sid} = req.params

    const {_id} = req.user
    if(!sid) {
        throw new Error("Missing input")
    }
    const user = await User.findById(_id)
    const alreadyWishList = user?.wishlist?.find(el => el.toString() === sid)
    if(alreadyWishList){
        const response = await User.findByIdAndUpdate(_id, {$pull: {wishlist: sid}},{new: true})
        return res.status(200).json({
            success: response ? true : false,
            mes: response ? 'Updated your wishlist successfully' : 'Something went wrong'
        })
    }
    else{
        const response = await User.findByIdAndUpdate(_id, {$push: {wishlist: sid}},{new: true})
        return res.status(200).json({
            success: response ? true : false,
            mes: response ? 'Updated your wishlist successfully' : 'Something went wrong'
        })
    }
})

const updateWishlistProduct = asyncHandler(async(req, res)=>{
    const {pid} = req.params

    const {_id} = req.user
    if(!pid) {
        throw new Error("Missing input")
    }
    const user = await User.findById(_id)
    const alreadyWishList = user?.wishlistProduct?.find(el => el.toString() === pid
)
    if(alreadyWishList){
        const response = await User.findByIdAndUpdate(_id, {$pull: {wishlistProduct: pid}},{new: true})
        return res.status(200).json({
            success: response ? true : false,
            mes: response ? 'Updated your wishlist successfully' : 'Something went wrong'
        })
    }
    else{
        const response = await User.findByIdAndUpdate(_id, {$push: {wishlistProduct: pid}},{new: true})
        return res.status(200).json({
            success: response ? true : false,
            mes: response ? 'Updated your wishlist successfully' : 'Something went wrong'
        })
    }
})

const removeProductFromCart = asyncHandler(async (req, res) => {
    const {_id} = req.user
    const {pid, colorCode, variantId} = req.query
    const user = await User.findById(_id).select('cart_product')

    if(!user){
        throw new Error("User not found")
    }
    else{
        if(!variantId){
            const alreadyProduct = user?.cart_product?.find(e1 => e1?.productId?.toString() === pid && e1?.colorCode === colorCode)            
            if(!alreadyProduct){
                return res.status(200).json({
                    success: true,
                    mes: 'Not Found'
                })
            }
            else{
                const response = await User.findByIdAndUpdate(_id,{$pull:{cart_product:{productId:pid, colorCode}}},{new: true})
                return res.status(200).json({
                    success: response ? true : false,
                    mes: response ? 'Deleted successfully' : "Something went wrong"
                })
            }
        }
        else{
            const alreadyProduct = user?.cart_product?.find(e1 => e1?.variantId?.toString() === variantId && e1?.colorCode === colorCode)            
            if(!alreadyProduct){
                return res.status(200).json({
                    success: true,
                    mes: 'Not Found'
                })
            }
            else{
                const response = await User.findByIdAndUpdate(_id,{$pull:{cart_product:{variantId, colorCode}}},{new: true})
                return res.status(200).json({
                    success: response ? true : false,
                    mes: response ? 'Deleted successfully' : "Something went wrong"
                })
            }
        }
    }
    
})

const getAllContact = async(req,res,next) => {
    try{
        const users = await User.find({ _id: { $ne: req.params.userId } }).populate('provider_id').exec();
        return res.json(users)
    }
    catch(err){
        next(err)
    }
}

const addContact = asyncHandler(async (req, res) => {
    const {uid, ucid} = req.body;

    if (!uid || !ucid) {
        throw new Error('Missing Input!');
    }
    const user = await User.findByIdAndUpdate(uid, { $push: { chat_users: ucid } }, {new: true});

    return res.status(200).json({
        success: user ? true : false,
        mes: user ? 'Contact added successfully' : "Something went wrong",
        contact: user
    })
});

module.exports = {
    register,
    login,
    getOneUser,
    refreshAccessToken,
    logout,
    forgotPassword,
    resetPassword,
    getAllUsers,
    deleteUser,
    updateUser,
    updateUserByAdmin,
    updateUserAddress,
    updateCartService,
    updateCartProduct,
    finalRegister,
    createUsers,
    updateWishlist,
    getAllCustomers,
    removeProductFromCart,
    getAllContact,
    addContact,
    updateWishlistProduct
}