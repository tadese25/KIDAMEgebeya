/* ============================================================
   KIDAMEgebeya — Client-side state (cart, wishlist, orders, profile)
   Persisted to localStorage + lightweight pub/sub.
   ============================================================ */

const Store = (() => {
  const LS_KEY = 'nova_state_v1';
  const DEFAULT = {
    cart: {},          // { productId: qty }
    wishlist: [],      // [productId]
    orders: [],        // [{ id, items:[], totals, address, payment, date, status }]
    addresses: [],     // [{ id, label, name, line, city, zip, country, phone }]
    profile: { name: 'Guest Shopper', email: '', phone: '' },
  };

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return structuredClone(DEFAULT);
      const parsed = JSON.parse(raw);
      return { ...structuredClone(DEFAULT), ...parsed };
    } catch {
      return structuredClone(DEFAULT);
    }
  }

  function save() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* storage full / private mode */ }
  }

  const listeners = new Set();
  function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
  function emit() { listeners.forEach((fn) => { try { fn(); } catch {} }); }

  function setState(mutator) {
    state = mutator(state);
    save();
    emit();
  }

  /* ---------- Cart ---------- */
  function cartCount() {
    return Object.values(state.cart).reduce((a, b) => a + b, 0);
  }
  function cartItems() {
    return Object.entries(state.cart)
      .map(([id, qty]) => ({ product: getProduct(id), qty }))
      .filter((i) => i.product);
  }

  function addToCart(id, qty = 1) {
    const p = getProduct(id);
    if (!p) return false;
    setState((s) => {
      const current = s.cart[id] || 0;
      const clamped = Math.min(current + qty, Math.max(1, p.stock));
      s.cart[id] = clamped;
      return s;
    });
    return true;
  }
  function setQty(id, qty) {
    setState((s) => {
      if (qty <= 0) delete s.cart[id];
      else s.cart[id] = Math.min(qty, getProduct(id)?.stock || qty);
      return s;
    });
  }
  function removeFromCart(id) {
    setState((s) => { delete s.cart[id]; return s; });
  }
  function clearCart() {
    setState((s) => ({ ...s, cart: {} }));
  }

  /* ---------- Wishlist ---------- */
  function isWishlisted(id) { return state.wishlist.includes(id); }
  function wishlistCount() { return state.wishlist.length; }
  function toggleWishlist(id) {
    setState((s) => {
      s.wishlist = s.wishlist.includes(id)
        ? s.wishlist.filter((x) => x !== id)
        : [...s.wishlist, id];
      return s;
    });
    return isWishlisted(id);
  }
  function removeWishlist(id) {
    setState((s) => ({ ...s, wishlist: s.wishlist.filter((x) => x !== id) }));
  }
  function wishlistProducts() {
    return state.wishlist.map(getProduct).filter(Boolean);
  }

  /* ---------- Orders ---------- */
  const FREE_SHIPPING_THRESHOLD = 75;
  const SHIPPING_FLAT = 9.99;

  function totals(items = cartItems(), promo = null) {
    const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
    const discount = subtotal > 0 ? subtotal * (promo?.rate || 0) : 0;
    const shipping = subtotal === 0 ? 0 : (subtotal - discount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT);
    const tax = (subtotal - discount) * 0.08;
    const total = subtotal - discount + shipping + tax;
    return {
      subtotal, discount, shipping, tax,
      total: Math.max(0, total),
      freeShippingEligible: subtotal - discount >= FREE_SHIPPING_THRESHOLD,
      freeShippingRemaining: Math.max(0, FREE_SHIPPING_THRESHOLD - (subtotal - discount)),
    };
  }

  const PROMOS = {
    WELCOME10: { rate: 0.10, label: 'Welcome 10% off' },
    KIDAMEgebeya15:    { rate: 0.15, label: 'KIDAMEgebeya 15% off' },
    FREESHIP:  { rate: 0.00, label: 'Free shipping' },
  };

  function placeOrder({ address, payment, email, name, promoCode }) {
    const items = cartItems();
    const promo = PROMOS[promoCode?.toUpperCase?.()] || null;
    if (!items.length) return null;
    const order = {
      id: 'KD-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
      date: new Date().toISOString(),
      status: 'Processing',
      items: items.map(({ product, qty }) => ({ id: product.id, name: product.name, price: product.price, qty, image: product.images[0] })),
      totals: totals(items, promo),
      subtotalBeforeDiscount: totals(items, null).subtotal,
      address, payment, email, name, promo: promo?.label || null,
      estimatedDelivery: (() => {
        const d = new Date(); d.setDate(d.getDate() + 5);
        return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      })(),
    };
    setState((s) => ({ ...s, orders: [order, ...s.orders], cart: {} }));
    return order;
  }
  function getOrder(id) { return state.orders.find((o) => o.id === id); }

  /* ---------- Server adoption (full-stack sync) ---------- */
  function adopt(changes) {
    setState((s) => {
      const next = { ...s };
      if (changes.cart !== undefined) next.cart = { ...changes.cart };
      if (changes.wishlist !== undefined) next.wishlist = [...changes.wishlist];
      if (changes.orders !== undefined) next.orders = [...changes.orders];
      if (changes.profile !== undefined) next.profile = { ...s.profile, ...changes.profile };
      if (changes.addresses !== undefined) next.addresses = [...changes.addresses];
      return next;
    });
  }
  function importOrder(order) {
    setState((s) => (s.orders.some((o) => o.id === order.id) ? s : { ...s, orders: [order, ...s.orders] }));
  }

  /* ---------- Profile & addresses ---------- */
  function saveProfile(p) { setState((s) => ({ ...s, profile: { ...s.profile, ...p } })); }
  function addAddress(a) { setState((s) => ({ ...s, addresses: [...s.addresses, { ...a, id: 'addr-' + Date.now() }] })); }
  function removeAddress(id) { setState((s) => ({ ...s, addresses: s.addresses.filter((a) => a.id !== id) })); }

  return {
    subscribe, emit,
    state, get state() { return state; },
    cartCount, cartItems, addToCart, setQty, removeFromCart, clearCart,
    isWishlisted, toggleWishlist, removeWishlist, wishlistCount, wishlistProducts,
    totals, placeOrder, getOrder, PROMOS, adopt, importOrder,
    saveProfile, addAddress, removeAddress,
    FREE_SHIPPING_THRESHOLD, SHIPPING_FLAT,
  };
})();