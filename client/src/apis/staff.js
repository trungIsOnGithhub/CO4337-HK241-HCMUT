import axios from '../axios'
export const apiAddStaff = (data) => axios({
    url: '/staff/',
    method: 'post',
    data,
})