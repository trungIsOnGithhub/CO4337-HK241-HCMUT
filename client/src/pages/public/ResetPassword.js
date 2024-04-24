import React, {useState} from 'react'
import { Button } from '../../components'
import { useParams } from 'react-router-dom'
import { apiResetPassword } from '../../apis/user'
import { toast } from 'react-toastify'
const ResetPassword = () => {
  const [password, setPassword] = useState('')
  const {token} = useParams()
  console.log(token)
  const handleResetPassword = async() => {
    const response = await apiResetPassword({password, token})
    if(response.success){
      toast.success(response.mes, {theme:"colored"})
    }
    else{
      toast.info(response.mes, {theme: "colored"})
    }
  }
  return (
    <div className="animate-slide-right absolute top-0 left-0 bottom-0 right-0 bg-white flex flex-col items-center py-8 z-50">
      <div className="flex flex-col gap-4">
          <label htmlFor="password">Enter a new password</label>
          <input type="text" id="password" placeholder="Type here" className="pb-2 w-[800px]  border-b outline-none placeholder:text-sm" value={password} onChange={e=>setPassword(e.target.value)}></input>
          <div className="flex items-center justify-end gap-4">
              <Button 
                  name='Submit'
                  style = 'px-4 py-2 rounded-md text-white bg-blue-500 font-semibold my-2'
                  handleOnclick={handleResetPassword}
              />
          </div>
      </div>
  </div>
  )
}

export default ResetPassword