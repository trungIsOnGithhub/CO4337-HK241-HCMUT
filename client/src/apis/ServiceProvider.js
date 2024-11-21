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
export const apiUpdateServiceProviderTheme = (provider_id, data) => axios({
    url: `/service_provider/updatetheme/${provider_id}`,
    method: 'put',
    data
})

export const apiFinalRegisterProvider = (token) => axios({
    url: '/service_provider/final_register/'+token,
    method: 'put',
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
// export const apiGetServiceProvidersGivenQnA = () => axios({
//     url: `/service_provider/qna`,
//     method: 'get'
// })
export const apiAddServiceProvidersGivenQnA = (data) => axios({
    url: `/service_provider/qna`,
    method: 'post',
    data
})
export const apiGetProviderByOwnerId = (data) => axios({
    url: `/service_provider/owner`,
    method: 'post',
    data
})


export const apiGetProviderByAdmin = () => axios({
    url: `/service_provider/getspbyad`,
    method: 'get',
})

export const apiUpdateFooterSection = (data) => axios({
    url: `/service_provider/edit_footer`,
    method: 'post',
    data
})

export const apiSearchProviderAdvanced = (data) => axios({
    url: `/service_provider/advanced_search`,
    method: 'post',
    data
})