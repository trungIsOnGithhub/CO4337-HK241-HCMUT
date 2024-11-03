const mongoose = require('mongoose');
const asyncHandler = require("express-async-handler")
const Order = require('../models/order')
const Service = require('../models/service');
const ServiceProvider = require('../models/ServiceProvider');
//  const Interaction = require('../models/interaction')

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

const getMondayOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
}
const get3RecentWeekRange = () => {
    const nowDate = new Date();
    const currentWeekMonday = getMondayOfWeek(nowDate);

    const sundayOfLastWeek = currentWeekMonday - 1;
    const mondayOfLastWeek = getMondayOfWeek(sundayOfLastWeek);

    const sundayOfPreviousWeek = mondayOfLastWeek - 1;
    const mondayOfPreviousWeek = getMondayOfWeek(sundayOfPreviousWeek);

    return [
        [currentWeekMonday, nowDate],
        [mondayOfLastWeek, sundayOfLastWeek],
        [mondayOfPreviousWeek, sundayOfPreviousWeek],
    ]
}
function getLastThreeMonthsStartEnd(date) {
    // Clone the date to avoid mutating the original
    const inputDate = new Date(date);
    const results = [];

    // Loop through the last three months
    for (let i = 0; i < 3; i++) {
        // Calculate the year and month for the current iteration
        const year = inputDate.getFullYear();
        const month = inputDate.getMonth() - i; // Go back i months

        // Start of the month
        const startOfMonth = new Date(year, month, 1);
        startOfMonth.setHours(0, 0, 0, 0); // Set to start of the day

        // End of the month
        const endOfMonth = new Date(year, month + 1, 0); // 0 gets the last day of the previous month
        endOfMonth.setHours(23, 59, 59, 999); // Set to end of the day

        // Push the result into the array
        results.push({
            start: startOfMonth,
            end: endOfMonth
        });
    }

    return results;
}


const getRevenue3RecentStatistic = asyncHandler(async (req, res) => {
    const { periodData, spid } = req.body;
    if (!periodData || !spid) {
        return res.status(400).json({
            success: false,
            error: 'Missing Input'
        });
    }

    const last3Weeks = get3RecentWeekRange();
    const last3Months = getLastThreeMonthsStartEnd(new Date());

    let revenueData = [0,0,0];
    if (periodData === 'week') {
        const currentWeekOrders = await Order.find({
            createdAt: {
                $gte: new Date(last3Weeks[0][0]),
                $lte: new Date(last3Weeks[0][1]),
            },
            'info.0.provider': spid
        }).populate('info.service');

        console.log('{{{{{{', currentWeekOrders[0].info[0].service);

        revenueData[2] = currentWeekOrders.reduce((acc, order) => {
            return acc + order?.info[0].service?.price;
        }, 0);

        console.log('|||||||||||||||||', revenueData[2]);


        const lastWeekOrders = await Order.find({
            createdAt: {
                $gte: new Date(last3Weeks[1][0]),
                $lte: new Date(last3Weeks[1][1]),
            },
            'info.0.provider': spid
        }).populate('info.service');

        revenueData[1] = lastWeekOrders.reduce((acc, order) => {
            return acc + order?.info[0].service?.price;
        }, 0);


        const prevWeekOrders = await Order.find({
            createdAt: {
                $gte: new Date(last3Weeks[2][0]),
                $lte: new Date(last3Weeks[2][1]),
            },
            'info.0.provider': spid
        }).populate('info.service');

        revenueData[0] = prevWeekOrders.reduce((acc, order) => {
            return acc + order?.info[0].service?.price;
        }, 0);
    }
    else if (periodData === 'month') {

        const currentWeekOrders = await Order.find({
            createdAt: {
                $gte: last3Months[2].start,
                $lte: last3Months[2].end,
            },
            'info.0.provider': spid
        }).populate('info.service');

        revenueData[2] = currentWeekOrders.reduce((acc, order) => {
            return acc + order?.info[0].service?.price;
        }, 0);


        const lastWeekOrders = await Order.find({
            createdAt: {
                $gte: last3Months[1].start,
                $lte: last3Months[1].end,
            },
            'info.0.provider': spid
        }).populate('info.service');

        revenueData[1] = lastWeekOrders.reduce((acc, order) => {
            return acc + order?.info[0].service?.price;
        }, 0);


        const prevWeekOrders = await Order.find({
            createdAt: {
                $gte: last3Months[0].start,
                $lte: last3Months[0].end,
            },
            'info.0.provider': spid
        }).populate('info.service');

        revenueData[0] = prevWeekOrders.reduce((acc, order) => {
            return acc + order?.info[0].service?.price;
        }, 0);
    }

    console.log('----><<', revenueData, '------<><>', periodData);

    return res.json({
        success: revenueData ? true : false,
        revenue: revenueData
    })
});


