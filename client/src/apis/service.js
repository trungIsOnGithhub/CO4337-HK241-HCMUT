import axios from '../axios'
export const apiAddService = (data) => axios({
    url: '/service/',
    method: 'post',
    data,
})

export const apiGetServiceByAdmin = (params) => axios({
    url: '/service/',
    method: 'get',
    params,
})