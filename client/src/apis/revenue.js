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
export const apiGet3ChartInfoByMonth = (data) => axios({
    url: '/revenue/chart_info',
    method: 'post',
    data
})
export const apiGetCustomerDataByMonth = (data) => axios({
    url: '/revenue/customer_by_month',
    method: 'post',
    data
})
export const apiGetOccupancyDataByMonth = (data) => axios({
    url: '/revenue/occupancy_by_month',
    method: 'post',
    data
})
export const apiGetPerformanceDataByService = (data) => axios({
    url: '/revenue/performance_by_service',
    method: 'post',
    data
})
export const apiGetPerformanceDataByStaff = (data) => axios({
    url: '/revenue/performance_by_staff',
    method: 'post',
    data
})