const getNewCustomer3RecentStatistic = asyncHandler(async (req, res) => {
    const { periodData, spid } = req.body;
    if (!periodData) {
        return res.status(400).json({
            success: false,
            error: 'Missing Input'
        });
    }

    const last3Weeks = get3RecentWeekRange();
    const last3Months = getLastThreeMonthsStartEnd(new Date());

    console.log('..........', last3Weeks);

    let newCustomerData = [0,0,0];
    if (periodData === 'week') {
        // console.log('......', last3Weeks[0]);
        // console.log('......', spid);

        const currentWeekOrders = await Order.find({
            'info.0.provider': spid
        }).populate('info.service').populate('orderBy');

        // console.log('..........', currentWeekOrders);

        let currentWeekCustomers = currentWeekOrders.map((order) => {
            return order.orderBy;
        });
        currentWeekCustomers = currentWeekCustomers.filter(function(item, pos, self) {
            return self.indexOf(item) == pos;
        })
    
        // console.log('..........', currentWeekCustomers);

        let newCusCnt = 0;
        for (const customer of currentWeekCustomers) {
            const pastOrder = await Order.find({
                'info.0.provider': spid,
                orderBy: customer._id
            });

            console.log('....:::::---', pastOrder.length);

            if (pastOrder?.length === 1) {
                ++newCusCnt;
            }
        }
        newCustomerData[2] = newCusCnt;


        const lastWeekOrders = await Order.find({
            createdAt: {
                $gte: new Date(last3Months[1].start),
                $lte: new Date(last3Months[1].end),
            },
            'info.0.provider': spid
        }).populate('info.service').populate('orderBy');

        let lastWeekCustomers = lastWeekOrders.map((order) => {
            return order.orderBy;
        });
        lastWeekCustomers = lastWeekCustomers.filter(function(item, pos, self) {
            return self.indexOf(item) == pos;
        })

        newCusCnt = 0;
        for (const customer of lastWeekCustomers) {
            const pastOrder = await Order.find({
                'info.0.provider': spid,
                orderBy: customer._id
            });

            if (pastOrder?.length === 1) {
                ++newCusCnt;
            }
        }
        newCustomerData[1] = newCusCnt;


        const prevWeekOrders = await Order.find({
            createdAt: {
                $gte: new Date(last3Months[2].start),
                $lte: new Date(last3Months[2].end),
            },
            'info.0.provider': spid
        }).populate('info.service').populate('orderBy');

        let prevWeekCustomers = prevWeekOrders.map((order) => {
            return order.orderBy;
        });
        prevWeekCustomers = prevWeekCustomers.filter(function(item, pos, self) {
            return self.indexOf(item) == pos;
        })

        newCusCnt = 0;
        for (const customer of prevWeekCustomers) {
            const pastOrder = await Order.find({
                'info.0.provider': spid,
                orderBy: customer._id
            });

            if (pastOrder?.length === 1) {
                ++newCusCnt;
            }
        }
        newCustomerData[0] = newCusCnt;
    }
    else if (periodData === 'month') {

        console.log(last3Months[2].start);
        console.log(last3Months[2].end);
        const currentWeekOrders = await Order.find({
            createdAt: {
                $gte: new Date(last3Months[2].start),
                $lte: new Date(last3Months[2].end),
            },
            'info.0.provider': spid
        }).populate('info.service').populate('orderBy');

        let currentWeekCustomers = currentWeekOrders.map((order) => {
            return order.orderBy;
        });
        currentWeekCustomers = currentWeekCustomers.filter(function(item, pos, self) {
            return self.indexOf(item) == pos;
        })

        let newCusCnt = 0;
        for (const customer of currentWeekCustomers) {
            const pastOrder = await Order.find({
                'info.0.provider': spid,
                orderBy: customer._id
            });

            if (pastOrder?.length === 1) {
                ++newCusCnt;
            }
        }
        newCustomerData[2] = newCusCnt;



        const lastWeekOrders = await Order.find({
            createdAt: {
                $gte: new Date(last3Months[1].start),
                $lte: new Date(last3Months[1].end),
            },
            'info.0.provider': spid
        }).populate('info.service').populate('orderBy');

        let lastWeekCustomers = lastWeekOrders.map((order) => {
            return order.orderBy;
        });
        lastWeekCustomers = lastWeekCustomers.filter(function(item, pos, self) {
            return self.indexOf(item) == pos;
        })

        newCusCnt = 0;
        for (const customer of lastWeekCustomers) {
            const pastOrder = await Order.find({
                'info.0.provider': spid,
                orderBy: customer._id
            });

            if (pastOrder?.length === 1) {
                ++newCusCnt;
            }
        }
        newCustomerData[1] = newCusCnt;



        const prevWeekOrders = await Order.find({
            createdAt: {
                $gte: new Date(last3Months[0].start),
                $lte: new Date(last3Months[0].end),
            },
            'info.0.provider': spid
        }).populate('info.service').populate('orderBy');

        let prevWeekCustomers = prevWeekOrders.map((order) => {
            return order.orderBy;
        });
        prevWeekCustomers = prevWeekCustomers.filter(function(item, pos, self) {
            return self.indexOf(item) == pos;
        })

        newCusCnt = 0;
        for (const customer of prevWeekCustomers) {
            const pastOrder = await Order.find({
                'info.0.provider': spid,
                orderBy: customer._id
            });

            if (pastOrder?.length === 1) {
                ++newCusCnt;
            }
        }
        newCustomerData[0] = newCusCnt;
    }

    // console.log('----><<', newCustomerData, '------<><>', periodData);

    return res.json({
        success: newCustomerData ? true : false,
        newCustomer: newCustomerData
    });
});


