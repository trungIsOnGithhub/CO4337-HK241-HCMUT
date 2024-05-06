import axios from '../axios'
export const apiGetCategorieService = () => axios({
    url: '/service_category/',
    method: 'get'
})