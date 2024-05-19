import axios from '../axios'
export const apiGetDailyRevenueByDateRange = (data) => axios({
    url: '/revenue/daily',
    method: 'post',
    data
})