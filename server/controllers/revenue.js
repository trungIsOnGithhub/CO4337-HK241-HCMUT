const mongoose = require('mongoose');
const asyncHandler = require("express-async-handler")
const Order = require('../models/order')

const getRevenueByDateRange = asyncHandler(async(req, res) => {
    const { provider_id, start_date, end_date } = req.body;

    console.log('0000000000000000000')
    if (!provider_id || !start_date || !end_date) {
        return res.status(400).json({
            success: false,
            error: 'Missing Input'
        });
    }

    console.log('::::::::::::', start_date, '________________')
    console.log(typeof start_date)

    const orders = await Order.find();

    const revByDate = new Map();
    orders.forEach(order => {
        if(!order?.info[0]?.date || !order?.total) return;

        if (revByDate.has(order.info[0].date)) {
            revByDate.set(order.info[0].date, 0)
        }
        else {
            const currRev = revByDate.get(order.info[0].date)
            revByDate.set(order.info[0].date, currRev + order.total)
        }
    })

    const dailyRevenue = []
    for(const dateKey of revByDate.keys) {
        const ddmmyyArr = dateKey.split('/').map(Number)
    
        const revDate = new Date(ddmmyyArr[2], ddmmyyArr[1]-1, ddmmyyArr[0], 0, 0, 0)

        dailyRevenue.push([revDate, revByDate[dateKey]])
    }

    res.json({
        success: true,
        revenue: dailyRevenue
    })
})

module.exports = {
    getRevenueByDateRange,
}