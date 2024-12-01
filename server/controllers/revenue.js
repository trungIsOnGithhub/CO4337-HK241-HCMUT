let mongoose = require('mongoose');
let asyncHandler = require("express-async-handler")
let Order = require('../models/order')
let Service = require('../models/service');
let ServiceProvider = require('../models/ServiceProvider');
let moment = require('moment');
//  let Interaction = require('../models/interaction')

let getRevenueByDateRange = asyncHandler(async(req, res) => {
    let { provider_id, start_date, end_date } = req.body;

    if (!provider_id || !start_date || !end_date) {
        return res.status(400).json({
            success: false,
            error: 'Missing Input'
        });
    }

    let providerObjectId = new mongoose.Types.ObjectId(provider_id)

    let orders = await Order.find({
        'info.provider': providerObjectId
    });

    let revByDate = new Map();
    orders.forEach(order => {
        if(!order?.info[0]?.date || !order?.total) return;

        if (!revByDate.has(order.info[0].date)) {
            revByDate.set(order.info[0].date, 0)
        }
        let currRev = revByDate.get(order.info[0].date)
        revByDate.set(order.info[0].date, currRev + order.total)
    })


    let dailyRevenue = []
    for(let dateKey of revByDate.keys()) {
        let ddmmyyArr = dateKey.split('/').map(Number);
        let revDate = new Date(ddmmyyArr[2], ddmmyyArr[1]-1, ddmmyyArr[0], 0, 0, 0);

        dailyRevenue.push([revDate, revByDate.get(dateKey)])
    }

    res.json({
        success: true,
        revenue: dailyRevenue
    })
})

let getRevenueStatistic = asyncHandler(async (req, res) => {
    let { provider_id } = req.body;

    if (!provider_id) {
        return res.status(400).json({
            success: false,
            error: 'Missing Input'
        });
    }

    let providerObjectId = new mongoose.Types.ObjectId(provider_id)

    let totalOrders = await Order.find({
        'info.provider': providerObjectId
    });

    let totalRevenue = totalOrders.reduce((acc, curr) => acc + curr.total, 0);

    let thisMonthOrders = totalOrders.filter(order => {
        if(!order?.info[0]?.date || !order?.total) return false;

        let ddmmyyArr = order.info[0].date.split('/').map(Number)

        return (new Date()).getMonth() === ddmmyyArr[1]-1
    });

    let customerByNumOrdered = thisMonthOrders.reduce(function (acc, curr) {
        // if (acc[curr]) {
        //     acc[curr] = ++acc[curr];
        // } else {
        //     acc[curr] = 1;
        // }
        acc[curr.orderBy.toString()] = true
        return acc;
    }, {});

    let totalMonthRevenue = thisMonthOrders.reduce((acc, curr) => acc + curr.total, 0);

    let totalServices = await Service.countDocuments({ provider_id: providerObjectId });

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

let getMondayOfWeek = (date) => {
    let d = new Date(date);
    let day = d.getDay();
    let diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff)).setHours(0, 0, 0, 0);
}
let get3RecentWeekRange = () => {
    let nowDate = new Date();
    let currentWeekMonday = getMondayOfWeek(nowDate);

    let sundayOfLastWeek = moment(currentWeekMonday).subtract(1, 'days').toDate();
    // let sundayOfLastWeek = currentWeekMonday.setDate(currentWeekMonday.getDate()-1);
    let mondayOfLastWeek = getMondayOfWeek(sundayOfLastWeek);

    let sundayOfPreviousWeek = moment(mondayOfLastWeek).subtract(1, 'days').toDate();
    // let sundayOfPreviousWeek = mondayOfLastWeek.setDate(mondayOfLastWeek.getDate()-1);
    let mondayOfPreviousWeek = getMondayOfWeek(sundayOfPreviousWeek);

    return [
        [currentWeekMonday, nowDate],
        [mondayOfLastWeek, sundayOfLastWeek],
        [mondayOfPreviousWeek, sundayOfPreviousWeek],
    ]
}
function getLastThreeMonthsStartEnd(inputDate) {
    // Clone the date to avoid mutating the original
    // let inputDate = new Date(date);
    let results = [];

    // Loop through the last three months
    for (let i = 0; i < 3; i++) {
        // Calculate the year and month for the current iteration
        let year = inputDate.getFullYear();
        let month = inputDate.getMonth() - i; // Go back i months

        // Start of the month
        let startOfMonth = new Date(year, month, 1);
        startOfMonth.setHours(0, 0, 0, 0); // Set to start of the day

        // End of the month
        let endOfMonth = new Date(year, month + 1, 0); // 0 gets the last day of the previous month
        endOfMonth.setHours(23, 59, 59, 999); // Set to end of the day

        // Push the result into the array
        results.push({
            start: startOfMonth,
            end: endOfMonth
        });
    }
    console.log('LAST 3 MONTHS: ' + JSON.stringify(results));

    return results;
}

