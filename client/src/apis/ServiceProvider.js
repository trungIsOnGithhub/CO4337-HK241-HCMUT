import axios from '../axios'
export const createServiceProvider = (data) => axios({
    url: '/service_provider/',
    method: 'post',
    data,
})