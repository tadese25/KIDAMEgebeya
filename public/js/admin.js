/* ============================================================
   KIDAMEgebeya — Admin panel (SPA, hash route #/admin)
   Separate admin password (env ADMIN_PASSWORD); JWT role=admin
   guards every /api/admin endpoint server-side.
   ============================================================ */

const Admin = (() => {
  let authed = false;
  let checking = null;
  let lastAuthed = null;
  let currentTab = 'dashboard';
  let editingProduct = null;

  const TABS = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'products', label: 'Products' },
    { key: 'orders', label: 'Orders' },
    { key: 'promos', label: 'Promo codes' },
    { key: 'users', label: 'Users' },
  ];

  function refreshNav() {
    const link = $('#adminNavLink');
    if (link) link.hidden = !authed;
  }

  function emit(force) {
    refreshNav();
    if (force || authed !== lastAuthed) {
      lastAuthed = authed;
      window.dispatchEvent(new CustomEvent('noverender'));
    }
  }

  async function check() {
    if (checking) return checking;
    checking = API.get('/api/admin/me')
      .then(() => { authed = true; })
      .catch(() => { authed = false; })
      .finally(() => { checking = null; emit(false); });
    return checking;
  }

  function isAuthed() { return authed; }

  async function login(password) {
    await API.post('/api/admin/login', { password });
    authed = true;
    emit(true);
  }

  async function logout() {
    try { await API.post('/api/admin/logout'); } catch { /* keep going */ }
    authed = false;
    currentTab = 'dashboard';
    editingProduct = null;
    emit(true);
  }

  /* ------------------------------ views ------------------------------ */

  function view() {
    if (!authed) {
      return `
      <div class="container section section--top full-min admin-gate">
        <form class="auth-card" id="adminLoginForm" novalidate>
          <div class="admin-gate__head">
            <span class="logo__mark" aria-hidden="true">N</span>
            <h2>Admin access</h2>
          </div>
          <p class="auth-hint">Enter the administrator password to manage the store.</p>
          <div class="form-stack">
            <div class="field"><label>Admin password</label><input type="password" id="adminPass" class="input input--lg" autocomplete="current-password" /></div>
            <p class="form-msg" data-msg hidden></p>
            <button class="btn btn--primary btn--lg" type="submit" id="adminLoginBtn">Sign in</button>
          </div>
        </form>
      </div>`;
    }
    return `
    <div class="container section section--top full-min">
      <div class="page-head admin-head">
        <div>
          <h1>Store admin</h1>
          <p class="admin-sub">Manage products, orders, promo codes and customers.</p>
        </div>
        <button class="btn btn--ghost btn--sm" id="adminLogout">Sign out</button>
      </div>
      <div class="admin-tabs" role="tablist">
        ${TABS.map((t) => `<button class="admin-tab ${t.key === currentTab ? 'is-active' : ''}" data-atab="${t.key}">${t.label}</button>`).join('')}
      </div>
      <div id="adminWorkspace" class="admin-workspace"><div class="admin-spinner">Loading…</div></div>
    </div>`;
  }

  function mount() {
    if (!authed) {
      const form = $('#adminLoginForm');
      if (!form) return;
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = form.querySelector('[data-msg]');
        const btn = $('#adminLoginBtn');
        msg.hidden = false;
        btn.disabled = true;
        btn.textContent = 'Signing in…';
        try {
          await login($('#adminPass').value);
        } catch (err) {
          msg.textContent = err.message || 'Sign in failed.';
          btn.disabled = false;
          btn.textContent = 'Sign in';
          return;
        }
      });
      return;
    }
    $('#adminLogout')?.addEventListener('click', () => { logout(); });
    $$('[data-atab]').forEach((b) => b.addEventListener('click', () => {
      currentTab = b.dataset.atab;
      $$('[data-atab]').forEach((x) => x.classList.toggle('is-active', x === b));
      loadTab(currentTab);
    }));
    loadTab(currentTab);
  }

  async function loadTab(tab) {
    const ws = $('#adminWorkspace');
    if (!ws) return;
    ws.innerHTML = '<div class="admin-spinner">Loading…</div>';
    try {
      let html = '';
      if (tab === 'dashboard') {
        const { overview } = await API.get('/api/admin/overview');
        html = dashboardView(overview);
      } else if (tab === 'products') {
        const { products } = await API.get('/api/admin/products');
        window.ADMIN_PRODUCTS = products;
        html = productsView(products);
      } else if (tab === 'orders') {
        const { orders } = await API.get('/api/admin/orders');
        html = ordersView(orders);
      } else if (tab === 'promos') {
        const { promos } = await API.get('/api/admin/promos');
        html = promosView(promos);
      } else if (tab === 'users') {
        const { users } = await API.get('/api/admin/users');
        html = usersView(users);
      }
      ws.innerHTML = html;
      bindWorkspace(tab);
    } catch (err) {
      ws.innerHTML = `<p class="admin-error">${escapeHtml(err.message || 'Failed to load.')}</p>`;
    }
  }

  function refreshTab() {
    if ($('#adminWorkspace')) loadTab(currentTab);
  }

  /* ---------------------------- templates ---------------------------- */

  const STATUS_PILL = { Processing: 'pill--amber', Shipped: 'pill--blue', Delivered: 'pill--green', Cancelled: 'pill--grey' };

  function dashboardView(o) {
    const cards = [
      { label: 'Revenue', value: money(o.revenue) },
      { label: 'Revenue today', value: money(o.revenueToday) },
      { label: 'Orders', value: o.orders },
      { label: 'Pending', value: o.pendingOrders },
      { label: 'Orders today', value: o.ordersToday },
      { label: 'Products', value: o.products },
      { label: 'Low stock', value: o.lowStock },
      { label: 'Customers', value: o.users },
    ];
    return `
      <div class="admin-stats">
        ${cards.map((c) => `<div class="admin-stat"><span>${escapeHtml(c.label)}</span><strong>${c.value}</strong></div>`).join('')}
      </div>
      <div class="admin-cols">
        <section class="admin-panel">
          <h3>Top products</h3>
          ${o.topProducts.length ? `<table class="admin-table">
            <thead><tr><th>Product</th><th>Sold</th><th>Revenue</th></tr></thead>
            <tbody>${o.topProducts.map((p) => `<tr><td>${escapeHtml(p.name)}</td><td>${p.sold}</td><td>${money(p.revenue)}</td></tr>`).join('')}</tbody>
          </table>` : '<p class="admin-empty">No orders yet.</p>'}
        </section>
        <section class="admin-panel">
          <h3>Recent orders</h3>
          ${o.recentOrders.length ? `<table class="admin-table">
            <thead><tr><th>#</th><th>Date</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>${o.recentOrders.map((r) => `
              <tr><td>${escapeHtml(r.id)}</td><td>${escapeHtml((r.date || '').slice(0, 16).replace('T', ' '))}</td>
              <td>${escapeHtml(r.email)}</td><td>${money(r.total)}</td>
              <td><span class="pill ${STATUS_PILL[r.status] || 'pill--grey'}">${escapeHtml(r.status)}</span></td></tr>`).join('')}</tbody>
          </table>` : '<p class="admin-empty">No orders yet.</p>'}
        </section>
      </div>`;
  }

  function catOptions(selected) {
    const cats = window.CATEGORIES || [];
    return cats.map((c) => `<option value="${escapeHtml(c.id)}" ${c.id === selected ? 'selected' : ''}>${escapeHtml(c.name)}</option>`).join('');
  }

  function productForm(p) {
    const isEdit = !!p;
    const img = p ? (p.images || [])[0] || '' : '';
    return `
      <form class="admin-form card" id="adminProductForm" novalidate>
        <h3>${isEdit ? 'Edit product' : 'Add product'}</h3>
        <div class="row">
          <div class="field"><label>ID (slug)</label><input class="input" id="pfId" value="${escapeHtml(p ? p.id : '')}" ${isEdit ? 'disabled' : ''} placeholder="e.g. nova-magnet" /></div>
          <div class="field"><label>Name *</label><input class="input" id="pfName" value="${escapeHtml(p ? p.name : '')}" /></div>
        </div>
        <div class="row">
          <div class="field"><label>Category *</label><select class="input" id="pfCat">${catOptions(p ? p.category : '')}</select></div>
          <div class="field"><label>Brand</label><input class="input" id="pfBrand" value="${escapeHtml(p ? p.brand : 'KIDAMEgebeya')}" /></div>
        </div>
        <div class="row">
          <div class="field"><label>Price ($) *</label><input class="input" type="number" step="0.01" id="pfPrice" value="${p ? p.price : ''}" /></div>
          <div class="field"><label>Old price ($)</label><input class="input" type="number" step="0.01" id="pfOldPrice" value="${p && p.oldPrice != null ? p.oldPrice : ''}" /></div>
        </div>
        <div class="row">
          <div class="field"><label>Stock *</label><input class="input" type="number" id="pfStock" value="${p ? p.stock : 0}" /></div>
          <div class="field"><label>Tag</label><select class="input" id="pfTag"><option value="">—</option>${['new', 'bestseller', 'deal'].map((t) => `<option ${p && p.tag === t ? 'selected' : ''}>${t}</option>`).join('')}</select></div>
        </div>
        <div class="row">
          <div class="field"><label>Colors (comma separated)</label><input class="input" id="pfColors" value="${escapeHtml(p ? (p.colors || []).join(', ') : '')}" /></div>
          <div class="field"><label>Sizes (comma separated)</label><input class="input" id="pfSizes" value="${escapeHtml(p ? (p.sizes || []).join(', ') : '')}" /></div>
        </div>
        <div class="field"><label>Cover image URL</label><input class="input" id="pfImage" value="${escapeHtml(img)}" /></div>
        <div class="field"><label>Description</label><textarea class="input" id="pfDesc" rows="3">${escapeHtml(p ? p.description : '')}</textarea></div>
        <div class="row">
          <div class="field"><label>Rating</label><input class="input" type="number" step="0.1" min="0" max="5" id="pfRating" value="${p ? p.rating : 4.5}" /></div>
          <div class="field"><label>Review count</label><input class="input" type="number" id="pfReviews" value="${p ? p.reviewsCount || 0 : 0}" /></div>
          <label class="check admin-check"><input type="checkbox" id="pfFeatured" ${p && p.featured ? 'checked' : ''}><span>Featured</span></label>
        </div>
        <p class="form-msg" data-msg hidden></p>
        <div class="admin-form__actions">
          <button class="btn btn--link" type="button" id="pfCancel">Cancel</button>
          <button class="btn btn--primary" type="submit">${isEdit ? 'Save changes' : 'Create product'}</button>
        </div>
      </form>`;
  }

  function productsView(products) {
    return `
      <div class="admin-bar">
        <button class="btn btn--primary btn--sm" id="adminAddProduct">+ Add product</button>
        <span class="admin-count">${products.length} products</span>
      </div>
      <div id="adminProductFormWrap"></div>
      <div class="admin-list card">
        ${products.length ? `<table class="admin-table">
          <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th>Feat.</th><th></th></tr></thead>
          <tbody>${products.map((p) => `
            <tr>
              <td><img class="admin-thumb" src="${escapeHtml((p.images || [])[0] || '')}" onerror="this.style.display='none'" alt="" /><strong>${escapeHtml(p.name)}</strong><span class="admin-sub">${escapeHtml(p.id)}</span></td>
              <td>${escapeHtml((window.getCategory && getCategory(p.category) || {}).name || p.category)}</td>
              <td>${money(p.price)}</td>
              <td>${p.stock}</td>
              <td>${p.rating.toFixed(1)}</td>
              <td>${p.featured ? '✓' : ''}</td>
              <td class="admin-actions">
                <button class="btn btn--link btn--sm" data-edit="${escapeHtml(p.id)}">Edit</button>
                <button class="btn btn--danger btn--sm" data-delete="${escapeHtml(p.id)}">Delete</button>
              </td>
            </tr>`).join('')}</tbody>
        </table>` : '<p class="admin-empty">No products yet.</p>'}
      </div>`;
  }

  function ordersView(orders) {
    return `
      <div class="admin-bar"><span class="admin-count">${orders.length} orders</span></div>
      <div class="admin-list card">
        ${orders.length ? `<table class="admin-table">
          <thead><tr><th>#</th><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Promo</th><th>Status</th></tr></thead>
          <tbody>${orders.map((o) => `
            <tr>
              <td><strong>${escapeHtml(o.id)}</strong></td>
              <td>${escapeHtml((o.date || '').slice(0, 16).replace('T', ' '))}</td>
              <td>${escapeHtml(o.name)}<span class="admin-sub">${escapeHtml(o.email)}</span></td>
              <td>${o.itemCount}</td>
              <td>${money(o.totals.total)}</td>
              <td>${escapeHtml(o.promoCode || '—')}</td>
              <td>
                <select class="input status-select" data-order="${escapeHtml(o.id)}">
                  ${['Processing', 'Shipped', 'Delivered', 'Cancelled'].map((s) => `<option ${s === o.status ? 'selected' : ''}>${s}</option>`).join('')}
                </select>
              </td>
            </tr>`).join('')}</tbody>
        </table>` : '<p class="admin-empty">No orders yet.</p>'}
      </div>`;
  }

  function promosView(promos) {
    return `
      <form class="admin-form card" id="adminPromoForm" novalidate>
        <h3>New promo code</h3>
        <div class="row">
          <div class="field"><label>Code</label><input class="input" id="promoCode" placeholder="e.g. SUMMER25" /></div>
          <div class="field"><label>Type</label><select class="input" id="promoType"><option value="percent">Percent off</option><option value="free_shipping">Free shipping</option></select></div>
          <div class="field"><label>Percent</label><input class="input" type="number" min="1" max="100" id="promoValue" value="10" /></div>
        </div>
        <p class="form-msg" data-msg hidden></p>
        <div class="admin-form__actions"><button class="btn btn--primary" type="submit">Create</button></div>
      </form>
      <div class="admin-list card">
        ${promos.length ? `<table class="admin-table">
          <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Status</th><th></th></tr></thead>
          <tbody>${promos.map((p) => `
            <tr>
              <td><strong>${escapeHtml(p.code)}</strong></td>
              <td>${escLbl(p.type)}</td>
              <td>${p.type === 'free_shipping' ? '—' : Math.round(p.value * 100) + '%'}</td>
              <td><span class="pill ${p.active ? 'pill--green' : 'pill--grey'}">${p.active ? 'Active' : 'Disabled'}</span></td>
              <td class="admin-actions">
                <button class="btn btn--link btn--sm" data-promo="${escapeHtml(p.code)}">${p.active ? 'Disable' : 'Enable'}</button>
                <button class="btn btn--danger btn--sm" data-delpromo="${escapeHtml(p.code)}">Delete</button>
              </td>
            </tr>`).join('')}</tbody>
        </table>` : '<p class="admin-empty">No promo codes yet.</p>'}
      </div>`;
  }

  function usersView(users) {
    return `
      <div class="admin-bar"><span class="admin-count">${users.length} customers</span></div>
      <div class="admin-list card">
        ${users.length ? `<table class="admin-table">
          <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Orders</th><th>Spent</th><th>Status</th></tr></thead>
          <tbody>${users.map((u) => `
            <tr>
              <td>${u.id}</td>
              <td>${escapeHtml(u.name)}</td>
              <td>${escapeHtml(u.email)}</td>
              <td>${u.orderCount}</td>
              <td>${money(u.spent)}</td>
              <td><button class="btn btn--link btn--sm" data-user="${u.id}">${u.disabled ? 'Enable' : 'Disable'}</button></td>
            </tr>`).join('')}</tbody>
        </table>` : '<p class="admin-empty">No customers yet.</p>'}
      </div>`;
  }

  function escLbl(type) {
    if (type === 'free_shipping') return 'Free shipping';
    if (type === 'percent') return 'Percent off';
    return escapeHtml(type);
  }

  /* ---------------------------- workspace wiring ---------------------------- */

  function bindWorkspace(tab) {
    if (tab === 'products') {
      $('#adminAddProduct')?.addEventListener('click', () => {
        editingProduct = null;
        $('#adminProductFormWrap').innerHTML = productForm(null);
        bindProductForm();
      });
      $$('[data-edit]').forEach((b) => b.addEventListener('click', () => {
        const pid = b.dataset.edit;
        const p = window.ADMIN_PRODUCTS?.find((x) => x.id === pid);
        if (!p) return;
        editingProduct = p;
        $('#adminProductFormWrap').innerHTML = productForm(p);
        bindProductForm();
      }));
      $$('[data-delete]').forEach((b) => b.addEventListener('click', async () => {
        const pid = b.dataset.delete;
        try {
          await API.del('/api/admin/products/' + encodeURIComponent(pid));
          toast(`Deleted ${pid}.`, 'success');
          loadTab('products');
        } catch (err) {
          toast(err.message, 'error');
        }
      }));
    } else if (tab === 'orders') {
      $$('.status-select').forEach((sel) => sel.addEventListener('change', async () => {
        const btn = sel;
        const id = btn.dataset.order;
        try {
          await API.patch('/api/admin/orders/' + encodeURIComponent(id), { status: btn.value });
          toast(`Order ${id} → ${btn.value}.`, 'success');
        } catch (err) {
          toast(err.message, 'error');
        }
      }));
    } else if (tab === 'promos') {
      const form = $('#adminPromoForm');
      form?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = form.querySelector('[data-msg]');
        msg.hidden = false;
        try {
          await API.post('/api/admin/promos', {
            code: $('#promoCode').value,
            type: $('#promoType').value,
            value: Number($('#promoValue').value || 0),
          });
          msg.hidden = true;
          form.reset();
          toast('Promo created.', 'success');
          loadTab('promos');
        } catch (err) {
          msg.textContent = err.message || 'Failed to create promo.';
        }
      });
      $$('[data-promo]').forEach((b) => b.addEventListener('click', async () => {
        const code = b.dataset.promo;
        const target = !b.textContent.startsWith('Disable');
        try {
          await API.patch('/api/admin/promos/' + encodeURIComponent(code), { active: target });
          toast(`${code} ${target ? 'enabled' : 'disabled'}.`, 'success');
          loadTab('promos');
        } catch (err) { toast(err.message, 'error'); }
      }));
      $$('[data-delpromo]').forEach((b) => b.addEventListener('click', async () => {
        const code = b.dataset.delpromo;
        try {
          await API.del('/api/admin/promos/' + encodeURIComponent(code));
          toast(`Deleted ${code}.`, 'success');
          loadTab('promos');
        } catch (err) { toast(err.message, 'error'); }
      }));
    } else if (tab === 'users') {
      $$('[data-user]').forEach((b) => b.addEventListener('click', async () => {
        const id = Number(b.dataset.user);
        const disabling = b.textContent === 'Disable';
        try {
          await API.patch('/api/admin/users/' + id, { disabled: disabling });
          loadTab('users');
        } catch (err) { toast(err.message, 'error'); }
      }));
    }
  }

  function bindProductForm() {
    const form = $('#adminProductForm');
    if (!form) return;
    $('#pfCancel')?.addEventListener('click', () => {
      editingProduct = null;
      $('#adminProductFormWrap').innerHTML = '';
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = form.querySelector('[data-msg]');
      msg.hidden = false;
      const payload = {
        name: $('#pfName').value.trim(),
        category: $('#pfCat').value,
        brand: $('#pfBrand').value.trim(),
        price: Number($('#pfPrice').value),
        oldPrice: $('#pfOldPrice').value ? Number($('#pfOldPrice').value) : null,
        stock: Math.floor(Number($('#pfStock').value || 0)),
        tag: $('#pfTag').value || null,
        colors: $('#pfColors').value.split(',').map((s) => s.trim()).filter(Boolean),
        sizes: $('#pfSizes').value.split(',').map((s) => s.trim()).filter(Boolean),
        description: $('#pfDesc').value.trim(),
        rating: Number($('#pfRating').value || 0),
        reviewsCount: Math.floor(Number($('#pfReviews').value || 0)),
        featured: $('#pfFeatured').checked,
        images: $('#pfImage').value.trim() ? [$('#pfImage').value.trim()] : [],
      };
      try {
        if (editingProduct) {
          await API.put('/api/admin/products/' + encodeURIComponent(editingProduct.id), payload);
          toast('Product updated.', 'success');
        } else {
          payload.id = $('#pfId').value.trim();
          await API.post('/api/admin/products', payload);
          toast('Product created.', 'success');
        }
        editingProduct = null;
        loadTab('products');
      } catch (err) {
        msg.textContent = err.message || 'Save failed.';
      }
    });
  }

  return { view, mount, check, isAuthed, refreshNav };
})();
window.Admin = Admin;