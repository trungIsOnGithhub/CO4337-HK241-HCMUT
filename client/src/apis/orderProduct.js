import axios from '../axios'
export const apiCreateOrder = (data) => axios({
    url: '/order_product',
    method: 'post',
    data
})

export const apiGetOrdersProductByAdmin = (params) => axios({
    url: '/order_product',
    method: 'get',
    params
})

export const apiGetUserOrderProduct = (params) => axios({
    url: '/order_product/user/',
    method: 'get',
    params
})

export const apiGetUserOrderProductByUserId = (params, userId) => axios({
    url: '/order_product/getOrderProduct/' + userId,
    method: 'get',
    params
})

export const apiGetOneOrderProduct = (oid) => axios({
    url: '/order_product/' + oid,
    method: 'get',
})

export const apiUpdateShippingStatusOrderProduct = (data) => axios({
    url: '/order_product/updateShippingStatus',
    method: 'post',
    data
});

export const apiUpdatePaymentStatusOrderProduct = (data) => axios({
    url: '/order_product/updatePaymentStatus',
    method: 'post',
    data
});