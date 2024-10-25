import React from 'react'

const ThisUser = ({ thisUser }) => {
    return (
        <div className="w-full px-4 py-[10px] flex items-center gap-3 cursor-default border-b border-gray-700">
            <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                    {thisUser?.username[0]?.toUpperCase() || 'X'}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-900"></div>
            </div>
            <div className="flex-1 text-left">
                <div className="font-medium text-gray-400">{thisUser?.username}</div>
                <div className="text-xs text-gray-400">( you )</div>
            </div>
        </div>
    )
}

export default ThisUser