import React, { useState, useEffect } from 'react';
import { InputForm, Button, Loading } from 'components';
import { useForm } from 'react-hook-form';
import { validate, getBase64 } from 'ultils/helper';
import { toast } from 'react-toastify';
import { apiAddStaff, apiGetServiceProvidersGivenQnA, apiAddServiceProvidersGivenQnA } from 'apis';
import { HashLoader } from 'react-spinners';
import { getCurrent } from 'store/user/asyncAction';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import Swal from 'sweetalert2';

const ManageChat = () => {
    const { current } = useSelector(state => state.user);
    const dispatch = useDispatch();
    const { register, formState: { errors } } = useForm();
    const [preview, setPreview] = useState({ avatar: null });
    const [isLoading, setIsLoading] = useState(false);
    const [allQnADataInput, setAllQnADataInput] = useState(current?.provider_id?.chatGivenQuestions || []);

    const handleSubmit = async () => {
        console.log(allQnADataInput,"===========");
        if (!allQnADataInput && !current?.provider_id?._id) {
            return;
        }

        let response = await apiAddServiceProvidersGivenQnA({qna: allQnADataInput, provider_id: current?.provider_id?._id});
        if (!response.success || !response.qna) {
            Swal.fire('Error Ocurred!!', 'Cannot Add Question And Answer!!', 'error');
        }
        else {
            Swal.fire('Sucessful!!', 'Added Sucessfully!!', 'success');
        }
        console.log("...................", allQnADataInput);
    };

    // const getQnAInputData = async () => {
    //     let response = await apiGetServiceProvidersGivenQnA({provi);

    //     if (!response.success || !response.qna) {
    //         Swal.fire('Error Ocurred!!', 'Cannot Get Data of Question And Answer!!', 'error');
    //     }
    //     else {
    //         setAllQnADataInput(response.qna);
    //     }
    // }

    const handleQnAFormChange = (index, inputEvent) => {
        const newQnAData = [...allQnADataInput];
        // if (!newQnAData[index]) {
            // newQnAData[index] = {question: '', answer: ''}
        // }
        console.log(newQnAData, "+++++++++++++++++");
        newQnAData[index][inputEvent.target.name] = inputEvent.target.value;
        console.log(newQnAData, "-------------------");
        setAllQnADataInput(newQnAData);
    };

    useEffect(() => {
        dispatch(getCurrent());
        console.log(current, "current user")
    }, []);

    const handleAddNewQnA = () => {
        const newQnAData = [...allQnADataInput, {question: '', name: ''} ];
        // newQnAData[index][event.target.name] = event.target.value;
        setAllQnADataInput(newQnAData);
    };

    const handleRemoveQnA = (index) => {
        const newQnAData = [...allQnADataInput];
        newQnAData.splice(index, 1);
        console.log(allQnADataInput, "------------");
        setAllQnADataInput(newQnAData);
    };

    return (
        <div className='w-full'>
            <h1 className='h-[75px] flex justify-between items-center text-3xl font-bold px-4 border-b'>
                <span>Manage Chat</span>
            </h1>
            <div className='flex justify-end'>
                <Button 
                    className="mt-2"
                    handleOnclick={ handleAddNewQnA }
                >
                    <FaPlus
                        class="inline mr-2 mb-1"
                    />Add New Given Q&A
                </Button>
            </div>
            <div className='p-4 '>
                {/* <form onSubmit={handleSubmit} action="POST"> */}
                    {
                        allQnADataInput.map((dataInput, index) => (
                            <div className='w-full my-6 flex gap-4' key={index}>
                                <input
                                    className='flex-auto text-black pl-2 rounded-md'
                                    name='question'
                                    onChange={event => handleQnAFormChange(index, event)}
                                    value={dataInput.question}
                                    placeholder='Commonly Asked Question About Your Service...'
                                />
                                <input
                                    className='flex-auto text-black pl-2 rounded-md'
                                    name='answer'
                                    onChange={event => handleQnAFormChange(index, event)}
                                    value={dataInput.answer}
                                    placeholder='Answer To Commonly Asked Service Question...'
                                />
                                <Button className="p-0 h-3" handleOnclick={ () => {handleRemoveQnA(index)} }><FaRegTrashAlt className='p-0'/></Button>
                            </div>
                        ))
                    }

                    {/* {preview.avatar && (
                        <div className='my-4'>
                            <img src={preview.avatar} alt='avatar' className='w-[200px] object-contain' />
                        </div>
                    )} */}
                    <div className='mt-8'>
                        <Button handleOnclick={handleSubmit}>
                            Save Changes
                        </Button>
                    </div>
                {/* </form> */}
                {/* Loading spinner */}
                {isLoading && (
                  <div className='flex justify-center z-50 w-full h-full fixed top-0 left-0 items-center bg-overlay'>
                      <HashLoader className='z-50' color='#3B82F6' loading={isLoading} size={80} />
                  </div>
                )}
            </div>
        </div>
    );
}

export default ManageChat