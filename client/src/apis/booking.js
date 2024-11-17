import axios from '../axios'
export const apiGetCalendarByUserId = () => axios({
    url: '/booking/',
    method: 'get',
})
export const apiGetServiceTimeOptionAvailableCurrentDay = (data) => axios({
    url: '/booking/options',
    method: 'post',
    data
})
export const apiGetServiceTimeOptionAvailableByDateRange = (data) => axios({
    url: '/booking/options_by_range',
    method: 'post',
    data
})