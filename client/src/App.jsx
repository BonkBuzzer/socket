import { useRef, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { Lock, MessageCircle, Send, User, Users } from 'lucide-react';
import axios from 'axios';
import ThisUser from './components/ThisUser';
// import Loader from './components/Loader'
import PerfectScrollbar from 'react-perfect-scrollbar'
import 'react-perfect-scrollbar/dist/css/styles.css';

const App = () => {
  const [broadcastMessages, setBroadcastMessages] = useState([]);
  const [freshUsersFromSocket, setFreshUsersFromSocket] = useState([]);
  const [messageToBeSent, setMessageToBeSent] = useState('');
  const [messages, setMessages] = useState({});
  const [isUserLoggedIn, setIsUserLoggedIn] = useState((localStorage.getItem('mongoId') ? true : false) || false);
  const [isDataFetchPending, setIsDataFetchPending] = useState(true);
  const [loginCredentials, setLoginCredentials] = useState({
    username: localStorage.getItem('username') || '',
    password: '',
  });

  const socketRef = useRef();
  const consistentUsersRef = useRef([]);

  const [selectedUser, setSelectedUser] = useState({
    username: '',
    socketId: '',
    mongoId: '',
  });

  const [thisUser, setThisUser] = useState({
    username: localStorage.getItem('username') || '',
    socketId: '',
    mongoId: localStorage.getItem('mongoId') || '',
  });

  const handleFetch = async (id1, id2) => {
    try {
      setIsDataFetchPending(true);
      // console.log('first id for db :', id1)
      // console.log('second id to be sent to db :', id2)
      const response = await axios.post('http://192.168.29.138:5000/fetchChat', { id1, id2 });
      const chatMessages = response.data.chat;
      const otherUserIdForStorage = response.data.otherUserIdForStorage;

      setMessages(prevMessages => ({
        ...prevMessages,
        [otherUserIdForStorage]: chatMessages.map(msg => ({
          content: msg.content,
          fromSelf: msg.fromSelf,
        })),
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsDataFetchPending(false);
    }
  };

  useEffect(() => {
    if (!isUserLoggedIn) return;

    const username = loginCredentials.username || 'anonymous' || localStorage.getItem('username');
    document.title = username;

    socketRef.current = io('http://192.168.29.138:5000', {
      auth: { username, mongoId: localStorage.getItem('mongoId') },
    });

    socketRef.current.on('connect', () => {
      setThisUser(prev => ({
        ...prev,
        username,
        socketId: socketRef.current.id,
      }));
      // console.log('Connected:', socketRef.current.id);
    });

    socketRef.current.on('message', data => {
      // console.log('Message from server:', data);
      setBroadcastMessages(prev => [...prev, data]);
    });

    socketRef.current.on('users', users => {
      consistentUsersRef.current = users;
      setFreshUsersFromSocket(users);
    });

    socketRef.current.on('private message', ({ content, from }) => {
      const senderUser = consistentUsersRef.current.find(user => user.socketId === from);
      if (senderUser) {
        setMessages(prevMessages => ({
          ...prevMessages,
          [senderUser.mongoId]: [
            ...(prevMessages[senderUser.mongoId] || []),
            { content, fromSelf: false },
          ],
        }));
      }
    });

    socketRef.current.on('disconnect', () => {
      // console.log('Disconnected from server');
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isUserLoggedIn, loginCredentials.username]);

  const sendPrivateMessage = (recipientId) => {
    const content = messageToBeSent.trim();
    if (content && socketRef.current) {
      const recipientUser = consistentUsersRef.current.find(user => user.socketId === recipientId);
      socketRef.current.emit('private message', { content, to: recipientId });

      setMessages(prevMessages => ({
        ...prevMessages,
        [recipientUser.mongoId]: [
          ...(prevMessages[recipientUser.mongoId] || []),
          { content, fromSelf: true },
        ],
      }));

      axios.post('http://192.168.29.138:5000/sendMessagesToBackend', {
        from: thisUser.mongoId,
        to: selectedUser.mongoId,
        message: content,
      })
        .then(response => {
          // console.log(response.data);
        })
        .catch(error => {
          console.error('Error sending message to backend:', error);
        });

      setMessageToBeSent('');
    }
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    setLoginCredentials(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async e => {
    e.preventDefault();
    const { username, password } = loginCredentials;
    if (username && password) {
      try {
        const response = await axios.post('http://192.168.29.138:5000/login', { username, password });
        if (response.status === 200 && response.data.canConnect) {
          localStorage.setItem('mongoId', response.data.mongoId);
          localStorage.setItem('username', username);
          setIsUserLoggedIn(true);
          setThisUser(prev => ({
            ...prev,
            username,
            mongoId: response.data.mongoId,
          }));
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Login failed');
      }
    }
  };

  const scrollbarOptions = {
    suppressScrollX: true,
    wheelSpeed: 0.25,
    wheelPropagation: false,
    minScrollbarLength: 400
  };

  const displayUsers = freshUsersFromSocket.filter(user => user.socketId !== thisUser.socketId);

  if (!isUserLoggedIn) {
    return (
      <div className="flex h-screen bg-gray-900 text-white items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-700">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
              <p className="text-gray-400">Please sign in to continue</p>
            </div>
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-gray-300">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={loginCredentials.username}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md 
                      bg-gray-700 text-white placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      transition duration-150 ease-in-out"
                    placeholder="Enter your username"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={loginCredentials.password}
                    onChange={handleInputChange}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-md 
                      bg-gray-700 text-white placeholder-gray-400
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      transition duration-150 ease-in-out"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md
                  bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 
                  focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out
                  text-white font-medium"
              >
                Sign In
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-700 flex flex-col">
        <ThisUser thisUser={thisUser} />
        {/* Active Users Header */}
        <div className="p-4 border-b border-gray-700 flex items-center gap-2">
          <Users className="w-5 h-5 text-white" />
          <h2 className="font-semibold text-white">Active Users ({displayUsers.length})</h2>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto">
          {displayUsers.map((user, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedUser({
                  socketId: user.socketId,
                  username: user.username,
                  mongoId: user.mongoId,
                });
                handleFetch(thisUser.mongoId || localStorage.getItem('mongoId'), user.mongoId);
              }}
              className={`w-full px-4 py-3 flex items-center gap-3
                hover:bg-gray-800 cursor-pointer
                border-b border-gray-700 transition-colors
                ${selectedUser.socketId === user.socketId ? 'bg-gray-800' : ''}`}
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                  {user.username[0]?.toUpperCase()}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-900"></div>
              </div>
              <div className="flex-1 text-left">
                <div className="font-medium">{user.username}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      {selectedUser.socketId === '' ? (
        <div className="flex-1 flex items-center justify-center flex-col gap-4 text-gray-400">
          <MessageCircle className="w-16 h-16" />
          <p className="text-xl font-medium">Select a user to start chatting</p>
        </div>
      ) : (
        <main className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-700">
            <h1 className="text-xl font-semibold text-white">Chat with {selectedUser.username}</h1>
          </div>

          {/* Messages Area */}
          <PerfectScrollbar options={scrollbarOptions}>
            <div className="flex-1 p-4 overflow-y-auto text-white">
              {isDataFetchPending ? (
                <div>Loading...</div>
              ) : (
                messages[selectedUser.mongoId]?.map((msg, idx) => (
                  <div key={idx} className={`flex mb-2 ${msg.fromSelf ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`px-3 py-1 rounded-lg ${msg.fromSelf ? 'rounded-se-none bg-blue-600' : 'rounded-ss-none bg-gray-700'} 
                    max-w-xs text-white break-words`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          </PerfectScrollbar>
          {/* Message Input */}
          <div className="p-4 border-t border-gray-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={messageToBeSent}
                onChange={e => setMessageToBeSent(e.target.value)}
                onKeyUp={e => {
                  if (e.key === 'Enter' && messageToBeSent.trim()) {
                    sendPrivateMessage(selectedUser.socketId);
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2 bg-gray-800 rounded-lg border border-gray-700 
                  focus:border-blue-500 focus:outline-none transition-colors"
              />
              <button
                type="button"
                disabled={!messageToBeSent.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 
                  disabled:cursor-not-allowed rounded-lg font-medium transition-colors 
                  flex items-center gap-2"
                onClick={() => sendPrivateMessage(selectedUser.socketId)}
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default App;
