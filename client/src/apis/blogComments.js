import axios from '../axios'
export const apiCreateNewBlogComment = (data) => axios({
    url: '/blog/add_comments',
    method: 'post',
    data
})

export const apiReplyBlogComment = (data) => axios({
    url: '/coupon/reply_comments/',
    method: 'post',
    data
})

export const apiGetAllBlogComment = (data) => axios({
    url: '/coupon/get_comments/',
    method: 'post',
    data
})