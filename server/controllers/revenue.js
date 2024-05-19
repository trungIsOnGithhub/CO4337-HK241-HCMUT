const mongoose = require('mongoose');

const Order = require('../models/order')

const getOrdersForStaffCalendar = asyncHandler(async(req, res) => {
    const { provider_id, date_start, date_end } = req.body;

    console.log('0000000000000000000')
    if (!provider_id || !date_start || !date_end) {
        return res.status(400).json({
            success: false,
            error: 'Missing Input'
        });
    }

    console.log('::::::::::::', date_start, '________________')
    console.log(typeof date_start)

    res.json({
        success: true,
        revenue: []
    })
})

module.exports = {
    getRevenueByDateRange,
}