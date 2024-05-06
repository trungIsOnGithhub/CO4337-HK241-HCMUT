import React ,{useState,useCallback,useEffect} from "react";
import {InputField, Button, Loading, Select} from '../../components'
import { apiRegister, apiLogin, apiForgotPassword, apiFinalRegister} from "../../apis/user";
import { apiCreateServiceProvider } from "../../apis/ServiceProvider";
import Swal from 'sweetalert2'
import {useNavigate, Link, useSearchParams} from 'react-router-dom'
import path from "../../ultils/path";
import { login } from "../../store/user/userSlice";
import { tinh_thanhpho } from "tinh_thanhpho";

import { showModal } from 'store/app/appSlice'

import { useDispatch } from 'react-redux';
import { toast} from 'react-toastify'
import { validate } from "ultils/helper";
import { useRef } from "react";
import { quan_huyen } from "quan_huyen";
import { xa_phuong } from "xa_phuong";

const ServiceProviderRegister = () => {
    // const navigate = useNavigate()
    const dispatch = useDispatch()

    const daysInWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const provinces = Object.values(tinh_thanhpho);
    const [districts, setDistricts] = useState([])
    const [wards, setWards] = useState([])
    const provinceInputRef = useRef(null)
    const districtInputRef = useRef(null)
    const wardInputRef = useRef(null)

    const [payload, setPayload] = useState({
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        password: '',
        bussinessName: '',
        address: '',
        province: '',
        district: '',
        ward: '',
    })
    const [timeOpenPayload, setTimeOpenPayload] = useState({
        startmonday: '',endmonday: '',
        starttuesday: '',endtuesday: '',
        startwednesday: '',endwednesday: '',
        startthursday: '',endthursday: '',
        startfriday: '',endfriday: '',
        startsaturday: '',endsaturday: '',
        startsunday: '',endsunday: '',
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
    // useEffect(() => {
    //     axios.get()
    // }, [])
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
            address: '',
            province: '',
            district: '',
            ward: '',
        })
        setTimeOpenPayload({
            startmonday: '',endmonday: '',
            starttuesday: '',endtuesday: '',
            startwednesday: '',endwednesday: '',
            startthursday: '',endthursday: '',
            startfriday: '',endfriday: '',
            startsaturday: '',endsaturday: '',
            startsunday: '',endsunday: '',
        })
        setWards([])
        setDistricts([])
    }
    // console.log('ddads ' + '');
    //SUBMIT
    const handleSubmit = useCallback(async() =>{
        const {firstName, lastName, mobile, ...data} = payload
        // console.log('===> ', timeOpenPayload);

        payload.time = {}
        for (const day of daysInWeek) {
            const startKey = `start${day}`
            const endKey = `end${day}`
            payload.time[startKey] = timeOpenPayload[startKey]
            payload.time[endKey] = timeOpenPayload[endKey]
        }

        const invalid = validate(payload, setInvalidField)
        // const invalid = 0;
        if(invalid===0)
        {
            payload.role = 1411;
            dispatch(showModal({isShowModal: true, modalChildren:<Loading />}))
            let response = await apiRegister(payload)
            dispatch(showModal({isShowModal: false, modalChildren:null}))
            if(response.success){
                setIsVerify(true)
            }
            else{
                Swal.fire('Opps!', response.mes,'error')
                return;
            }
            response = await apiCreateServiceProvider(payload);
            if(!response.success){
                Swal.fire('Opps!', response.mes,'error')
                return;
            }
            resetPayload()
        }
        else {
            Swal.fire('Opps!', 'Invalid Input Form','error')
        }
    },[payload, timeOpenPayload, isRegister])

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
    const locationFormOnChange = (event) => {
        const newPayLoad = {
            ...payload,
        }
        if (event.target.id === 'province') {
            const province_index = parseInt(event.target.value)
            newPayLoad[event.target.id] = provinces[province_index].name
            setDistricts(Object.values(quan_huyen).filter(district => district.parent_code === provinces[province_index].code))
        }
        else if (event.target.id === 'district') {
            const district_index = parseInt(event.target.value)
            newPayLoad[event.target.id] = districts[district_index].name
            setWards(Object.values(xa_phuong).filter(ward => ward.parent_code === districts[district_index].code))
        }
        else if (event.target.id === 'ward') {
            newPayLoad[event.target.id] = wards[parseInt(event.target.value)].name
        }
        
        setPayload(newPayLoad)
        // console.log('------', newPayLoad)
        // console.log(event.target.id)
    }
    return (
        <div className="w-screen h-screen relative flex justify-center items-center flex-row">
            {isVerify &&
                <div className="absolute top-0 bottom-0 left-0 right-0 bg-overlay z-50 flex flex-row items-center justify-center"> 
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
                <div className="p-8 bg-white rounded-md min-w-[500px] flex flex-row items-center">
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

                {/* <div className="flex items-center gap-6">
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
                </div> */}

                <InputField 
                    value= {payload.adress}
                    setValue={setPayload}
                    nameKey='address'
                    type='address'
                    invalidField={invalidField}
                    setInvalidField={setInvalidField}
                    fullWidth
                />

                <form onChange={locationFormOnChange} className="flex items-center gap-2">
                    <Select
                    label = 'Province'
                    options = {provinces?.map((el, index) =>(
                        {code: index,
                        value: el.name}
                    ))}
                    register={(a,b) => {}}
                    id = 'province'
                    validate = {{
                        required: 'Need fill this field'
                    }}
                    style='flex-auto'
                    errors={{}}
                    fullWidth
                    ref={provinceInputRef}
                    />

                    <Select 
                    label = 'District'
                    options = {districts?.map((el, index) =>(
                        {code: index,
                        value: el.name}
                    ))}
                    register={(a,b) => {}}
                    id = 'district'
                    validate = {{
                        required: 'Need fill this field'
                    }}
                    style='flex-auto'
                    errors={{}}
                    fullWidth
                    />

                    <Select 
                    label = 'Ward'
                    options = {wards?.map((el, index) =>(
                        {code: index,
                        value: el.name}
                    ))}
                    register={(a,b) => {}}
                    id = 'ward'
                    validate = {{
                        required: 'Need fill this field'
                    }}
                    style='flex-auto'
                    errors={{}}
                    fullWidth
                    />
                </form>

                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 p-4 rounded mt-5" onClick={() => {setIsInTimeForm(prevState => { setIsInTimeForm(!prevState); });}}>
                    { isInTimeForm ? 'Close Time Select' : 'Open Time Select' }
                </button>
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

                { isInTimeForm &&
                <div className="bg-white w-2/3 p-10 flex flex-col items-center justify-center m-10">
                    <h5 className="text-center text-gray-600">Select Time Schedule</h5>
                    {   isInTimeForm &&
                        daysInWeek.map(day => {
                            return <div className="flex items-center gap-3">
                                <div>{ day }</div>
                                <InputField 
                                    value={timeOpenPayload[`start${day}`]}
                                    setValue={setTimeOpenPayload}
                                    nameKey={`start${day}`}
                                    invalidField={invalidField}
                                    setInvalidField={setInvalidField}
                                    type="time"
                                />
                                <InputField 
                                    value={timeOpenPayload[`end${day}`]}
                                    setValue={setTimeOpenPayload}
                                    nameKey={`end${day}`}
                                    invalidField={invalidField}
                                    setInvalidField={setInvalidField}
                                    type="time"
                                />
                            </div>
                        })
                    }

                    <Button 
                        handleOnclick={() => {setIsInTimeForm(prevState => { setIsInTimeForm(!prevState); });}}
                        fullWidth
                    >
                        Close Time Select
                    </Button>
                </div>
                }
                </div>
            </div>
        </div>
    )
}

export default ServiceProviderRegister;