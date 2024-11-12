import axios from '../axios'
export const apiGetCalendarByUserId = () => axios({
    url: '/booking/',
    method: 'get',
})
export const apiGetServiceTimeOptionAvailable = () => axios({
    url: '/booking/options',
    method: 'get',
})