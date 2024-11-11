const ServiceProvider = require('../models/ServiceProvider')
const asyncHandler = require('express-async-handler')
const User = require('../models/user')
const makeToken = require('uniqid')
const mongoose = require('mongoose');
const sendMail = require('../ultils/sendMail')
const crypto = require('crypto')

const makeTokenNumber = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Tạo mã 6 chữ số
};

const createServiceProvider = asyncHandler(async(req, res)=>{
    console.log(req.body)
    const { email, password, firstName, lastName, mobile } = req.body
    const avatar = req.files?.avatar[0]?.path

    if(!email || !password || !firstName || !lastName || !mobile){
        return res.status(400).json({
            success: false,
            mes: "Missing input"
        })}
    
    let user = await User.findOne({email})
    if(user){
        return res.status(400).json({
            success: false,
            mes: "User has existed already"
        })}

    const token = makeTokenNumber()
    const email_edit = btoa(email) + '@' + token
    const newUser = await User.create({
        email:email_edit,password,firstName,lastName,mobile,avatar
    })

    if(!newUser){
        return res.status(400).json({
            success: false,
            mes: "Error creating user"
        })
    }
    else{
        setTimeout(async()=>{
            await User.deleteOne({email: email_edit})
        },[15*60*1000])
    }

    const { bussinessName, address } = req.body
    if (!bussinessName || !address ) {
        return res.status(400).json({
            success: false,
            mes: "Missing Input On Provider"
        })
    }

    console.log('test111')
    const images = req.files?.images[0]?.path
    console.log(images)
    req.body.images = images

    const bname = await ServiceProvider.findOne({bussinessName})
    if(bname){
        return res.status(400).json({
            success: false,
            mes: "Provider name has existed already"
        })
    }


    const newProvider = await ServiceProvider.create({
        ...req.body,
        bussinessName:  bussinessName + "@" + token
    });

    if (!newProvider) {
        console.log('test333')
        res.status(400).json({
            success: false,
            mes: "Cannot Create Provider Register"
        })
    }
    else{
        console.log('test444')
        setTimeout(async()=>{
            await ServiceProvider.deleteOne({bussinessName: req.body.bussinessName + "@" + token})
        },[15*60*1000])
    }

    user = await User.findOne({mobile: req?.body?.mobile})
    if(!user){
        res.status(400).json({
            success: false,
            mes: "Invalid Request For Provider Register"
        })
        return
    }
    const userUpdated = await User.updateOne({mobile: req?.body?.mobile}, { provider_id: newProvider.id, role: 1411 })

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
    await sendMail({email, html, subject: 'Complete Registration'})

    return res.status(201).json({
        success: newProvider ? true : false,
        mes: "Created Provider and Account Successful"
    })
})

const finalRegisterProvider = asyncHandler(async(req, res)=>{
    const {token} = req.params
    const notActiveEmail = await User.findOne({email:new RegExp(`${token}$`)})
    const notActiveProvider = await ServiceProvider.findOne({bussinessName:new RegExp(`${token}$`)})
    if(notActiveEmail){
        notActiveEmail.email = atob(notActiveEmail?.email?.split("@")[0])
        notActiveEmail.save()
    }
    if(notActiveProvider){
        notActiveProvider.bussinessName = notActiveProvider?.bussinessName?.split("@")[0]
        notActiveProvider.save()
    }
    return res.json({
        success: (notActiveEmail && notActiveProvider) ? true : false,
        mes: (notActiveEmail && notActiveProvider) ? "Successfully" : "Something went wrong"
    })
})


const getAllServiceProvider = asyncHandler(async(req, res) => {
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
    
    let queryCommand = ServiceProvider.find(formatedQueries).select('-createdAt -updatedAt');
    
    try {
        // sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            queryCommand.sort(sortBy);
        } else {
            // Sort by createdAt in descending order if no sort query is provided
            queryCommand.sort('-createdAt');
        }

        //pagination
        const page = +req.query.page || 1;
        const limit = +req.query.limit || process.env.LIMIT_PRODUCT;
        const skip = (page - 1) * limit;
        queryCommand.skip(skip).limit(limit);

        const response = await queryCommand;
        const counts = await ServiceProvider.countDocuments(formatedQueries);
        
        return res.status(200).json({
            success: true,
            counts: counts,
            AllServiceProviders: response ? response : "Cannot get all coupons",
        });
        
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Cannot get all service providers',
        });
    }
})

