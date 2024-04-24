import React,{useEffect, useState} from 'react'

const useDebounce = (value, delayTime) => {

    const [debounce, setDebounce] = useState('')
    useEffect(() => {
        const setTimeoutId = setTimeout(()=>{
            setDebounce(value)
        },delayTime)

        return () => {
            clearTimeout(setTimeoutId)
        }
    }, [value, delayTime])
    
    return debounce
}

export default useDebounce

// chi call API khi nguoi dung nhap xong

// tách price thành 2 biến:
// 1 biến phục vụ UI (gõ tới đâu render tới đó)
// 1 biến dùng để quyết định call API => setTimeout => biến được gán sau 1 khoảng thời gian