function getSpecificMonthStartEnd(month, year) {
    // Ensure month is within the valid range (1-12)
    if (month < 1 || month > 12) {
        throw new Error('Month must be between 1 and 12');
    }

    // Start of the month (set to the 1st day of the specified month and year)
    const startOfMonth = new Date(year, month - 1, 1); // month - 1 because Date months are 0-indexed
    startOfMonth.setHours(0, 0, 0, 0); // Set to start of the day

    // End of the month (set to the last day of the specified month and year)
    const endOfMonth = new Date(year, month, 0); // 0 gets the last day of the previous month
    endOfMonth.setHours(23, 59, 59, 999); // Set to end of the day

    return {
        start: startOfMonth,
        end: endOfMonth
    };
}
const getAllOrderSpecificMonth = async (month, year, spid) => {
    const startEndThisMonth = getSpecificMonthStartEnd(month, year);
    console.log(startEndThisMonth, ";;;;;;;;;;;;;;;;");
    return await Order.find({
        createdAt: {
            $gte: startEndThisMonth.start,
            $lte: startEndThisMonth.end,
        },
        'info.0.provider': spid
    })
    .populate('info.service')
    .populate('orderBy');
}
const getCustomerDataByMonth = asyncHandler(async (req, res) => {
    const { currMonth, currYear, spid } = req.body;
    if (!currMonth || !currYear || currMonth < 0 || currMonth > 12 || !spid) {
        return res.status(400).json({
            success: false,
            error: 'Missing Input'
        });
    }


    const allOrdersThisMonth = await getAllOrderSpecificMonth(currMonth, currYear, spid);

    let allCustomersThisMonth = allOrdersThisMonth.map(order => {
        return order.orderBy;
    });
    allCustomersThisMonth = allCustomersThisMonth.filter(function(item, pos, self) {
        return self.indexOf(item) == pos;
    })

    let newCusCnt = 0;
    for (const customer of allCustomersThisMonth) {
        const pastOrder = await Order.find({
            'info.0.provider': spid,
            orderBy: customer._id
        });

        if (pastOrder?.length === 1) {
            ++newCusCnt;
        }
    }

    return res.json({
        success: true,
        newCustomers: newCusCnt,
        returningCustomers: allCustomersThisMonth.length - newCusCnt
    });
});

