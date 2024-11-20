import React, {useCallback, useEffect, useState} from 'react'
import { InputForm, Pagination, Variant, Button, InputFormm } from 'components'
import { useForm } from 'react-hook-form'
import {apiGetAllStaffs, apiDeleteStaff} from 'apis/staff'
// import moment from 'moment'
import { useSearchParams, createSearchParams, useNavigate, useLocation, json} from 'react-router-dom'
// import useDebounce from 'hook/useDebounce'
import UpdateStaff from './UpdateStaff'
import ManageStaffShift from './ManageStaffShift'
import icons from 'ultils/icon'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'
import { FaCalendarCheck, FaSearch } from "react-icons/fa";
import bgImage from '../../assets/clouds.svg'
// import { createSearchParams, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
// import { apiGetOrdersByAdmin } from 'apis/order';
// import moment from 'moment';
// import { FiCalendar, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
// import path from 'ultils/path';
// import withBaseComponent from 'hocs/withBaseComponent';
// import { formatPrice, formatPricee } from 'ultils/helper';
import { TfiExport } from "react-icons/tfi";
import { BsCalendar } from "react-icons/bs";
import { RxMixerVertical } from 'react-icons/rx';
import { utils, writeFile } from 'xlsx';

const ManageProduct = () => {
  const {MdModeEdit, MdDelete} = icons
  // const navigate = useNavigate()
  // const location = useLocation()
  const [params] = useSearchParams()
  const {register,formState:{errors}, handleSubmit, watch} = useForm()
  const [staffs, setStaffs] = useState(null)
  const [counts, setCounts] = useState(0)
  const [editStaff, setEditStaff] = useState(null)
  const [update, setUpdate] = useState(false)
  const [manageStaffShift, setManageStaffShift] = useState(false)
  const [currentStaffId, setCurrentStaffId] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); 

  const [showExportExcelModal, setShowExportExcelModal] = useState(false);

  const handleDeleteStaff = async(pid) => {
    Swal.fire({
      title: 'Are you sure',
      text: 'Are you sure you want to delete this staff?',
      icon: 'warning',
      showCancelButton: true
    }).then(async(rs)=>{
      if(rs.isConfirmed){
        const response = await apiDeleteStaff(pid)
        if(response.success){
          toast.success(response.mes)
        }
        else{
         toast.error(response.mes)
        }
        render()
      }
    }) 
  }

  const render = useCallback(() => { 
    setUpdate(!update)
   })

  // const handleSearchProduct = (data) => {
  // }
  // const handleInputClick = () => {
  //   // setShowCalendar(!showCalendar);
  // };
  const fetchStaff = async(params) => {
    const response = await apiGetAllStaffs({...params, limit: process.env.REACT_APP_LIMIT})
    // console.log('---------', response);
    if(response.success){ 
      setStaffs(response.staffs)
      setCounts(response.counts)
    }
  }

  const staffDataEffectHandler = () => {
    const searchParams = Object.fromEntries([...params]);

    if (searchTerm?.length > 1) {
      // searchParams['firstName'] = searchTerm;
      // searchParams['lastName'] = searchTerm;
      // searchParams['email'] = searchTerm;
      // searchParams['phone'] = searchTerm;
      searchParams['q'] = searchTerm;
    }

    // console.log('____________', searchParams);

    fetchStaff(searchParams);
  }

  const resetParam = () => {
    const searchParams = {};

    fetchStaff(searchParams);
  }
  
  useEffect(staffDataEffectHandler, [params, update])

  // useEffect(() => {
  //   if(queryDebounce) {
  //     navigate({
  //       pathname: location.pathname,
  //       search: createSearchParams({q:queryDebounce}).toString()
  //     })
  //   }
  //   else{
  //     navigate({
  //       pathname: location.pathname,
  //     })
  //   }
  // }, [queryDebounce])
  
  
  return (
    <div className="w-full h-full relative">
      <div className='inset-0 absolute z-0'>
        <img src={bgImage} className='w-full h-full object-cover'/>
      </div>
      <div className="relative z-10"> {/* Thêm lớp này để đảm bảo dòng chữ không bị che mất */}
        <div className='w-full h-20 flex justify-between p-4'>
          <span className='text-[#00143c] text-3xl font-semibold'>Manage Staff</span>
        </div>

        {editStaff && <div className='absolute inset-0 bg-zinc-900 h-[200%] z-50 flex-auto'>
          <UpdateStaff editStaff={editStaff} render={render} setEditStaff={setEditStaff}/>
        </div>}
        {manageStaffShift &&
        <div className='absolute inset-0 bg-zinc-900 h-[360%] z-50 flex-auto'>
          <ManageStaffShift staffId={currentStaffId} setManageStaffShift={setManageStaffShift}/>
        </div>} 

        <div className='w-[95%] h-[600px] shadow-2xl rounded-md bg-white ml-4 mb-[200px] px-6 py-4 flex flex-col gap-4'>
          <div className='w-full h-fit flex justify-between items-center'>
            <h1 className='text-[#00143c] font-medium text-[16px]'>{`Total Current Staffs: (${counts})`}</h1>

            <Button style={'px-4 py-2 rounded-md text-[#00143c] bg-[#fff] font-semibold w-fit h-fit flex gap-2 items-center border border-[#b3b9c5]'}
              handleOnclick={() => { setShowExportExcelModal(true); }}
            ><TfiExport className='text-lg font-bold' />Export Data</Button>
            { showExportExcelModal &&
              <DataExportSheetModal rawData={staffs}
                onClose={() => { setShowExportExcelModal(false); }}
                propsToExport={["firstName", "lastName", "phone", "email"]} /> }

          </div>
          <div className='w-full h-[48px] mx-[-6px] mt-[-6px] mb-[10px] flex'>
              <div className='h-[36px] m-[6px] flex grow'>
                <form className='flex-1' >
                  <InputFormm
                    id='q'
                    register={() => {}}
                    errors={errors}
                    fullWidth
                    placeholder= 'Search staff by name or email or phones...'
                    style={'w-full bg-[#f4f6fa] h-10 rounded-md pl-2 flex items-center'}
                    styleInput={'w-[100%] bg-[#f4f6fa] outline-none text-[#99a1b1]'}
                    onChange={event => setSearchTerm(event.target.value)}
                  >
                  </InputFormm>
                </form>
              </div>
              <div className='h-[36px] m-[6px] flex justify-start gap-4'>
                <Button
                  handleOnclick={() => { staffDataEffectHandler() }}
                  style={'w-full px-4 py-2 bg-[#dee1e6] rounded-md text-[#00143c] flex gap-1 items-center justify-center font-semibold'}>
                  <span className='text-lg'><FaSearch /></span>
                  <span>Search</span>
                </Button>
              </div>
            </div>

            <div className='text-[#99a1b1]'>
            <div className='w-full flex gap-1 border-b border-[##dee1e6] p-[8px]'>
              <span className='w-[10%] text-center'>Avatar</span>
              <span className='w-[25%] text-center'>Email Address</span>
              <span className='w-[25%] text-center'>Full Name</span>
              <span className='w-[20%] text-center'>Phone</span>
              <span className='w-[20%] text-center'>Action</span>
            </div>

            <div>
              {staffs?.map((el,index) => (
                <div key={index} className='w-full flex border-b border-[#f4f6fa] gap-1 px-[8px] py-[12px]'>
                  <span className='w-[10%] py-2 text-[#00143c] flex items-center justify-center'><img src={el.avatar} alt='thumb' className='w-12 h-12 object-cover'></img></span>
                  <span className='w-[25%] py-2 text-[#00143c] text-sm line-clamp-1 font-semibold flex items-center justify-center'>{el?.email}</span>
                  <span className='w-[25%] py-2 text-[#00143c] text-sm line-clamp-1 flex items-center justify-center'>{`${el?.firstName} ${el?.lastName}`}</span>
                  <span className='w-[20%] px-2 py-2 text-[#00143c] text-sm line-clamp-1 flex items-center justify-center'>{`${el?.mobile}`}</span>
                  <span className='w-[20%] px-2 py-2 text-[#00143c] text-sm line-clamp-1 flex items-center justify-center'>
                      <span onClick={() => setEditStaff(el)} 
                        className='inline-block hover:underline cursor-pointer text-blue-500 hover:text-orange-500 px-0.5'>
                          <MdModeEdit size={24}/>
                      </span>
                      <span onClick={() => handleDeleteStaff(el._id)} 
                      className='inline-block hover:underline cursor-pointer text-blue-500 hover:text-orange-500 px-0.5'><MdDelete size={24}/></span>
                      <span onClick={() => { setManageStaffShift(true); setCurrentStaffId(el?._id) } } 
                      className='inline-block hover:underline cursor-pointer text-blue-500 hover:text-orange-500 px-0.5 pb-0.5'>
                      <FaCalendarCheck size={"20"}/>
                    </span>
                  </span>
                  {/* <span className='w-[15%] px-2 py-2 text-[#00143c]'>Status</span>
                  <span className='w-[20%] px-4 py-2 text-[#00143c] flex items-center'>
                    <img className='w-[32px] h-[32px] rounded-full ml-[-10px] mr-[0px]' src={el?.staffDetails?.avatar}/>
                  </span> */}

                </div>
              ))}
            </div>
          </div>
          <div className='text-[#00143c] flex-1 flex items-end'>
            <Pagination totalCount={counts} />
          </div>
          </div>
        </div>
      </div>
  )
}

