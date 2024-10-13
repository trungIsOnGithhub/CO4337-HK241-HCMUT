import axios from '../axios'
export const apiCreateNewFlashSaleEvent = (data) => axios({
    url: '/flashsale/',
    method: 'post',
    data,
})


export const apiGetAllFlashSaleEventsByProviderId = (providerId) => axios({
    url: '/flashsale/getFlashSalesByProviderId/'+ providerId,
    method: 'get',
})