let getRevenue3RecentStatistic = asyncHandler(async (req, res) => {
    let { periodData, spid } = req.body;
    if (!periodData || !spid) {
        return res.status(400).json({
            success: false,
            error: 'Missing Input'
        });
    }

    let last3Weeks = get3RecentWeekRange();
    let last3Months = getLastThreeMonthsStartEnd(new Date());

    let revenueData = [0,0,0];
    if (periodData === 'week') {
        let providerOrders = await Order.find({
            'info.0.provider': spid,
            status: 'Successful'
        }).populate('info.service');

        let currentWeekOrders = providerOrders.filter(order => {
            let [day, month, year] = order.info[0].date.split('/').map(e => e.padStart(2,'0'));
            let cDate = new Date(`${year}-${month}-${day}T00:00:00Z`);

            return cDate < last3Weeks[0][1] && cDate > last3Weeks[0][0];
        });
        // currentWeekOrders.forEach(order => {
        //     console.log("||||||||||||||||||||||||||||");
        //     console.log(order._id);
        //     console.log(order.info[0].date);
        //     console.log(order.total);
        // });

        revenueData[2] = currentWeekOrders.reduce((acc, order) => {
            return acc + order.total;
        }, 0);

        // console.log('|||||||||||||||||', revenueData[2]);


        let lastWeekOrders = providerOrders.filter(order => {
            let [day, month, year] = order.info[0].date.split('/').map(e => e.padStart(2,'0'));
            let cDate = new Date(`${year}-${month}-${day}T00:00:00Z`);

            return cDate < last3Weeks[1][1] && cDate > last3Weeks[1][0];
        });

        revenueData[1] = lastWeekOrders.reduce((acc, order) => {
            return acc + order.total;
        }, 0);


        let prevWeekOrders = providerOrders.filter(order => {
            let [day, month, year] = order.info[0].date.split('/').map(e => e.padStart(2,'0'));
            let cDate = new Date(`${year}-${month}-${day}T00:00:00Z`);

            return cDate < last3Weeks[2][1] && cDate > last3Weeks[2][0];
        });

        revenueData[0] = prevWeekOrders.reduce((acc, order) => {
            return acc + order.total;
        }, 0);

    }
    else if (periodData === 'month') {
        let providerOrders = await Order.find({
            'info.0.provider': spid,
            status: 'Successful'
        }).populate('info.service');

        let currentMonthOrders = providerOrders.filter(order => {
            let [day, month, year] = order.info[0].date.split('/').map(e => e.padStart(2,'0'));
            let cDate = new Date(`${year}-${month}-${day}T00:00:00Z`);

            return cDate < last3Months[0].end && cDate > last3Months[0].start;
        })
        // console.log(JSON.stringify(last3Months[2]) + '  8888888>>>');
        // currentMonthOrders.forEach(order => {
        //     console.log(";;;;;;;;;;;||||||||||||||||||||||||||||;;;;;;;;;;;;;");
        //     console.log(order._id);
        //     console.log(order.info[0].date);
        //     console.log(order.total);
        // });
        revenueData[2] = currentMonthOrders.reduce((acc, order) => {
            return acc + order.total;
        }, 0);

        let lastWeekOrders = providerOrders.filter(order => {
            let [day, month, year] = order.info[0].date.split('/').map(e => e.padStart(2,'0'));
            let cDate = new Date(`${year}-${month}-${day}T00:00:00Z`);

            return cDate < last3Months[1].end && cDate > last3Months[1].start;
        })
        //  console.log('{{{{{{', currentWeekOrders[0].info[0].service);
        revenueData[1] = lastWeekOrders.reduce((acc, order) => {
            return acc + order.total;
        }, 0);


        let prevWeekOrders = providerOrders.filter(order => {
            let [day, month, year] = order.info[0].date.split('/').map(e => e.padStart(2,'0'));
            let cDate = new Date(`${year}-${month}-${day}T00:00:00Z`);

            return cDate < last3Months[2].end && cDate > last3Months[2].start;
        })
        //  console.log('{{{{{{', currentWeekOrders[0].info[0].service);
        revenueData[0] = prevWeekOrders.reduce((acc, order) => {
            return acc + order.total;
        }, 0);
 
    }

    // console.log('----><<', revenueData, '------<><>', periodData);

    return res.json({
        success: revenueData ? true : false,
        revenue: revenueData
    })
});


