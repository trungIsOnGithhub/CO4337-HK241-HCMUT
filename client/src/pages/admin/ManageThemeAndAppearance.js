import React, { useEffect, useState } from 'react'
import bgImage from '../../assets/clouds.svg'
import lightTheme from '../../assets/theme_light.png'
import neoTheme from '../../assets/theme_neo.png'
import oceanTheme from '../../assets/theme_ocean.png'
import darkTheme from '../../assets/theme_dark.png'
import blossomTheme from '../../assets/theme_blossom.png'
import brooklynTheme from '../../assets/theme_brooklyn.png'
import everestTheme from '../../assets/theme_everest.png'
import honeycombTheme from '../../assets/theme_honeycomb.png'
import clsx from 'clsx'
import {apiGetServiceProviderById, apiUpdateServiceProviderTheme} from '../../apis'
import {useSelector} from 'react-redux'
import { Button } from 'components'
import { IoSaveOutline } from "react-icons/io5";
import { toast } from 'react-toastify'

const ManageThemeAndAppearance = () => {
  const {current} = useSelector(state => state.user)
  const [theme, setTheme] = useState("")
  const [providerTheme, setProviderTheme] = useState("")

  const fetchThemeProvider = async () => {
    const response = await apiGetServiceProviderById(current?.provider_id?._id) 
    console.log(response)
    if(response?.payload?.theme){
      setProviderTheme(response?.payload?.theme)
      setTheme(response?.payload?.theme)
    }
    else{
      setProviderTheme("light")
      setTheme("light")
    }
  }

  useEffect(() => {  
    fetchThemeProvider()
  }, [providerTheme]);

  const handleSaveTheme = async() => {
    const response = await apiUpdateServiceProviderTheme(current?.provider_id?._id, {theme})
    console.log(response)
    if(response.success) {
      toast.success(response.mes)
    }
    else{
      toast.error(response.mes)
    }
    setProviderTheme(theme)
  }
  
  return (
    <div className="w-full h-full relative">
      <div className='inset-0 absolute z-0'>
        <img src={bgImage} className='w-full h-full object-cover'/>
      </div>
      <div className="relative z-10"> {/* Thêm lớp này để đảm bảo dòng chữ không bị che mất */}
        <div className='w-full h-24 flex justify-between p-4'>
          <span className='text-[#00143c] text-3xl font-semibold'>Theme and Appearance</span>
        </div>
        <div className='w-[95%] h-fit shadow-2xl rounded-md bg-white ml-4 mb-[200px] px-6 py-4 flex flex-col gap-4'>
          <div className='w-full h-fit flex items-center'>
            <h1 className='font-medium text-[16px]' style={{color: 'rgba(128,138,158,1)'}}>THEME</h1>
          </div>
          <div className='flex flex-col w-full gap-8'>
            <div className='flex gap-4 w-[900px] justify-center'>
              <div className={clsx('w-[25%] h-fit cursor-pointer rounded-lg shadow-xl border border-[#ebeef5] hover:border-2', theme==="light" && 'border border-[#005aee]')} onClick={()=>{setTheme("light")}}>
                <img src={lightTheme} className='max-w-full h-auto object-cover rounded-t-lg'/>
                <div className={clsx('px-[16px] py-[12px] rounded-b-lg', theme === "light" ? 'bg-[#005aee] text-white':'bg-white text-[#00143c]')}>
                  <span className='w-full font-medium'>Light</span>
                </div>
              </div>
              <div className={clsx('w-[25%] h-fit cursor-pointer rounded-lg shadow-xl border border-[#ebeef5] hover:border-2', theme==="blossom" && 'border border-[#005aee]')} onClick={()=>{setTheme("blossom")}}>
                <img src={blossomTheme} className='max-w-full h-auto object-cover rounded-t-lg'/>
                <div className={clsx('px-[16px] py-[12px] rounded-b-lg', theme === "blossom" ? 'bg-[#005aee] text-white':'bg-white text-[#00143c]')}>
                  <span className='w-full font-medium'>Blossom</span>
                </div>
              </div>
              <div className={clsx('w-[25%] h-fit cursor-pointer rounded-lg shadow-xl border border-[#ebeef5] hover:border-2', theme==="everest" && 'border border-[#005aee]')} onClick={()=>{setTheme("everest")}}>
                <img src={everestTheme} className='max-w-full h-auto object-cover rounded-t-lg'/>
                <div className={clsx('px-[16px] py-[12px] rounded-b-lg', theme === "everest" ? 'bg-[#005aee] text-white':'bg-white text-[#00143c]')}>
                <span className='w-full font-medium'>Everest</span>
                </div>
              </div>
              <div className={clsx('w-[25%] h-fit cursor-pointer rounded-lg shadow-xl border border-[#ebeef5] hover:border-2', theme==="ocean" && 'border border-[#005aee]')} onClick={()=>{setTheme("ocean")}}>
                <img src={oceanTheme} className='max-w-full h-auto object-cover rounded-t-lg'/>
                <div className={clsx('px-[16px] py-[12px] rounded-b-lg', theme === "ocean" ? 'bg-[#005aee] text-white':'bg-white text-[#00143c]')}>
                <span className='w-full font-medium'>Ocean</span>
                </div>
              </div>
            </div>
            <div className='flex gap-4 w-[900px] justify-center'>
              <div className={clsx('w-[25%] h-fit cursor-pointer rounded-lg shadow-xl border border-[#ebeef5] hover:border-2', theme==="dark" && 'border border-[#005aee]')} onClick={()=>{setTheme("dark")}}>
                <img src={darkTheme} className='max-w-full h-auto object-cover rounded-t-lg'/>
                <div className={clsx('px-[16px] py-[12px] rounded-b-lg', theme === "dark" ? 'bg-[#005aee] text-white':'bg-white text-[#00143c]')}>
                <span className='w-full font-medium'>Dark</span>
                </div>
              </div>
              <div className={clsx('w-[25%] h-fit cursor-pointer rounded-lg shadow-xl border border-[#ebeef5] hover:border-2', theme==="brooklyn" && 'border border-[#005aee]')} onClick={()=>{setTheme("brooklyn")}}>
                <img src={brooklynTheme} className='max-w-full h-auto object-cover rounded-t-lg'/>
                <div className={clsx('px-[16px] py-[12px] rounded-b-lg', theme === "brooklyn" ? 'bg-[#005aee] text-white':'bg-white text-[#00143c]')}>
                <span className='w-full font-medium'>Brooklyn</span>
                </div>
              </div>
              <div className={clsx('w-[25%] h-fit cursor-pointer rounded-lg shadow-xl border border-[#ebeef5] hover:border-2', theme==="honeycomb" && 'border border-[#005aee]')} onClick={()=>{setTheme("honeycomb")}}>
                <img src={honeycombTheme} className='max-w-full h-auto object-cover rounded-t-lg'/>
                <div className={clsx('px-[16px] py-[12px] rounded-b-lg]', theme === "honeycomb" ? 'bg-[#005aee] text-white':'bg-white text-[#00143c]')}>
                <span className='w-full font-medium'>Honeycomb</span>
                </div>
              </div>
              <div className={clsx('w-[25%] h-fit cursor-pointer rounded-lg shadow-xl border border-[#ebeef5] hover:border-2', theme==="neo" && 'border border-[#005aee]')} onClick={()=>{setTheme("neo")}}>
                <img src={neoTheme} className='max-w-full h-auto object-cover rounded-t-lg'/>
                <div className={clsx('px-[16px] py-[12px] rounded-b-lg', theme === "neo" ? 'bg-[#005aee] text-white':'bg-white text-[#00143c]')}>
                <span className='w-full font-medium'>Neo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {
        providerTheme !== theme &&
        <div className='fixed bottom-4 right-1/4 z-[1000] w-[500px] h-[60px] px-[18px] py-[11px] bg-white flex justify-between items-center rounded-xl border border-[rgba(179,185,197,1)] shadow-inner'>
          <span className='text-[#00143c]'>You have unsaved changes</span>
          <Button handleOnclick={handleSaveTheme} style={'px-4 py-2 rounded-md text-white bg-[#005aee] font-semibold w-fit h-fit flex gap-1 items-center'}><IoSaveOutline size={20}/> Save Changes</Button>
        </div>
      }
    </div>
  )
}

export default ManageThemeAndAppearance