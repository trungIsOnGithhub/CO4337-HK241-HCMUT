import axios from '../axios'
export const apiCreateBlog = (data) => axios({
    url: '/blog/',
    method: 'post',
    data,
})

export const apiGetAllBlogsByProvider = (params) => axios({
    url: '/blog/',
    method: 'get',
    params,
})

export const apiDeleteBlog = (id) => axios({
    url: '/blog/'+id,
    method: 'delete',
})

export const apiGetBlogPublic = (params) => axios({
    url: '/blog/public',
    method: 'get',
    params,
})

export const apiGetOneBlog = (id) => axios({
    url: '/blog/'+id,
    method: 'get',
})

export const apiUpdateBlog = (data, id) => axios({
    url: '/blog/'+id,
    method: 'put',
    data
})

export const apiRatingBlog = (data) => axios({
    url: '/blog/rating_blog',
    method: 'put',
    data
})