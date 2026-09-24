'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { chatService } from '@/services/chatService';
import type { ChatMessage, ChatResponse } from '@/types/chat';

const SESSION_KEY = 'boki_chat_session_id';

export function useConversation(isAdmin: boolean = false) {
  const pathname = usePathname();
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Khởi tạo sessionId
  useEffect(() => {
    let sid = typeof window !== 'undefined' ? sessionStorage.getItem(SESSION_KEY) : null;
    if (!sid) {
      sid = 'boki-' + Math.random().toString(36).substring(2, 10);
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    setSessionId(sid);

    // Tin nhắn chào mừng ban đầu
    const welcomeText = isAdmin
      ? 'Xin chào Quản trị viên! Boki Copilot đã sẵn sàng hỗ trợ bạn theo dõi doanh thu, kiểm tra đơn hàng và cảnh báo tồn kho.'
      : 'Xin chào! Mình là Boki, trợ lý ảo BokiStore. Bạn cần tìm manga, light novel hay kiểm tra đơn hàng, cứ bảo mình nhé!';

    setMessages([
      {
        id: 'init-1',
        sender: 'BOT',
        text: welcomeText,
        timestamp: new Date().toISOString(),
        suggestions: isAdmin
          ? ['Doanh thu hôm nay', 'Đơn hàng cần duyệt', 'Sách sắp hết hàng', 'Có gì bất thường không']
          : ['🔥 Manga nào hot nhất tuần này?', '📦 Tra cứu đơn hàng của tôi', '🎟️ Mã giảm giá mới hôm nay', '🚚 Phí ship thế nào?']
      }
    ]);

    // Load suggestions theo pathname
    if (!isAdmin) {
      chatService.getSuggestions(pathname).then((suggs) => {
        if (suggs && suggs.length > 0) {
          setSuggestions(suggs);
        }
      }).catch(() => {});
    }
  }, [isAdmin, pathname]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text || !text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'USER',
      text: text.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response: ChatResponse = isAdmin
        ? await chatService.sendAdminMessage({
            message: text.trim(),
            sessionId,
            currentPath: pathname
          })
        : await chatService.sendMessage({
            message: text.trim(),
            sessionId,
            currentPath: pathname
          });

      let parsedLogId: number | undefined;
      if (response.id && !isNaN(Number(response.id))) {
        parsedLogId = Number(response.id);
      }

      const botMsg: ChatMessage = {
        id: response.id || 'bot-' + Date.now(),
        sender: 'BOT',
        text: response.text,
        actionType: response.actionType,
        cards: response.cards,
        actions: response.actions,
        suggestions: response.suggestions,
        timestamp: response.timestamp || new Date().toISOString(),
        latencyMs: response.latencyMs,
        logId: parsedLogId
      };

      setMessages((prev) => [...prev, botMsg]);
      if (response.suggestions && response.suggestions.length > 0) {
        setSuggestions(response.suggestions);
      }
    } catch (err: any) {
      console.error('Chat request failed:', err);
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        sender: 'BOT',
        text: 'Xin lỗi bạn, kết nối tới máy chủ tạm thời bị gián đoạn. Vui lòng thử lại sau giây lát nhé!',
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  }, [loading, sessionId, pathname, isAdmin]);

  return {
    messages,
    loading,
    suggestions,
    sendMessage,
    clearHistory: () => setMessages([])
  };
}
