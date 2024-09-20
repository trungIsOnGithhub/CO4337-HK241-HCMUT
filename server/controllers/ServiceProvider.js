const ServiceProvider = require('../models/ServiceProvider')
const asyncHandler = require('express-async-handler')
const User = require('../models/user')
const makeToken = require('uniqid')
const mongoose = require('mongoose');
const sendMail = require('../ultils/sendMail')
const crypto = require('crypto')

const createServiceProvider = asyncHandler(async(req, res)=>{
    const { email, password, firstName, lastName, mobile } = req.body
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

    const token = makeToken()
    const email_edit = btoa(email) + '@' + token
    const newUser = await User.create({
        email:email_edit,password,firstName,lastName,mobile
    })

    if(!newUser){
        return res.status(400).json({
            success: false,
            mes: "Error creating user"
        })
    }


    const { bussinessName, province } = req.body
    if (!bussinessName || !province ) {
        return res.status(400).json({
            success: false,
            mes: "Missing Input On Provider"
        })
    }



    const bname = await ServiceProvider.findOne({bussinessName})
    if(bname){
        return res.status(400).json({
            success: false,
            mes: "Provider name has existed already"
        })}

    const response = await ServiceProvider.create({
        ...req.body,
        success: true,
    });
    if (!response) {
        res.status(400).json({
            success: false,
            mes: "Cannot Create Provider Register"
        })
        return
    }

    user = await User.findOne({mobile: req?.body?.mobile})
    if(!user){
        res.status(400).json({
            success: false,
            mes: "Invalid Request For Provider Register"
        })
        return
    }
    const userUpdated = await User.updateOne({mobile: req?.body?.mobile}, { provider_id: response.id, role: 1411 })

    const html = `<h2>Register code: </h2><br /><blockquote>${token}</blockquote>`
    await sendMail({email, html, subject: 'Complete Registration'})

    return res.status(201).json({
        success: response ? true : false,
        mes: "Created Provider and Account Successful"
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
    const sp = await ServiceProvider.findById(spid)

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

module.exports = {
    createServiceProvider,
    getAllServiceProvider,
    updateServiceProvider,
    deleteServiceProvider,
    getServiceProvider,
}