const updateServiceProvider = asyncHandler(async(req, res)=>{
    const spid = req.params.spid

    if(Object.keys(req.body).length === 0){
        throw new Error('Missing input')
    }
    if(req.body.expiry){
        req.body.expiry = Date.now() + +req.body.expiry * 24 * 60 * 60 * 1000
    }
    const response = await ServiceProvider.findByIdAndUpdate(spid, req.body, {new: true})

    return res.status(200).json({
        success: response ? true : false,
        updatedServiceProvider: response ? response : "Cannot update a Service Provider",
        mes: response ? 'Success Updated' : 'Failed to Update'
    })
})

const getServiceProvider = asyncHandler(async(req, res)=>{
    const spid = req.params.spid;
    const sp = await ServiceProvider.findById(spid);

    const owner = await User.find({provider_id: spid});
    sp.owner = owner;

    return res.status(200).json({
        success: sp ? true : false,
        payload: sp ? sp : "Cannot find Service Provider"
    })
})

const deleteServiceProvider = asyncHandler(async(req, res)=>{
    const {cid} = req.params
    const response = await ServiceProvider.findByIdAndDelete(cid)
    return res.status(200).json({
        success: response ? true : false,
        deletedServiceProvider: response ? response : "Cannot delete service provider"
    })
})

const addServiceProviderQuestion = asyncHandler(async(req, res)=>{
    const {qna, provider_id} = req.body;
    if(!qna && !provider_id){
        throw new Error('Missing input')
    }
    console.log(req.body);
    const response = await ServiceProvider.findByIdAndUpdate(provider_id, {chatGivenQuestions:qna}, {new:true});
    return res.status(200).json({
        success: response ? true : false,
        qna: response ? response : "Cannot delete service provider"
    })
})

const getServiceProviderByOwnerId = asyncHandler(async(req, res)=>{
    const {owner} = req.body;
    if(!owner){
        throw new Error('Missing input')
    }
    console.log(req.body);
    const response = await ServiceProvider.findOne({});
    return res.status(200).json({
        success: response ? true : false,
        provider: response ? response : "Cannot get service provider"
    })
})

const updateServiceProviderTheme = asyncHandler(async(req, res)=>{
    const spid = req.params.spid

    const {theme} = req.body
    if(!theme){
        throw new Error('Missing inputttt')
    }

    const response = await ServiceProvider.findByIdAndUpdate(spid,  { $set: { theme } }, {new: true})

    if (!response) {
        return res.status(404).json({
            success: false,
            message: "Service Provider not found",
        });
    }

    return res.status(200).json({
        success: response ? true : false,
        updatedServiceProvider: response ? response : "Cannot update a Service Provider",
        mes: response ? 'Settings has been saved' : 'Failed to Update'
    })
})

const getServiceProviderByAdmin = asyncHandler(async(req,res) => {
    const {_id} = req.user
    const {provider_id} = await User.findById({_id}).select('provider_id')
    const sp = await ServiceProvider.findById(provider_id);
    return res.status(200).json({
        success: sp ? true : false,
        payload: sp ? sp : "Cannot find Service Provider"
    })
})

const updateFooterSection = asyncHandler(async(req,res) => {
    const {_id} = req.user
    const {provider_id} = await User.findById({_id}).select('provider_id')
    console.log(req?.body)
})
module.exports = {
    createServiceProvider,
    getAllServiceProvider,
    updateServiceProvider,
    deleteServiceProvider,
    getServiceProvider,
    addServiceProviderQuestion,
    getServiceProviderByOwnerId,
    updateServiceProviderTheme,
    finalRegisterProvider,
    getServiceProviderByAdmin,
    updateFooterSection
}