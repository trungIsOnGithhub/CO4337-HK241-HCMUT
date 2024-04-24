const User = require('../models/user')
const asyncHandler = require("express-async-handler")
const {generateAccessToken, generateRefreshToken} = require('../middlewares/jwt')
const jwt = require('jsonwebtoken')
const sendMail = require('../ultils/sendMail')
const crypto = require('crypto')
const makeToken = require('uniqid')
const {users} = require('../ultils//constant')

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

    const {email, password, firstName, lastName, mobile} = req.body
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
        const token = makeToken()
        const email_edit = btoa(email) + '@' + token
        const newUser = await User.create({
            email:email_edit,password,firstName,lastName,mobile
        })
        // res.cookie('dataregister', {...req.body, token}, {httpOnly: true, maxAge: 15*60*1000})

        if(newUser){
            const html = `<h2>Register code: </h2><br /><blockquote>${token}</blockquote>`
            await sendMail({email, html, subject: 'Complete Registration'})
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
    //const cookie = req.cookies

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
    // const newUser = await User.create({
    //     email: cookie?.dataregister?.email,
    //     password: cookie?.dataregister?.password,
    //     mobile: cookie?.dataregister?.mobile,
    //     firstName: cookie?.dataregister?.firstName,
    //     lastName: cookie?.dataregister?.lastName,
    // })

    // res.clearCookie('dataregister')
    // if(newUser){
    //     return res.redirect(`${process.env.CLIENT_URL}/final_register/success`)
    // }
    // else{
    //     return res.redirect(`${process.env.CLIENT_URL}/final_register/fail`)
    // }
    
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
        console.log('check block')
        console.log(isBlocked)
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
    const user = await User.findById({_id}).select('-refresh_token -password').populate({
        path: 'cart',
        populate:{
            path: 'product',
            select: 'title thumb price'
        }
    }).populate('wishlist', 'title thumb price color')
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
    const {firstName, lastName, email, mobile, address} = req.body
    const data = {firstName, lastName, email, mobile, address}
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


// update cart
const updateCart = asyncHandler(async (req, res) => {
    const {_id} = req.user
    const {pid, quantity = 1, color, price, thumb, title} = req.body
    if(!pid || !color || !price || !thumb|| !title) {
        throw new Error("Missing input")
    }
    else{
        const user = await User.findById(_id).select('cart')
        const alreadyProduct = user?.cart.find(e1 => e1.product.toString() === pid && e1.color === color)

        if(alreadyProduct){
            console.log('Already')
            const response = await User.updateOne({cart:{$elemMatch: alreadyProduct}}, {$set: {"cart.$.quantity": quantity, "cart.$.price": price, "cart.$.thumb": thumb, "cart.$.title": title}},{new:true})
            return res.status(200).json({
                success: response ? true : false,
                mes: response ? 'Updated your cart' : "Something went wrong"
            })     
        }

        // neu sp chua them vao gio hang || sp da them nhung khac color
        else {
            const response = await User.findByIdAndUpdate(_id,{$push:{cart:{product:pid, quantity, color, price, thumb, title}}},{new: true})
            return res.status(200).json({
                success: response ? true : false,
                mes: response ? 'Updated your cart' : "Something went wrong"
            })
        }
    }
})

//remove product from cart
const removeProductFromCart = asyncHandler(async (req, res) => {
    console.log('removeProductFromCart')
    const {_id} = req.user
    const {pid, color} = req.params
    const user = await User.findById(_id).select('cart')
    const alreadyProduct = user?.cart.find(e1 => e1.product.toString() === pid && e1.color === color)
    if(!alreadyProduct){
        return res.status(200).json({
            success: true,
            mes: 'Not Found'
        })
    }
    else{
        const response = await User.findByIdAndUpdate(_id,{$pull:{cart:{product:pid, color}}},{new: true})
        return res.status(200).json({
            success: response ? true : false,
            mes: response ? 'Deleted successfully' : "Something went wrong"
        })
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
    const {pid} = req.params
    console.log(pid)
    const {_id} = req.user
    if(!pid) {
        throw new Error("Missing input")
    }
    const user = await User.findById(_id)
    const alreadyWishList = user?.wishlist?.find(el => el.toString() === pid)
    if(alreadyWishList){
        const response = await User.findByIdAndUpdate(_id, {$pull: {wishlist: pid}},{new: true})
        return res.status(200).json({
            success: response ? true : false,
            mes: response ? 'Updated your wishlist successfully' : 'Something went wrong'
        })
    }
    else{
        const response = await User.findByIdAndUpdate(_id, {$push: {wishlist: pid}},{new: true})
        return res.status(200).json({
            success: response ? true : false,
            mes: response ? 'Updated your wishlist successfully' : 'Something went wrong'
        })
    }

    const response = await User.create(users)
    return res.status(200).json({
        success: response ? true : false,
        user: response ? response : 'Something went wrong!'
    })
})
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
    updateCart,
    finalRegister,
    createUsers,
    removeProductFromCart,
    updateWishlist
}