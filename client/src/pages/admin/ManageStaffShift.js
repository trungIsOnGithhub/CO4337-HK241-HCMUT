import { Button, InputForm, Loading, MarkdownEditor, Select } from 'components'
import React, { memo, useCallback, useEffect, useState} from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { validate, getBase64 } from 'ultils/helper'
import {apiModifyStaff} from 'apis/staff'
import { showModal } from 'store/app/appSlice'

const ManageStaffShift = ({editStaff, render, setEditStaff, setManageStaffShift}) => {
  const dispatch = useDispatch()

  const {register, formState:{errors}, reset, handleSubmit, watch} = useForm()

  const [preview, setPreview] = useState({
    avatar: null,
  })

  useEffect(() => {
    reset({
      email: editStaff?.email || '',
      mobile: editStaff?.mobile || '',
      firstName: editStaff?.firstName || '',
      lastName: editStaff?.lastName || '',
    })
    setPreview({
      avatar: editStaff?.avatar || '',
    })
  }, [editStaff])
  
  const [invalidField, setInvalidField] = useState([])
  
  const handlePreviewAvatar = async(file) => {
    const base64Avatar = await getBase64(file)
    setPreview({avatar: base64Avatar})
  }


  useEffect(() => {
    if(watch('avatar') instanceof FileList && watch('avatar').length > 0) handlePreviewAvatar(watch('avatar')[0])
  }, [watch('avatar')])

  const handleUpdateStaff = async(data) => {
    // const invalid = validate(payload, setInvalidField)
    // if(invalid === 0){
      let finalPayload = {...data}
      if(data.avatar?.length === 0){
        finalPayload.avatar = preview.avatar
      }
      else{
        finalPayload.avatar = data.avatar[0]
      }
      const formData = new FormData()

      for(let i of Object.entries(finalPayload)){
        formData.append(i[0],i[1])
      }

      for (var pair of formData.entries())
      {
      }
    
      // dispatch(showModal({isShowModal: true, modalChildren: <Loading />}))
      const response = await apiModifyStaff(formData, editStaff._id)
      // dispatch(showModal({isShowModal: false, modalChildren: null}))
      if(response.success){
        toast.success(response.mes)
        render()
        setEditStaff(null)
      }
      else{
        toast.error(response.mes)
      }
    //}
  }

  return (
    <div className='w-full'>
        <h1 className='h-[75px] flex justify-between items-center text-3xl font-bold px-4 border-b'>
          <span>Manage Staff Shifts</span>
          <span className='text-main text-lg hover:underline cursor-pointer' onClick={()=>setManageStaffShift(false)}>Cancel</span>
        </h1>
        <div className='p-4 '>
        </div>
    </div>
  )
}

    export default memo(ManageStaffShift)