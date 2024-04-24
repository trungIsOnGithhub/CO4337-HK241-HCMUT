import React ,{useState,useCallback,useEffect} from "react";
import {InputField, Button, Loading} from '../../components'
import { apiRegister, apiLogin, apiForgotPassword, apiFinalRegister} from "../../apis/user";
import Swal from 'sweetalert2'
import {useNavigate, Link, useSearchParams} from 'react-router-dom'
import path from "../../ultils/path";
import { login } from "../../store/user/userSlice";

import { showModal } from 'store/app/appSlice'

import { useDispatch } from 'react-redux';
import { toast} from 'react-toastify'
import { validate } from "ultils/helper";

const Login = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [payload, setPayload] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        mobile: ''
    })
    const [isVerify, setIsVerify] = useState(false)
    const [invalidField, setInvalidField] = useState([])
    const [isForgotPassword, setIsForgotPassword] = useState(false)
    const [isRegister, setIsRegister] = useState(false)
    const [email, setEmail] = useState('')
    const [token, setToken] = useState('')
    const [searchParams] = useSearchParams()

    const handleForgotPassword = async() =>{
        const response = await apiForgotPassword({email})
        if(response.success){
            toast.success(response.mes, {theme:"colored"})
        }
        else{
            toast.info(response.mes, {theme: "colored"})
        }
    }
    useEffect(() => {
        resetPayload()
    }, [isRegister])
    

    const resetPayload = () =>{
        setPayload({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            mobile: ''
        })
    }
    //SUBMIT
    const handleSubmit = useCallback(async() =>{
        const {firstName, lastName, mobile, ...data} = payload
        const invalid = isRegister? validate(payload, setInvalidField) : validate(data,setInvalidField)
        if(invalid===0)
        {
            if(isRegister){
                // call api to register
                dispatch(showModal({isShowModal: true, modalChildren:<Loading />}))
                const response = await apiRegister(payload)
                dispatch(showModal({isShowModal: false, modalChildren:null}))
                if(response.success){
                    setIsVerify(true)
                }
                else{
                    Swal.fire('Opps!', response.mes,'error')
                }
            }
            else{
                // call api to login
                const result = await apiLogin(data)
                if(result.success){ 
                    dispatch(login({
                        isLogin: true,
                        token: result.accessToken,
                        userData: result.userData
                    }))
                    searchParams.get('redirect') ? navigate(searchParams.get('redirect')) : navigate(`/${path.HOME}`)
    
                }
                else{
                    Swal.fire('Opps!', result.mes,'error')
                }
            }
        }
    },[payload, isRegister])

    const finalRegister = async() => {
        const res = await apiFinalRegister(token)
        if(res.success){
            Swal.fire('Congratulations!', res.mes,'success').then(() =>{
                setIsRegister(false)
                resetPayload()
            })
        }
        else{
            Swal.fire('Opps!', res.mes,'error')
        }
        setIsVerify(false)
        setToken('')
    }
    return (
        <div className="w-screen h-screen relative">
            {isVerify&&
            <div className="absolute top-0 bottom-0 left-0 right-0 bg-overlay z-50 flex flex-col items-center justify-center"> 
                <div className="bg-white w-[500px] rounded-md p-8">
                    <h4 className="">We have sent a registration code to your email. Please check your mail and enter the code:</h4>
                    <input 
                        type="text" 
                        value={token}
                        onChange={e=> setToken(e.target.value)}
                        className="p-2 rounded-md outline-none border"
                    ></input>
                    <button 
                        type="button" 
                        className="px-4 py-2 bg-blue-500 font-semibold text-white rounded-md ml-4"
                        onClick={finalRegister}>
                        Submit
                    </button>
                </div>
            </div>}
            {isForgotPassword&&
            <div className="animate-slide-right absolute top-0 left-0 bottom-0 right-0 bg-white flex flex-col items-center py-8 z-50">
                <div className="flex flex-col gap-4">
                    <label htmlFor="email">Enter your email</label>
                    <input type="text" id="email" placeholder="example@gmail.com" className="pb-2 w-[800px]  border-b outline-none placeholder:text-sm" value={email} onChange={e=>setEmail(e.target.value)}></input>
                    <div className="flex items-center justify-end gap-4">
                        <Button 
                            handleOnclick={()=> setIsForgotPassword(false)}
                        >Cancel</Button>
                        <Button 
                            style = 'px-4 py-2 rounded-md text-white bg-blue-500 font-semibold my-2'
                            handleOnclick={handleForgotPassword}
                        >Submit</Button>
                    </div>
                </div>
            </div>}
            <img src="https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA4L3Jhd3BpeGVsX29mZmljZV8zM18zZF9pbGx1c3RyYXRpb25fb2ZfYV9uZW9uX2ljb25zX3Nob3BwaW5nX2lzb19hYTQwZTZhNi0xOTk1LTRlMTUtOTJjYy03ZjJlODdlNjkyODNfMS5qcGc.jpg" alt=""
                className='w-full h-full object-cover'></img>
            <div className="absolute top-0 bottom-0 left-0 right-1/2 flex items-center justify-center">
                <div className="p-8 bg-white rounded-md min-w-[500px] flex flex-col items-center">
                <h1 className="text-[28px] font-semibold text-main mb-8">{isRegister? 'Register':'Login'}</h1>
                {isRegister && 
                <div className="flex items-center gap-2">
                    <InputField 
                    value= {payload.firstName}
                    setValue={setPayload}
                    nameKey='firstName'
                    invalidField={invalidField}
                    setInvalidField={setInvalidField}
                    />
                    <InputField 
                    value= {payload.lastName}
                    setValue={setPayload}
                    nameKey='lastName'
                    invalidField={invalidField}
                    setInvalidField={setInvalidField}
                    />
                </div>}
                <InputField 
                value= {payload.email}
                setValue={setPayload}
                nameKey='email'
                invalidField={invalidField}
                setInvalidField={setInvalidField}
                fullWidth
                />
                {isRegister&&
                <InputField 
                value= {payload.mobile}
                setValue={setPayload}
                nameKey='mobile'
                invalidField={invalidField}
                setInvalidField={setInvalidField}
                fullWidth
                />}
                <InputField 
                value= {payload.password}
                setValue={setPayload}
                nameKey='password'
                type='password'
                invalidField={invalidField}
                setInvalidField={setInvalidField}
                fullWidth
                />
                <Button 
                handleOnclick={handleSubmit}
                fullWidth
                >
                    {isRegister? 'Register' : 'Login'}
                </Button>
                <div className='flex items-center justify-between w-full text-sm'>
                    {!isRegister && <span className="text-blue-500 hover:underline cursor-pointer" onClick={()=>{setIsForgotPassword(true)}}>Forget your account?</span>}
                    {!isRegister? <span 
                    className="text-blue-500 hover:underline cursor-pointer"
                    onClick={()=>{setIsRegister(true)}}
                    >Create a new account</span>:
                    <span 
                    className="text-blue-500 hover:underline cursor-pointer w-full text-center"
                    onClick={()=>{setIsRegister(false)}}
                    >Go login</span>}
                </div>
                <Link className="text-blue-500 text-sm hover:underline cursor-pointer" to={`/${path.HOME}`}>
                    Go home ?
                </Link>
                </div>
            </div>
        </div>
    )
}

export default Login