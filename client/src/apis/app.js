import axios from '../axios'
export const apiGetCategories = () => axios({
    url: '/service_category/',
    method: 'get'
})