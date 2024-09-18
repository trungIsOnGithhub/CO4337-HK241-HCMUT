import React, { memo,useState } from 'react'
import avatar from 'assets/avatarDefault.png'
import moment from 'moment'
import { FaRegThumbsDown, FaRegThumbsUp, FaReply } from 'react-icons/fa'
import {Button} from '../Buttons/Button'

const CommentBlog = ({image = avatar, name = 'Anonymous', updatedAt, comment, replies}) => {
    const [liked, setLiked] = useState(false);
    const [disliked, setDisliked] = useState(false);
    const [isEditReply, setIsEditReply] = useState(false);

    return (
        <div className='flex gap-4 mr-4'>
            <div className='flex-none'>
                <img src={image} alt="avatar" className='w-[30px] h-[30px] object-cover rounded-full'></img>
            </div>
            <div className='flex flex-col flex-auto'>
                <div className='flex justify-between items-center'>
                    <h3 className='font-semibold'>{name}</h3>
                    <span className='text-xs italic'>{moment(updatedAt)?.fromNow()}</span>
                </div>
                <div className='flex flex-col gap-2 pl-4 text-sm mt-4 border border-gray-300 py-2 bg-gray-100'>
                    {/* <span className='flex items-center gap-1'>
                        <span className='font-semibold'>Vote:</span>
                        <span className='flex items-center gap-1'>
                            {renderStarfromNumber(star)?.map((el,index) => (
                                <span key={index}>{el}</span>
                            ))}
                        </span>
                    </span> */}
                    <span className='flex gap-1'>
                        <span className='flex items-center gap-1'>
                            {comment} ddadsdasdasds<br></br>SDsdhasjdajdlk
                        </span>
                    </span>
                    <span className="flex justify-end pt-2 mr-5 gap-2">
                        <p className="font-semibold text-sm text-left flex">
                            <span onClick={() => {
                                setDisliked(prev => !prev);
                                setLiked(false);
                                //   triggerReaction("dislike");
                                }}
                            >
                                <FaReply/>
                            </span>
                        </p>
                        <p className="font-semibold text-sm text-left flex"><span onClick={() => {
                            setLiked(prev => !prev);
                            setDisliked(false);
                            //   triggerReaction("like");
                            }}
                        >
                            <FaRegThumbsUp  color={liked ? 'orange' : 'lightgrey'}/>
                            </span>: {0}
                        </p>
                        <p className="font-semibold text-sm text-left flex"><span onClick={() => {
                        setDisliked(prev => !prev);
                        setLiked(false);
                        //   triggerReaction("dislike");
                        }}>
                            <FaRegThumbsDown color={disliked ? 'orange' : 'lightgrey'}/>
                            </span>: {0}
                        </p>
                    </span>

                    {isEditReply &&
                    <div className='w-4/5 m-0 flex flex-col'>
                        <textarea 
                            onChange={e=>setComment(e.target.value)}
                            value = {comment}
                            className='form-textarea w-full placeholder:italic placeholder:text-sm placeholder:text-gray-500 min-h-20'
                            placeholder='Type something ...'
                        ></textarea>
                        <Button fullWidth handleOnclick={()=>{submitComment(comment)}}>Submit</Button>
                    </div>}

                    {replies?.length > 0 && <span className='font-semibold py-1 '>Replies</span> }
                    {replies?.map(function(el) {
                            return (<div className='ml-5'>
                                <CommentBlog
                                    updatedAt = {el?.updatedAt}
                                    comment = {el?.comment}
                                    name={`${el?.postedBy?.lastName} ${el?.postedBy?.firstName}`}
                                    replies={el?.replies || []}
                                />
                            </div>)
                    })}
                </div>
            </div>
        </div>
    )
}
export default memo(CommentBlog)