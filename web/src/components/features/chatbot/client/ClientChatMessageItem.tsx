'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import type { ChatMessage, ChatAction } from '@/types/chat';
import { dispatchChatAction } from '../actions/ActionDispatcher';
import BookCard from '../cards/BookCard';
import OrderCard from '../cards/OrderCard';
import VoucherCard from '../cards/VoucherCard';
import CompareCard from '../cards/CompareCard';
import MetricCard from '../cards/MetricCard';
import MessageFeedback from '../feedback/MessageFeedback';
import styles from '../styles/clientChatbot.module.css';

interface MessageItemProps {
  message: ChatMessage;
}

export default function ClientChatMessageItem({ message }: MessageItemProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const isUser = message.sender === 'USER';

  const handleActionClick = (action: ChatAction) => {
    dispatchChatAction(action, {
      router,
      addToCart
    });
  };

  // Helper đơn giản định dạng text markdown nhẹ (in đậm, xuống dòng, bullet)
  const formatText = (content: string) => {
    if (!content) return null;
    const lines = content.split('\n');

    return lines.map((line, idx) => {
      const parts = line.split(/(<green>[^<]+<\/green>|<red>[^<]+<\/red>|\*\*[^*]+\*\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('<green>') && part.endsWith('</green>')) {
          return (
            <span key={pIdx} style={{ color: '#16a34a', fontWeight: 600 }}>
              {part.slice(7, -8)}
            </span>
          );
        }
        if (part.startsWith('<red>') && part.endsWith('</red>')) {
          return (
            <span key={pIdx} style={{ color: '#dc2626', fontWeight: 600 }}>
              {part.slice(5, -6)}
            </span>
          );
        }
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

  return (
    <div className={`${styles.messageRow} ${isUser ? styles.userRow : styles.botRow}`}>
      <div className={`${styles.messageBubble} ${isUser ? styles.userBubble : styles.botBubble}`}>
        <div>{formatText(message.text)}</div>

        {/* Render Rich Cards */}
        {message.cards && message.cards.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            {message.actionType === 'BOOK_LIST' && <BookCard books={message.cards} />}
            {message.actionType === 'BOOK_COMPARE' && <CompareCard books={message.cards} />}
            {message.actionType === 'ORDER_INFO' && <OrderCard order={message.cards[0]} />}
            {message.actionType === 'VOUCHER_LIST' && <VoucherCard vouchers={message.cards} />}
            {message.actionType === 'ADMIN_METRIC' && <MetricCard data={message.cards[0]} />}
          </div>
        )}

        {/* Action Buttons */}
        {message.actions && message.actions.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
            {message.actions.map((act, i) => (
              <button
                key={i}
                type="button"
                className={styles.suggestionChip}
                style={{ background: '#fff7ed', borderColor: '#fdba74', color: '#c2410c', fontWeight: 600 }}
                onClick={() => handleActionClick(act)}
              >
                {act.label}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp & Feedback (Bot only) */}
        {!isUser && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <MessageFeedback logId={(message as any).logId} />
            <span className={styles.messageTime}>
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}

        {isUser && (
          <div className={styles.messageTime} style={{ color: 'rgba(255,255,255,0.8)' }}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
}
