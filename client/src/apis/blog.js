import axios from '../axios'
export const apiCreateBlog = (data) => axios({
    url: '/blog/create',
    method: 'post',
    data,
})

export const apiGetAllBlogs = (data) => axios({
    url: '/blog/',
    method: 'post',
    data,
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

export const apiGetAllPostTags = (data) => axios({
    url: '/blog/tags',
    method: 'get',
})

export const apiLikeBlog = (data) => axios({
    url: 'like/:bid',
    method: 'put',
})

export const apiDislikeBlog = (data) => axios({
    url: 'dislike/:bid',
    method: 'pur',
})