import axios from '../axios'
export const apiRegister = (data) => axios({
    url: '/user/register',
    method: 'post',
    data,
})
export const apiFinalRegister = (token) => axios({
    url: '/user/final_register/'+token,
    method: 'put',
})
export const apiLogin = (data) => axios({
    url: '/user/login',
    method: 'post',
    data
})
export const apiForgotPassword = (data) => axios({
    url: '/user/forgotpassword',
    method: 'post',
    data
})
export const apiResetPassword = (data) => axios({
    url: '/user/reset_password',
    method: 'put',
    data
})
export const apiGetCurrent = () => axios({
    url: '/user/current',
    method: 'get'
})

export const apiUsers = (params) => axios({
    url: '/user/',
    method: 'get',
    params
})

export const apiModifyUser = (data, uid) => axios({
    url: '/user/'+uid,
    method: 'put',
    data
})

export const apiDeleteUser = (uid) => axios({
    url: '/user/'+uid,
    method: 'delete'
})

export const apiUpdateCurrent = (data) => axios({
    url: '/user/current',
    method: 'put',
    data
})

export const apiUpdateCart = (data) => axios({
    url: '/user/cart',
    method: 'put',
    data
})

export const apiRemoveCart = (pid, color) => axios({
    url: `/user/remove-cart/${pid}/${color}`,
    method: 'delete',
})

export const apiUpdateWishlist = ({pid}) => axios({
    url: `/user/wishlist/${pid}`,
    method: 'put',
})

