const Staff = require('../models/staff')
const asyncHandler = require("express-async-handler")


const addStaff = asyncHandler(async(req, res)=>{
    const {firstName, lastName, mobile} = req.body
    const data = {firstName, lastName, mobile}
    if(req.file){
        data.avatar = req.file.path
    }
    if(!firstName || !lastName || !mobile){
        throw new Error("Missing input")
    }
    else{
        const response = await Staff.create(data)
        return res.status(200).json({
            success: response ? true : false,
            mes: response ? 'Created successfully' : "Cannot create new staff"
        })
    }
})

// const getOneUser = asyncHandler(async(req, res)=>{
//     const {_id} = req.user
//     const user = await User.findById({_id}).select('-refresh_token -password').populate({
//         path: 'cart',
//         populate:{
//             path: 'product',
//             select: 'title thumb price'
//         }
//     }).populate('wishlist', 'title thumb price color')
//     return res.status(200).json({
//         success: user? true : false,
//         res: user? user : "User not found"
//     })
// })


// // get all users
// const getAllUsers = asyncHandler(async (req, res) => {
//     const queries = { ...req.query };
//     // Loại bỏ các trường đặc biệt ra khỏi query
//     const excludeFields = ['limit', 'sort', 'page', 'fields'];
//     excludeFields.forEach((el) => delete queries[el]);

//     // Format lại các toán tử cho đúng cú pháp của mongoose
//     let queryString = JSON.stringify(queries);
//     queryString = queryString.replace(
//         /\b(gte|gt|lt|lte)\b/g,
//         (matchedEl) => `$${matchedEl}`
//     );

//     // chuyen tu chuoi json sang object
//     const formatedQueries = JSON.parse(queryString);
//     // Filtering
//     if (queries?.name) formatedQueries.name = { $regex: queries.name, $options: 'i' };  
//     if (req.query.q){
//         delete formatedQueries.q
//         formatedQueries['$or'] = [
//             {firstName : { $regex: req.query.q, $options: 'i' }},
//             {lastName : { $regex: req.query.q, $options: 'i' }},
//             {email : { $regex: req.query.q, $options: 'i' }},
//         ]
//     }
//     let queryCommand =  User.find(formatedQueries)
//     try {
//         // sorting
//         if(req.query.sort){
//             const sortBy = req.query.sort.split(',').join(' ')
//             queryCommand.sort(sortBy)
//         }

//         //filtering
//         if(req.query.fields){
//             const fields = req.query.fields.split(',').join(' ')
//             queryCommand.select(fields)
//         }
//         //pagination
//         //limit: so object lay ve 1 lan goi API
//         //skip: n, nghia la bo qua n cai dau tien
//         //+2 -> 2
//         //+dgfbcxx -> NaN
//         const page = +req.query.page || 1
//         const limit = +req.query.limit || process.env.LIMIT_PRODUCT
//         const skip = (page-1)*limit
//         queryCommand.skip(skip).limit(limit)


//         const users = await queryCommand
//         const counts = await User.countDocuments(formatedQueries);
//         return res.status(200).json({
//             success: true,
//             counts: counts,
//             users: users,
//             });
        
//     } catch (error) {
//         // Xử lý lỗi nếu có
//         return res.status(500).json({
//         success: false,
//         error: 'Cannot get products',
//         });
//     }
// })

// // delete user
// const deleteUser = asyncHandler(async (req, res) => {
//     const {userId} = req.params
//     if(!userId){
//         throw new Error("Missing input")
//     }
//     else{
//         const response = await User.findByIdAndDelete(userId)  
//         return res.status(200).json({
//             success: response ? true : false,
//             mes: response ? `User with email ${response.email} deleted successfully` : "Something went wrong"
//         })
//     }
// })


//update user by admin
// const updateUserByAdmin = asyncHandler(async (req, res) => {
//     const {userId} = req.params
//     if(!userId || Object.keys(req.body).length === 0){
//         throw new Error("Missing input")
//     }
//     else{
//         const response = await User.findByIdAndUpdate(userId, req.body, {new: true}).select('-refresh_token -password -role')
//         return res.status(200).json({
//             success: response ? true : false,
//             mes: response ? `User with email ${response.email} updated successfully` : "Something went wrong"
//         })
//     }
// })

module.exports = {
    addStaff,
    // getOneUser,
    // getAllUsers,
    // deleteUser,
    // updateUserByAdmin,
}