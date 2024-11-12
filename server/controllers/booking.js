const asyncHandler = require('express-async-handler');
const Service = require('../models/service');
const Order = require('../models/order'); 

const timeOffGap = 10;

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

    let service = await Service.findById(svid).populate('assigned_staff');
    let ordersInCurrentDay = await Order.find({
        // 'infor.0.service': svid,
        'info.0.dateTime': {
            $gte: startCurrentDay,
            $lte: endCurrentDay
        },
        status: 'Successful'
    });

    // console.log('==_==____====_==', service);

    const shiftKey = capitalizeFirstLetter(dow);
    // console.log('____1', shiftKey);

    // console.log('!!!!!!!!!!!!!!!!!!!!!!!');
    // service.assigned_staff.forEach(stf => {
    //     console.log(stf.shifts);
    // });
    // console.log('!!!!!!!!!!!!!!!!!!!!!!!');

    const staffTimes = service.assigned_staff?.map(
        stff => {
            return {
                // times: stff?.shifts[shiftKey],
                times:  {Tuesday: { periods: { start: '09:02', end: '14:34' }, isEnabled: true },
                Wednesday: { periods: { start: '09:02', end: '14:34' }, isEnabled: true },
                Monday: { periods: { start: '09:02', end: '14:34' }, isEnabled: true },
                Thursday: { periods: { start: '09:02', end: '14:34' }, isEnabled: true },
                Saturday: { periods: { start: '09:02', end: '09:04' }, isEnabled: true },
                Friday: { periods: { start: '09:02', end: '19:44' }, isEnabled: true },
                Sunday: { periods: { start: '09:02', end: '19:44' }, isEnabled: true }
              },              
                id: stff?._id,
                name: '' + stff.firstName + ' ' + stff.lastName,
                isEnabled: stff?.shifts[shiftKey]?.isEnabled || true
            };
        }
    );
    console.log('~~~~~~~~~~~~~~', staffTimes);
    
    const svduration = 45; // parseInt(service.duration);
    let timeOptionsByStaff = {};

    for (const stffTime of staffTimes) {
        if (!timeOptionsByStaff[stffTime.id]) {
            timeOptionsByStaff[stffTime.id] = [];
        }

        // console.log('LLLLLLLL', stffTime);
        if (stffTime.isEnabled) {
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

            let startMM = convertH2M(stffTime.times[shiftKey].periods.start);
            let endMM = convertH2M(stffTime.times[shiftKey].periods.end);

            // console.log(stffTime.times[shiftKey].periods.start+ '=====>' + stffTime.times[shiftKey].periods.end);
            // console.log(startMM+ '----493042==>' + endMM);

            timeOptionsByStaff[stffTime.id] = [];
            while (startMM < endMM && startMM > mStarted) {
                const reservedCollision = false;
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

    return res.status(400).json({
        success: true,
        timeOptions: timeOptionsByStaff
    });
});


function convertM2H(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}`;
}
const getTimeOptionsAvailableForWeek = asyncHandler(async (req, res) => {
    const { now, dow, mStarted, svid } = req.user;
    if (!now || !dow?.length || !mStarted) {
        return res.status(400).json({
            success: false,
            message: 'Missing input.'
        });
    }

    let service = await Service.findById(svid).populate('assigned_staff');
    const staffTimes = service.assigned_staff?.map(
        stff => {
            return {
                times: stff?.shifts[capitalizeFirstLetter(dow)],
                id: stff?._id
            };
        }
    );
    
    console.log('~~~~~~~~~~~~~~', staffTimes);
    
    const svduration = parseInt(service.duration);
    let timeOptionsByStaff = {};

    for (const stffTime of staffTimes) {
        if (stffTime.isEnabled) {
            let startMM = convertH2M(stffTime.times.start);
            let endMM = convertH2M(stffTime.times.end);

            timeOptionsByStaff[stffTime.id] = [];
            while (startMM < endMM) {
                timeOptionsByStaff[stffTime.id].push({
                    start: startMM,
                    end: startMM + svduration
                })
                startMM +=  svduration;
            }
        }
    }

    return res.status(400).json({
        success: true,
        timeOptions: timeOptionsByStaff
    });
});

module.exports = {
    getUserBookingsById,
    getTimeOptionsAvailableForDate,
    getTimeOptionsAvailableForWeek
}