const getThisMonthRevenueAndOrderStatistic = asyncHandler(async (req, res) => {
    const { currMonth, currYear, spid } = req.body;
    if (!currMonth || !currYear || currMonth < 0 || currMonth > 12) {
        return res.status(400).json({
            success: false,
            error: 'Missing Input'
        });
    }

    let canceledOrderCurrMonth = 0;
    let finishedOrderCurrMonth = 0;
    // filter by current Month-Year and previous Month-Year
    let allOrdersThisMonth = await getAllOrderSpecificMonth(currMonth, currYear, spid);

    let numDaysInMonth = new Date(currYear, currMonth, 0).getDate();
    let revenueMonthList = Array(numDaysInMonth).fill(0);
    allOrdersThisMonth.forEach(order => {
        if (order.status === 'Successful' && order.createdAt) {
            const indexByDate = order.createdAt.getDate()-1;
            revenueMonthList[indexByDate] += order.total;
            ++finishedOrderCurrMonth;
        }
        else if (order.status === 'Cancelled') {
            ++canceledOrderCurrMonth;
        }
    });
    // canceledOrderCurrMonth = allOrder.filter(ele => ele.status === "canceled");
    // finishedOrderCurrMonth = allOrder.filter(ele => ele.status === "finished");

    return res.json({
        success: true,
        canceled: canceledOrderCurrMonth,
        finished: finishedOrderCurrMonth,
        revenueSeries: revenueMonthList
    });
});

