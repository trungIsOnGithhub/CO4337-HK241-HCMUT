import axios from '../axios'
export const apiGetCalendarByUserId = () => axios({
    url: '/booking/',
    method: 'get',
})
export const apiGetServiceTimeOptionAvailable = (data) => axios({
    url: '/booking/options',
    method: 'post',
    data
})