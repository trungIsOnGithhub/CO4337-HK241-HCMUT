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


    const providerObjectId = new mongoose.Types.ObjectId(provider_id)

    const interactions = await Interaction.find();

    const startDateObj = new Date(start_date)
    const endDateObj = new Date(end_date)

    if (startDateObj > endDateObj) {
        return res.status(400).json({
            success: false,
            error: 'Invalid Input'
        });
    }

    const startMonth = startDateObj.getMonth()
    const startYear = startDateObj.getFullYear()
    const endMonth = endDateObj.getMonth()
    const endYear = endDateObj.getFullYear()
    const visByMonth = {}

    if (startYear == endYear) {
        for (let m = startMonth; m <= endMonth; ++m) {
            const keyMonth = m + 1 + "/" + startYear
            visByMonth[keyMonth]  = 0
        }
    }
    else if (startYear < endYear) {
        for (let m = startMonth; m <= 11; ++m) {
            const keyMonth = m + 1 + "/" + startYear
            visByMonth[keyMonth]  = 0
        }
        for (let m = 0; m <= endMonth; ++m) {
            const keyMonth = m + 1 + "/" + endYear
            visByMonth[keyMonth]  = 0
        }
    }


    interactions.forEach(ele => {
        if(!ele?.createdAt || !ele?.user_id || !ele?.provider_id) return;
        // const dateCreated = new Date(ele.createdAt)
        const interactionMonth = ele.createdAt.getMonth()
        const interactionYear = ele.createdAt.getFullYear()

        const dateCategoryLabel = interactionMonth + 1 + "/" + interactionYear
        if(visByMonth[dateCategoryLabel] >= 0) {
            visByMonth[dateCategoryLabel] += 1
        }

    })

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