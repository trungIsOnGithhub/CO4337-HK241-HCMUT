import axios from '../axios'
export const apiAddService = (data) => axios({
    url: '/service/',
    method: 'post',
    data,
})