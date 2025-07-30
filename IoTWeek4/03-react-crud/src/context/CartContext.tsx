import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface CartContextType {
  cart: { [key: number]: number };
  favorites: Set<number>;
  addToCart: (itemId: number, quantity?: number) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  toggleFavorite: (itemId: number) => void;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Helper functions for localStorage
function getCartFromStorage(): { [key: number]: number } {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem("coffee-cart");
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function setCartToStorage(cart: { [key: number]: number }) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("coffee-cart", JSON.stringify(cart));
  } catch (error) {
    console.error("Failed to save cart to localStorage:", error);
  }
}

function getFavoritesFromStorage(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem("coffee-favorites");
    const favorites = stored ? JSON.parse(stored) : [];
    return new Set(favorites);
  } catch {
    return new Set();
  }
}

function setFavoritesToStorage(favorites: Set<number>) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("coffee-favorites", JSON.stringify(Array.from(favorites)));
  } catch (error) {
    console.error("Failed to save favorites to localStorage:", error);
  }
}

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<{ [key: number]: number }>({});
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from localStorage only once
  useEffect(() => {
    if (!isInitialized) {
      const storedCart = getCartFromStorage();
      const storedFavorites = getFavoritesFromStorage();
      
      setCart(storedCart);
      setFavorites(storedFavorites);
      setIsInitialized(true);
      
      console.log("Cart initialized:", storedCart);
    }
  }, [isInitialized]);

  // Save to localStorage whenever cart changes (but only after initialization)
  useEffect(() => {
    if (isInitialized) {
      setCartToStorage(cart);
      console.log("Cart saved to localStorage:", cart);
    }
  }, [cart, isInitialized]);

  // Save favorites to localStorage whenever favorites change
  useEffect(() => {
    if (isInitialized) {
      setFavoritesToStorage(favorites);
    }
  }, [favorites, isInitialized]);

  const addToCart = (itemId: number, quantity: number = 1) => {
    setCart(prevCart => {
      const newCart = {
        ...prevCart,
        [itemId]: (prevCart[itemId] || 0) + quantity
      };
      console.log("Adding to cart:", { itemId, quantity, newCart });
      return newCart;
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart(prevCart => {
      const newCart = { ...prevCart };
      delete newCart[itemId];
      console.log("Removing from cart:", { itemId, newCart });
      return newCart;
    });
  };

  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart(prevCart => {
      const newCart = {
        ...prevCart,
        [itemId]: quantity
      };
      console.log("Updating quantity:", { itemId, quantity, newCart });
      return newCart;
    });
  };

  const clearCart = () => {
    setCart({});
    console.log("Cart cleared");
  };

  const toggleFavorite = (itemId: number) => {
    setFavorites(prevFavorites => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId);
      } else {
        newFavorites.add(itemId);
      }
      console.log("Toggling favorite:", { itemId, isFavorite: newFavorites.has(itemId) });
      return newFavorites;
    });
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  const contextValue: CartContextType = {
    cart,
    favorites,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleFavorite,
    getTotalItems,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}