'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Bot, X, RotateCcw, Send, Sparkles, BarChart2, Package, AlertTriangle, ShieldAlert } from 'lucide-react';
import { useConversation } from '../hooks/useConversation';
import { dispatchChatAction } from '../actions/ActionDispatcher';
import MetricCard from '../cards/MetricCard';
import OrderCard from '../cards/OrderCard';
import BookCard from '../cards/BookCard';
import AdminConfirmationModal, { ConfirmationPayload } from './AdminConfirmationModal';
import type { ChatAction } from '@/types/chat';
import styles from '../styles/adminChatbot.module.css';

interface AdminChatWindowProps {
  onClose: () => void;
}

export default function AdminChatWindow({ onClose }: AdminChatWindowProps) {
  const router = useRouter();
  const { messages, loading, sendMessage, clearHistory } = useConversation(true);
  const [inputText, setInputText] = useState('');
  const [pendingConfirmation, setPendingConfirmation] = useState<ConfirmationPayload | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

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

  const handleActionClick = (action: ChatAction) => {
    if (action.type === 'REQUIRE_CONFIRMATION' && action.payload?.ticketId) {
      setPendingConfirmation({
        ticketId: action.payload.ticketId,
        actionType: action.payload.actionType,
        actionName: action.payload.actionName,
        orderId: action.payload.orderId,
        orderCode: action.payload.orderCode,
        totalAmount: action.payload.totalAmount,
      });
      return;
    }

    dispatchChatAction(action, {
      router,
      onConfirmAction: (ticketId, actionType) => {
        setPendingConfirmation({
          ticketId,
          actionType,
          orderId: action.payload?.orderId,
          orderCode: action.payload?.orderCode,
        });
      },
    });
  };

  const formatText = (content: string) => {
    if (!content) return null;
    const lines = content.split('\n');

    return lines.map((line, idx) => {
      const parts = line.split(/(\*\*[^*]+\*\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return (
        <span key={idx}>
          {formattedLine}
          {idx < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  const shortcuts = [
    { label: 'Bản tin sáng', icon: <Sparkles size={12} />, prompt: 'Tóm tắt bản tin hoạt động hôm nay' },
    { label: 'Doanh thu', icon: <BarChart2 size={12} />, prompt: 'Doanh thu hôm nay thế nào so với hôm qua?' },
    { label: 'Đơn chờ duyệt', icon: <Package size={12} />, prompt: 'Có bao nhiêu đơn hàng đang chờ duyệt?' },
    { label: 'Tồn kho thấp', icon: <AlertTriangle size={12} />, prompt: 'Những tựa sách nào sắp hết hàng?' },
    { label: 'Quét bất thường', icon: <ShieldAlert size={12} />, prompt: 'Hôm nay có gì bất thường trong vận hành không?' },
  ];

  return (
    <div className={styles.adminChatWindow}>
      {/* Header */}
      <div className={styles.adminHeader}>
        <div className={styles.adminHeaderTitle}>
          <Bot size={18} />
          <span>Boki Admin Co-Pilot</span>
          <span className={styles.adminBadge}>EXECUTIVE</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
            onClick={clearHistory}
            title="Xóa cuộc trò chuyện"
          >
            <RotateCcw size={15} />
          </button>
          <button
            type="button"
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
            onClick={onClose}
            title="Đóng co-pilot"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Operational Shortcuts */}
      <div className={styles.adminShortcutsRow}>
        {shortcuts.map((sc, i) => (
          <button
            key={i}
            type="button"
            className={styles.shortcutBtn}
            onClick={() => sendMessage(sc.prompt)}
          >
            {sc.icon}
            <span>{sc.label}</span>
          </button>
        ))}
      </div>

      {/* Message List */}
      <div className={styles.adminMessageList}>
        {messages.map((msg) => {
          const isUser = msg.sender === 'USER';
          return (
            <div
              key={msg.id}
              className={`${styles.adminBubble} ${isUser ? styles.adminUserBubble : styles.adminBotBubble}`}
            >
              <div>{formatText(msg.text)}</div>

              {/* Render Admin Metric Card */}
              {msg.cards && msg.cards.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  {msg.actionType === 'ADMIN_METRIC' && <MetricCard data={msg.cards[0]} />}
                  {msg.actionType === 'DAILY_BRIEFING' && <MetricCard data={msg.cards[0]} />}
                  {msg.actionType === 'ORDER_INFO' && <OrderCard order={msg.cards[0]} />}
                  {msg.actionType === 'BOOK_LIST' && <BookCard books={msg.cards} />}
                </div>
              )}

              {/* Action Buttons */}
              {msg.actions && msg.actions.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                  {msg.actions.map((act, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={styles.shortcutBtn}
                      style={{ background: '#0f172a', color: 'white', borderColor: '#334155', fontWeight: 600 }}
                      onClick={() => handleActionClick(act)}
                    >
                      {act.label}
                    </button>
                  ))}
                </div>
              )}

              <div style={{ fontSize: '10px', color: isUser ? 'rgba(255,255,255,0.7)' : '#94a3b8', marginTop: '4px', textAlign: 'right' }}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className={styles.adminBotBubble} style={{ fontStyle: 'italic', color: '#64748b' }}>
            Boki Copilot đang truy xuất cơ sở dữ liệu...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <div className={styles.adminInputBar}>
        <input
          ref={inputRef}
          type="text"
          className={styles.adminInput}
          placeholder="Hỏi về doanh thu, tồn kho hoặc lệnh quản trị..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <button
          type="button"
          className={styles.adminSendBtn}
          onClick={handleSend}
          disabled={!inputText.trim() || loading}
          title="Gửi"
        >
          <Send size={15} />
        </button>
      </div>

      {pendingConfirmation && (
        <AdminConfirmationModal
          payload={pendingConfirmation}
          onClose={() => setPendingConfirmation(null)}
          onComplete={(_success, message) => {
            const ticketId = pendingConfirmation.ticketId;
            setPendingConfirmation(null);
            sendMessage(`Đã xử lý vé xác thực ${ticketId}: ${message}`);
          }}
        />
      )}
    </div>
  );
}