function getMinutesDifference(startTime, endTime) {
    if (startTime?.length === 0 || endTime?.length === 0) {
        return 0;
    }
    // Split the time strings into hours and minutes
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    // Convert both times to total minutes
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    // Calculate the difference in minutes
    return endTotalMinutes - startTotalMinutes;
}
const getOccupancy3RecentStatistic = asyncHandler(async (req, res) => {
    const { periodData,spid } = req.body;
    if (!periodData || !spid) {
        return res.status(400).json({
            success: false,
            error: 'Missing Input'
        });
    }

    const serviceProviderInfo = await ServiceProvider.findById(spid);
    let totalWorkingHoursOfProviderPerWeek = 0;
    [
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
    ].forEach(day => {
        totalWorkingHoursOfProviderPerWeek +=
            getMinutesDifference(serviceProviderInfo?.time[`start${day}`], serviceProviderInfo?.time[`end${day}`]);
    });

    const last3Weeks = get3RecentWeekRange();
    const last3Months = getLastThreeMonthsStartEnd(new Date());

    let occupancyData = [0,0,0];
    if (periodData === 'week') {
        const currentWeekOrders = await Order.find({
            createdAt: {
                $gte: new Date(last3Weeks[0][0]),
                $lte: new Date(last3Weeks[0][1]),
            },
            'info.0.provider': spid
        }).populate('info.service').populate('orderBy');

        // console.log('..........', currentWeekOrders);

        let sumDurationsAllOrders = currentWeekOrders.reduce((acc, order) => {
            return acc + order?.info[0].service?.duration;
        }, 0);
    
        console.log('..//////////', sumDurationsAllOrders);

        occupancyData[2] = sumDurationsAllOrders * 100 / (totalWorkingHoursOfProviderPerWeek || 1);

        console.log('..//////////', totalWorkingHoursOfProviderPerWeek);


        const lastWeekOrders = await Order.find({
            createdAt: {
                $gte: new Date(last3Weeks[1][0]),
                $lte: new Date(last3Weeks[1][1]),
            },
            'info.0.provider': spid
        }).populate('info.service').populate('orderBy');
        // console.log('..........', currentWeekOrders);

        sumDurationsAllOrders = lastWeekOrders.reduce((acc, order) => {
            return acc + order?.info[0].service?.duration;
        }, 0);
    
        console.log('..//////////', sumDurationsAllOrders);

        occupancyData[1] = sumDurationsAllOrders * 100 / (totalWorkingHoursOfProviderPerWeek || 1);


        const prevWeekOrders = await Order.find({
            createdAt: {
                $gte: new Date(last3Weeks[2][0]),
                $lte: new Date(last3Weeks[2][1]),
            },
            'info.0.provider': spid
        }).populate('info.service').populate('orderBy');
        // console.log('..........', currentWeekOrders);

        sumDurationsAllOrders = lastWeekOrders.reduce((acc, order) => {
            return acc + order?.info[0].service?.duration;
        }, 0);
    
        console.log('..//////////', sumDurationsAllOrders * 100 / (totalWorkingHoursOfProviderPerWeek || 1));

        occupancyData[0] = sumDurationsAllOrders * 100 / (totalWorkingHoursOfProviderPerWeek || 1);
    }
    else if (periodData === 'month') {

        console.log(last3Months[2].start);
        console.log(last3Months[2].end);
        const currentWeekOrders = await Order.find({
            createdAt: {
                $gte: new Date(last3Months[2].start),
                $lte: new Date(last3Months[2].end),
            },
            'info.0.provider': spid
        }).populate('info.service').populate('orderBy');

        let currentWeekCustomers = currentWeekOrders.map((order) => {
            return order.orderBy;
        });
        currentWeekCustomers = currentWeekCustomers.filter(function(item, pos, self) {
            return self.indexOf(item) == pos;
        })

        let newCusCnt = 0;
        for (const customer of currentWeekCustomers) {
            const pastOrder = await Order.find({
                'info.0.provider': spid,
                orderBy: customer._id
            });

            if (pastOrder?.length === 1) {
                ++newCusCnt;
            }
        }
        newCustomerData[2] = newCusCnt;



        const lastWeekOrders = await Order.find({
            createdAt: {
                $gte: new Date(last3Months[1].start),
                $lte: new Date(last3Months[1].end),
            },
            'info.0.provider': spid
        }).populate('info.service').populate('orderBy');

        let lastWeekCustomers = lastWeekOrders.map((order) => {
            return order.orderBy;
        });
        lastWeekCustomers = lastWeekCustomers.filter(function(item, pos, self) {
            return self.indexOf(item) == pos;
        })

        newCusCnt = 0;
        for (const customer of lastWeekCustomers) {
            const pastOrder = await Order.find({
                'info.0.provider': spid,
                orderBy: customer._id
            });

            if (pastOrder?.length === 1) {
                ++newCusCnt;
            }
        }
        newCustomerData[1] = newCusCnt;



        const prevWeekOrders = await Order.find({
            createdAt: {
                $gte: new Date(last3Months[0].start),
                $lte: new Date(last3Months[0].end),
            },
            'info.0.provider': spid
        }).populate('info.service').populate('orderBy');

        let prevWeekCustomers = prevWeekOrders.map((order) => {
            return order.orderBy;
        });
        prevWeekCustomers = prevWeekCustomers.filter(function(item, pos, self) {
            return self.indexOf(item) == pos;
        })

        newCusCnt = 0;
        for (const customer of prevWeekCustomers) {
            const pastOrder = await Order.find({
                'info.0.provider': spid,
                orderBy: customer._id
            });

            if (pastOrder?.length === 1) {
                ++newCusCnt;
            }
        }
        newCustomerData[0] = newCusCnt;
    }
    return res.json({
        success: occupancyData ? true : false,
        occupancy: occupancyData
    })
});

