import React ,{useState,useCallback,useEffect, useRef} from "react";
import {Button} from '../../components'
import { apiRegister, apiLogin, apiForgotPassword, apiFinalRegister} from "../../apis/user";
import Swal from 'sweetalert2'
import {useNavigate, Link, useSearchParams} from 'react-router-dom'
import path from "../../ultils/path";
import { login } from "../../store/user/userSlice";
import bg1 from "../../assets/bg1.jpg"
import bg2 from "../../assets/bg2.jpg"
import bg3 from "../../assets/bg3.jpg"
import bg4 from "../../assets/bg4.jpg"
import bg5 from "../../assets/bg5.jpg"
import { showModal } from 'store/app/appSlice'

import { useDispatch } from 'react-redux';
import { toast} from 'react-toastify'
import { validate } from "ultils/helper";
import { HashLoader } from "react-spinners";
import { FaCamera, FaEye, FaEyeSlash, FaGoogle, FaSpinner } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { IoCheckmarkCircle } from "react-icons/io5";

const Login = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});


    const [showPassword, setShowPassword] = useState(false);
    const [loginMethod, setLoginMethod] = useState("email");

    const [payload, setPayload] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        mobile: '',
        avatar: null
    })

    const backgroundOptions = {
        bg1: bg1,
        bg2: bg2,
        bg3: bg3,
        bg4: bg4,
        bg5: bg5
      };

    const [isVerify, setIsVerify] = useState(false)
    const [invalidField, setInvalidField] = useState([])
    const [isForgotPassword, setIsForgotPassword] = useState(false)
    const [isRegister, setIsRegister] = useState(false)
    const [email, setEmail] = useState('')
    const [token, setToken] = useState('')
    const [searchParams] = useSearchParams()
    const [selectedBackground, setSelectedBackground] = useState("bg1");

    const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef([]);

    useEffect(() => {
        inputRefs.current[0]?.focus();
      }, []);


      useEffect(() => {
        // Hàm xử lý khi nhấn phím
        const handleKeyDown = (event) => {
          if (event.key === "Enter") {
            console.log('enter')
            handleSubmit(event);
          }
        };
    
        // Gắn sự kiện lắng nghe
        window.addEventListener("keydown", handleKeyDown);
    
        // Dọn dẹp sự kiện khi component bị unmount
        return () => {
          window.removeEventListener("keydown", handleKeyDown);
        };
      }, [payload, isRegister]); 

    const handleInputChangee = (index, value) => {
        if (value.length <= 1 && /^\d*$/.test(value)) {
            const newVerificationCode = [...verificationCode];
            newVerificationCode[index] = value;
            setVerificationCode(newVerificationCode);
            if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
            }
        }
    };
    const handleKeyDown = (index, e) => {
        if (e.key === "Backspace" && !verificationCode[index] && index > 0) {
          inputRefs.current[index - 1]?.focus();
        }
    };


    const handleClear = () => {
        setVerificationCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
    };


    const handleForgotPassword = async() =>{
        setIsLoading(true)
        const response = await apiForgotPassword({email})
        setIsLoading(false)
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
            mobile: '',
            avatar: null
        })
    }

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
      };

    const handleInputChange = (e) => {
        if(!isRegister){
            const { name, value } = e.target;
        setPayload({ ...payload, [name]: value });

        const newErrors = { ...errors };
        if (name === "email") {
          if (loginMethod === "email" && !validateEmail(value)) {
            newErrors.email = "Invalid email format";
          } else {
            delete newErrors.email;
          }
        }
        if (name === "password") {
        //   if (value.length < 8) {
        //     newErrors.password = "Password must be at least 8 characters long";
        //   } else {
        //     delete newErrors.password;
        //   }
        }
        setErrors(newErrors);
        }
        else{
            const { name, value } = e.target;
            setPayload({ ...payload, [name]: value });
        }
      };

      const validateForm = () => {
        const newErrors = {};
        if (!payload.avatar) newErrors.avatar = "Avatar is required";
        if (!payload.firstName.trim()) newErrors.firstName = "First name is required";
        if (!payload.lastName.trim()) newErrors.lastName = "Last name is required";
        if (!payload.email.trim()) {
          newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
          newErrors.email = "Invalid email format";
        }
        if (!payload.mobile.trim()) {
            newErrors.mobile = "Mobile number is required";
        } else if (!/^(\+84|0)\d{9}$/.test(payload.mobile)) {
            newErrors.mobile = "Invalid mobile number";
        }
        if (!payload.password) {
          newErrors.password = "Password is required";
        } else if (payload.password.length < 8) {
          newErrors.password = "Password must be at least 8 characters long";
        }
        return newErrors;
      };

    //SUBMIT
    const handleSubmit = useCallback(async(e) =>{
        console.log("Submit")
        //login
        if(!isRegister){
            console.log("login")
            console.log(payload)
            if (Object.keys(errors).length === 0 && payload.email !== "" && payload.password !== "") {
                const {firstName, lastName, mobile, ...data} = payload
                setIsLoading(true)
                const result = await apiLogin(data)
                setIsLoading(false)
                if(result?.success){ 
                    dispatch(login({
                        isLogin: true,
                        token: result.accessToken,
                        userData: result.userData
                    }))
                    searchParams.get('redirect') ? navigate(searchParams.get('redirect')) : navigate(`/${path.HOME}`)
    
                }
                else{
                    Swal.fire('Check your email or password!', result?.mes,'error')
                }
            }
        }
        //register
        else{
            e.preventDefault();
            const newErrors = validateForm();
            setErrors(newErrors);

            if (Object.keys(newErrors).length === 0) {
                setIsLoading(true);
                const formData = new FormData()
                for(let i of Object.entries(payload)){
                    formData.append(i[0],i[1])
                }

                for (let [key, value] of formData.entries()) {
                    console.log(`${key}:`, value);
                }
                const result = await apiRegister(formData)
                setIsLoading(false)
                if(result.success){
                    setIsVerify(true)
                }
                else {
                    Swal.fire('Check your email or password!', result.mes,'error')
                }
            }
        }
        
    },[payload, isRegister])

    const finalRegister = async() => {
        const res = await apiFinalRegister(verificationCode.join(""))
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
        setVerificationCode(["", "", "", "", "", ""]);
    }

    const [text, setText] = useState("");
    const [registerText, setRegisterText] = useState("")

    const fullRegisterText = "Join us and start your journey !"
    const fullText = "Login to book your beauty & wellness services !";
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentRegisterIndex, setCurrentRegisterIndex] = useState(0);

    useEffect(() => {
        if (currentIndex < fullText.length && !isRegister) {
            const timeout = setTimeout(() => {
                setText(fullText.substring(0, currentIndex + 1));
                setCurrentIndex(currentIndex + 1);
            }, 50);
            return () => clearTimeout(timeout);
        }
    }, [currentIndex, isRegister]);

    useEffect(() => {
        if (currentRegisterIndex < fullRegisterText.length && isRegister) {
            const timeout = setTimeout(() => {
                setRegisterText(fullRegisterText.substring(0, currentRegisterIndex + 1));
                setCurrentRegisterIndex(currentRegisterIndex + 1);
            }, 50);
            return () => clearTimeout(timeout);
        }
    }, [currentRegisterIndex, isRegister]);

    const [previewImage, setPreviewImage] = useState(null);

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          setPayload({ ...payload, avatar: file });
          setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleNavigateForgotPasswordPage = () => {
        navigate(`/${path.FORGOT_PASSWORD}`)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-cover bg-center relative">
            <div className="absolute top-4 right-4 z-20 flex gap-2">
                {Object.keys(backgroundOptions).map((bg) => (
                <button
                    key={bg}
                    onClick={() => setSelectedBackground(bg)}
                    className={`w-8 h-8 rounded-full border-2 ${selectedBackground === bg ? "border-white" : "border-transparent"} overflow-hidden transition-all duration-300 hover:scale-110`}
                >
                    <img
                    src={backgroundOptions[bg]}
                    alt={`Background ${bg}`}
                    className="w-full h-full object-cover"
                    />
                </button>
                ))}
            </div>
            {/* Main background */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
                style={{
                backgroundImage: `url(${backgroundOptions[selectedBackground]})`
                }}
            ></div>
            <div className="absolute inset-0 bg-black bg-opacity-50"></div>

            {
                !isRegister 
                ?
                <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 relative z-10 mx-4">
                    <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome!</h1>
                    <p className="text-gray-600">{text}</p>
                    </div>
                    <div className="relative mb-2">
                        <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-1"
                        aria-label={loginMethod === "email" ? "Email address" : "Phone number"}
                        >
                        {loginMethod === "email" ? "Email Address" : "Phone Number"}
                        </label>
                        <input
                            type={loginMethod === "email" ? "email" : "tel"}
                            id="email"
                            name="email"
                            value={payload.email}
                            onChange={handleInputChange}
                            placeholder={loginMethod === "email" ? "Enter your email" : "Enter your phone number"}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.email ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:#0a66c2 focus:border-transparent transition-all duration-300 outline-none`}
                            autoComplete={loginMethod === "email" ? "email" : "tel"}
                            aria-invalid={errors.email ? "true" : "false"}
                            aria-describedby={errors.email ? "email-error" : undefined}
                        />
                        {errors.email && (
                        <p id="email-error" className="mt-1 text-sm text-red-500" role="alert">
                            {errors.email}
                        </p>
                        )}
                    </div>

                    <div className="relative mb-2">
                    <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                    aria-label="Password"
                    >
                    Password
                    </label>
                    <div className="relative">
                    <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            name="password"
                            value={payload.password}
                            placeholder="Enter your password"
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-lg border ${errors.password ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:#0a66c2 focus:border-transparent transition-all duration-300 outline-none`}
                            autoComplete="current-password"
                            aria-invalid={errors.password ? "true" : "false"}
                            aria-describedby={errors.password ? "password-error" : undefined}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                        </button>
                        </div>
                        {errors.password && (
                        <p id="password-error" className="mt-1 text-sm text-red-500" role="alert">
                            {errors.password}
                        </p>
                        )}
                    </div>
                    <div className="flex justify-end items-center">
                        <button onClick={()=>handleNavigateForgotPasswordPage()} className="text-sm text-[#0a66c2] hover:underline transition-colors duration-200">
                            Forgot Password?
                        </button>
                    </div>
                    <div className="w-[100%] my-2">
                        <Button 
                        handleOnclick={handleSubmit}
                        style={`w-[100%] px-4 py-2 rounded-md text-white bg-[#0a66c2] font-semibold`}
                        >
                            {isRegister? 'Register' : 'Login'}
                        </Button>
                    </div>
                    <div className="mt-6">
                        <div className="mt-6 items-center flex flex-col gap-2">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{" "}
                                <button 
                                    onClick={
                                        ()=>{setIsRegister(true); 
                                        setCurrentIndex(0);
                                        setCurrentRegisterIndex(0);
                                        setErrors({});
                                        setPayload({
                                            email: '',
                                            password: '',
                                            firstName: '',
                                            lastName: '',
                                            mobile: '',
                                            avatar: null
                                    })}} 
                                    className="text-[#0a66c2] font-medium transition-colors duration-200"
                                >
                                    Sign up
                                </button>
                            </p>
                            <span onClick={()=>{navigate(`/${path.SERVICE_PROVIDER_REGISTER}`)}} className="cursor-pointer text-sm text-[#0a66c2] font-medium underline">Register for business account</span>
                        </div>

                        </div>
                </div>
                :
                <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg z-10">
                    <div className="h-[540px] px-[2px] flex flex-col gap-2 overflow-y-scroll scrollbar-none">
                        <div className="text-center">
                            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Create your account</h2>
                            <p className="mt-2 text-sm text-gray-600">{registerText}</p>
                        </div>

                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            <div className="flex justify-center mb-8">
                                <div className="relative">
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                                    {previewImage ? (
                                    <img
                                        src={previewImage}
                                        alt="Avatar preview"
                                        className="w-full h-full object-cover"
                                    />
                                    ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <FaCamera size={32} />
                                    </div>
                                    )}
                                </div>
                                <label
                                    htmlFor="avatar"
                                    className="absolute bottom-0 right-0 bg-[#0a66c2] text-white p-2 rounded-full cursor-pointer transition-colors duration-200"
                                >
                                    <FaCamera size={16} />
                                        <input
                                        type="file"
                                        id="avatar"
                                        name="avatar"
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                        className="hidden"
                                    />
                                </label>
                                </div>
                            </div>
                            {errors.avatar && (
                            <p id="email-error" className="mt-1 text-sm text-red-500 flex justify-center" role="alert">
                                {errors.avatar}
                            </p>
                            )}

                            <div className="grid grid-cols-1 gap-6">
                                <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                    First Name
                                    </label>
                                    <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={payload.firstName}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 rounded-lg border ${errors.firstName ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:#0a66c2 focus:border-transparent transition-all duration-300 outline-none`}
                                    />
                                    {errors.firstName && (
                                    <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                                    )}
                                </div>

                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                    Last Name
                                    </label>
                                    <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={payload.lastName}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 rounded-lg border ${errors.lastName ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:#0a66c2 focus:border-transparent transition-all duration-300 outline-none`}
                                    />
                                    {errors.lastName && (
                                    <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                                    )}
                                </div>
                                </div>

                                <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={payload.email}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 rounded-lg border ${errors.email ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:#0a66c2 focus:border-transparent transition-all duration-300 outline-none`}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                                )}
                                </div>

                                <div>
                                <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">
                                    Mobile Number
                                </label>
                                <input
                                    type="tel"
                                    id="mobile"
                                    name="mobile"
                                    value={payload.mobile}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 rounded-lg border ${errors.mobile ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:#0a66c2 focus:border-transparent transition-all duration-300 outline-none`}
                                />
                                {errors.mobile && (
                                    <p className="mt-1 text-sm text-red-500">{errors.mobile}</p>
                                )}
                                </div>

                                <div className="relative">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    name="password"
                                    value={payload.password}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 rounded-lg border ${errors.password ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:#0a66c2 focus:border-transparent transition-all duration-300 outline-none`}
                                    />
                                    <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                    {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                                )}
                                </div>
                            </div>

                            <div>
                                <button
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#0a66c2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
                                >
                                {isLoading ? (
                                    <span className="flex items-center">
                                    <FaSpinner className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                                    Creating account...
                                    </span>
                                ) : (
                                    "Sign up"
                                )}
                                </button>
                            </div>
                        </form>

                        <p className="mt-2 text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <button onClick={
                                    ()=>{setIsRegister(false); 
                                        setCurrentIndex(0);
                                        setCurrentRegisterIndex(0);
                                        setErrors({});
                                        setPayload({
                                            email: '',
                                            password: '',
                                            firstName: '',
                                            lastName: '',
                                            mobile: '',
                                            avatar: null
                                    })}} 
                                className="font-medium text-[#0a66c2]">
                            Sign in
                        </button>
                        </p>
                    </div>
                </div>
            }
            
            {isVerify &&
                <div className="absolute inset-0 bg-overlay z-50 flex flex-col items-center justify-center">
                    <div className="bg-white p-8 rounded-xl shadow-lg space-y-6">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900">Verification Code</h2>
                        <p className="mt-2 text-sm text-gray-600">
                        Please enter the 6-digit code sent to your device
                        </p>
                    </div>

                    <div className="mt-8 flex flex-col gap-6">
                        <div className="flex justify-between space-x-4">
                        {verificationCode.map((digit, index) => (
                            <div key={index} className="relative w-12">
                            <input
                                ref={(el) => (inputRefs.current[index] = el)}
                                type="text"
                                value={digit}
                                onChange={(e) => handleInputChangee(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className={`w-full h-12 text-[#0a66c2] text-center text-2xl border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a66c2] focus:border-transparent transition-all duration-300 outline-none`}
                                maxLength="1"
                                aria-label={`Digit ${index + 1}`}
                            />
                            </div>
                        ))}
                        </div>

                        <button
                        type="button"
                        className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0a66c2] hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300 ${verificationCode.join("").length !== 6 ? "opacity-50 cursor-not-allowed" : ""}`}
                        disabled={verificationCode.join("").length !== 6}
                        onClick={finalRegister}
                        >
                        Verify
                        </button>
                    </div>

                    <div className="text-center">
                        <button
                        type="button"
                        className="text-sm text-blue-600 hover:text-blue-500 focus:outline-none focus:underline transition-colors duration-300"
                        onClick={handleClear}
                        >
                        Clear Input
                        </button>
                    </div>
                    </div>
                </div>
            }
        </div>
    )
}

export default Login




