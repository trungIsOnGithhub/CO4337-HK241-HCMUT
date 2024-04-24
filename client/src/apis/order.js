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

export const apiGetOrdersByUser = (params) => axios({
    url: '/order/',
    method: 'get',
    params
})