const asyncHandler = require('express-async-handler');
const Service = require('../models/service');
const Order = require('../models/order'); 

// const ObjectId = require('mongodb').ObjectId; 
const timeOffGap = 10;
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const getUserBookingsById = asyncHandler(async (req, res) => {
    const { _id } = req.user;

    if (!_id) {
        return res.status(400).json({ message: 'User ID is required.' });
    }

    const bookings = await Order.find({ orderBy: _id }).populate({
        path: 'info.service'
    });

    if (!bookings.length) {
        return res.status(404).json({ message: 'No bookings found for this user.' });
    }

    // Lấy ra thông tin cần thiết
    const filteredBookings = bookings.map(booking => {
        const bookingInfo = booking.info[0];
        
        if (!bookingInfo) {
            return null; // Trả về null nếu không có thông tin
        }

        const service = bookingInfo.service; // Thông tin dịch vụ
        
        // Kiểm tra service có tồn tại không
        if (!service) {
            return null; // Hoặc xử lý tùy theo yêu cầu của bạn
        }

        const [day, month, year] = bookingInfo.date.split('/'); // Tách ngày, tháng, năm
        const formattedMonth = month.padStart(2, '0'); // Đảm bảo tháng có 2 chữ số
        const formattedDate = `${year}-${formattedMonth}-${day}`; // Định dạng lại thành YYYY-MM-DD
        const start = new Date(`${formattedDate}T${bookingInfo.time}:00`); // Tạo đối tượng Date
        const localStart = new Date(start.getTime() - (start.getTimezoneOffset() * 60000)); // Chuyển đổi sang múi giờ địa phương
        const localEnd = new Date(localStart.getTime() + (bookingInfo?.service?.duration * 60000)); // Tính toán thời gian kết thúc
        const bookingId = booking?._id;

        return {
            localStart: localStart, // Thời gian bắt đầu theo múi giờ địa phương
            localEnd: localEnd,     // Thời gian kết thúc theo múi giờ địa phương
            serviceName: service.name, // Tên dịch vụ
            status: booking.status, // Trạng thái đặt chỗ
            bookingId : bookingId,
            emailsSync : booking?.emails || []
        };
    }).filter(Boolean); // Lọc bỏ các phần tử null

    return res.status(200).json({ success: true, bookings: filteredBookings });
});

function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}
function convertH2M(timeInHour){
    let timeParts = timeInHour.split(":");
    return Number(timeParts[0]) * 60 + Number(timeParts[1]);
}

