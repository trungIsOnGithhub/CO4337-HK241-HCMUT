import axios from '../axios'
export const apiCreateOrder = (data) => axios({
    url: '/order',
    method: 'post',
    data
})

export const apiGetOrdersByAdmin = (params) => axios({
    url: '/order/admin',
    method: 'get',
    params
})

export const apiGetOneOrderByAdmin = (bookingid) => axios({
    url: '/order/admin/' + bookingid,
    method: 'get',
})

export const apiGetOrdersByUser = (params) => axios({
    url: '/order/',
    method: 'get',
    params
})

export const apiGetOrdersUserByAdmin = (params, userId) => axios({
    url: '/order/admin/getOrder/' + userId,
    method: 'get',
    params
})

export const apiGetOrdersForStaffCalendar = (data) => axios({
    url: '/order/admin/staff_calendar',
    method: 'post',
    data
})

export const apiUpdateEmailByBookingId = (data) => axios({
    url: '/order/update_email',
    method: 'put',
    data
})

export const apiUpdateOrderStatus = (data, oid) => axios({
    url: `/order/status/${oid}`,
    method: 'put',
    data
})
export const apiRefundOrder = (captureId) => axios({
    url: '/order/refund',
    method: 'post',
    data: { captureId } // Truyền captureId vào body
});
export const apiUpdateStatusOrder = (data) => axios({
    url: '/order/updateStatus',
    method: 'post',
    data
});
