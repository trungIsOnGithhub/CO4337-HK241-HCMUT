import axios from '../axios'
export const apiGetDailyRevenueByDateRange = (data) => axios({
    url: '/revenue/daily',
    method: 'post',
    data
})
export const apiGetRevenueStatistic = (data) => axios({
    url: '/revenue/stat',
    method: 'post',
    data
})