const getTimeOptionsAvailableForDate = asyncHandler(async (req, res) => {
    const { now, dow, mStarted, svid } = req.body;
    console.log('=====]]]]]]]', now, dow, mStarted);
    if (!now || !dow?.length || !(typeof mStarted === 'number')) {
        return res.status(400).json({
            success: false,
            message: 'Missing input.'
        });
    }

    // console.log('-----]]]]]]]', new Date(now));
    // Bug timezone
    const startCurrentDay = (new Date(now)).setHours(0, 0, 0, 0);
    const endCurrentDay = (new Date(now)).setHours(23, 59, 59, 999);

    let service = await Service.findById(svid).populate('assigned_staff').populate('provider_id');
    let ordersInCurrentDay = await Order.find({
        'infor.0.service': svid,
        'info.0.dateTime': {
            $gte: startCurrentDay,
            $lte: endCurrentDay
        },
        status: 'Successful'
    });

    console.log('==_==____====_==', ordersInCurrentDay);

    const shiftKey = capitalizeFirstLetter(dow);
    // console.log('____1', shiftKey);

    // console.log('!!!!!!!!!!!!!!!!!!!!!!!');
    // service.assigned_staff.forEach(stf => {
    //     console.log(stf.shifts);
    // });
    // console.log('!!!!!!!!!!!!!!!!!!!!!!!');

    const staffTimes = service.assigned_staff?.map(
        stff => {
            // console.log(`P${shiftKey}P`)
            // console.log('currr sk: ' + JSON.stringify(stff.shifts));
            return {
                times: stff?.shifts?.[shiftKey],         
                id: stff?._id,
                name: '' + stff.firstName + ' ' + stff.lastName,
                isEnabled: stff?.shifts?.[shiftKey]?.isEnabled || true
            };
        }
    );
    
    const svduration = parseInt(service.duration);
    let timeOptionsByStaff = {};

    for (const stffTime of staffTimes) {
        if (!timeOptionsByStaff[stffTime.id]) {
            timeOptionsByStaff[stffTime.id] = [];
        }

        console.log('LLLLLLLL', stffTime?.times, stffTime?.isEnabled);
        if (stffTime?.isEnabled && stffTime?.times) {
            const orderSameDayThisStaff = ordersInCurrentDay.filter(order => {
                return order?.info[0]?.staff === stffTime.id;
            });

            console.log('OrderSameDay', orderSameDayThisStaff);
            // console.log('>>>>>>>>>>>>>>>>>>>>>>>>');

            const timeReservedThisStaff = orderSameDayThisStaff.map(order => {
                const mmStart = convertH2M(order.info[0].time);
                return [mmStart, mmStart + order.info[0].duration];
            })

            console.log('Tim Reserved:', timeReservedThisStaff);
            // console.log('>>>>>>>>>>>>>>>>>>>>>>>>');

            console.log('PREEEEEE' + JSON.stringify(stffTime.times));

            let startMM = convertH2M(stffTime.times?.periods.start);
            let endMM = convertH2M(stffTime.times?.periods.end);

            // console.log(stffTime.times[shiftKey].periods.start+ '=====>' + stffTime.times[shiftKey].periods.end);
            // console.log(startMM+ '----493042==>' + endMM);

            timeOptionsByStaff[stffTime.id] = [];
            while (startMM + svduration <= endMM && startMM + svduration >= mStarted) {
                let reservedCollision = false;
                timeReservedThisStaff.forEach((t) => {
                    if (startMM >= t[0] || endMM <= t[1]) {
                        reservedCollision = true;
                    }
                },);
                if (reservedCollision) {
                    continue;
                }

                timeOptionsByStaff[stffTime.id].push({
                    start: startMM,
                    end: startMM + svduration
                })
                startMM +=  svduration;
            }
        }
    }

    console.log('~~~~~~~~~~~~~~', staffTimes.map(s => s.times.periods));

    return res.status(200).json({
        success: true,
        timeOptions: timeOptionsByStaff
    });
});

// const getMfromDate(date) {

