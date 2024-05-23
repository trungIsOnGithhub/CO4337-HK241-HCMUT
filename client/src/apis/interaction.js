import axios from '../axios'
export const apiRecordInteraction = (data) => axios({
    url: '/interaction/',
    method: 'post',
    data
})
export const apiGetUserVisitByDateRange  = (data) => axios({
    url: '/interaction/user_visit',
    method: 'post',
    data
})