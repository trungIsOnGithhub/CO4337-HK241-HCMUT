const asyncHandler = require('express-async-handler');
const Order = require('../models/order'); 

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


module.exports = {
    getUserBookingsById
}