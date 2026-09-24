'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, RotateCcw, Send } from 'lucide-react';
import ClientChatMessageItem from './ClientChatMessageItem';
import { useConversation } from '../hooks/useConversation';
import styles from '../styles/clientChatbot.module.css';

interface ClientChatWindowProps {
  onClose: () => void;
  initialPrompt?: string | null;
}

export default function ClientChatWindow({ onClose, initialPrompt }: ClientChatWindowProps) {
  const { messages, loading, suggestions, sendMessage, clearHistory } = useConversation(false);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Nếu có initialPrompt từ proactive prompt, gửi luôn
  useEffect(() => {
    if (initialPrompt) {
      sendMessage(initialPrompt);
    }
  }, [initialPrompt, sendMessage]);

  const handleSend = () => {
    if (!inputText.trim() || loading) return;
    sendMessage(inputText);
    setInputText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.chatWindow}>
      {/* Header */}
      <div className={styles.chatHeader}>
        <div className={styles.headerInfo}>
          <div className={styles.botAvatar}>
            <Bot size={22} />
          </div>
          <div>
            <div className={styles.botTitle}>BokiStore Assistant</div>
            <div className={styles.botStatus}>
              <span className={styles.statusDot}></span>
              <span>Trợ lý AI trực tuyến</span>
            </div>
          </div>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.headerBtn}
            onClick={clearHistory}
            title="Xóa lịch sử chat"
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            className={styles.headerBtn}
            onClick={onClose}
            title="Đóng chat"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Message List */}
      <div className={styles.messageList}>
        {messages.map((msg) => (
          <ClientChatMessageItem key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className={styles.botRow}>
            <div className={styles.typingIndicator}>
              <div className={styles.typingDot}></div>
              <div className={styles.typingDot}></div>
              <div className={styles.typingDot}></div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      {suggestions && suggestions.length > 0 && (
        <div className={styles.suggestionContainer}>
          {suggestions.map((sugg, idx) => (
            <button
              key={idx}
              type="button"
              className={styles.suggestionChip}
              onClick={() => sendMessage(sugg)}
            >
              {sugg}
            </button>
          ))}
        </div>
      )}

      {/* Input Field */}
      <div className={styles.inputContainer}>
        <input
          ref={inputRef}
          type="text"
          className={styles.inputField}
          placeholder="Nhập tên sách, mã đơn hoặc hỏi Boki..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          type="button"
          className={styles.sendButton}
          onClick={handleSend}
          disabled={!inputText.trim() || loading}
          title="Gửi tin nhắn"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