let getNewCustomer3RecentStatistic = asyncHandler(async (req, res) => {
    let { periodData, spid } = req.body;
    if (!periodData) {
        return res.status(400).json({
            success: false,
            error: 'Missing Input'
        });
    };


    let last3Weeks = get3RecentWeekRange();
    let last3Months = getLastThreeMonthsStartEnd(new Date());

    // console.log('..........', last3Weeks);

    let newCustomerData = [0,0,0];
    if (periodData === 'week') {
        // console.log('......', last3Weeks[0]);
        // console.log('......', spid);

        let providerOrders = await Order.find({
            'info.0.provider': spid,
            status: 'Successful'
        }).populate('info.service');
        // let currentWeekOrders = await Order.find({
        //     'info.0.provider': spid
        // }).populate('info.service').populate('orderBy');

        // console.log('..........', currentWeekOrders);

        let currentWeekOrders = providerOrders.filter(order => {
            let [day, month, year] = order.info[0].date.split('/').map(e => e.padStart(2,'0'));
            let cDate = new Date(`${year}-${month}-${day}T00:00:00Z`);

            return cDate < last3Weeks[0][1] && cDate > last3Weeks[0][0];
        });
        let currentWeekCustomers = currentWeekOrders.map(order => {
            return order.orderBy.toString();
        });
        console.log('Curr Week Customer: =====', currentWeekCustomers);
        currentWeekCustomers = currentWeekCustomers.filter((item, pos, self) => {
            return self.indexOf(item) === pos;
        });
        // console.log('..........', currentWeekCustomers);

        let newCusCnt = 0;
        let orderIdsArr = currentWeekOrders.map(o => o._id.toString());
        console.log("=======:::::|||<<<<", orderIdsArr);
        for (let customerId of currentWeekCustomers) {
            let pastOrder = await Order.find({
                'info.0.provider': spid,
                orderBy: customerId
            });
            //  console.log("=======:::::|||<<<<", pastOrder.map(o=>o._id.toString()));
            pastOrder = pastOrder.filter(order => {
                let [day, month, year] = order.info[0].date.split('/').map(e => e.padStart(2,'0'));
                let cDate = new Date(`${year}-${month}-${day}T00:00:00Z`);
    
                return cDate < last3Weeks[0][0];
            });

            let havePastOrder = false;
            for (const o of pastOrder) {
                if (!orderIdsArr.includes(o._id.toString())) {
                    havePastOrder = true;
                    break;
                }
            }
            if (!havePastOrder) {
                // console.log('..:::::::CURRENTWEEEK', customerId);
                ++newCusCnt;
            }
        }
        newCustomerData[2] = newCusCnt;


        let lastWeekOrders = providerOrders.filter(order => {
            let [day, month, year] = order.info[0].date.split('/').map(e => e.padStart(2,'0'));
            let cDate = new Date(`${year}-${month}-${day}T00:00:00Z`);

            return cDate < last3Weeks[1][1] && cDate > last3Weeks[1][0];
        });

        let lastWeekCustomers = lastWeekOrders.map(order => {
            return order.orderBy.toString();
        });
        lastWeekCustomers = lastWeekCustomers.filter(function(item, pos, self) {
            return self.indexOf(item) === pos;
        })

        newCusCnt = 0;
        orderIdsArr = lastWeekOrders.map(o => o._id.toString());
        for (let customerId of lastWeekCustomers) {
            let pastOrder = await Order.find({
                'info.0.provider': spid,
                orderBy: customerId
            });
            pastOrder = pastOrder.filter(order => {
                let [day, month, year] = order.info[0].date.split('/').map(e => e.padStart(2,'0'));
                let cDate = new Date(`${year}-${month}-${day}T00:00:00Z`);
    
                return cDate < last3Weeks[1][0];
            });

            let havePastOrder = false;
            for (const o of pastOrder) {
                if (!orderIdsArr.includes(o._id.toString())) {
                    havePastOrder = true;
                    break;
                }
            }
            if (!havePastOrder) {
                // console.log('..:::::::CURRENTWEEEK', customerId);
                ++newCusCnt;
            }
        }
        newCustomerData[1] = newCusCnt;


        let prevWeekOrders = providerOrders.filter(order => {
            let [day, month, year] = order.info[0].date.split('/').map(e => e.padStart(2,'0'));
            let cDate = new Date(`${year}-${month}-${day}T00:00:00Z`);

            return cDate < last3Weeks[2][1] && cDate > last3Weeks[2][0];
        });
        let prevWeekCustomers = prevWeekOrders.map(order => {
            return order.orderBy.toString();
        });
        prevWeekCustomers = prevWeekCustomers.filter(function(item, pos, self) {
            return self.indexOf(item) === pos;
        })

        newCusCnt = 0;
        orderIdsArr = prevWeekOrders.map(o => o._id.toString());
        for (let customerId of prevWeekCustomers) {
            let pastOrder = await Order.find({
                'info.0.provider': spid,
                orderBy: customerId
            });
            pastOrder = pastOrder.filter(order => {
                let [day, month, year] = order.info[0].date.split('/').map(e => e.padStart(2,'0'));
                let cDate = new Date(`${year}-${month}-${day}T00:00:00Z`);
    
                return cDate < last3Weeks[2][0];
            });

            if (!pastOrder) {
                // console.log('.::::::::PREVWEEK', customerId);
                ++newCusCnt;
            }
        }
        newCustomerData[0] = newCusCnt;

    }
    else if (periodData === 'month') {

        // console.log(last3Months[2].start);
        // console.log(last3Months[2].end);
        let providerOrders = await Order.find({
            'info.0.provider': spid,
        }).populate('info.service');

        let currentMonthOrders = providerOrders.filter(order => {
            let [day, month, year] = order.info[0].date.split('/').map(e => e.padStart(2,'0'));
            let cDate = new Date(`${year}-${month}-${day}T00:00:00Z`);

            return cDate < last3Months[0].end && cDate > last3Months[0].start;
        });
        let currentMonthCustomers = currentMonthOrders.map(order => {
            return order.orderBy.toString();
        });
        console.log('Curr Week Customer: =====', currentMonthCustomers);
        currentMonthCustomers = currentMonthCustomers.filter((item, pos, self) => {
            return self.indexOf(item) === pos;
        });

        let newCusCnt = 0;
        let orderIdsArr = currentMonthOrders.map(o => o._id.toString());
        for (let customerId of currentMonthCustomers) {
            let pastOrder = await Order.find({
                'info.0.provider': spid,
                orderBy: customerId
            });
            pastOrder = pastOrder.filter(order => {
                let [day, month, year] = order.info[0].date.split('/').map(e => e.padStart(2,'0'));
                let cDate = new Date(`${year}-${month}-${day}T00:00:00Z`);
    
                return cDate < last3Months[0].start;
            });


            let havePastOrder = false;
            for (const o of pastOrder) {
                if (!orderIdsArr.includes(o._id.toString())) {
                    havePastOrder = true;
                    break;
                }
            }
            if (!havePastOrder) {
                // console.log('..:::::::CURRENTWEEEK', customerId);
                ++newCusCnt;
            }
        }
        newCustomerData[2] = newCusCnt;



        let lastMonthOrders = providerOrders.filter(order => {
            let [day, month, year] = order.info[0].date.split('/').map(e => e.padStart(2,'0'));
            let cDate = new Date(`${year}-${month}-${day}T00:00:00Z`);

            return cDate < last3Months[1].end && cDate > last3Months[1].start;
            // return order.orderBy;
        });

        let lastMonthCustomers = lastMonthOrders.map(order => {
            return order.orderBy.toString();
        });
        console.log('Last Week Customer: =====', lastMonthCustomers);
        lastMonthCustomers = lastMonthCustomers.filter((item, pos, self) => {
            return self.indexOf(item) === pos;
        });

        newCusCnt = 0;
        orderIdsArr = lastMonthOrders.map(o => o._id.toString());
        for (let customerId of lastMonthCustomers) {
            let pastOrder = await Order.find({
                'info.0.provider': spid,
                orderBy: customerId
            });
            pastOrder = pastOrder.filter(order => {
                let [day, month, year] = order.info[0].date.split('/').map(e => e.padStart(2,'0'));
                let cDate = new Date(`${year}-${month}-${day}T00:00:00Z`);
    
                return cDate < last3Months[1].start;
            });


            let havePastOrder = false;
            for (const o of pastOrder) {
                if (!orderIdsArr.includes(o._id.toString())) {
                    havePastOrder = true;
                    break;
                }
            }
            if (!havePastOrder) {
                // console.log('..:::::::CURRENTWEEEK', customerId);
                ++newCusCnt;
            }
        }
        newCustomerData[1] = newCusCnt;


        // newCusCnt = 0;
        // for (let customer of lastMonthCustomers) {
        //     let pastOrder = await Order.find({
        //         'info.0.provider': spid,
        //         orderBy: customer._id
        //     });

        //     if (!pastOrder) {
        //         ++newCusCnt;
        //     }
        // }
        // newCustomerData[1] = newCusCnt;


        let prevMonthOrders = providerOrders.filter(order => {
            let [day, month, year] = order.info[0].date.split('/').map(e => e.padStart(2,'0'));
            let cDate = new Date(`${year}-${month}-${day}T00:00:00Z`);
            console.log(cDate);
            console.log("-----" + JSON.stringify(last3Months[2]));

            return cDate < last3Months[2].end && cDate > last3Months[2].start;
            // return order.orderBy;
        });
        console.log("******", prevMonthOrders);
        let prevMonthCustomers = prevMonthOrders.map(order => {
            return order.orderBy.toString();
        });
        // console.log('Last Week Customer: =====', lastMonthCustomers);
        prevMonthCustomers = prevMonthCustomers.filter((item, pos, self) => {
            return self.indexOf(item) === pos;
        });

        newCusCnt = 0;
        orderIdsArr = prevMonthOrders.map(o => o._id.toString());
        for (let customerId of prevMonthCustomers) {
            let pastOrder = await Order.find({
                'info.0.provider': spid,
                orderBy: customerId
            });
            pastOrder = pastOrder.filter(order => {
                let [day, month, year] = order.info[0].date.split('/').map(e => e.padStart(2,'0'));
                let cDate = new Date(`${year}-${month}-${day}T00:00:00Z`);
    
                return cDate < last3Months[2].start;
            });

            let havePastOrder = false;
            for (const o of pastOrder) {
                if (!orderIdsArr.includes(o._id.toString())) {
                    havePastOrder = true;
                    break;
                }
            }
            if (!havePastOrder) {
                // console.log('..:::::::CURRENTWEEEK', customerId);
                ++newCusCnt;
            }
        }
        newCustomerData[0] = newCusCnt;
    }

    // console.log('----><<', newCustomerData, '------<><>', periodData);

    // let pastOrder = await Order.find({
    //     'info.0.provider': '663771db2463a33c6f3a39d2',
    //     orderBy: '6613f975bc65bac9278a7b51'
    // });

    // console.log("=======>}}}}" + JSON.stringify(pastOrder));

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
    let startOfMonth = new Date(year, month - 1, 1); // month - 1 because Date months are 0-indexed
    startOfMonth.setHours(0, 0, 0, 0); // Set to start of the day

    // End of the month (set to the last day of the specified month and year)
    let endOfMonth = new Date(year, month, 0); // 0 gets the last day of the previous month
    endOfMonth.setHours(23, 59, 59, 999); // Set to end of the day

    return {
        start: startOfMonth,
        end: endOfMonth
    };
}
let getAllOrderSpecificMonth = async (month, year, spid) => {
    let startEndThisMonth = getSpecificMonthStartEnd(month, year);
    // console.log(startEndThisMonth, ";;;;;;;;;;;;;;;;");
    let ordersByProv = await Order.find({
        // createdAt: {
        //     $gte: startEndThisMonth.start,
        //     $lte: startEndThisMonth.end,
        // },
        'info.0.provider': spid
    })
    .populate('info.service')
    .populate('info.staff')
    .populate('orderBy');

    let res = ordersByProv.filter(order => {
        let dates = order?.info[0]?.date?.split('/').map(Number);
        // console.log(month, "-------------))))", dates);
        return dates[1] === month && dates[2] === year;
    });

    return res;
}
let getCustomerDataByMonth = asyncHandler(async (req, res) => {
    let { currMonth, currYear, spid } = req.body;
    if (!currMonth || !currYear || currMonth < 0 || currMonth > 12 || !spid) {
        return res.status(400).json({
            success: false,
            error: 'Missing Input'
        });
    }


    let allOrdersThisMonth = await getAllOrderSpecificMonth(currMonth, currYear, spid);

    let allCustomersThisMonth = allOrdersThisMonth.map(order => {
        return order.orderBy;
    });
    allCustomersThisMonth = allCustomersThisMonth.filter(function(item, pos, self) {
        return self.indexOf(item) === pos;
    })

    let newCusCnt = 0;
    let orderIdsArr = allOrdersThisMonth.map(o => o._id.toString());
    for (let customer of allCustomersThisMonth) {
        let pastOrder = await Order.find({
            'info.0.provider': spid,
            orderBy: customer._id
        });
        pastOrder = pastOrder.filter(order => {
            let [day, month, year] = order.info[0].date.split('/').map(Number);

            return month < currMonth && year <= currYear;
        });


        let havePastOrder = false;
        for (const o of pastOrder) {
            if (!orderIdsArr.includes(o._id.toString())) {
                havePastOrder = true;
                break;
            }
        }
        if (!havePastOrder) {
            // console.log('..:::::::CURRENTWEEEK', customerId);
            ++newCusCnt;
        }
    }

    return res.json({
        success: true,
        newCustomers: newCusCnt,
        returningCustomers: allCustomersThisMonth.length - newCusCnt
    });
});

let getThisMonthRevenueAndOrderStatistic = asyncHandler(async (req, res) => {
    let { currMonth, currYear, spid } = req.body;
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
        if (order.status === 'Successful' && order.info[0]?.date) {
            let dates = order.info[0].date.split('/');

            console.log('==============ORDER===================');
            console.log('||||||');
            console.log(order.status);
            console.log(order.total);
            console.log('||||||');
            console.log(`============&&&&&&&&&&&&&&&&${dates}`)

            revenueMonthList[dates[0]-1] += order.total;
            ++finishedOrderCurrMonth;
        }
        else if (order.status === 'Cancelled') {
            ++canceledOrderCurrMonth;
        }
    });

    return res.json({
        success: true,
        total: allOrdersThisMonth.length,
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
    let [startHours, startMinutes] = startTime.split(':').map(Number);
    let [endHours, endMinutes] = endTime.split(':').map(Number);

    // Convert both times to total minutes
    let startTotalMinutes = startHours * 60 + startMinutes;
    let endTotalMinutes = endHours * 60 + endMinutes;

    // Calculate the difference in minutes
    return endTotalMinutes - startTotalMinutes;
}
let getOccupancy3RecentStatistic = asyncHandler(async (req, res) => {
    let { periodData,spid } = req.body;
    if (!periodData || !spid) {
        return res.status(400).json({
            success: false,
            error: 'Missing Input'
        });
    }

    let serviceProviderInfo = await ServiceProvider.findById(spid);
    let totalWorkingHoursOfProviderPerWeek = 0;
    [
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
    ].forEach(day => {
        totalWorkingHoursOfProviderPerWeek +=
            getMinutesDifference(serviceProviderInfo?.time[`start${day}`], serviceProviderInfo?.time[`end${day}`]);
    });

    let last3Weeks = get3RecentWeekRange();
    let last3Months = getLastThreeMonthsStartEnd(new Date());

    let occupancyData = [0,0,0];
    if (totalWorkingHoursOfProviderPerWeek >= 1 && periodData === 'week') {
        let providerOrders = await Order.find({
            'info.0.provider': spid,
            status: 'Successful'
        }).populate('info.service');

        let currentWeekOrders = providerOrders.filter(order => {
            let [day, month, year] = order.info[0].date.split('/').map(e => e.padStart(2,'0'));
            let cDate = new Date(`${year}-${month}-${day}T00:00:00Z`);

            return cDate < last3Weeks[0][1] && cDate > last3Weeks[0][0];
        });
        // console.log('..........', currentWeekOrders);

        let sumDurationsAllOrders = currentWeekOrders.reduce((acc, order) => {
            return acc + order?.info[0].service?.duration;
        }, 0);
        // console.log('..//////////', sumDurationsAllOrders);
        occupancyData[2] = sumDurationsAllOrders * 100 / totalWorkingHoursOfProviderPerWeek;
        console.log('..////////// totalWorkingHoursOfProviderPerWeek: ////////', totalWorkingHoursOfProviderPerWeek);


        let lastWeekOrders = providerOrders.filter(order => {
            let [day, month, year] = order.info[0].date.split('/').map(e => e.padStart(2,'0'));
            let cDate = new Date(`${year}-${month}-${day}T00:00:00Z`);

            return cDate < last3Weeks[1][1] && cDate > last3Weeks[1][0];
        });
        // console.log('..........', currentWeekOrders);

        sumDurationsAllOrders = lastWeekOrders.reduce((acc, order) => {
            return acc + order?.info[0].service?.duration;
        }, 0);
    
        // console.log('..//////////', sumDurationsAllOrders);
        occupancyData[1] = sumDurationsAllOrders * 100 / totalWorkingHoursOfProviderPerWeek;


        let prevWeekOrders = providerOrders.filter(order => {
            let [day, month, year] = order.info[0].date.split('/').map(e => e.padStart(2,'0'));
            let cDate = new Date(`${year}-${month}-${day}T00:00:00Z`);

            return cDate < last3Weeks[2][1] && cDate > last3Weeks[2][0];
        });
        sumDurationsAllOrders = prevWeekOrders.reduce((acc, order) => {
            return acc + order?.info[0].service?.duration;
        }, 0);
        // console.log('..//////////', sumDurationsAllOrders * 100 / (totalWorkingHoursOfProviderPerWeek || 1));
        occupancyData[0] = sumDurationsAllOrders * 100 / totalWorkingHoursOfProviderPerWeek;
    }
    else if (totalWorkingHoursOfProviderPerWeek >= 1 && periodData === 'month') {

        // console.log(last3Months[2].start);
        // console.log(last3Months[2].end);
        let providerOrders = await Order.find({
            'info.0.provider': spid,
            status: 'Successful'
        }).populate('info.service');

        let currentMonthOrders = providerOrders.filter(order => {
            let [day, month, year] = order.info[0].date.split('/').map(e => e.padStart(2,'0'));
            let cDate = new Date(`${year}-${month}-${day}T00:00:00Z`);

            return cDate < last3Months[0].end && cDate > last3Months[0].start;
        });
        let sumDurationsAllOrders = currentMonthOrders.reduce((acc, order) => {
            return acc + order?.info[0].service?.duration;
        }, 0);
        // console.log('..//////////', sumDurationsAllOrders);
        occupancyData[2] = sumDurationsAllOrders * 100 / (totalWorkingHoursOfProviderPerWeek * 4);
        console.log('..////////// totalWorkingHoursOfProviderPerWeek: ////////', totalWorkingHoursOfProviderPerWeek);

        // let newCusCnt = 0;
        // let orderIdsArr = currentWeekOrders.map(o => o._id.toString());
        // for (let customer of currentWeekCustomers) {
        //     let pastOrder = await Order.find({
        //         'info.0.provider': spid,
        //         orderBy: customer._id
        //     });


        //     let havePastOrder = false;
        //     for (const o of pastOrder) {
        //         if (!orderIdsArr.includes(o._id.toString())) {
        //             havePastOrder = true;
        //             break;
        //         }
        //     }
        //     if (!havePastOrder) {
        //         // console.log('..:::::::CURRENTWEEEK', customerId);
        //         ++newCusCnt;
        //     }
        // }
        // newCustomerData[2] = newCusCnt;

        let lastMonthOrders = providerOrders.filter(order => {
            let [day, month, year] = order.info[0].date.split('/').map(e => e.padStart(2,'0'));
            let cDate = new Date(`${year}-${month}-${day}T00:00:00Z`);

            return cDate < last3Months[1].end && cDate > last3Months[1].start;
        });
        sumDurationsAllOrders = lastMonthOrders.reduce((acc, order) => {
            return acc + order?.info[0].service?.duration;
        }, 0);
        // console.log('..//////////', sumDurationsAllOrders);
        occupancyData[1] = sumDurationsAllOrders * 100 / (totalWorkingHoursOfProviderPerWeek * 4);
        // newCusCnt = 0;
        // orderIdsArr = lastWeekOrders.map(o => o._id.toString());
        // for (let customer of lastWeekCustomers) {
        //     let pastOrder = await Order.find({
        //         'info.0.provider': spid,
        //         orderBy: customer._id
        //     });

        //     let havePastOrder = false;
        //     for (const o of pastOrder) {
        //         if (!orderIdsArr.includes(o._id.toString())) {
        //             havePastOrder = true;
        //             break;
        //         }
        //     }
        //     if (!havePastOrder) {
        //         // console.log('..:::::::CURRENTWEEEK', customerId);
        //         ++newCusCnt;
        //     }
        // }
        // newCustomerData[1] = newCusCnt;

        let prevMonthOrders = providerOrders.filter(order => {
            let [day, month, year] = order.info[0].date.split('/').map(e => e.padStart(2,'0'));
            let cDate = new Date(`${year}-${month}-${day}T00:00:00Z`);

            return cDate < last3Months[2].end && cDate > last3Months[2].start;
        });
        sumDurationsAllOrders = prevMonthOrders.reduce((acc, order) => {
            return acc + order?.info[0].service?.duration;
        }, 0);
        // console.log('..//////////', sumDurationsAllOrders);
        occupancyData[0] = sumDurationsAllOrders * 100 / (totalWorkingHoursOfProviderPerWeek * 4);
    }
    return res.json({
        success: true,
        occupancy: occupancyData
    });
});

let getOccupancyByDayCurrentMonth = asyncHandler(async (req, res) => {
    let { currMonth, currYear, spid } = req.body;
    if (!currMonth || !currYear || currMonth < 0 || currMonth > 12) {
        return res.status(400).json({
            success: false,
            error: 'Missing Input'
        });
    }

    let workingHourByDayMap = [];
    let serviceProviderInfo = await ServiceProvider.findById(spid);
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

    // console.log('------', allOrdersThisMonth);

    let numDaysInMonth = new Date(currYear, currMonth, 0).getDate();
    let occupancyMonthList = Array(numDaysInMonth).fill(0);
    let workingHoursList = Array(numDaysInMonth).fill(0);

    // console.log('..........OOOOOO.....', workingHourByDayMap, '..........OOOOOO.....');

    allOrdersThisMonth.forEach(order => {
        // console.log(order.info, 'order.info++++++===;[;');
        if (order.status === 'Successful' && order.info?.length > 0) {
            for (let item of order.info) {
                let [day, month, year] = item.date.split('/').map(e => e.padStart(2,'0'));
                // console.log(`***********************************${year}-${month}-${day}T00:00:00Z`);
                let cDate = new Date(`${year}-${month}-${day}T00:00:00Z`);
                console.log('CDate:  ' + cDate.toISOString());
                let itemDate = cDate.getDate();
                // let itemMonth = item.dateTime.getMonth()+1;
                let itemDayWeek = cDate.getDay();

                // console.log(';;;;;;;;;;;;;;;;', item.)
                // console.log(';', currYear)
                
                    let indexByDate = itemDate - 1;
                    // console.log(item.service, '++++++++==');
                    occupancyMonthList[indexByDate] += item.service?.duration;
                    console.log(occupancyMonthList[indexByDate])
                    // console.log('----;;;;-;;;;', item?.service);
                    workingHoursList[indexByDate] = workingHourByDayMap[itemDayWeek];

            }
        }
    });
    // console.log(occupancyMonthList);
    for (let idx in occupancyMonthList) {
        if (workingHoursList[idx] > 0) {
            occupancyMonthList[idx] = Math.ceil(occupancyMonthList[idx] * 100 / workingHoursList[idx]);
        }
        else occupancyMonthList[idx] = 0;
    }

    // console.log(occupancyMonthList, '++++++++++');
    // console.log(workingHoursList, '++++++++++');

    return res.json({
        success: true,
        occupancySeries: occupancyMonthList
    })
});

let getOccupancyByServices = asyncHandler(async (req, res) => {
    let { currMonth, currYear, spid } = req.body;
    if (!currMonth || !currYear || currMonth < 0 || currMonth > 12 || !spid) {
        return res.status(400).json({
            success: false,
            error: 'Missing Input'
        });
    }

    let allOrdersThisMonth = await getAllOrderSpecificMonth(currMonth, currYear, spid);
    allOrdersThisMonth = allOrdersThisMonth.filter(order => {   
        return order.status === 'Successful';
    });
    console.log('ALl Service In Orders: ', allOrdersThisMonth.length, currMonth, currYear);

    let allServiceInOrders = [];
    // console.log('ALl Service In Orders: ', allServiceInOrders);
    // allServiceInOrders = allServiceInOrders.filter((serv, idx, self) => {
    //     return self.indexOf()
    // })

    let orderCountByService = {};
    let revenueCountByService = {};
    let sumWorkedHourByService = {};

    allOrdersThisMonth.forEach(order => {
        if (order.info?.length > 0) {
            for (let item of order.info) {
                if (!item.service || !item.service?._id) continue;

                if (allServiceInOrders.filter(serv => serv._id === item.service?._id).length === 0) {
                    allServiceInOrders.push(item.service);
                }
                sumWorkedHourByService[item.service?._id] = (sumWorkedHourByService[item.service?._id] || 0) + item.service.duration;
                orderCountByService[item.service?._id] = (orderCountByService[item.service?._id] || 0) + 1;
                revenueCountByService[item.service?._id] = (revenueCountByService[item.service?._id] || 0) + order.total;
            }
        }
    });


    let serviceProviderInfo = await ServiceProvider.findById(spid);
    let totalWorkingHoursOfProviderPerWeek = 0;
    [
        'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
    ].forEach(day => {
        totalWorkingHoursOfProviderPerWeek +=
            getMinutesDifference(serviceProviderInfo?.time[`start${day}`], serviceProviderInfo?.time[`end${day}`]);
    });
    if (totalWorkingHoursOfProviderPerWeek < 1) {
        return res.json({
            success: true,
            performance: allServiceInOrders
        })
    }
    // console.log("---||||-->", orderCountByService);
    // console.log("---||||-->", sumWorkedHourByService);
    // console.log("---||||-->", revenueCountByService);

    // let numDaysInMonth = new Date(currYear, currMonth, 0).getDate();
    for (let idx in allServiceInOrders) {
        let serviceId = allServiceInOrders[idx]._id;

        allServiceInOrders[idx] = {
            ...(allServiceInOrders[idx].toObject()),
            numberOrders: orderCountByService[serviceId],
            revenue: revenueCountByService[serviceId],
            occupancy: sumWorkedHourByService[serviceId] * 100 / (totalWorkingHoursOfProviderPerWeek * 4)
        }
        //     ;
        // allServiceInOrders[idx].;
        // allServiceInOrders[idx].
    }

    // desc sort then take only top 3
    allServiceInOrders.sort((a,b) => {
        return (a.revenue > b.revenue) ? -1 : ((b.revenue > a.revenue) ? 1 : 0)
    });
    allServiceInOrders = allServiceInOrders.slice(0, 3);

    return res.json({
        success: true,
        performance: allServiceInOrders
    })
});

let getOccupancyByStaffs = asyncHandler(async (req, res) => {
    let { currMonth, currYear, spid } = req.body;
    if (!currMonth || !currYear || currMonth < 0 || currMonth > 12) {
        return res.status(400).json({
            success: false,
            error: 'Missing Input'
        });
    }

    let allOrdersThisMonth = await getAllOrderSpecificMonth(currMonth, currYear, spid);
    allOrdersThisMonth = allOrdersThisMonth.filter(order => {
        return order.status === 'Successful';
    });
    console.log('ALl Orders This Month: ', allOrdersThisMonth.length, currMonth, currYear);
    let allStaffInOrders = [];

    let orderCountByStaff = {};
    let revenueCountByStaff = {};
    let sumWorkedHourByStaff = {};

    allOrdersThisMonth.forEach(order => {
        if (order.info?.length > 0) {
            for (let item of order.info) {
                if (!item.staff || !item.staff?._id || !item.service) continue;

                if (allStaffInOrders.filter(staff => staff._id === item.staff?._id).length === 0) {
                    // console.log('---------JJJJJJJJ', item.staff);
                    allStaffInOrders.push(item.staff);
                }
                sumWorkedHourByStaff[item.staff?._id] = (sumWorkedHourByStaff[item.staff?._id] || 0) + item.service?.duration;
                orderCountByStaff[item.staff?._id] = (orderCountByStaff[item.staff?._id] || 0) + 1;
                revenueCountByStaff[item.staff?._id] = (revenueCountByStaff[item.staff?._id] || 0) + order.total;
            }
        }
    });
    // console.log('----:::::::', allStaffInOrders);

    // let serviceProviderInfo = await ServiceProvider.findById(spid);
    // let totalWorkingHoursOfProviderPerWeek = 0;
    // [
    //     'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
    // ].forEach(day => {
    //     totalWorkingHoursOfProviderPerWeek +=
    //         getMinutesDifference(serviceProviderInfo?.time[`start${day}`], serviceProviderInfo?.time[`end${day}`]);
    // });
    // if (totalWorkingHoursOfProviderPerWeek < 1) {
    //     return res.json({
    //         success: true,
    //         performance: allStaffInOrders
    //     });
    // }
    // console.log("----->", orderCountByService);

    // let numDaysInMonth = new Date(currYear, currMonth, 0).getDate();
    for (let idx in allStaffInOrders) {
        let staffId = allStaffInOrders[idx]._id;
        let staffShiftHour = calculateWorkingHourOfStaffWholeWeek(allStaffInOrders[idx].shifts);

        let stffOccupancy = 0;
        if (staffShiftHour >= 1) {
            stffOccupancy = sumWorkedHourByStaff[staffId] * 100 / (staffShiftHour * 4);
        }
        if (stffOccupancy > 100.0) {
            stffOccupancy = 100.0;
        }

        allStaffInOrders[idx] = {
            ...(allStaffInOrders[idx].toObject()),
            numberOrders: orderCountByStaff[staffId],
            revenue: revenueCountByStaff[staffId],
            occupancy: stffOccupancy
        }
    }

    // desc sort then take only top 3
    allStaffInOrders.sort((a,b) => {
        return (a.revenue > b.revenue) ? -1 : ((b.revenue > a.revenue) ? 1 : 0);
    });
    allStaffInOrders = allStaffInOrders.slice(0, 3);

    return res.json({
        success: true,
        performance: allStaffInOrders
    });
});

const calculateWorkingHourOfStaffWholeWeek = (staffShift) => {
    if (!staffShift) {
        return 0;
    }

    let sumWorking = 0;
    for (const value of Object.values(staffShift)) {
        if (!value?.isEnabled || !value?.periods?.start && !value?.periods?.end) {
            continue;
        }

        sumWorking += getMinutesDifference(value.periods.start, value.periods.end)
    }

    return sumWorking;
};

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