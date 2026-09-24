import type { ChatAction } from '@/types/chat';

export interface ActionDispatcherContext {
  router: { push: (url: string) => void };
  addToCart?: (book: any, quantity: number, variant?: any) => void;
  showToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
  onConfirmAction?: (ticketId: string, actionType: string) => void;
}

export function dispatchChatAction(action: ChatAction, ctx: ActionDispatcherContext) {
  if (!action) return;

  switch (action.type) {
    case 'NAVIGATE':
    case 'VIEW_BOOK': {
      const path = action.payload?.path || (action.payload?.bookId ? `/books/${action.payload.bookId}` : null);
      if (path) {
        ctx.router.push(path);
      }
      break;
    }

    case 'VIEW_ORDER':
    case 'TRACK_ORDER': {
      const orderId = action.payload?.orderId;
      if (orderId) {
        ctx.router.push(`/orders?id=${orderId}`);
      }
      break;
    }

    case 'COPY_VOUCHER': {
      const code = action.payload?.code;
      if (code) {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(code).then(() => {
            if (ctx.showToast) {
              ctx.showToast(`Đã sao chép mã voucher ${code}!`, 'success');
            } else {
              alert(`Đã sao chép mã voucher: ${code}`);
            }
          }).catch(() => {
            alert(`Mã voucher: ${code}`);
          });
        }
      }
      break;
    }

    case 'ADD_TO_CART': {
      if (ctx.addToCart && action.payload?.bookId) {
        const dummyBook = {
          id: action.payload.bookId,
          title: action.payload.title || 'Sách',
          price: action.payload.price || 0,
          originalPrice: action.payload.originalPrice,
          stockQuantity: 99,
          images: action.payload.coverUrl ? [{ imageUrl: action.payload.coverUrl, isPrimary: true }] : [],
          sellerId: 'system',
          author: action.payload.author || 'Tác giả',
          condition: 'NEW',
          status: 'ACTIVE',
          currency: 'VND',
          viewsCount: 0,
          rating: 5,
          reviewsCount: 0,
          isPreOrder: false
        };
        ctx.addToCart(dummyBook, action.payload.quantity || 1);
        if (ctx.showToast) {
          ctx.showToast('Đã thêm sản phẩm vào giỏ hàng!', 'success');
        }
      }
      break;
    }

    case 'GO_TO_CHECKOUT': {
      ctx.router.push('/checkout');
      break;
    }

    case 'REQUIRE_CONFIRMATION': {
      if (ctx.onConfirmAction && action.payload?.ticketId) {
        ctx.onConfirmAction(action.payload.ticketId, action.payload.actionType);
      }
      break;
    }

    default:
      console.warn('Unhandled chat action:', action);
  }
}
