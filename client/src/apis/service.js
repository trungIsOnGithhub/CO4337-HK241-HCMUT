import axios from '../axios'
export const apiAddService = (data) => axios({
    url: '/service/',
    method: 'post',
    data,
})

export const apiGetServiceByAdmin = (params) => axios({
    url: '/service/',
    method: 'get',
    params,
})

export const apiDeleteServiceByAdmin = (sid) => axios({
    url: '/service/'+sid,
    method: 'delete',
})

export const apiUpdateServiceByAdmin = (data, sid) => axios({
    url: '/service/'+sid,
    method: 'put',
    data
})

export const apiGetServicePublic = (params) => axios({
    url: '/service/public',
    method: 'get',
    params,
})

export const apiGetOneService = (sid) => axios({
    url: '/service/'+sid,
    method: 'get',
})

export const apiAddVariantService = (data, sid) => axios({
    url: '/service/variant/'+sid,
    method: 'put',
    data
})

export const apiRatingService = (data) => axios({
    url: '/service/rating_service',
    method: 'put',
    data
})

export const apiGetMostPurchasedServicesByYear = (data) => axios({
    url: '/service/most_purchased',
    method: 'post',
    data
})


export const apiGetServiceByProviderId = (prid, params) => axios({
    url: '/service/public/' + prid,
    method: 'get',
    params
})