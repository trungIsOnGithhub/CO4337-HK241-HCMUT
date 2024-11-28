import React, { useState } from "react";
import { apiAddServiceProvidersGivenQnA } from 'apis';
import { FiEdit2, FiTrash2, FiPlus, FiX, FiCheck, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import bgImage from '../../assets/clouds.svg';
import {useDispatch, useSelector} from 'react-redux';
import Swal from "sweetalert2";
import { getCurrent } from 'store/user/asyncAction'

const ManageChat = () => {
  const dispatch = useDispatch()
  const { current } = useSelector(state => state.user);
  const [qaItems, setQaItems] = useState(
    current?.provider_id?.chatGivenQuestions.map(
        (ele, idx) => {
            return {
                ...ele,
                id: idx+1
            };
        }
    )
    || []);

  const [allQnADataInput, setAllQnADataInput] = useState();

  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({ question: "", answer: "" });
  const [expandedId, setExpandedId] = useState(null);

  // useEffect(() => {

  // }, [qaItems])

  const validateForm = () => {
    const newErrors = {};
    if (!newQuestion.trim()) {
      newErrors.question = "Question is required";
    } else if (newQuestion.length > 200) {
      newErrors.question = "Question must be less than 200 characters";
    }

    if (!newAnswer.trim()) {
      newErrors.answer = "Answer is required";
    } else if (newAnswer.length > 1000) {
      newErrors.answer = "Answer must be less than 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      let newQna = qaItems;
      if (editingId) {
        newQna = qaItems.map(item =>
          item.id === editingId ? { ...item, question: newQuestion, answer: newAnswer } : item
        );
      } else {
        newQna = [...qaItems, { id: Date.now(), question: newQuestion, answer: newAnswer }];
      }

      newQna.forEach(q => {
        delete q._id;
        delete q.id
      })
      // console.log(newQna)

    let resp = await apiAddServiceProvidersGivenQnA({
        provider_id: current.provider_id._id,
        qna: newQna
    });

      if (resp.success && resp.qna) {
        console.log('--===============  >' + JSON.stringify(resp?.qna?.chatGivenQuestions));
        setQaItems(resp?.qna?.chatGivenQuestions.map(
          (ele, idx) => {
              return {
                  ...ele,
                  id: idx+1
              };
          }
      )
      || []);
        dispatch(getCurrent())
        if (editingId) {
            toast.success("Q&A pair updated successfully!");
        }
        else {
            toast.success("New Q&A pair added successfully!");
        }
      }
      else {
          toast.success("Error ocurred!!");
      }
      
      setNewQuestion("");
      setNewAnswer("");
      setEditingId(null);
    }
  };

  const handleEdit = (item) => {
    console.log('=====', item);
    setNewQuestion(item.question);
    setNewAnswer(item.answer);
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    const rs = await Swal.fire({
        name: "Confirm delete",
        text: 'Do you want to delete this ',
        icon: 'warning',
        showConfirmButton: true,
        showCancelButton: true,
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Not now',                
      })

    if(rs.isConfirmed){
        let newQna = qaItems.filter(item => item.id !== id);

        newQna.forEach(q => {
          delete q._id;
          delete q.id
        });

        // console.log("------------------->>>>>>>", qaItems);
        // console.log("3412424231>>>>>>>", newQna);
        // let resp;
          let resp = await apiAddServiceProvidersGivenQnA({
              provider_id: current.provider_id._id,
              qna: newQna
          });
      
          if (resp.success && resp.qna) {
            // console.log('--           >' + JSON.stringify(resp?.qna?.chatGivenQuestions));
              setQaItems(resp.qna?.chatGivenQuestions.map(
                (ele, idx) => {
                    return {
                        ...ele,
                        id: idx+1
                    };
                }
            )
            || []);
              dispatch(getCurrent());
              toast.success("Q&A pair deleted successfully!");
          }
          else {
              toast.success("Error ocurred!!");
          }
    }

  };

  return (
    <div className="min-h-screen md:p-8">
        <div className='inset-0 absolute z-0'>
            <img src={bgImage} className='w-full h-full object-cover'/>
        </div>
        <div className="relative z-10"> 
            <ToastContainer position="top-right" autoClose={3000} />
            <div className='w-full h-20 flex justify-between'>
                <span className='text-[#00143c] text-3xl font-semibold'>Manage Chat</span>
            </div>
            
            <div className="max-w-6xl mx-auto space-y-8">
                {/* <h1 className="text-4xl font-bold text-[#0a66c2] text-center mb-8 transition-all hover:scale-105">Q&A Admin Interface</h1> */}

                {/* Form Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 [&>*]:text-gray-500">
                <h2 className="text-2xl font-semibold mb-6 text-gray-700">{editingId ? "Edit Q&A Pair" : "Add New Q&A Pair"}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                    <label htmlFor="question" className="block font-medium text-gray-700">Question</label>
                    <input
                        type="text"
                        id="question"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        className={`mt-1 block w-full rounded-md border shadow-sm p-1 ${errors.question ? "border-red-500" : "border-gray-300"} transition-all`}
                        placeholder="Enter your question"
                        aria-label="Question input"
                    />
                    {errors.question && <p className="mt-1 text-sm text-red-500">{errors.question}</p>}
                    </div>

                    <div>
                    <label htmlFor="answer" className="block text-sm font-medium text-gray-700">Answer</label>
                    <textarea
                        id="answer"
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                        className={`mt-1 p-1 block w-full rounded-md border shadow-sm focus:border-[#0a66c2] ${errors.answer ? "border-red-500" : "border-gray-300"} transition-all`}
                        rows="4"
                        placeholder="Enter your answer"
                        aria-label="Answer input"
                    />
                    {errors.answer && <p className="mt-1 text-sm text-red-500">{errors.answer}</p>}
                    </div>

                    <button
                    type="submit"
                    className="inline-flex items-center p-2 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#0a66c2] hover:bg-[#0a66c2]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0a66c2] transition-all transform hover:scale-105"
                    aria-label={editingId ? "Update Q&A pair" : "Add new Q&A pair"}
                    >
                    {editingId ? <FiCheck className="mr-2" /> : <FiPlus className="mr-2" />}
                    {editingId ? "Update" : "Add"}
                    </button>
                </form>
                </div>

                {/* Existing Q&A Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#0a66c2]/20">
                <h2 className="text-2xl font-semibold mb-6 text-gray-700">Existing Q&A Pairs</h2>
                <div className="space-y-4">
                    {qaItems.map((item) => (
                    <div key={item.id} className="border-2 border-gray-100 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                        <h3 className="text-lg font-medium text-gray-800">{item.question}</h3>
                        <div className="flex space-x-2">
                            <button
                            onClick={() => {window.scrollTo(0,0); handleEdit(item);}}
                            className="p-2 text-gray-600 hover:text-[#0a66c2] transition-colors rounded-full"
                            aria-label="Edit Q&A pair"
                            >
                            <FiEdit2 />
                            </button>
                            <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-gray-600 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                            aria-label="Delete Q&A pair"
                            >
                            <FiTrash2 />
                            </button>
                        </div>
                        </div>
                        <p className="mt-2 text-gray-600">{item.answer}</p>
                    </div>
                    ))}
                </div>
                </div>

                {/* Preview Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-[#0a66c2]/20 hover:border-[#0a66c2]/40 transition-all">
                <h2 className="text-2xl font-semibold mb-6 text-gray-700">User Preview</h2>
                <div className="space-y-4">
                    {qaItems.map((item) => (
                    <div key={item.id} className="border-2 border-gray-100 rounded-lg hover:border-[#0a66c2]/20 transition-all">
                        <button
                        onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                        className="w-full flex justify-between items-center text-left p-4 hover:bg-[#0a66c2]/5 transition-colors rounded-lg"
                        aria-expanded={expandedId === item.id}
                        aria-controls={`answer-${item.id}`}
                        >
                        <span className="font-medium text-gray-800">{item.question}</span>
                        {expandedId === item.id ? 
                            <FiChevronUp className="text-[#0a66c2]" /> : 
                            <FiChevronDown className="text-[#0a66c2]" />
                        }
                        </button>
                        {expandedId === item.id && (
                        <div
                            id={`answer-${item.id}`}
                            className="px-4 pb-4 text-gray-600 transition-all duration-300 animate-fadeIn"
                        >
                            {item.answer}
                        </div>
                        )}
                    </div>
                    ))}
                </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ManageChat;