// }
const getTimeOptionsAvailableByDateRange = asyncHandler(async (req, res) => {
    const { startTs, endTs, svid, stfid } = req.body;
    // if (!startTs || !endTs || !(typeof mStarted === 'number')
    //         || !service?._id || !service?.duration) {
    //     return res.status(400).json({
    //         success: false,
    //         message: 'Missing input.'
    //     });
    // }
    const startDate = new Date(startTs);
    const endDate = new Date(endTs);

    console.log('INPUT OptsByDateRange: ', startDate.toISOString());
    console.log('INPUT OptsByDateRange: ', endDate.toISOString());

    let service = await Service.findById(svid).populate('assigned_staff').populate('provider_id');
    if (!service?.assigned_staff) {
        return res.status(400).json({
            success: false,
            message: 'Invalid input: Service has no assigned staff'
        });
    }
    let currentStaff = service?.assigned_staff?.filter(stf => {
        console.log('------>', stf._id);
        return stf._id.toString() === stfid
    });
    if (currentStaff?.length !== 1) {
        return res.status(400).json({
            success: false,
            message: 'Invalid input: Cannot find staff in service'
        });
    }

    let successfulBookings = await Order.find({
        // 'infor.0.service': svid,
        'info.0.staff': stfid,
        // 'info.0.dateTime': {
        //     $gte: startDate,
        //     $lte: endDate
        // },
        status: 'Successful'
    });
    successfulBookings = successfulBookings.filter(order => {
        const dates = order?.info[0]?.date?.split('/').map(Number);
        console.log(dates, "-----))))")
        const times = order?.info[0]?.time?.split(':').map(Number);
        const currOrderDate = new Date(dates[2], dates[1]-1, dates[0], times[0], times[1], 0, 0);

        // console.log(currOrderDate.toISOString());
        // console.log(startDate.toISOString());
        // console.log(endDate.toISOString());
        // console.log('------------------');

        return currOrderDate >= startDate && currOrderDate <= endDate;
    });

    console.log('VUIUIUIUIUIUIUIUIU', successfulBookings.map(o => o.info[0]), 'OQPIEPOIQWOPEIPQIEPOIQPE');

    
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const timeOptionsByStaffAndDay = {};
    for (let currentDate = startDate; currentDate <= endDate; currentDate.setDate(currentDate.getDate() + 1)) {
        // console.log(currentDate, '+++++++LDASDASDAD');

        const bookingDate = new Date(currentDate).toISOString().split('T')[0];
        const dayOfWeek = weekdays[currentDate.getDay()];
    
        const workSchedule = currentStaff.map(
            staff => {
                // console.log('INSIDE WS======>' + staff.lastName + '---' + JSON.stringify(staff.shifts));
                if (!staff?.shifts[dayOfWeek]?.isEnabled) {
                    return {
                        id: staff._id,
                        shifts: null
                    }
                }
                return {
                    id: staff._id,
                    shifts: staff?.shifts[dayOfWeek]
                }
            }
        );

        // console.log("====>>>>|||||", currentStaff);
        // const curtStaffShift = currentStaff[0].shifts;
        console.log('========q>>>>>>>>', workSchedule);

        for (const stfs of workSchedule) {
            // console.log('+++++++>>>', stfs);
            if (!stfs?.shifts) {
                continue;
            }
            // const workingStart = new Date(`${bookingDate}T${stfs.shifts?.periods?.start}`);
            // const workingEnd = new Date(`${bookingDate}T${stfs.shifts?.periods?.end}`);


            // if (!timeOptionsByStaffAndDay[stfs.id]) {
            //     timeOptionsByStaffAndDay[stfs.id] = {};
            // }
            if (!timeOptionsByStaffAndDay[bookingDate]) {
                timeOptionsByStaffAndDay[bookingDate] = [];
            }

            // Filter "Successful" orders only for this staff
            // const successfulBookings = successfulBookings.filter(order => {
            //     if (!order.info[0]?.date || !order.info[0]?.staff) return false;

            //     const orderAD = order.split('/');
            //     const bookAD = bookingDate.split('-');

            //     if (bookAD[0] !== orderAD[2] || bookAD[1] !== orderAD[1] || bookAD[2] !== orderAD[0]) return false

            //     return order.info[0]?.staff?._id === stfs.id && order.status === "Successful";
            // });

            let mmStart = convertH2M(stfs.shifts?.periods?.start);
            let mmEnd = convertH2M(stfs.shifts?.periods?.end);
    
            while (mmStart + service.duration <= mmEnd) {
              const mmCurrEnd = mmStart + service.duration;
            //    console.log('PREEEEEE');
            //    console.log(successfulBookings);
            //    console.log('PREEEEEE');

              // Check if the current slot overlaps with any "Successful" bookings
              const overlaps = successfulBookings.filter(order => {
                const dates = order?.info[0]?.date?.split('/').map(Number);
                const mmBookTime = convertH2M(order.info[0]?.time);
                const mmBookTimeEnd = mmBookTime + service.duration;

                // if (dates[0] === 14 && mmStart === 602) {
                //     console.log('Checkinggg: ' + (currentDate.getMonth() === dates[1]-1))
                //     console.log(dates);
                //     console.log(currentDate);
                //     console.log(mmStart + '----' + mmCurrEnd);
                //     console.log(mmBookTime + '----' + mmBookTimeEnd);
                //     console.log('=++++++_+_+');
                // }

                return currentDate.getDate() === dates[0]
                    && currentDate.getMonth() === dates[1]-1
                    && currentDate.getFullYear()  === dates[2]
                    && !(mmStart >= mmBookTimeEnd || mmCurrEnd <= mmBookTime);
              });
            
            //   if (overlaps.length > 0) {
            //     console.log('----->', overlaps);
            //   }
        //     if (overlaps) {
        //         // console.log('Checkinggg: ' + (currentDate.getMonth() === dates[1]-1))
        //         // console.log(dates);
        //         console.log(mmStart + '----' + mmCurrEnd);
        //         console.log(currentDate);
        //         console.log('=++++++_+_+' + overlaps);
        //    }

              // console.log(mmStart, mmCurrEnd, overlaps);
        
              if (overlaps.length === 0) {
                timeOptionsByStaffAndDay[bookingDate].push({
                //   date: bookingDate,
                //   startTime: currentSlotStart.toTimeString().slice(0, 5),
                //   endTime: currentSlotEnd.toTimeString().slice(0, 5)
                    start: mmStart,
                    end: mmCurrEnd
                });
              }
        
              mmStart = mmCurrEnd;
            }
        }
    }
    

    // let service = await Service.findById(svid).populate('assigned_staff').populate('provider_id');
    // const staffTimes = service.assigned_staff?.map(
    //     stff => {
    //         return {
    //             times: stff?.shifts[capitalizeFirstLetter(dow)],
    //             id: stff?._id
    //         };
    //     }
    // );
    
    // console.log('~~~~~~~~~~~~~~', staffTimes);
    
    // const svduration = parseInt(service.duration);
    // let timeOptionsByStaff = {};

    // for (const stffTime of staffTimes) {
    //     if (stffTime.isEnabled) {
    //         let startMM = convertH2M(stffTime.times.start);
    //         let endMM = convertH2M(stffTime.times.end);

    //         timeOptionsByStaff[stffTime.id] = [];
    //         while (startMM < endMM) {
    //             timeOptionsByStaff[stffTime.id].push({
    //                 start: startMM,
    //                 end: startMM + svduration
    //             })
    //             startMM +=  svduration;
    //         }
    //     }
    // }

    return res.status(200).json({
        success: true,
        timeOptions: timeOptionsByStaffAndDay
    });
});