const DataExportSheetModal = ({ rawData, onClose, propsToExport }) => {
  const [fileType, setFileType] = useState('xlsx');
  const [sheetName, setSheetName] = useState('My Data Sheet');
  const [workbookName, setWorkbookName] = useState('My Workbook');

  const exportExcelFile = () => {
    // console.log("========>>>", rawData);
    if (!rawData) return;

    const jsonData = [];

    rawData.forEach(item => {
      // console.log(">>>>>>>>", item);
      const newObj = {};

      for (const prop of propsToExport) {
        console.log(":???????" + prop)
        if (item[prop]) {
          newObj[prop] = item[prop];
        }
      }

      jsonData.push(newObj);

      // console.log('=========||||', jsonData);
    })

    const ws = utils.json_to_sheet(jsonData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, sheetName);
    writeFile(wb, `${workbookName}.${fileType}`);
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-80 transition duration-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-500 text-center">
          Configure your Export File
        </h3>
        <div className="space-y-2 border-2 p-2 rounded-md flex justify-center flex-wrap gap-1">
          <label htmlFor='sh' className='text-gray-500 text-sm'>Sheet Name</label>
          <InputFormm
            id='sh'
            register={() => {}}
            errors={() => {}}
            fullWidth
            placeholder= 'Sheet Name...'
            defaultValue={sheetName}
            style={'w-full bg-[#f4f6fa] h-10 rounded-md pl-2 flex items-center'}
            styleInput={'w-[100%] bg-[#f4f6fa]   text-[#99a1b1]'}
            onChange={event => setSheetName(event.target.value)}
          >
          </InputFormm>

          <label htmlFor='wb' className='text-gray-500 text-sm'>Workbook Name</label>
          <InputFormm
            id='wb'
            register={() => {}}
            errors={() => {}}
            fullWidth
            placeholder= 'Workbook Name...'
            defaultValue={workbookName}
            style={'w-full bg-[#f4f6fa] h-10 rounded-md pl-2 flex items-center'}
            styleInput={'w-[100%] bg-[#f4f6fa] text-[#99a1b1]'}
            onChange={event => setWorkbookName(event.target.value)}
          >
          </InputFormm>

          <label htmlFor='wb' className='text-gray-500 text-sm'>File Type</label>
          <select className='w-full bg-[#f4f6fa] h-10 rounded-md pl-2 flex items-center text-gray-500'
            onChange={event => setFileType(event.target.value)}
          >
            <option value="xlsx">xlsx</option>
            <option value="csv">csv</option>
          </select>
        </div>
        <div className="mt-4 flex justify-end space-x-2 gap-4">
          <button onClick={onClose} className="text-gray-500 hover:opacity-50 bg-red-500 p-2 rounded-md text-white">Cancel</button>
          <button
            onClick={() => { exportExcelFile(); onClose(); }}
            className='text-blue-600 hover:opacity-50 bg-blue-600 p-2 rounded-md text-white'
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageProduct