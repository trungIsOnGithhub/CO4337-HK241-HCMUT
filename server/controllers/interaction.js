const mongoose = require('mongoose')
const Interaction = require('../models/interaction')
const asyncHandler = require('express-async-handler')

const createNewInteraction = asyncHandler(async(req, res)=>{
    const { user_id, type, provider_id, service_id } = req.body
    if ((!user_id || !type) && (provider_id || service_id)) {
        return res.status(400).json({
            success: response ? true : false,
        })
    }

    const response = await Interaction.create({
        ...req.body,
    })

    return res.status(200).json({
        success: response ? true : false,
        type
    })
})
const getMonthlyVisitByDateRange = asyncHandler(async(req, res) => {
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

    const interactions = await Interaction.find();

    const startDateObj = start_date
    const endDateObj = end_date

    const startMonth = startDateObj.getMonth()
    const startYear = startDateObj.getYear()
    const endMonth = endDateObj.getMonth()
    const endYear = endDateObj.getYear()

    console.log('-----adsd', startMonth, startYear, endMonth, endYear,'41da========')

    const visByMonth = interactions.reduce((acc, ele) => {
        if(!ele?.createdAt || !ele?.user_id || !ele?.provider_id) return acc;
        const interactionMonth = ele.createdAt.getMonth()
        const interactionYear = ele.createdAt.getYear()

        const dateCategoryLabel = interactionMonth + "/" + interactionYear
        acc[dateCategoryLabel] = acc[dateCategoryLabel] ? acc[dateCategoryLabel] + 1 : 0

        return acc
    }, {})

    // console.log(revByDate,'===============')
    const userVisit = Object.entries(visByMonth).map(ele => {
        return {
            x: ele[0],
            y: ele[1]
        }
    })

    res.json({
        success: true,
        userVisit
    })
})

module.exports = {
    createNewInteraction,
    getMonthlyVisitByDateRange
}