module.exports = {
    getUserBookingsById,
    getTimeOptionsAvailableForDate,
    getTimeOptionsAvailableByDateRange
}

/* {
    "startTs": 1731494092000,
    "endTs": 1733049292000,
    "mStarted" : 280,
    "svid" : "66377b05e479e46dab038112"
}

{
    "staffId": "66377a8ce479e46dab038106",
    "newShifts": {
  "times": {
    "Tuesday": {
      "periods": {
        "start": "09:02",
        "end": "14:34"
      },
      "isEnabled": true
    },
    "Wednesday": {
      "periods": {
        "start": "09:02",
        "end": "14:34"
      },
      "isEnabled": true
    },
    "Monday": {
      "periods": {
        "start": "09:02",
        "end": "14:34"
      },
      "isEnabled": true
    },
    "Thursday": {
      "periods": {
        "start": "09:02",
        "end": "14:34"
      },
      "isEnabled": true
    },
    "Saturday": {
      "periods": {
        "start": "09:02",
        "end": "09:04"
      },
      "isEnabled": true
    },
    "Friday": {
      "periods": {
        "start": "09:02",
        "end": "19:44"
      },
      "isEnabled": true
    },
    "Sunday": {
      "periods": {
        "start": "09:02",
        "end": "19:44"
      },
      "isEnabled": true
    }
  }
}
}
*/