const getOccupancyByDayCurrentMonth = asyncHandler(async (req, res) => {
    const { currMonth, currYear, spid } = req.body;
    if (!currMonth || !currYear || currMonth < 0 || currMonth > 12) {
        return res.status(400).json({
            success: false,
            error: 'Missing Input'
        });
    }

    const workingHourByDayMap = [];
    const serviceProviderInfo = await ServiceProvider.findById(spid);
    // let totalWorkingHoursOfProviderPerWeek = 0;
    // order of this correspond to number return by getDay() method
    [
         'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
    ].forEach(day => {
        workingHourByDayMap.push(
            getMinutesDifference(serviceProviderInfo?.time[`start${day}`], serviceProviderInfo?.time[`end${day}`])
        );
    });

    let allOrdersThisMonth = await getAllOrderSpecificMonth(currMonth, currYear, spid);

    let numDaysInMonth = new Date(currYear, currMonth, 0).getDate();
    let occupancyMonthList = Array(numDaysInMonth).fill(0);
    let workingHoursList = Array(numDaysInMonth).fill(0);

    console.log(allOrdersThisMonth.length, '..........OOOOOO.....');

    allOrdersThisMonth.forEach(order => {
        console.log(order.info, 'order.info++++++===;[;');
        if (order.status === 'Successful' && order.info?.length > 0) {
            for (const item of order.info) {
                const itemDate = order.createdAt.getDate();
                const itemMonth = order.createdAt.getMonth()+1;
                const itemDayWeek = order.createdAt.getDay();

                // console.log(';', itemYear)
                // console.log(';', currYear)
                
                if (item.dateTime && itemMonth === currMonth) {
                    const indexByDate = itemDate - 1;
                    occupancyMonthList[indexByDate] += item.service?.duration || 0;
                    console.log('----;;;;-;;;;', item?.service);
                    workingHoursList[indexByDate] = workingHourByDayMap[itemDayWeek];
                }
            }
        }
    });

    for (const idx in occupancyMonthList) {
        occupancyMonthList[idx] = Math.ceil(occupancyMonthList[idx] * 100 / workingHoursList[idx]);
    }

    console.log(occupancyMonthList, '++++++++++');
    console.log(workingHoursList, '++++++++++');

    return res.json({
        success: true,
        occupancySeries: occupancyMonthList
    })
});

const getOccupancyByServices = asyncHandler(async (req, res) => {
    const { currMonth, currYear, spid } = req.body;
    if (!currMonth || !currYear || currMonth < 0 || currMonth > 12 || !spid) {
        return res.status(400).json({
            success: false,
            error: 'Missing Input'
        });
    }

    let allOrdersThisMonth = await getAllOrderSpecificMonth(currMonth, currYear, spid);
    console.log('ALl Service In Orders: ', allOrdersThisMonth.length, currMonth, currYear);
    let allServiceInOrders = allOrdersThisMonth.map(order => {
        return order.info[0]?.service;
    });
    console.log('ALl Service In Orders: ', allServiceInOrders);
    // allServiceInOrders = allServiceInOrders.filter((serv, idx, self) => {
    //     return self.indexOf()
    // })

    let orderCountByService = {};
    let revenueCountByService = {};
    let sumWorkedHourByService = {};

    allOrdersThisMonth.forEach(order => {
        if (order.info?.length > 0) {
            for (const item of order.info) {
                if (!item.service || !item.service?._id) continue;

                if (allServiceInOrders.filter(serv => serv._id === item.service?._id).length === 0) {
                    allServiceInOrders.push(item.service);
                }
                sumWorkedHourByService[item.service?._id] = (sumWorkedHourByService[item.service?._id] || 0) + item.service.duration;
                orderCountByService[item.service?._id] = (orderCountByService[item.service?._id] || 0) + 1;
                revenueCountByService[item.service?._id] = (revenueCountByService[item.service?._id] || 0) + item.service.price;
            }
        }
    });


    const serviceProviderInfo = await ServiceProvider.findById(spid);
    let totalWorkingHoursOfProviderPerWeek = 0;
    [
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
    ].forEach(day => {
        totalWorkingHoursOfProviderPerWeek +=
            getMinutesDifference(serviceProviderInfo?.time[`start${day}`], serviceProviderInfo?.time[`end${day}`]);
    });

    console.log("---||||-->", orderCountByService);
    console.log("---||||-->", sumWorkedHourByService);
    console.log("---||||-->", revenueCountByService);

    // let numDaysInMonth = new Date(currYear, currMonth, 0).getDate();
    for (const idx in allServiceInOrders) {
        const serviceId = allServiceInOrders[idx]._id;

        allServiceInOrders[idx] = {
            ...(allServiceInOrders[idx].toObject()),
            numberOrders: orderCountByService[serviceId],
            revenue: revenueCountByService[serviceId],
            occupancy: sumWorkedHourByService[serviceId] * 100 / totalWorkingHoursOfProviderPerWeek * 4
        }
        //     ;
        // allServiceInOrders[idx].;
        // allServiceInOrders[idx].
    }
    return res.json({
        success: true,
        performance: allServiceInOrders
    })
});

