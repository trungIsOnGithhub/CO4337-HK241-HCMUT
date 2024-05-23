const mongoose = require('mongoose');
const asyncHandler = require("express-async-handler")
const Order = require('../models/order')
const Service = require('../models/service')
const Interaction = require('../models/interaction')

const getRevenueByDateRange = asyncHandler(async(req, res) => {
    const { provider_id, start_date, end_date } = req.body;

    if (!provider_id || !start_date || !end_date) {
        return res.status(400).json({
            success: false,
            error: 'Missing Input'
        });
    }

    console.log('::::::::::::', start_date, '________________')
    console.log(typeof start_date)

    const providerObjectId = new mongoose.Types.ObjectId(provider_id)

    const orders = await Order.find({
        'info.provider': providerObjectId
    });

    const revByDate = new Map();
    orders.forEach(order => {
        if(!order?.info[0]?.date || !order?.total) return;

        if (!revByDate.has(order.info[0].date)) {
            revByDate.set(order.info[0].date, 0)
        }
        const currRev = revByDate.get(order.info[0].date)
        revByDate.set(order.info[0].date, currRev + order.total)
    })

    // console.log(revByDate,'===============')

    const dailyRevenue = []
    for(const dateKey of revByDate.keys()) {
        const ddmmyyArr = dateKey.split('/').map(Number)
        console.log('------------' ,ddmmyyArr[2], ddmmyyArr[1]-1, ddmmyyArr[0], '--------')
        const revDate = new Date(ddmmyyArr[2], ddmmyyArr[1]-1, ddmmyyArr[0], 0, 0, 0)
        console.log('-ihkhlkjj-----', revDate)

        dailyRevenue.push([revDate, revByDate.get(dateKey)])
    }

    res.json({
        success: true,
        revenue: dailyRevenue
    })
})

const getRevenueStatistic = asyncHandler(async (req, res) => {
    const { provider_id } = req.body;

    // console.log('0000000000000000000')
    if (!provider_id) {
        return res.status(400).json({
            success: false,
            error: 'Missing Input'
        });
    }

    const providerObjectId = new mongoose.Types.ObjectId(provider_id)

    const totalOrders = await Order.find({
        'info.provider': providerObjectId
    });

    const totalRevenue = totalOrders.reduce((acc, curr) => acc + curr.total, 0);

    const thisMonthOrders = totalOrders.filter(order => {
        if(!order?.info[0]?.date || !order?.total) return false;

        const ddmmyyArr = order.info[0].date.split('/').map(Number)

        return (new Date()).getMonth() === ddmmyyArr[1]-1
    });

    const customerByNumOrdered = thisMonthOrders.reduce(function (acc, curr) {
        // if (acc[curr]) {
        //     acc[curr] = ++acc[curr];
        // } else {
        //     acc[curr] = 1;
        // }
        acc[curr.orderBy.toString()] = true
        return acc;
    }, {});

    const totalMonthRevenue = thisMonthOrders.reduce((acc, curr) => acc + curr.total, 0);

    const totalServices = await Service.countDocuments({ provider_id: providerObjectId });

    res.json({
        success: true,
        statistic: {
            totalRevenue,
            monthOrders: thisMonthOrders.length,
            monthCustomer: Object.keys(customerByNumOrdered).length,
            monthRevenue: totalMonthRevenue,
            totalServices
        }
    })
})

module.exports = {
    getRevenueByDateRange,
    getRevenueStatistic
}