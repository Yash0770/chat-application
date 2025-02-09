import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useSelector, useDispatch } from "react-redux";
import { logout, fetchWithAuth } from "../redux/authSlice";
import { useNavigate } from "react-router-dom";
import LogoutDropdown from "./LogoutDropdown";
import "../styles.css";

const socket = io("http://localhost:3001", {
  autoConnect: false, // Prevent auto-connecting on load
});

function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    return () => {
      socket.disconnect();
    };
  }, [user, navigate]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await fetchWithAuth(
          "http://localhost:3001/api/chat/messages",
          {
            method: "GET",
          },
          dispatch
        );

        if (Array.isArray(data)) {
          setMessages(data);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [dispatch]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && isConnected) {
      socket.emit("chat message", `${user}: ${message}`);
      setMessage("");
    }
  };

  const connectUser = () => {
    if (!isConnected) {
      socket.connect();
      socket.emit("user connected", user);
      setIsConnected(true);

      socket.on("chat message", (msg) => {
        setMessages((prevMessages) => [...prevMessages, msg]);
      });

      socket.on("user connected", (msg) => {
        setMessages((prevMessages) => [...prevMessages, msg]);
      });

      socket.on("user disconnected", (msg) => {
        setMessages((prevMessages) => [...prevMessages, msg]);
      });
    }
  };

  const disconnectUser = () => {
    if (isConnected) {
      socket.emit("user disconnected", `${user} has left the chat`);
      socket.disconnect();
      setIsConnected(false);
    }
  };

  const handleLogout = () => {
    disconnectUser();
    dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <div className="heading">Chat Application</div>
        <LogoutDropdown onLogout={handleLogout} />
      </div>

      <ul id="messages">
        {messages.map((msg, index) => (
          <li key={index}>{msg}</li>
        ))}
        <div ref={messagesEndRef} />
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
        <button onClick={connectUser} className="connect-btn">
          Connect
        </button>
      )}
    </div>
  );
}

export default Chat;
