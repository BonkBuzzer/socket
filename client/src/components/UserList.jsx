import React from 'react';
import { Users } from 'lucide-react';

const UserList = ({ users, mySocketId, selectedId, onUserSelect }) => {
  return (
    <div className="w-80 border-r border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700 flex items-center gap-2">
        <Users className="w-5 h-5 text-white" />
        <h2 className="font-semibold text-white">Active Users ({users.length})</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        {users.map((user, index) => (
          <UserListItem
            key={index}
            user={user}
            isCurrentUser={user.socketId === mySocketId}
            isSelected={selectedId === user.socketId}
            onSelect={() => onUserSelect(user)}
          />
        ))}
      </div>
    </div>
  );
};

const UserListItem = ({ user, isCurrentUser, isSelected, onSelect }) => {
  return (
    <button
      onClick={isCurrentUser ? undefined : onSelect}
      className={`
        w-full px-4 py-3 flex items-center gap-3
        ${isCurrentUser ? 'bg-gray-800 cursor-default' : 'hover:bg-gray-800 cursor-pointer'}
        ${isSelected ? 'bg-gray-700' : ''}
        border-b border-gray-700 transition-colors
      `}
    >
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center font-medium">
          {user.username[0].toUpperCase()}
        </div>
        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-900"></div>
      </div>
      <div className="flex-1 text-left">
        <div className="font-medium">{user.username}</div>
        {isCurrentUser && (
          <div className="text-xs text-gray-400">You</div>
        )}
      </div>
    </button>
  );
};

export default UserList;