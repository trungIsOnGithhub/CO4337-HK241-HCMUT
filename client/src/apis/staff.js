import axios from '../axios'
export const apiAddStaff = (data) => axios({
    url: '/staff/',
    method: 'post',
    data,
})
export const apiGetAllStaffs = (params) => axios({
    url: '/staff/',
    method: 'get',
    params,
})
export const apiModifyStaff = (data, sid) => axios({
    url: '/staff/'+sid,
    method: 'put',
    data
})
export const apiDeleteStaff = (sid) => axios({
    url: '/staff/'+sid,
    method: 'delete',
})
export const apiGetOneStaff = (stid) => axios({
    url: '/staff/'+stid,
    method: 'get',
})
export const apiUpdateStaffWork = (data) => axios({
    url: '/staff/update_work',
    method: 'put',
    data
})
export const apiUpdateStaffShift = (data) => axios({
    url: '/staff/update_shift',
    method: 'post',
    data
})