const getOccupancyByStaffs = asyncHandler(async (req, res) => {
    const { currMonth, currYear, spid } = req.body;
    if (!currMonth || !currYear || currMonth < 0 || currMonth > 12) {
        return res.status(400).json({
            success: false,
            error: 'Missing Input'
        });
    }

    let allOrdersThisMonth = [
        {
            info: [
                {
                    service: {
                        _id: "1a",
                        name:"Service Sample 1",
                        thumb: "https://monngonmoingay.com/wp-content/smush-webp/2024/09/dui-ech-chien-8.jpg.webp",
                        price: 10.1,
                        duration: 10,
                        assigned_staff: [1,2]
                    }
                }
            ]
        },
        {
            info: [
                {
                    service: {
                        _id: "2b",
                        name:"Service Sample 2",
                        thumb: "https://monngonmoingay.com/wp-content/smush-webp/2024/09/dui-ech-chien-8.jpg.webp",
                        price: 20.2,
                        duration: 20,
                        assigned_staff: [1,2]
                    }
                }
            ]
        }
    ];
    let allServiceInOrders = [];

    let orderCountByService = {};
    let revenueCountByService = {};
    let sumWorkedHourByService = {};

    allOrdersThisMonth.forEach(order => {
        if (order.info?.length > 0) {
            for (const item of order.info) {
                if (!item.service || !item.service?._id) continue;

                if (allServiceInOrders.filter(serv => serv._id === item.service?._id)) {
                    allServiceInOrders.push(item.service);
                }
                sumWorkedHourByService[item.service?._id] = (sumWorkedHourByService[item.service?._id] || 0) + item.service.duration;
                orderCountByService[item.service?._id] = (orderCountByService[item.service?._id] || 0) + 1;
                revenueCountByService[item.service?._id] = (revenueCountByService[item.service?._id] || 0) + item.service.price;
            }
        }
    });

    // const serviceProviderInfo = await ServiceProvider.findById(spid);
    // let totalWorkingHoursOfProviderPerWeek = 0;
    // [
    //     'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
    // ].forEach(day => {
    //     totalWorkingHoursOfProviderPerWeek +=
    //         getMinutesDifference(serviceProviderInfo?.time[`start${day}`], serviceProviderInfo?.time[`end${day}`]);
    // });

    // console.log("----->", orderCountByService);

    // let numDaysInMonth = new Date(currYear, currMonth, 0).getDate();
    // for (const idx in allServiceInOrders) {
    //     const serviceId = allServiceInOrders[idx]._id;

    //     allServiceInOrders[idx].numberOrders = orderCountByService[serviceId];
    //     allServiceInOrders[idx].revenue = revenueCountByService[serviceId];
    //     allServiceInOrders[idx].occupancy = sumWorkedHourByService[serviceId] * 100 / totalWorkingHoursOfProviderPerWeek;
    // }

    return res.json({
        success: true,
        performance: allServiceInOrders
    })
});

module.exports = {
    getRevenueByDateRange,
    getRevenueStatistic,
    getRevenue3RecentStatistic,
    getNewCustomer3RecentStatistic,
    getOccupancy3RecentStatistic,
    getThisMonthRevenueAndOrderStatistic,
    getCustomerDataByMonth,
    getOccupancyByDayCurrentMonth,
    getOccupancyByServices,
    getOccupancyByStaffs
}