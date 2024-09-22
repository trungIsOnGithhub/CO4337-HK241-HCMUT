import React, { useState, useEffect } from 'react';
import { InputForm, Button, Loading } from 'components';
import { useForm } from 'react-hook-form';
import { validate, getBase64 } from 'ultils/helper';
import { toast } from 'react-toastify';
import { apiAddStaff } from 'apis';
import { HashLoader } from 'react-spinners';
import { getCurrent } from 'store/user/asyncAction';
import { useDispatch, useSelector } from 'react-redux';
import { FaPlus } from 'react-icons/fa';

const ManageChat = () => {
    const { current } = useSelector(state => state.user);
    const dispatch = useDispatch();
    const { register, formState: { errors }, reset, handleSubmit, watch } = useForm();
    const [preview, setPreview] = useState({ avatar: null });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        dispatch(getCurrent());
    }, []);

    const handlePreviewAvatar = async (file) => {
        const base64Avatar = await getBase64(file);
        setPreview({ avatar: base64Avatar });
    };

    useEffect(() => {
        handlePreviewAvatar(watch('avatar')[0]);
    }, [watch('avatar')]);

    const handleAddStaff = async (data) => {
        data.provider_id = current.provider_id;
        const formData = new FormData();
        for (let i of Object.entries(data)) {
            formData.append(i[0], i[1]);
        }
        if (!current?.provider_id) {
            toast.error('No Provider Specified With Current User!!');
            return;
        }
        if (data.avatar) formData.append('avatar', data.avatar[0]);
        setIsLoading(true);
        const response = await apiAddStaff(formData);
        setIsLoading(false);
        if (response.success) {
            toast.success(response.mes);
            reset();
        } else {
            toast.error(response.mes);
        }
    };

    return (
        <div className='w-full'>
            <h1 className='h-[75px] flex justify-between items-center text-3xl font-bold px-4 border-b'>
                <span>Manage Chat</span>
            </h1>
            <div className='flex justify-end'>
                <Button className="mt-2">
                    <FaPlus
                        class="inline mr-2 mb-1"
                        onClick={() => {}}
                    />Add New Given Q&A
                </Button>
            </div>
            <div className='p-4 '>
                <form onSubmit={handleSubmit(handleAddStaff)}>
                    <div className='w-full my-6 flex gap-4'>
                        <InputForm 
                            label='Given Question'
                            register={register}
                            errors={errors}
                            id='email'
                            validate={{}} 
                            style='flex-auto'
                            placeholder='Commonly Asked Question About Your Service...'
                        />
                        <InputForm 
                            label='Prompt Answer(Optional)'
                            register={register}
                            errors={errors}
                            id='mobile'
                            validate={{}} 
                            style='flex-auto'
                            placeholder='Prepared Answer For The Given Question...'
                        />
                    </div>

                    {preview.avatar && (
                        <div className='my-4'>
                            <img src={preview.avatar} alt='avatar' className='w-[200px] object-contain' />
                        </div>
                    )}
                    <div className='mt-8'>
                        <Button type='submit'>
                            Save Changes
                        </Button>
                    </div>
                </form>
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