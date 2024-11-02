import axios from '../axios'
export const apiGetDailyRevenueByDateRange = (data) => axios({
    url: '/revenue/daily',
    method: 'post',
    data
})
// export const apiGetRevenueStatistic = (data) => axios({
//     url: '/revenue/stat',
//     method: 'post',
//     data
// })
export const apiGet3RecentRevenueStatistic = (data) => axios({
    url: '/revenue/recent',
    method: 'post',
    data
})
export const apiGet3RecentNewCustomerStatistic = (data) => axios({
    url: '/revenue/recent_new_customer',
    method: 'post',
    data
})
export const apiGet3RecentOccupancyStatistic = (data) => axios({
    url: '/revenue/recent_occupancy',
    method: 'post',
    data
})