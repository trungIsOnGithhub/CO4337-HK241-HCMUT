import axios from '../axios'
export const apiCreateNewCoupon = (data) => axios({
    url: '/coupon/',
    method: 'post',
    data,
})

export const apiGetCouponsByServiceId = (serviceId) => axios({
    url: '/coupon/getCouponsByServiceId/'+serviceId,
    method: 'get',
})

export const apiGetCouponsByProductsId = (data) => axios({
    url: '/coupon/getCouponsByProductsId/',
    method: 'post',
    data
})

export const apiGetAllCouponsByProviderId = (providerId) => axios({
    url: '/coupon/getCouponsByProviderId/'+ providerId,
    method: 'get',
})

export const apiGetAllCouponsByAdmin = (params) => axios({
    url: '/coupon/getAllCouponsByAdmin',
    method: 'get',
    params
})

// Thêm hai hàm mới này
export const apiValidateAndUseCoupon = (data) => axios({
    url: '/coupon/validate',
    method: 'post',
    data,
})

export const apiUpdateCouponUsage = (data) => axios({
    url: '/coupon/update-usage',
    method: 'post',
    data,
})