import React, { useState } from 'react';
import styles from './TimetableChat.module.css';
import { base_url } from '../../assets/help';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const TimetableChat = ({ preferences, tasks,schedule, onScheduleUpdate }) => {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Hello! I can help you modify your timetable. What would you like to change?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/modify-timetable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userRequest: input,
          preferences: preferences,
          tasks: tasks,
          schedule: schedule,
          chatHistory: newMessages,
        }),
      });

      const data = await response.json();
      console.log(data)

      const token = localStorage.getItem('access_token');
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.user.id;

      const saveTimetableResponse = await fetch(`${base_url}/timetable`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              userId: userId,
              schedule: data.schedule
          }),
      });

      if (!saveTimetableResponse.ok) {
          throw new Error('Failed to save timetable');
      }

      const savedTimetable = await saveTimetableResponse.json();
      
      setMessages(prev => [...prev, { role: 'assistant', content: "Timetable Successfully Updated" }]);
      if (data.schedule) {
        onScheduleUpdate(data.schedule);
      }

      // setTimeout(() => {
      //   navigate('/timetable');
      // }, 200);
      
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error while processing your request.' 
      }]);
    }
    
    setIsLoading(false);
  };

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button 
        className={`${styles.toggleButton} ${isOpen ? styles.toggleActive : ''}`}
        onClick={toggleChat}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {/* Chat Container */}
      <div className={`${styles.container} ${isOpen ? styles.open : ''}`}>
        <div className={styles.header}>
          <h3>Schedule Assistant</h3>
          <button 
            className={styles.closeButton}
            onClick={toggleChat}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className={styles.messagesContainer}>
          {messages.map((message, index) => (
            <div
              key={index}
              className={`${styles.message} ${
                message.role === 'user' ? styles.userMessage : styles.assistantMessage
              }`}
            >
              <div className={styles.messageContent}>
                {message.content}
              </div>
            </div>
          ))}
        </div>
        
        <div className={styles.inputContainer}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your request..."
            disabled={isLoading}
            className={styles.input}
          />
          <button 
            onClick={handleSend} 
            disabled={isLoading}
            className={`${styles.button} ${isLoading ? styles.loading : ''}`}
          >
            {isLoading ? (
              <div className={styles.loader}></div>
            ) : (
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13"></path>
                <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default TimetableChat;