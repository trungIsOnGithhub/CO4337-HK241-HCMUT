const Product = require('../models/product')
const asyncHandler = require('express-async-handler')
const data= require('../../data/data2.json')
const slugify = require('slugify')
const categoryData = require('../../data/cate_brand.js')
const categoryServiceData = require('../../data/category_service.js')
const productCategory = require('../models/productCategory')
const serviceCategory = require('../models/serviceCategory.js')
const fn = async(product) =>{
    await Product.create({
        title: product?.name,
        slug: slugify(product?.name) + Math.round(Math.random()*100) + '',
        description: product?.description,
        brand: product?.brand,
        price: Math.round(Number(product?.price?.match(/\d/g).join(''))/100),
        category: product?.category[1],
        quantity: Math.round(Math.random()*1000),
        soldQuantity: Math.round(Math.random()*100),
        image: product?.images,
        thumb: product?.thumb,
        color: product?.variants?.find(el => el.label === 'Color')?.variants[0],
        totalRatings: 0

    })
}
const insertProduct = asyncHandler(async(req, res)=>{
    const promises = []
    for(let product of data){
        promises.push(fn(product))
    }
    await Promise.all(promises)
    return res.json('Done')
})

const fn2 = async(cate) => {
    await productCategory.create({
        title: cate?.cate,
        brand: cate?.brand,
        image: cate?.image,
    })
}
const insertCategory = asyncHandler(async(req, res)=>{
    const promises = []

    for(let cate of categoryData){
        promises.push(fn2(cate))
    }
    await Promise.all(promises)
    return res.json('Done')
})


const fn3 = async(cate) => {
    await serviceCategory.create({
        title: cate?.cate,
        image: cate?.image,
        color: cate?.color,
    })
}
const insertCategoryService = asyncHandler(async(req, res)=>{
    const promises = []

    for(let cate of categoryServiceData){
        promises.push(fn3(cate))
    }
    await Promise.all(promises)
    return res.json('Done')
})
module.exports ={
    insertProduct,
    insertCategory,
    insertCategoryService
}
