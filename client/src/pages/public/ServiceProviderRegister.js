import React ,{useState,useCallback,useEffect} from "react";
import {InputField, Button, Loading} from '../../components'
import { apiRegister, apiLogin, apiForgotPassword, apiFinalRegister} from "../../apis/user";
import { createServiceProvider } from "../../apis/ServiceProvider";
import Swal from 'sweetalert2'
import {useNavigate, Link, useSearchParams} from 'react-router-dom'
import path from "../../ultils/path";
import { login } from "../../store/user/userSlice";

import { showModal } from 'store/app/appSlice'

import { useDispatch } from 'react-redux';
import { toast} from 'react-toastify'
import { validate } from "ultils/helper";

const ServiceProviderRegister = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const hehe = ['asd', 'dada'];

    const [payload, setPayload] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        password: '',
        bussinessName: '',
        province: '',
        district: '',
        ward: '',
        category: '',
        homeurl: '',
        phone: '',
        time: {
            monday: '',
            tuesday: '',
            wednesday: '',
            thursday: '',
            friday: '',
            saturday: '',
            sunday: '',
        }
    })
    const [isVerify, setIsVerify] = useState(false)
    const [invalidField, setInvalidField] = useState([])
    const [isRegister, setIsRegister] = useState(false)
    const [email, setEmail] = useState('')
    const [token, setToken] = useState('')
    const [searchParams] = useSearchParams()
    const [isInTimeForm, setIsInTimeForm] = useState(false)

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
            firstName: '',
            lastName: '',
            email: '',
            mobile: '',
            password: '',
            bussinessName: '',
            province: '',
            district: '',
            ward: '',
            category: '',
            homeurl: '',
            phone: '',
            time: {
                monday: { start: '', time: '' },
                tuesday: { start: '', time: '' },
                wednesday: { start: '', time: '' },
                thursday: { start: '', time: '' },
                friday: { start: '', time: '' },
                saturday: { start: '', time: '' },
                sunday: { start: '', time: '' },
            }
        })
    }
    console.log('ddads ' + '');
    //SUBMIT
    const handleSubmit = useCallback(async() =>{
        const {firstName, lastName, mobile, ...data} = payload
        // const invalid = isRegister? validate(payload, setInvalidField) : validate(data,setInvalidField)
        const invalid = 0;
        if(invalid===0)
        {

            dispatch(showModal({isShowModal: true, modalChildren:<Loading />}))
            const response = await apiRegister(payload)
            dispatch(showModal({isShowModal: false, modalChildren:null}))
            if(response.success){
                setIsVerify(true)
            }
            else{
                Swal.fire('Opps!', response.mes,'error')
                return;
            }
            response = await createServiceProvider(payload);
            if(!response.success){
                Swal.fire('Opps!', response.mes,'error')
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
            {isVerify &&
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
                </div>
            }

            <img src="https://images.rawpixel.com/image_800/cHJpdmF0ZS9sci9pbWFnZXMvd2Vic2l0ZS8yMDIzLTA4L3Jhd3BpeGVsX29mZmljZV8zM18zZF9pbGx1c3RyYXRpb25fb2ZfYV9uZW9uX2ljb25zX3Nob3BwaW5nX2lzb19hYTQwZTZhNi0xOTk1LTRlMTUtOTJjYy03ZjJlODdlNjkyODNfMS5qcGc.jpg" alt=""
                className='w-full h-full object-cover'></img>
            <div className="absolute top-0 bottom-0 left-1/4 flex items-center justify-center">
                <div className="p-8 bg-white rounded-md min-w-[500px] flex flex-col items-center">
                <h1 className="text-[28px] font-semibold text-main mb-8">Đăng ký Dịch vụ Kinh Doanh của Bạn</h1>


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
                </div>

                <InputField 
                    value= {payload.email}
                    setValue={setPayload}
                    nameKey='email'
                    invalidField={invalidField}
                    setInvalidField={setInvalidField}
                    fullWidth
                />

                <InputField 
                    value= {payload.password}
                    setValue={setPayload}
                    nameKey='password'
                    type='password'
                    invalidField={invalidField}
                    setInvalidField={setInvalidField}
                    fullWidth
                />

                <InputField 
                    value= {payload.mobile}
                    setValue={setPayload}
                    nameKey='mobile'
                    invalidField={invalidField}
                    setInvalidField={setInvalidField}
                    fullWidth
                />

                <InputField 
                    value={payload.bussinessName}
                    setValue={setPayload}
                    nameKey='bussinessName'
                    invalidField={invalidField}
                    setInvalidField={setInvalidField}
                    fullWidth
                />

                <div className="flex items-center gap-2">
                    <InputField 
                        value= {payload.province}
                        setValue={setPayload}
                        nameKey='province'
                        // invalidField={invalidField}
                        // setInvalidField={setInvalidField}
                    />
                    <InputField 
                        value= {payload.district}
                        setValue={setPayload}
                        nameKey='district'
                        // invalidField={invalidField}
                        // setInvalidField={setInvalidField}
                    />
                    <InputField 
                        value= {payload.ward}
                        setValue={setPayload}
                        nameKey='ward'
                        invalidField={invalidField}
                        setInvalidField={setInvalidField}
                    />
                </div>

                <div className="flex items-center gap-6">
                    <InputField 
                        value= {payload.homeurl}
                        setValue={setPayload}
                        nameKey='homeurl'
                        invalidField={invalidField}
                        setInvalidField={setInvalidField}
                    />
                    <InputField 
                        value= {payload.phone}
                        setValue={setPayload}
                        nameKey='phone'
                        invalidField={invalidField}
                        setInvalidField={setInvalidField}
                    />
                </div>
                
                {/* <button onClick={() => {setIsInTimeForm(prevState => { setIsInTimeForm(!prevState); });}}>
                    { isInTimeForm ? 'Close Time Select' : 'Open Time Select' }
                </button>
                {   isInTimeForm &&
                    Object.keys(payload.time).map(day => {
                        return <div className="flex items-center gap-3">
                            <div>{ day }</div>
                            <InputField 
                                value={payload.time[day]}
                                setValue={setPayload}
                                nameKey={'starttime'}
                                invalidField={invalidField}
                                setInvalidField={setInvalidField}
                            />
                            <InputField 
                                value={payload.time[day]}
                                setValue={setPayload}
                                nameKey={'endtime'}
                                invalidField={invalidField}
                                setInvalidField={setInvalidField}
                            />
                        </div>
                    })
                } */}

                <Button 
                    handleOnclick={handleSubmit}
                    fullWidth
                >
                    Register As Provider
                </Button>

                <Link className="text-blue-500 text-sm hover:underline cursor-pointer" to={`/${path.LOGIN}`}>
                    Go to Login Page
                </Link>
                </div>
            </div>
        </div>
    )
}

export default ServiceProviderRegister;