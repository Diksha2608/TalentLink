// frontend/src/pages/Messages.jsx
import { useState, useEffect } from 'react';
import { messagesAPI } from '../api/messages';
import ChatWindow from '../components/ChatWindow';

export default function Messages({ user }) {
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = () => {
    messagesAPI.getConversations().then((res) => setConversations(res.data));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Messages</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden" style={{ height: '600px' }}>
          <div className="flex h-full">
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-lg">Conversations</h2>
              </div>
              {conversations.length > 0 ? (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedUser(conv)}
                    className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                      selectedUser?.id === conv.id ? 'bg-purple-50' : ''
                    }`}
                  >
                    <h3 className="font-semibold">{conv.first_name} {conv.last_name}</h3>
                    <p className="text-sm text-gray-600">{conv.email}</p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-gray-600 text-center">
                  No conversations yet
                </div>
              )}
            </div>

            <div className="flex-1">
              {selectedUser ? (
                <ChatWindow
                  user={user}
                  recipientId={selectedUser.id}
                  recipientName={`${selectedUser.first_name} ${selectedUser.last_name}`}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  Select a conversation to start messaging
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}