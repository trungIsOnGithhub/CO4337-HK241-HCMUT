import React,{useEffect}from 'react'
import {useParams, useNavigate} from 'react-router-dom'
import path from '../../ultils/path'
import Swal from 'sweetalert2'
const Final_Register = () => {
  const {status} = useParams()
  const navigate = useNavigate()
  useEffect(() => {
    if(status === 'fail'){
      Swal.fire('Oops!','Failed Registration', 'error').then(() => {
        navigate(`/${path.LOGIN}`)
      });
    }
    else{
      Swal.fire('Congratulations!','Registration Successful', 'success').then(() => {
        navigate(`/${path.LOGIN}`)
      });
    }
  }, [])
  
  return (
    <div className='h-screen w-screen bg-gray-100'>
    </div>
  )
}

export default Final_Register