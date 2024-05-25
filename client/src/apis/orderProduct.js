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
