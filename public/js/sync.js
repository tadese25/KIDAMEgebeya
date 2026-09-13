/* ============================================================
   KIDAMEgebeya — Session + server sync
   Wraps the client Store with the backend API:
   - catalog comes from /api/products at boot
   - auth (JWT in httpOnly cookie) via /api/auth/*
   - cart & wishlist are mirrored to the server while logged in
   - orders & profile are imported from the server on login
   ============================================================ */

const Nova = (() => {
  let user = null;
  let timer = null;
  const PUSH_DELAY = 400;

  async function init() {
    try {
      const res = await API.get('/api/auth/me');
      user = res.user || null;
    } catch { user = null; }
    if (user) await adoptServerState();
    return user;
  }

  function bind() {
    Store.subscribe(() => schedulePush());
  }

  function session() { return user; }
  function isLoggedIn() { return !!user; }

  async function login(email, password) {
    const res = await API.post('/api/auth/login', { email, password });
    await afterAuth(res.user);
    return res.user;
  }

async function register(name, email, password) {
  // account is created but NOT signed in — a verification email is sent first
  return API.post('/api/auth/register', { name, email, password });
}

  async function afterAuth(nextUser) {
    user = nextUser;
    // push the guest's local cart/wishlist to the server, then adopt canonical state
    await syncNow();
    await adoptServerState();
    Admin.check();
  }

  async function logout() {
    user = null;
    try { await API.post('/api/auth/logout'); } catch { /* offline */ }
    Store.adopt({ profile: { name: 'Guest Shopper', email: '', phone: '' } });
    Admin.check();
  }

  async function adoptServerState() {
    try {
      const [cart, wish, orders] = await Promise.all([
        API.get('/api/cart'),
        API.get('/api/wishlist'),
        API.get('/api/orders'),
      ]);
      const profileRes = await API.get('/api/profile').catch(() => null);
      Store.adopt({
        cart: (cart && cart.cart) || {},
        wishlist: (wish && wish.wishlist) || [],
        orders: (orders && orders.orders) || [],
        profile: { name: user?.name || 'Customer', email: user?.email || '', phone: '' },
        addresses: (profileRes && profileRes.addresses) || [],
      });
    } catch { /* keep local state if server hiccups */ }
  }

  async function syncNow() {
    if (!user) return;
    await Promise.all([
      API.post('/api/cart/merge', { cart: Store.state.cart }),
      API.post('/api/wishlist/merge', { wishlist: Store.state.wishlist }),
    ]);
  }

  function schedulePush() {
    clearTimeout(timer);
    timer = setTimeout(() => { if (user) syncNow().catch(() => {}); }, PUSH_DELAY);
  }

  return { init, bind, login, register, logout, session, isLoggedIn, syncNow };
})();