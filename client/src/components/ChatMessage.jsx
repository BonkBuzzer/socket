import React from 'react';

const ChatMessage = ({ message }) => {
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return (
    <div className={`flex mb-4 ${message.fromSelf ? 'justify-end' : 'justify-start'}`}>
      <div className="relative max-w-xs">
        <div
          className={`relative px-4 py-2 rounded-lg ${
            message.fromSelf ? 'rounded-se-none bg-blue-600' : 'rounded-ss-none bg-gray-700'
          }`}
        >
          <div className="break-words mb-1">{message.content}</div>
          <div className="text-xs opacity-70 text-right">{timestamp}</div>
          
          <div
            className={`absolute top-0 ${
              message.fromSelf ? '-right-2' : '-left-2'
            } w-4 h-4 overflow-hidden`}
          >
            <div
              className={`absolute transform rotate-45 w-2 h-2 ${
                message.fromSelf ? 'bg-blue-600' : 'bg-gray-700'
              }`}
              style={{
                top: '6px',
                [message.fromSelf ? 'left' : 'right']: '6px',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;