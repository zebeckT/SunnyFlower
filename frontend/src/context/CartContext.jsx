import { createContext, useContext, useReducer, useEffect, useMemo } from 'react';
import { shippingFor } from '../lib/format';

const CART_KEY = 'sunnyflower_cart_v1';
const MAX_QTY = 20;
const CartContext = createContext(null);

function clampQty(qty) {
  return Math.min(MAX_QTY, Math.max(1, qty));
}

function loadCart() {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY));
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function cartReducer(state, action) {
  switch (action.type) {
    case 'add': {
      const { item } = action;
      const key = `${item.productId}:${item.size || ''}`;
      return state.find((i) => i.key === key)
        ? state.map((i) =>
            i.key === key ? { ...i, quantity: clampQty(i.quantity + item.quantity) } : i,
          )
        : [...state, { ...item, key, quantity: clampQty(item.quantity) }];
    }
    case 'setQty':
      return state.map((i) =>
        i.key === action.key ? { ...i, quantity: clampQty(action.quantity) } : i,
      );
    case 'remove':
      return state.filter((i) => i.key !== action.key);
    case 'replace':
      return action.items;
    case 'clear':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === CART_KEY) dispatch({ type: 'replace', items: loadCart() });
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const fee = shippingFor(subtotal);

    return {
      items,
      count,
      subtotal,
      shippingFee: fee,
      total: subtotal + fee,
      add: (item) => dispatch({ type: 'add', item }),
      setQty: (key, quantity) => dispatch({ type: 'setQty', key, quantity }),
      remove: (key) => dispatch({ type: 'remove', key }),
      clear: () => dispatch({ type: 'clear' }),
    };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
