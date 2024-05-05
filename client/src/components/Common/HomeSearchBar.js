import React from 'react'
import useWindowSize from 'react-use/lib/useWindowSize'

const HomeSearchBar = () => {
    // const { width, height } = useWindowSize()
    return (
        <div className="flex-row flex-gap-2 justify-start">
            <div className='mx-auto'>
                <div className="flex justify-evenly h-12 rounded-lg focus-within:shadow-lg bg-white">
                    <div className="relative flex items-left h-12 rounded-lg focus-within:shadow-lg bg-white overflow-hidden">
                        <div class="grid place-items-center h-full w-12 text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <input
                        class="peer h-full outline-none text-sm text-gray-700 pr-2"
                        style={{width:'90%'}}
                        type="text"
                        id="search"
                        placeholder="Tìm dịch vụ, nhà cung cấp......" />
                    </div>


                    <div className="relative flex items-left h-12 rounded-lg focus-within:shadow-lg bg-white overflow-hidden">
                        <div className="grid place-items-center h-full w-12 text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0 0v6M9.5 9A2.5 2.5 0 0 1 12 6.5"/>
                            </svg>
                        </div>

                        <input
                        class="peer h-full outline-none text-sm text-gray-700 pr-2 min-w-36"
                        style={{width:'90%'}}
                        type="text"
                        id="search"
                        placeholder="Ở đâu..." />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HomeSearchBar