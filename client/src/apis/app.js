import axios from '../axios'
export const apiGetCategories = () => axios({
    url: '/product_category/',
    method: 'get'
})