import axios from '../axios'
export const apiCreateNewBlogComment = (data) => axios({
    url: '/blog_comment/add_comments',
    method: 'post',
    data
})

export const apiCreateReplyComment = (data) => axios({
    url: '/blog_comment/add_reply_comments',
    method: 'post',
    data
})

export const apiGetAllReplyComment = (params) => axios({
    url: '/blog_comment/get_reply_comments',
    method: 'get',
    params
})

export const apiGetAllBlogComment = (params) => axios({
    url: '/blog_comment/get_comments',
    method: 'get',
    params
})

export const apiReactComment = (data) => axios({
    url: '/blog_comment/react_comment',
    method: 'post',
    data
})