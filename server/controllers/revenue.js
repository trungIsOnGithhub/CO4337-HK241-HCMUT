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


    const dailyRevenue = []
    for(const dateKey of revByDate.keys()) {
        const ddmmyyArr = dateKey.split('/').map(Number)
        const revDate = new Date(ddmmyyArr[2], ddmmyyArr[1]-1, ddmmyyArr[0], 0, 0, 0)


        dailyRevenue.push([revDate, revByDate.get(dateKey)])
    }

    res.json({
        success: true,
        revenue: dailyRevenue
    })
})

const getRevenueStatistic = asyncHandler(async (req, res) => {
    const { provider_id } = req.body;

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
});

const getRevenue3RecentStatistic = asyncHandler(async (req, res) => {
    const { periodData } = req.body;
    if (!periodData) {
        return res.status(400).json({
            success: false,
            error: 'Missing Input'
        });
    }

    let revenueData = null;
    if (periodData === 'week') {
        revenueData = [666, 888, 999];
    }
    else if (periodData === 'month') {
        revenueData = [999, 888, 666];
    }

    return res.json({
        success: revenueData ? true : false,
        revenue: revenueData
    })
});
const getNewCustomer3RecentStatistic = asyncHandler(async (req, res) => {
    const { periodData } = req.body;
    if (!periodData) {
        return res.status(400).json({
            success: false,
            error: 'Missing Input'
        });
    }

    let newCustomerData = null;
    if (periodData === 'week') {
        newCustomerData = [222, 333, 444];
    }
    else if (periodData === 'month') {
        newCustomerData = [444, 333, 222];
    }

    return res.json({
        success: newCustomerData ? true : false,
        newCustomer: newCustomerData
    });
});
const getOccupancy3RecentStatistic = asyncHandler(async (req, res) => {
    const { periodData } = req.body;
    if (!periodData) {
        return res.status(400).json({
            success: false,
            error: 'Missing Input'
        });
    }

    let occupancyData = null;
    if (periodData === 'week') {
        occupancyData = [555, 333, 222];
    }
    else if (periodData === 'month') {
        occupancyData = [22, 333, 555];
    }

    return res.json({
        success: occupancyData ? true : false,
        occupancy: occupancyData
    })
});

module.exports = {
    getRevenueByDateRange,
    getRevenueStatistic,
    getRevenue3RecentStatistic,
    getNewCustomer3RecentStatistic,
    getOccupancy3RecentStatistic
}