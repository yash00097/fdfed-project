import { createContext, useState, useContext, useEffect } from 'react';
import { useSelector } from 'react-redux';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const { currentUser } = useSelector((state) => state.user);
  const userId = currentUser?._id;

  const [cartItems, setCartItems] = useState(() => {
    const storedCart = localStorage.getItem(`cartItems_${userId}`);
    return storedCart ? JSON.parse(storedCart) : [];
  });

  // Update cart when user changes
  useEffect(() => {
    const storedCart = localStorage.getItem(`cartItems_${userId}`);
    setCartItems(storedCart ? JSON.parse(storedCart) : []);
  }, [userId]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`cartItems_${userId}`, JSON.stringify(cartItems));
  }, [cartItems, userId]);

  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((i) => i._id === item._id);
      if (existingItem) {
        // If item already exists, maybe update quantity or just return
        // For cars, usually quantity is 1, so we'll just return if it's already there
        // or maybe alert the user. For now, let's just not add duplicates.
        return prevItems;
      }
      return [...prevItems, item];
    });
  };

  const removeFromCart = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item._id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price || 0), 0);
  };

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    getCartTotal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
