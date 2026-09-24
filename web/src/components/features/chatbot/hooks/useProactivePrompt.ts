'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface ProactivePrompt {
  message: string;
  actionText?: string;
  promptText?: string;
}

const STORAGE_KEY = 'boki_chat_proactive_last';
const COOLDOWN_MS = 10 * 60 * 1000; // 10 phút cooldown giữa các lần gợi ý chủ động

export function useProactivePrompt(isOpen: boolean) {
  const pathname = usePathname();
  const [prompt, setPrompt] = useState<ProactivePrompt | null>(null);

  useEffect(() => {
    // Nếu người dùng đã mở khung chat, không cần hiển thị bóng gợi ý nổi
    if (isOpen) {
      setPrompt(null);
      return;
    }

    // Kiểm tra cooldown
    const lastTrigger = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (lastTrigger) {
      const elapsed = Date.now() - parseInt(lastTrigger, 10);
      if (elapsed < COOLDOWN_MS) {
        return;
      }
    }

    let timer: NodeJS.Timeout;

    if (pathname.startsWith('/books/')) {
      // Trang chi tiết sách: Sau 15 giây gợi ý tìm tập khác hoặc bản đặc biệt
      timer = setTimeout(() => {
        setPrompt({
          message: 'Bạn đang quan tâm tựa sách này? Mình có thể tìm bản đặc biệt hoặc kiểm tra còn hàng cho bạn!',
          actionText: 'Kiểm tra',
          promptText: 'Sách này còn hàng không và có bản đặc biệt không?'
        });
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
      }, 15000);
    } else if (pathname === '/cart') {
      // Trang giỏ hàng: Sau 10 giây gợi ý kiểm tra voucher
      timer = setTimeout(() => {
        setPrompt({
          message: 'Bạn có muốn Boki kiểm tra xem có mã giảm giá nào giúp tiết kiệm cho giỏ hàng này không?',
          actionText: 'Tìm voucher',
          promptText: 'Có mã giảm giá nào áp dụng được cho giỏ hàng của mình không?'
        });
        localStorage.setItem(STORAGE_KEY, Date.now().toString());
      }, 10000);
    }

    return () => clearTimeout(timer);
  }, [pathname, isOpen]);

  const dismissPrompt = () => {
    setPrompt(null);
  };

  return { prompt, dismissPrompt };
}
