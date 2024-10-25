import React from 'react';
import { Send } from 'lucide-react';

const ChatInput = ({ message, setMessage, onSend, disabled }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSend();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-gray-700">
      <div className="flex gap-2">
        <input
          disabled={disabled}
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={disabled ? 'Select someone to send them a message' : 'Type your message...'}
          className="flex-1 px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!message.trim() || disabled}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </div>
    </form>
  );
};

export default ChatInput;