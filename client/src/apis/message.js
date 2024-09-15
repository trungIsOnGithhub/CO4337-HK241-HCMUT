import axios from '../axios'

export const apiAddMessage = (data) => axios({
    url: '/message/addmsg/',
    method: 'post',
    data,
})

export const apigetAllMessageFromSenderToReceiver = (data) => {
    return axios({
    url: '/message/getmsg/',
    method: 'post',
    data
})}

export const apigetLastMessages = (data) => {
    return axios({
    url: '/message/getLastMessages/',
    method: 'post',
    data
})}