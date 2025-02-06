import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './styles.css';

const socket = io('http://localhost:3001');

function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [isConnected, setIsConnected] = useState(true);
  const usernameSet = useRef(false);

  useEffect(() => {
    if (!usernameSet.current) {
      const name = prompt('Enter your name:');
      setUsername(name);
      socket.emit('user connected', name);
      usernameSet.current = true;
    }

    socket.on('chat message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    socket.on('user connected', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    socket.on('user disconnected', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off('chat message');
      socket.off('user connected');
      socket.off('user disconnected');
    };
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message) {
      socket.emit('chat message', `${username}: ${message}`);
      setMessage('');
    }
  };

  const disconnectUser = () => {
    socket.emit('user disconnected', `${username} has left the chat`);
    socket.disconnect();
    setIsConnected(false);
  };

  const connect = ()=>{
    socket.emit('user connected', `${username}`);
    socket.connect()
    setIsConnected(true)
  }

  return (
    <div className="chat-container">
      <div className='heading'>Chat Application</div>
      <ul id="messages">
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
      </ul>
      {isConnected ? (
        <>
          <form id="form" onSubmit={sendMessage}>
            <input
              id="input"
              autoComplete="off"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button type="submit">Send</button>
          </form>
          <button onClick={disconnectUser} className="disconnect-btn">
            Disconnect
          </button>
        </>
      ) : (
        // <p>You have disconnected from the chat.</p>
        <button onClick={connect}>Connect</button>
      )}
    </div>
  );
}

export default App;
