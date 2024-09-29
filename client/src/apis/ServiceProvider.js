import axios from '../axios'
export const apiCreateServiceProvider = (data) => axios({
    url: '/service_provider/',
    method: 'post',
    data,
})
export const apiUpdateCurrentServiceProvider = (provider_id, data) => axios({
    url: `/service_provider/${provider_id}`,
    method: 'put',
    data
})
export const apiGetServiceProviderById = (provider_id) => axios({
    url: `/service_provider/${provider_id}`,
    method: 'get'
})
export const apiGetServiceProviders = (params) => axios({
    url: `/service_provider/`,
    method: 'get',
    params
})
export const apiGetServiceProvidersGivenQnA = () => axios({
    url: `/service_provider/qna`,
    method: 'get'
})
export const apiAddServiceProvidersGivenQnA = (data) => axios({
    url: `/service_provider/qna`,
    method: 'post',
    data
})