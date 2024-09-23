import axios from '../axios'
export const apiGetCalendarByUserId = () => axios({
    url: '/booking/',
    method: 'get',
})