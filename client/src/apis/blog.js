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

export const apiUpdateViewBlog = (id) => axios({
    url: '/blog/update_view_blog/'+id,
    method: 'post',
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
    url: 'blog/like/',
    method: 'post',
    data
})

export const apiDislikeBlog = (data) => axios({
    url: 'blog/dislike',
    method: 'post',
    data
})

export const apiCreateNewPostTag = (data) => axios({
    url: '/blog/create_tag',
    method: 'post',
    data
})

export const apiSearchBlogByParams = (params) => axios({
    url: '/blog/',
    method: 'get',
    params
})

export const apiGetTopTags = (data) => axios({
    url: '/blog/top_tags',
    method: 'post',
    data
})

export const apiGetTopBlogsWithSelectedTags = (data) => axios({
    url: '/blog/top_blogs',
    method: 'post',
    data
})

export const apiAddBlogComment = (data) => axios({
    url: '/blog/add_comment',
    method: 'post',
    data
})