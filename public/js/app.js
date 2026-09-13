/* ============================================================
   KIDAMEgebeya — Router + page views + interactions
   ============================================================ */

(() => {
  'use strict';

  const app = $('#app');
  const mainNav = $('#mainNav');
  const menuToggle = $('#menuToggle');
  const searchOverlay = $('#searchOverlay');
  const searchToggle = $('#searchToggle');
  const searchForm = $('#searchForm');
  const searchInput = $('#searchInput');
  const searchSuggestions = $('#searchSuggestions');

  let currentMount = () => {};
  let pendingVerifyEmail = null;
  let pendingVerifyLink = null;
  let verifyOtp = null;                       // { email, sent, devOtp }
  let forgotOtp = { mode: 'link', email: '', sent: false, devOtp: null };

  /* ============================================================
     Shared bits
     ============================================================ */

  function starsBlock(r) {
    return `<span class="stars-wrap">${ratingStars(r, 14)}<span class="stars-avg">${r.toFixed(1)}</span></span>`;
  }

  function priceBlock(p) {
    const d = discountPct(p.price, p.oldPrice);
    let html = `<span class="price">${money(p.price)}</span>`;
    if (p.oldPrice) html += ` <span class="price-old">${money(p.oldPrice)}</span>`;
    if (d) html += ` <span class="price-save">-${d}%</span>`;
    return html;
  }

  function tagBadge(tag) {
    const map = { new: 'New', bestseller: 'Best seller', deal: 'Sale' };
    return map[tag] ? `<span class="badge badge--tag badge--${tag}">${map[tag]}</span>` : '';
  }

  function productCard(p) {
    const inWish = Store.isWishlisted(p.id);
    return `
    <article class="card product-card" data-id="${p.id}">
      <div class="card__media">
        <a href="#/product/${p.id}" aria-label="${escapeHtml(p.name)}">
          ${imgTag(p.image = p.images[0], p.name, 'card__img')}
        </a>
        <div class="card__badges">
          ${tagBadge(p.tag)}
          ${discountPct(p.price, p.oldPrice) ? `<span class="badge badge--discount">-${discountPct(p.price, p.oldPrice)}%</span>` : ''}
        </div>
        <div class="card__actions">
          <button class="icon-btn btn-wish" data-action="wishlist" data-id="${p.id}" data-on="1"
            aria-label="${inWish ? 'Remove from wishlist' : 'Add to wishlist'}"
            title="${inWish ? 'Remove from wishlist' : 'Add to wishlist'}">${inWish ? I.heartFill : I.heart}</button>
          <button class="btn btn--dark btn--sm btn-add" data-action="add" data-id="${p.id}"
            ${p.stock <= 0 ? 'disabled' : ''}>
            ${I.cart}<span>${p.stock <= 0 ? 'Sold out' : 'Add to Cart'}</span>
          </button>
        </div>
        ${p.stock <= 0 ? '<div class="out-stock">Out of stock</div>' : ''}
      </div>
      <div class="card__body">
        <div class="card__meta"><span>${escapeHtml(getCategory(p.category)?.name || p.category)}</span> · <span>${escapeHtml(p.brand || 'KIDAMEgebeya')}</span></div>
        <a class="card__title" href="#/product/${p.id}">${escapeHtml(p.name)}</a>
        <div class="card__rating">${starsBlock(p.rating)}<span class="stars-count">${p.reviewsCount.toLocaleString()} reviews</span></div>
        <div class="card__footer">
          <div class="card__price">${priceBlock(p)}</div>
        </div>
      </div>
    </article>`;
  }

  function categoryCard(c) {
    const count = PRODUCTS.filter((p) => p.category === c.id).length;
    return `
    <a class="card cat-card" href="#/shop?cat=${c.id}">
      <div class="cat-card__media">${imgTag(c.image, c.name, 'cat-card__img')}
        <div class="cat-card__overlay"></div>
      </div>
      <div class="cat-card__body">
        <h3>${escapeHtml(c.name)}</h3>
        <p>${escapeHtml(c.tagline)}</p>
        <span class="cat-card__cta">Shop now ${I.arrow}</span>
      </div>
    </a>`;
  }

  function sectionHeader(title, sub, link, linkLabel = 'View all') {
    return `
    <div class="section-head">
      <div>
        <h2 class="section-title">${title}</h2>
        ${sub ? `<p class="section-sub">${sub}</p>` : ''}
      </div>
      ${link ? `<a class="link-arrow" href="${link}">${linkLabel} ${I.arrow}</a>` : ''}
    </div>`;
  }

  function emptyState(title, sub, cta = null) {
    return `
    <div class="empty-state">
      <div class="empty-state__icon">${I.box}</div>
      <h3>${title}</h3>
      <p>${sub}</p>
      ${cta ? `<a class="btn btn--primary" href="${cta.href}">${cta.label}</a>` : ''}
    </div>`;
  }

  function breadcrumbs(items) {
    return `<nav class="breadcrumbs" aria-label="Breadcrumb">${items.map((it, i) =>
      it.href
        ? `<a href="${it.href}">${it.label}</a>`
        : `<span aria-current="page">${it.label}</span>`
    ).join('<span class="sep">/</span>')}</nav>`;
  }

  /* ============================================================
     HOME
     ============================================================ */

  function viewHome() {
    document.title = 'KIDAMEgebeya — Premium Online Store';
    const featured = PRODUCTS.filter((p) => p.featured).slice(0, 8);
    const sale = PRODUCTS.filter((p) => p.oldPrice).slice(0, 4);
    const heroSrc = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80&auto=format&fit=crop';
    const promo1 = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80&auto=format&fit=crop';
    const promo2 = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&q=80&auto=format&fit=crop';
    const promo3 = 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=1200&q=80&auto=format&fit=crop';

    return `
    <section class="hero">
      <div class="hero__bg">${imgTag(heroSrc, '', 'hero__img', 'KIDAMEgebeya store')}
        <div class="hero__shade"></div>
      </div>
      <div class="container hero__content">
        <span class="eyebrow">New season · New drops</span>
        <h1>Elevate your everyday.<br><span class="accent">Premium. Curated. Yours.</span></h1>
        <p>Discover thoughtfully designed products — from studio-grade audio to timeless fashion — curated by our team and delivered to your door in days.</p>
        <div class="hero__cta">
          <a class="btn btn--primary btn--lg" href="#/shop">Shop the collection</a>
          <a class="btn btn--ghost btn--lg" href="#/categories">Explore categories</a>
        </div>
        <div class="hero__trust">
          <span>${I.truck} Free shipping over $75</span>
          <span>${I.shield} 30-day returns</span>
          <span>${I.star} 4.9 / 5 from 12k+ reviews</span>
        </div>
      </div>
      <div class="hero__cards container">
        <div class="hero-card hero-card--primary">
          <span class="hero-card__icon">${I.gift}</span>
          <div><strong>Welcome 10% off</strong><span>Use code WELCOME10 at checkout</span></div>
        </div>
        <div class="hero-card">
          <span class="hero-card__icon">${I.truck}</span>
          <div><strong>Fast, tracked delivery</strong><span>In 2–5 business days</span></div>
        </div>
        <div class="hero-card">
          <span class="hero-card__icon">${I.refresh}</span>
          <div><strong>Easy 30-day returns</strong><span>No questions asked</span></div>
        </div>
      </div>
    </section>

    <section class="container brands-strip" aria-label="Featured brands">
      <div class="brands-strip__inner">
        ${['KIDAMEgebeya Audio', 'KIDAMEgebeya Studio', 'Vertex', 'KIDAMEgebeya Living', 'KIDAMEgebeya Fit', 'KIDAMEgebeya Maison'].map(b => `<span>${b}</span>`).join('')}
      </div>
    </section>

    <section class="container section" id="home-categories">
      ${sectionHeader('Shop by category', 'Six ways to upgrade your everyday.', '#/categories')}
      <div class="grid grid--cats">
        ${CATEGORIES.slice(0, 6).map(categoryCard).join('')}
      </div>
    </section>

    <section class="container section" id="home-products">
      <div class="section-head">
        <div>
          <h2 class="section-title">Trending now</h2>
          <p class="section-sub">Hand-picked favourites from across the store.</p>
        </div>
        <div class="tabs" role="tablist">
          <button class="tab is-active" data-tab="featured">Featured</button>
          <button class="tab" data-tab="new">New in</button>
          <button class="tab" data-tab="sale">On sale</button>
        </div>
      </div>
      <div class="grid grid--products" id="trendingGrid">
        ${featured.map(productCard).join('')}
      </div>
    </section>

    <section class="container section">
      <div class="banner promo promo--split">
        <div class="promo__media">${imgTag(promo1, '', 'promo__img', 'Sneaker')}</div>
        <div class="promo__body">
          <span class="eyebrow">Limited offer</span>
          <h2>Up to 30% off<br>active essentials</h2>
          <p>Velocity runners, trail tees and training gear — refreshed for the new season.</p>
          <a class="btn btn--light" href="#/shop?cat=sports">Shop the sale ${I.arrow}</a>
        </div>
      </div>
    </section>

    <section class="section section--dark">
      <div class="container grid grid--promos">
        <div class="banner promo promo--tall">
          <div class="promo__media">${imgTag(promo2, '', 'promo__img', 'Backpack')}</div>
          <div class="promo__body">
            <span class="eyebrow">New arrivals</span>
            <h3>Weekend-ready carry</h3>
            <p>Travel bags &amp; tote bags built for real life.</p>
            <a class="link-arrow link-arrow--light" href="#/shop?tag=new">Discover ${I.arrow}</a>
          </div>
        </div>
        <div class="banner promo promo--tall">
          <div class="promo__media">${imgTag(promo3, '', 'promo__img', 'Leather bag')}</div>
          <div class="promo__body">
            <span class="eyebrow">Bestsellers</span>
            <h3>Loved by thousands</h3>
            <p>The products customers keep coming back for.</p>
            <a class="link-arrow link-arrow--light" href="#/shop?tag=bestseller">Shop bestsellers ${I.arrow}</a>
          </div>
        </div>
        <div class="banner promo promo--tall">
          <div class="promo__media">${imgTag('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80&auto=format&fit=crop', '', 'promo__img', 'Headphones')}</div>
          <div class="promo__body">
            <span class="eyebrow">Audio week</span>
            <h3>Sound for every room</h3>
            <p>Headphones, earbuds &amp; speakers on sale.</p>
            <a class="link-arrow link-arrow--light" href="#/shop?cat=electronics">Explore audio ${I.arrow}</a>
          </div>
        </div>
      </div>
    </section>

    <section class="container section" id="home-testimonials">
      ${sectionHeader('Loved by customers', 'Real words from verified buyers.', '')}
      <div class="grid grid--testimonials">
        ${TESTIMONIALS.slice(0, 3).map((t) => `
        <div class="card testi">
          <div class="testi__stars">${ratingStars(t.rating, 16)}</div>
          <p class="testi__quote">“${escapeHtml(t.quote)}”</p>
          <div class="testi__author">
            ${imgTag(t.avatar, t.name, 'testi__avatar')}
            <div><strong>${escapeHtml(t.name)}</strong><span>${escapeHtml(t.role)}</span></div>
          </div>
        </div>`).join('')}
      </div>
    </section>
    `;
  }

  function mountHome() {
    const grid = $('#trendingGrid');
    $$('.tab', grid.parentElement).forEach((tab) => {
      tab.addEventListener('click', () => {
        $$('.tab', tab.parentElement).forEach((t) => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        const key = tab.dataset.tab;
        const list = key === 'featured' ? PRODUCTS.filter((p) => p.featured)
          : key === 'new' ? PRODUCTS.filter((p) => p.tag === 'new' || p.featured).slice(0, 8)
          : PRODUCTS.filter((p) => p.oldPrice);
        grid.innerHTML = list.slice(0, 8).map(productCard).join('');
      });
    });
  }

  /* ============================================================
     CATEGORIES
     ============================================================ */

  function viewCategories() {
    document.title = 'Categories — KIDAMEgebeya';
    return `
    <div class="page-head container">
      ${breadcrumbs([{ label: 'Home', href: '#/home' }, { label: 'Categories' }])}
      <h1>Shop by category</h1>
      <p>Explore six curated collections, each stocked with the very best in its class.</p>
    </div>
    <section class="container section section--top">
      <div class="grid grid--cats grid--cats-lg">
        ${CATEGORIES.map((c) => categoryCard(c)).join('')}
      </div>
    </section>
    <section class="container section">
      <div class="banner promo promo--cta">
        <div class="promo__body">
          <span class="eyebrow">Can't decide?</span>
          <h2>Shop everything, one place</h2>
          <p>Browse our complete catalogue with powerful filters and instant shipping.</p>
        </div>
        <a class="btn btn--primary btn--lg" href="#/shop">Browse all products ${I.arrow}</a>
      </div>
    </section>`;
  }

  /* ============================================================
     SHOP (catalog + filters + sorting + search)
     ============================================================ */

  function viewShop() {
    document.title = 'Shop — KIDAMEgebeya';
    const q = parseQuery(location.hash);
    const grid = filterProducts(q);
    const sortLabels = {
      featured: 'Featured',
      'price-asc': 'Price: Low to High',
      'price-desc': 'Price: High to Low',
      rating: 'Top rated',
      name: 'Name A–Z',
    };
    const selectedCats = q.cat ? q.cat.split(',') : [];

    return `
    <div class="page-head container">
      ${breadcrumbs([{ label: 'Home', href: '#/home' }, { label: 'Shop' }])}
      <h1>${q.q ? `Results for “${escapeHtml(q.q)}”` : q.tag ? `Shop — ${({ new: 'New Arrivals', bestseller: 'Best Sellers', deal: 'Special Offers' })[q.tag] || q.tag}` : 'All products'}</h1>
      <p>${grid.length} ${pluralize(grid.length, 'product')} · Free shipping over $75</p>
    </div>

    <div class="container shop">
      <aside class="filters" id="filters">
        <div class="filters__head">
          <h3>Filters</h3>
          <button class="btn--link" id="clearFilters">Clear all</button>
        </div>

        <div class="filter">
          <h4>Category</h4>
          <div class="filter__options">
            ${CATEGORIES.map((c) => {
              const checked = selectedCats.includes(c.id);
              return `<label class="check"><input type="checkbox" name="cat" value="${c.id}" ${checked ? 'checked' : ''}><span>${escapeHtml(c.name)}</span><em>${PRODUCTS.filter((p) => p.category === c.id).length}</em></label>`;
            }).join('')}
          </div>
        </div>

        <div class="filter">
          <h4>Price</h4>
          <div class="range-row">
            <label class="input input--sm">$
              <input id="priceMin" type="number" min="0" placeholder="Min" value="${q.min || ''}" />
            </label>
            <span class="range-sep">—</span>
            <label class="input input--sm">$
              <input id="priceMax" type="number" min="0" placeholder="Max" value="${q.max || ''}" />
            </label>
          </div>
          <label class="check check--stock"><input type="checkbox" id="inStock" ${q.stock === '1' ? 'checked' : ''}><span>In stock only</span></label>
        </div>

        <div class="filter">
          <h4>Minimum rating</h4>
          <div class="filter__options">
            ${[0, 4, 4.5].map((r) => {
              const id = 'rate' + r;
              return `<label class="check"><input type="radio" name="rating" value="${r}" ${Number(q.rating || 0) === r ? 'checked' : ''} id="${id}"><span>${r === 0 ? 'Any rating' : '★ ' + r + ' & up'}</span></label>`;
            }).join('')}
          </div>
        </div>

        <div class="filter">
          <h4>Sort by</h4>
          <select class="select" id="sortSelect">
            ${Object.entries(sortLabels).map(([k, v]) => `<option value="${k}" ${(q.sort || 'featured') === k ? 'selected' : ''}>${v}</option>`).join('')}
          </select>
        </div>
      </aside>

      <div class="shop__main">
        <div class="shop__toolbar">
          <form class="search-bar search-bar--shop" id="shopSearch">
            ${I.search}
            <input type="search" id="shopSearchInput" placeholder="Search ${
              q.tag === 'deal' ? 'the deals' : q.cat ? getCategory(q.cat)?.name.toLowerCase() : 'products'
            }…" value="${escapeHtml(q.q || '')}" />
            ${q.q ? `<button type="button" class="search-clear" data-action="shop-clear" aria-label="Clear search">×</button>` : ''}
          </form>
          <button class="icon-btn icon-btn--bordered filter-toggle" id="filterToggle" aria-label="Toggle filters">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54z"></path></svg>
            Filters
            ${selectedCats.length || q.min || q.max || q.rating || q.stock ? '<span class="filter-count"></span>' : ''}
          </button>
        </div>

        <div class="shop__results">
          <div class="grid grid--products" id="shopGrid">
            ${grid.length ? grid.map(productCard).join('') : emptyState('No products match', 'Try adjusting your filters or search terms.', { href: '#/shop', label: 'Reset filters' })}
          </div>
        </div>
      </div>
    </div>`;
  }

  function filterProducts(q) {
    let list = [...PRODUCTS];
    if (q.q) {
      const term = q.q.trim().toLowerCase();
      list = list.filter((p) =>
        [p.name, p.brand, getCategory(p.category)?.name, p.category]
          .join(' ').toLowerCase().includes(term));
    }
    if (q.tag) list = list.filter((p) => p.tag === q.tag);
    if (q.cat) {
      const cats = q.cat.split(',');
      list = list.filter((p) => cats.includes(p.category));
    }
    if (q.min !== undefined && q.min !== '') list = list.filter((p) => p.price >= Number(q.min));
    if (q.max !== undefined && q.max !== '') list = list.filter((p) => p.price <= Number(q.max));
    if (q.rating !== undefined && q.rating !== '') list = list.filter((p) => p.rating >= Number(q.rating));
    if (q.stock === '1') list = list.filter((p) => p.stock > 0);
    if (q.max && q.max > 0 && q.min && Number(q.min) > Number(q.max)) list = [];
    if (q.sort === 'price-asc') list.sort((a, b) => a.price - b.price);
    else if (q.sort === 'price-desc') list.sort((a, b) => b.price - a.price);
    else if (q.sort === 'rating') list.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount);
    else if (q.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    else list.sort((a, b) => (!!b.featured) - (!!a.featured) || b.reviewsCount - a.reviewsCount);
    return list;
  }

  function mountShop() {
    const base = '#/shop';
    const setParam = (key, val) => {
      location.hash = setQueryParam(base, key, val);
    };

    $$('input[name="cat"]').forEach((cb) => {
      cb.addEventListener('change', () => {
        const cats = $$('input[name="cat"]').filter((c) => c.checked).map((c) => c.value);
        setParam('cat', cats.join(','));
      });
    });

    $('#priceMin').addEventListener('change', (e) => setParam('min', e.target.value));
    $('#priceMax').addEventListener('change', (e) => setParam('max', e.target.value));
    $('#inStock').addEventListener('change', (e) => setParam('stock', e.target.checked ? '1' : ''));
    $$('input[name="rating"]').forEach((r) =>
      r.addEventListener('change', () => setParam('rating', r.value === '0' ? '' : r.value)));
    $('#sortSelect').addEventListener('change', (e) => setParam('sort', e.target.value));
    $('#clearFilters').addEventListener('click', () => {
      location.hash = base;
    });

    const shopSearch = $('#shopSearch');
    const input = $('#shopSearchInput');
    input.addEventListener('input', debounce(() => {
      setParam('q', input.value.trim());
    }, 300));
    shopSearch.addEventListener('submit', (e) => {
      e.preventDefault();
      setParam('q', input.value.trim());
    });

    const toggleFilters = () => {
      document.body.classList.toggle('filters-open');
    };
    $('#filterToggle').addEventListener('click', toggleFilters);
  }

  /* ============================================================
     PRODUCT DETAIL
     ============================================================ */

  function viewProduct(id) {
    const p = getProduct(id);
    if (!p) return viewNotFound('Product not found');
    document.title = `${p.name} — KIDAMEgebeya`;
    const reviews = generateReviews(p, 5).concat(userReviewsFor(p.id));
    const cat = getCategory(p.category);
    const inWish = Store.isWishlisted(p.id);
    const gallery = p.images.map((src, i) => `
      <button class="thumb ${i === 0 ? 'is-active' : ''}" data-action="set-image" data-src="${escapeHtml(src)}" aria-label="Product photo ${i + 1}">
        ${imgTag(src, `${p.name} photo ${i + 1}`, 'thumb__img')}
      </button>`).join('');

    const dist = [5, 4, 3, 2, 1].map((star) => {
      const count = Math.round(p.reviewsCount * (star >= Math.round(p.rating) ? 0.6 : 0.1));
      return { star, count };
    });
    const maxCount = Math.max(...dist.map((d) => d.count));

    return `
    <div class="container section section--top">
      ${breadcrumbs([{ label: 'Home', href: '#/home' }, { label: cat.name, href: '#/shop?cat=' + cat.id }, { label: p.name }])}

      <div class="product">
        <div class="product__gallery">
          <div class="gallery-main relative">
            ${imgTag(p.images[0], p.name, 'gallery-main__img', p.name)}
            <div class="card__badges gallery-badges">
              ${tagBadge(p.tag)}
              ${discountPct(p.price, p.oldPrice) ? `<span class="badge badge--discount">Save ${money(p.oldPrice - p.price)}</span>` : ''}
            </div>
            <button class="gallery-nav gallery-nav--prev" data-action="gallery-prev" aria-label="Previous image">‹</button>
            <button class="gallery-nav gallery-nav--next" data-action="gallery-next" aria-label="Next image">›</button>
          </div>
          <div class="gallery-thumbs">${gallery}</div>
        </div>

        <div class="product__info">
          <div class="product__brand">${escapeHtml(p.brand)}</div>
          <h1 class="product__title">${escapeHtml(p.name)}</h1>
          <div class="product__rating">
            ${starsBlock(p.rating)}
            <a class="link" href="#reviews">${p.reviewsCount.toLocaleString()} reviews</a>
          </div>

          <div class="product__price">${priceBlock(p)}</div>
          <p class="product__tax">Free shipping over ${money(Store.FREE_SHIPPING_THRESHOLD)} · 30-day returns · 2-year warranty</p>

          <div class="product__desc">${escapeHtml(p.description)}</div>

          <div class="product__select">
            ${p.colors && p.colors.length ? `
              <div class="opt">
                <div class="opt__label">Color <span id="colorLabel">${escapeHtml(p.colors[0])}</span></div>
                <div class="swatches">
                  ${p.colors.map((c, i) => {
                    const hue = swatchHue(c);
                    return `<button class="swatch ${i === 0 ? 'is-active' : ''}" data-attr="color" data-value="${escapeHtml(c)}" title="${escapeHtml(c)}" style="--sw:${hue}"></button>`;
                  }).join('')}
                </div>
              </div>` : ''}

            ${p.sizes && p.sizes.length ? `
              <div class="opt">
                <div class="opt__label">Size <a class="link link--sm" href="#" data-attr-action="size-guide">Size guide</a></div>
                <div class="size-picker">
                  ${p.sizes.map((s, i) => `<button class="size ${i === 0 ? 'is-active' : ''}" data-attr="size" data-value="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join('')}
                </div>
              </div>` : ''}
          </div>

          <div class="product__stock">
            ${p.stock > 0
              ? `<span class="in-line"><span class="dot dot--ok"></span> In stock — ${p.stock} available</span>`
              : `<span class="in-line in-line--bad"><span class="dot dot--bad"></span> Currently out of stock</span>`}
          </div>

          <div class="product__purchase">
            <div class="qty">
              <button class="qty__btn" data-action="qty-down" aria-label="Decrease quantity">${I.minus}</button>
              <input class="qty__val" data-action="qty-input" id="pQty" type="number" value="1" min="1" max="${Math.max(1, p.stock)}" aria-label="Quantity" />
              <button class="qty__btn" data-action="qty-up" aria-label="Increase quantity">${I.plus}</button>
            </div>
            <button class="btn btn--dark btn--lg product__add" data-action="add" data-id="${p.id}" data-qty-source="pQty" ${p.stock <= 0 ? 'disabled' : ''}>
              ${I.cart} Add to cart
            </button>
            <button class="btn btn--primary btn--lg product__buy" data-action="buy-now" data-id="${p.id}" data-qty-source="pQty" ${p.stock <= 0 ? 'disabled' : ''}>
              Buy now ${I.arrow}
            </button>
            <button class="icon-btn icon-btn--bordered product__wish" data-action="wishlist" data-id="${p.id}" data-on="1"
              aria-label="${inWish ? 'Remove from wishlist' : 'Add to wishlist'}">${inWish ? I.heartFill : I.heart}</button>
          </div>

          <div class="perks">
            <div class="perk">${I.truck}<span><strong>Free delivery</strong>${money(Store.FREE_SHIPPING_THRESHOLD)}+</span></div>
            <div class="perk">${I.refresh}<span><strong>30-day returns</strong>easy &amp; free</span></div>
            <div class="perk">${I.shield}<span><strong>2-year warranty</strong>included</span></div>
          </div>
        </div>
      </div>

      <div class="product__tabs" id="reviews">
        <div class="tabs">
          <button class="tab is-active" data-ptab="description">Description</button>
          <button class="tab" data-ptab="specs">Specifications</button>
          <button class="tab" data-ptab="reviews">Reviews <em>(${reviews.length})</em></button>
        </div>

        <div class="product-tabs__panes">
          <div class="pane is-active" data-pane="description">
            <p class="pane__text">${escapeHtml(p.description)}</p>
            <p class="pane__text">Detailed check on every detail: materials are sourced responsibly, joints are reinforced, and each unit passes a 12-point QC inspection before it ships. We stand behind every product we sell — if it isn't right, we'll make it right.</p>
          </div>

          <div class="pane" data-pane="specs">
            <table class="specs">
              ${p.specs.map(([k, v]) => `<tr><th>${escapeHtml(k)}</th><td>${escapeHtml(v)}</td></tr>`).join('')}
              <tr><th>SKU</th><td>${p.id.toUpperCase()}-${p.colors?.length || 1}</td></tr>
              <tr><th>Warranty</th><td>2-year KIDAMEgebeya warranty</td></tr>
            </table>
          </div>

          <div class="pane" data-pane="reviews">
            <div class="reviews">
              <div class="reviews__summary">
                <div class="reviews__score">
                  <strong>${p.rating.toFixed(1)}</strong>
                  <span>${ratingStars(p.rating, 18)}</span>
                  <em>${p.reviewsCount.toLocaleString()} verified reviews</em>
                  <button class="btn btn--dark btn--sm" id="writeReviewBtn">Write a review</button>
                </div>
                <div class="reviews__bars">
                  ${dist.map((d) => `
                  <div class="bar">
                    <span class="bar__label">${d.star} ★</span>
                    <div class="bar__track"><div class="bar__fill" style="width:${maxCount ? (d.count / maxCount) * 100 : 0}%"></div></div>
                    <span class="bar__count">${d.count}</span>
                  </div>`).join('')}
                </div>
              </div>

              <form class="review-form" id="reviewForm" hidden novalidate>
                <h4>Write a review</h4>
                <div class="review-rate" id="reviewRate">
                  <span class="review-rate__stars">${[1, 2, 3, 4, 5].map((i) => `<button type="button" data-r="${i}" class="rate-btn">${I.star}</button>`).join('')}</span>
                  <span class="review-rate__label" id="rateLabel">Choose a rating</span>
                </div>
                <div class="field"><label>Your name</label><input type="text" id="rvName" placeholder="Jane Doe" /></div>
                <div class="field"><label>Review title</label><input type="text" id="rvTitle" placeholder="Summarize your experience" /></div>
                <div class="field"><label>Your review</label><textarea id="rvText" rows="4" placeholder="What did you like or dislike?"></textarea></div>
                <p class="form-msg" data-msg hidden></p>
                <div class="row row--end">
                  <button type="button" class="btn--link" id="reviewCancel">Cancel</button>
                  <button class="btn btn--primary" type="submit">Submit review</button>
                </div>
              </form>

              <div id="reviewList" class="reviews__list">
                ${reviews.map((r) => `
                <article class="review">
                  ${imgTag(r.avatar, r.author, 'review__avatar')}
                  <div>
                    <div class="review__head">
                      <strong>${escapeHtml(r.author)} ${r.verified ? '<span class="badge-verified">✓ Verified</span>' : ''}</strong>
                      <span class="review__date">${r.date}</span>
                    </div>
                    <div class="review__stars">${ratingStars(r.rating, 14)}</div>
                    <h4>${escapeHtml(r.title)}</h4>
                    <p>${escapeHtml(r.text)}</p>
                  </div>
                </article>`).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="section">
        ${sectionHeader('You may also like', 'Products customers viewed together.', '#/shop')}
        <div class="grid grid--products">
          ${relatedProducts(p, 4).map(productCard).join('')}
        </div>
      </div>
    </div>`;
  }

  const userReviewsStore = {};
  function userReviewsFor(id) { return userReviewsStore[id] || []; }

  function swatchHue(color) {
    const map = {
      black: '#1a1a1a', white: '#f7f7f7', 'midnight black': '#15181e', 'cloud white': '#f3f2ef',
      'sunset orange': '#ff6b4a', graphite: '#3a3a3e', silver: '#c7c9cd', 'rose gold': '#e8b4a4',
      'pearl white': '#f4f2ee', 'matte black': '#242424', 'midnight': '#1d2b3a', terracotta: '#c1683f',
      sage: '#9cae8f', cobalt: '#2a4fbf', sand: '#d9c4a8', 'natural oak': '#d8b98a', walnut: '#7a5230',
      'matte black': '#242424', brass: '#c5a15a', 'cloud white': '#f2f0ec', 'triple black': '#161616',
      bone: '#e7e0d5', oatmeal: '#dcccb8', charcoal: '#3c3f45', forest: '#3f5a45', 'wheat': '#e3d3ae',
      slate: '#5b6470', 'dark olive': '#4a5236', gold: '#c9a227', 'steel / blue': '#5b7fae',
      'steel / black': '#3c3c3c', 'midwash blue': '#6a8cbf', indigo: '#4a5d9e', 'washed black': '#3a3a3a',
      'arctic': '#e8f0f5', volt: '#d9f236', coral: '#ff7f66', 'warm + color': '#8a6bff',
      'oatmeal': '#dcccb8', 'heather grey': '#c9c9c9', 'tan': '#c19a6b', '50 ml': '#18181b',
    };
    return map[color.toLowerCase()] || '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
  }

  function mountProduct() {
    const main = $('.gallery-main__img');
    const thumbs = $$('.thumb');
    const galleryIdx = { i: 0, max: thumbs.length };
    let currentSrc = main?.src || '';

    function setImage(src, bindThumb = true) {
      main.src = src;
      currentSrc = src;
      thumbs.forEach((t, i) => t.classList.toggle('is-active', t.dataset.src === src || i === galleryIdx.i));
    }

    $$('[data-action="set-image"]').forEach((t) => {
      t.addEventListener('click', () => {
        galleryIdx.i = thumbs.indexOf(t);
        setImage(t.dataset.src);
      });
    });

    const step = (dir) => {
      if (!thumbs.length) return;
      galleryIdx.i = (galleryIdx.i + dir + thumbs.length) % thumbs.length;
      setImage(thumbs[galleryIdx.i].dataset.src);
    };
    $('[data-action="gallery-prev"]')?.addEventListener('click', () => step(-1));
    $('[data-action="gallery-next"]')?.addEventListener('click', () => step(1));

    /* attribute pickers */
    const colorLabel = $('#colorLabel');
    $$('[data-attr="color"]').forEach((b) => b.addEventListener('click', () => {
      $$('[data-attr="color"]').forEach((x) => x.classList.remove('is-active'));
      b.classList.add('is-active');
      if (colorLabel) colorLabel.textContent = b.dataset.value;
    }));
    $$('[data-attr="size"]').forEach((b) => b.addEventListener('click', () => {
      $$('[data-attr="size"]').forEach((x) => x.classList.remove('is-active'));
      b.classList.add('is-active');
    }));
    $('[data-attr-action="size-guide"]')?.addEventListener('click', (e) => {
      e.preventDefault();
      toast('Size guide: run true to size. See reviews for fit notes.', 'info');
    });

    /* product tabs */
    $$('[data-ptab]').forEach((tab) => {
      tab.addEventListener('click', () => {
        $$('[data-ptab]').forEach((t) => t.classList.remove('is-active'));
        tab.classList.add('is-active');
        $$('.product-tabs__panes .pane').forEach((p) => p.classList.toggle('is-active', p.dataset.pane === tab.dataset.ptab));
      });
    });

    /* reviews */
    let rating = 0;
    const rateStars = $$('.rate-btn');
    const rateLabel = $('#rateLabel');
    function paint(n) {
      rateStars.forEach((s, i) => s.classList.toggle('is-active', i < n));
      rateLabel.textContent = n ? `${n} / 5 — ${['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][n]}` : 'Choose a rating';
    }
    rateStars.forEach((s, i) => {
      s.addEventListener('mouseenter', () => rateStars.forEach((x, j) => x.classList.toggle('is-active', j <= i)));
    });
    $('#reviewRate').addEventListener('mouseleave', () => paint(rating));
    rateStars.forEach((s, i) => s.addEventListener('click', () => { rating = i + 1; paint(rating); }));

    const reviewForm = $('#reviewForm');
    const writeBtn = $('#writeReviewBtn');
    const cancelBtn = $('#reviewCancel');
    if (Nova.isLoggedIn()) {
      const rvName = $('#rvName');
      if (rvName && !rvName.value) rvName.value = (Nova.session() || {}).name || '';
    }
    writeBtn.addEventListener('click', () => { reviewForm.hidden = false; writeBtn.hidden = true; });
    cancelBtn.addEventListener('click', () => { reviewForm.hidden = true; writeBtn.hidden = false; });

    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = $('#rvName').value.trim();
      const title = $('#rvTitle').value.trim();
      const text = $('#rvText').value.trim();
      const msg = $('[data-msg]', reviewForm);
      msg.hidden = false;
      if (!rating) { msg.textContent = 'Please select a star rating.'; return; }
      if (!name) { msg.textContent = 'Please enter your name.'; return; }
      if (!title) { msg.textContent = 'Please add a short title.'; return; }
      if (!text) { msg.textContent = 'Please write a few words about your experience.'; return; }
      msg.hidden = true;
      const id = currentProductId(location.hash);
      const submittedRating = rating;
      const review = {
        author: name, avatar: '', rating: submittedRating, title, text,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        verified: false,
      };
      userReviewsStore[id] = [review, ...(userReviewsStore[id] || [])];
      const list = $('#reviewList');
      list.insertAdjacentHTML('afterbegin', reviewHtml(review));
      const count = $$('.tab[data-ptab="reviews"] em', app);
      if (count.length) count[0].textContent = `(${userReviewsStore[id].length})`;
      reviewForm.reset(); rating = 0; paint(0);
      reviewForm.hidden = true; writeBtn.hidden = false;
      toast('Thanks! Your review has been posted.', 'success');
      try {
        await API.post('/api/reviews', {
          productId: id, rating: submittedRating, title, body: text,
          authorName: Nova.isLoggedIn() ? undefined : name,
        });
      } catch { /* offline fallback — review already shown locally */ }
    });
  }

  function currentProductId(hash) {
    const m = hash.match(/^#\/product\/([^/?]+)/);
    return m ? decodeURIComponent(m[1]) : '';
  }

  function reviewHtml(r) {
    return `
    <article class="review">
      ${r.avatar ? imgTag(r.avatar, r.author, 'review__avatar') : `<span class="review__avatar review__avatar--init">${escapeHtml((r.author[0] || 'N').toUpperCase())}</span>`}
      <div>
        <div class="review__head"><strong>${escapeHtml(r.author)} ${r.verified ? '<span class="badge-verified">✓ Verified</span>' : ''}</strong><span class="review__date">${r.date}</span></div>
        <div class="review__stars">${ratingStars(r.rating, 14)}</div>
        <h4>${escapeHtml(r.title)}</h4>
        <p>${escapeHtml(r.text)}</p>
      </div>
    </article>`;
  }

  /* ============================================================
     CART
     ============================================================ */

  function viewCart() {
    document.title = 'Cart — KIDAMEgebeya';
    const items = Store.cartItems();
    if (!items.length) {
      return `
      <div class="container section section--top full-min">
        <div class="page-head"><h1>Your cart</h1></div>
        ${emptyState('Your cart is empty', 'Looks like you haven’t added anything yet. Explore the store to find something you’ll love.', { href: '#/shop', label: 'Start shopping' })}
      </div>`;
    }
    const t = storeTotalsFor(items);
    return `
    <div class="container section section--top full-min">
      <div class="page-head">
        <h1>Your cart <em class="count-pill">${items.length} ${pluralize(items.length, 'item')}</em></h1>
        <a class="link-arrow" href="#/shop">${I.arrow} Continue shopping</a>
      </div>
      <div class="cart">
        <div class="cart__items card">
          ${items.map(({ product, qty }) => `
          <div class="cart-item" data-id="${product.id}">
            <a class="cart-item__media" href="#/product/${product.id}">${imgTag(product.images[0], product.name, 'cart-item__img')}</a>
            <div class="cart-item__info">
              <a class="cart-item__name" href="#/product/${product.id}">${escapeHtml(product.name)}</a>
              <span class="cart-item__brand">${escapeHtml(product.brand)}</span>
              <div class="cart-item__price">${money(product.price)} ${product.oldPrice ? `<s>${money(product.oldPrice)}</s>` : ''}</div>
              <div class="cart-item__controls">
                <div class="qty qty--sm">
                  <button class="qty__btn" data-action="qty-down" data-cart-id="${product.id}" aria-label="Decrease">${I.minus}</button>
                  <input class="qty__val" data-action="qty-input" data-cart-id="${product.id}" type="number" value="${qty}" min="1" max="${product.stock}" aria-label="Quantity"/>
                  <button class="qty__btn" data-action="qty-up" data-cart-id="${product.id}" aria-label="Increase">${I.plus}</button>
                </div>
                <button class="btn--link btn--danger" data-action="remove" data-cart-id="${product.id}">${I.trash} Remove</button>
              </div>
            </div>
            <div class="cart-item__total" data-role="line-total">${money(product.price * qty)}</div>
          </div>`).join('')}
          <div class="cart__actions-row">
            <button class="btn--link btn--danger" id="clearCart">Clear cart</button>
          </div>
        </div>

        <aside class="summary card">
          <h3>Order summary</h3>
          ${t.freeShippingRemaining > 0
            ? `<div class="shipping-meter"><p>You’re ${money(t.freeShippingRemaining)} away from <strong>free shipping</strong></p><div class="meter"><div class="meter__fill" style="width:${clamp(((t.subtotal - t.discount) / Store.FREE_SHIPPING_THRESHOLD) * 100, 4, 100)}%"></div></div></div>`
            : items.length ? `<p class="shipping-free">${I.check} Free shipping unlocked!</p>` : ''}
          <dl class="summary__rows">
            <div><dt>Subtotal</dt><dd data-role="subtotal">${money(t.subtotal)}</dd></div>
            ${t.discount ? `<div class="pos"><dt>Discount</dt><dd>-${money(t.discount)}</dd></div>` : ''}
            ${t.promo ? `<div><dt>Promo (${escapeHtml(t.promo)})</dt><dd>-${money(t.discount)}</dd></div>` : ''}
            <div><dt>Shipping</dt><dd>${t.shipping === 0 ? '<span class="free-tag">FREE</span>' : money(t.shipping)}</dd></div>
            <div><dt>Tax (8%)</dt><dd>${money(t.tax)}</dd></div>
          </dl>
          <form class="promo-form" id="promoForm">
            <input class="input" id="promoInput" placeholder="Promo code (try WELCOME10)" />
            <button class="btn btn--dark btn--sm" type="submit">Apply</button>
          </form>
          ${t.promoApplied ? `<p class="promo-on">${I.check} ${escapeHtml(t.promoApplied)}</p>` : ''}
          <div class="summary__total"><span>Total</span><strong data-role="total">${money(t.total)}</strong></div>
          <a class="btn btn--primary btn--lg btn--block" href="#/checkout" id="checkoutBtn">Proceed to checkout ${I.arrow}</a>
          <p class="secure-note">${I.lock} Secure 256-bit SSL checkout</p>
        </aside>
      </div>
    </div>`;
  }

  function storeTotalsFor(items) {
    const promo = cartPromo ? Store.PROMOS[cartPromo] : null;
    const t = Store.totals(items, promo);
    t.promo = cartPromo || null;
    t.promoRate = promo?.rate || 0;
    t.promoApplied = promo ? `${cartPromo} — ${promo.label}` : null;
    return t;
  }

  let cartPromo = null;

  function mountCart() {
    $('#clearCart')?.addEventListener('click', () => {
      Store.clearCart();
      toast('Cart cleared', 'info');
      render();
    });
    $('#promoForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const code = $('#promoInput').value.trim().toUpperCase();
      if (!code) return;
      let valid = !!Store.PROMOS[code];
      try {
        const res = await API.post('/api/checkout/validate-promo', { code });
        valid = !!res.valid;
      } catch { /* offline — trust local table */ }
      if (!valid) {
        cartPromo = null;
        toast('That promo code isn’t valid.', 'error', 'Invalid code');
        render();
        return;
      }
      cartPromo = code;
      toast(`Promo ${code} applied!`, 'success');
      render();
    });
  }

  /* ============================================================
     CHECKOUT (multi-step)
     ============================================================ */

  let checkoutStep = 1;
  let checkoutData = {};

  function viewCheckout() {
    document.title = 'Checkout — KIDAMEgebeya';
    const items = Store.cartItems();
    if (!items.length) {
      return `
      <div class="container section section--top full-min">
        ${emptyState('Nothing to check out', 'Your cart is empty. Add a product first, then come back.', { href: '#/shop', label: 'Browse products' })}
      </div>`;
    }
    checkoutStep = Math.min(checkoutStep, 3);
    const t = Store.totals(items, cartPromo ? Store.PROMOS[cartPromo] : null);
    const steps = ['Contact & shipping', 'Payment', 'Review & place order'];
    const profile = Store.state.profile;
    const addrs = Store.state.addresses;

    const stepHTML = {
      1: `
      <div class="step">
        <h3>Contact information</h3>
        <div class="row">
          <div class="field field--half"><label>First name *</label><input class="input" id="cFirstName" value="${escapeHtml(profile.firstName || '')}" autocomplete="given-name"/></div>
          <div class="field field--half"><label>Last name *</label><input class="input" id="cLastName" value="${escapeHtml(profile.lastName || '')}" autocomplete="family-name"/></div>
        </div>
        <div class="row">
          <div class="field field--half"><label>Email address *</label><input class="input" id="cEmail" type="email" value="${escapeHtml(profile.email || '')}" placeholder="you@example.com" autocomplete="email"/></div>
          <div class="field field--half"><label>Phone *</label><input class="input" id="cPhone" value="${escapeHtml(checkoutData.phone || '')}" placeholder="+1 555 000 1234" autocomplete="tel"/></div>
        </div>
        <h3 class="step-h3">Shipping address</h3>
        ${addrs.length ? `
          <div class="saved-addr" id="savedAddrs">
            ${addrs.filter(a => a.name || a.line).map((a, i) => `
              <label class="addr-card ${checkoutData.savedAddr === a.id || (checkoutData.savedAddr === undefined && i === 0) ? 'is-active' : ''}">
                <input type="radio" name="savedAddr" value="${a.id}" ${checkoutData.savedAddr === a.id || (checkoutData.savedAddr === undefined && i === 0) ? 'checked' : ''}/>
                <span class="addr-card__body"><strong>${escapeHtml(a.label || 'Address ' + (i + 1))}</strong><span>${escapeHtml([a.name, a.line, a.city, a.zip, a.country].filter(Boolean).join(', '))}</span>${a.phone ? `<em>${escapeHtml(a.phone)}</em>` : ''}</span>
              </label>`).join('')}
            <label class="addr-card">
              <input type="radio" name="savedAddr" value="new" ${checkoutData.savedAddr === 'new' ? 'checked' : ''}/>
              <span class="addr-card__body"><strong>＋ Use a new address</strong></span>
            </label>
          </div>` : ''}
        <div id="newAddressFields" ${addressesLocked() ? 'hidden' : ''}>
          <div class="row">
            <div class="field field--half"><label>Address line *</label><input class="input" id="cAddress" value="${escapeHtml(checkoutData.address || '')}" placeholder="Street, number, apt"/></div>
            <div class="field field--half"><label>City *</label><input class="input" id="cCity" value="${escapeHtml(checkoutData.city || '')}"/></div>
          </div>
          <div class="row">
            <div class="field field--third"><label>State / Region</label><input class="input" id="cState" value="${escapeHtml(checkoutData.state || '')}"/></div>
            <div class="field field--third"><label>ZIP / Postcode *</label><input class="input" id="cZip" value="${escapeHtml(checkoutData.zip || '')}"/></div>
            <div class="field field--third"><label>Country *</label>
              <select class="select" id="cCountry">
                <option>United States</option><option>Canada</option><option>United Kingdom</option>
                <option>Germany</option><option>France</option><option>Australia</option><option>Other</option>
              </select>
            </div>
          </div>
        </div>
        <label class="check check--tight"><input type="checkbox" id="cSaveAddr" checked><span>Save this address to my account</span></label>
        <div class="step__actions">
          <button class="btn btn--primary btn--lg" data-step-next>Continue to payment ${I.arrow}</button>
        </div>
      </div>`,
      2: `
      <div class="step">
        <h3>Payment method</h3>
        <div class="pay-methods">
          <label class="pay-method ${payIs('card') ? 'is-active' : ''}">
            <input type="radio" name="pay" value="card" ${payIs('card') ? 'checked' : ''}/>
            <span class="pay-method__icon">💳</span><span><strong>Credit / Debit card</strong><em>Visa · Mastercard · Amex</em></span>
            ${checkoutData.pay === 'card' ? '<span class="pay-method__check">✓</span>' : ''}
          </label>
          <label class="pay-method ${payIs('paypal') ? 'is-active' : ''}">
            <input type="radio" name="pay" value="paypal" ${payIs('paypal') ? 'checked' : ''}/>
            <span class="pay-method__icon">🅿</span><span><strong>PayPal</strong><em>Fast &amp; secure</em></span>
          </label>
          <label class="pay-method ${payIs('cod') ? 'is-active' : ''}">
            <input type="radio" name="pay" value="cod" ${payIs('cod') ? 'checked' : ''}/>
            <span class="pay-method__icon">💵</span><span><strong>Cash on delivery</strong><em>Pay when it arrives</em></span>
          </label>
        </div>

        <div id="cardFields" ${checkoutData.pay === 'card' ? '' : 'hidden'}>
          <div class="field"><label>Card number *</label><input class="input input--lg" id="cCardNum" inputmode="numeric" placeholder="1234 5678 9012 3456" maxlength="19"/></div>
          <div class="row">
            <div class="field field--half"><label>Expiry date *</label><input class="input" id="cCardExp" placeholder="MM / YY" maxlength="7"/></div>
            <div class="field field--half"><label>CVC *</label><input class="input" id="cCardCvc" inputmode="numeric" placeholder="123" maxlength="4"/></div>
          </div>
          <div class="field"><label>Name on card *</label><input class="input" id="cCardName" placeholder="As printed on the card"/></div>
        </div>
        <div id="paypalFields" ${checkoutData.pay === 'paypal' ? '' : 'hidden'}>
          <p class="pay-note">You’ll be redirected to PayPal to complete your purchase securely.</p>
        </div>
        <div id="codFields" ${checkoutData.pay === 'cod' ? '' : 'hidden'}>
          <p class="pay-note">Pay in cash when your order arrives. A small confirmation call may be required.</p>
        </div>

        <div class="step__actions">
          <button class="btn btn--ghost btn--lg" data-step-back>${I.chevron} Back</button>
          <button class="btn btn--primary btn--lg" data-step-next>Continue to review ${I.arrow}</button>
        </div>
      </div>`,
      3: `
      <div class="step">
        <h3>Review your order</h3>
        <div class="review-blocks">
          <div class="review-block">
            <h4>Contact &amp; shipping ${backLink(1)}</h4>
            <p><strong>${escapeHtml(checkoutData.firstName + ' ' + checkoutData.lastName)}</strong></p>
            <p>${escapeHtml(checkoutData.email)} · ${escapeHtml(checkoutData.phone)}</p>
            <p>${escapeHtml([checkoutData.address, checkoutData.city, checkoutData.state ? checkoutData.state + ' ' : '', checkoutData.zip, checkoutData.country].filter(Boolean).join(', '))}</p>
          </div>
          <div class="review-block">
            <h4>Payment ${backLink(2)}</h4>
            <p>${checkoutData.pay === 'card'
                ? `<strong>${escapeHtml(checkoutData.cardType || 'Card')}</strong> ending ${escapeHtml(maskCard(checkoutData.cardNum))}`
                : checkoutData.pay === 'paypal' ? '<strong>PayPal</strong>' : '<strong>Cash on delivery</strong>'}</p>
          </div>
        </div>
        <div class="review-items">
          <h4>Items</h4>
          ${items.map(({ product, qty }) => `
            <div class="review-item">
              ${imgTag(product.images[0], product.name, 'review-item__img')}
              <div><strong>${escapeHtml(product.name)}</strong><span>Qty ${qty}</span></div>
              <em>${money(product.price * qty)}</em>
            </div>`).join('')}
        </div>
        <div class="review-total">
          <div><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
          ${t.discount ? `<div class="pos"><span>Discount</span><span>-${money(t.discount)}</span></div>` : ''}
          <div><span>Shipping</span><span>${t.shipping === 0 ? 'FREE' : money(t.shipping)}</span></div>
          <div><span>Tax</span><span>${money(t.tax)}</span></div>
          <div class="grand"><span>Total</span><strong>${money(t.total)}</strong></div>
        </div>
        <div class="step__actions">
          <button class="btn btn--ghost btn--lg" data-step-back>${I.chevron} Back</button>
          <button class="btn btn--primary btn--lg" id="placeOrder" data-action="place-order">Place order · ${money(t.total)} ${I.lock}</button>
        </div>
        <p class="secure-note">By placing your order you agree to our Terms of Service and Returns Policy.</p>
      </div>`,
    };

    return `
    <div class="container section section--top full-min">
      <div class="page-head">
        <h1>Secure checkout</h1>
        <a class="link-arrow" href="#/cart">Back to cart</a>
      </div>
      <div class="steps" aria-label="Checkout progress">
        ${steps.map((s, i) => {
          const n = i + 1;
          const state = n < checkoutStep ? 'done' : n === checkoutStep ? 'active' : '';
          return `
          <div class="step-item ${state}">
            <span class="step-item__num">${n < checkoutStep ? I.check : n}</span>
            <span class="step-item__label">${s}</span>
          </div>`;
        }).join('')}
      </div>
      <div class="co">
        <div class="co__form card">
          ${stepHTML[checkoutStep]}
        </div>
        <aside class="summary card co__summary">
          <h3>Order summary</h3>
          <div class="co__items">
            ${items.slice(0, 4).map(({ product, qty }) => `
              <div class="co-item">
                <div class="co-item__imgwrap">${imgTag(product.images[0], product.name, 'co-item__img')}<span class="co-item__qty">${qty}</span></div>
                <span class="co-item__name">${escapeHtml(product.name)}</span>
                <em>${money(product.price * qty)}</em>
              </div>`).join('')}
            ${items.length > 4 ? `<p class="co-more">+${items.length - 4} more items</p>` : ''}
          </div>
          <dl class="summary__rows">
            <div><dt>Subtotal</dt><dd>${money(t.subtotal)}</dd></div>
            ${t.discount ? `<div><dt>Discount</dt><dd>-${money(t.discount)}</dd></div>` : ''}
            <div><dt>Shipping</dt><dd>${t.shipping === 0 ? 'FREE' : money(t.shipping)}</dd></div>
            <div><dt>Tax (8%)</dt><dd>${money(t.tax)}</dd></div>
          </dl>
          <div class="summary__total"><span>Total</span><strong>${money(t.total)}</strong></div>
          <div class="perks perks--sm">
            ${[I.lock + ' SSL secured payment', I.truck + ' Tracked delivery', I.refresh + ' 30-day returns'].map((x) => `<span>${x}</span>`).join('')}
          </div>
        </aside>
      </div>
    </div>`;

    function payIs(m) { return (checkoutData.pay || 'card') === m; }
    function addressesLocked() {
      return !!(addrs.length && checkoutData.savedAddr && checkoutData.savedAddr !== 'new');
    }
  }

  function maskCard(num = '') { return (num.replace(/\s/g, '').slice(-4)) ? ('···· ' + num.replace(/\s/g, '').slice(-4)) : ''; }

  function backLink(to) { return `<a class="link link--sm" href="#" data-goto-step="${to}">Edit</a>`; }

  function mountCheckout() {
    /* saved address switching */
    $$('input[name="savedAddr"]').forEach((el) => {
      el.addEventListener('change', () => {
        $$('input[name="savedAddr"]').forEach((r) => r.closest('.addr-card').classList.toggle('is-active', r.checked));
        const v = el.value;
        checkoutData.savedAddr = v;
        const fields = $('#newAddressFields');
        if (v !== 'new') {
          const a = Store.state.addresses.find((x) => x.id === v);
          if (a) {
            checkoutData.firstName = a.firstName || checkoutData.firstName;
            checkoutData.lastName = a.lastName || checkoutData.lastName;
            checkoutData.address = a.line; checkoutData.city = a.city; checkoutData.zip = a.zip;
            checkoutData.country = a.country;
          }
          fields.hidden = true;
        } else {
          fields.hidden = false;
        }
      });
    });

    $$('.pay-method input').forEach((el) => {
      el.addEventListener('change', () => {
        checkoutData.pay = el.value;
        $$('.pay-method').forEach((m) => m.classList.toggle('is-active', m.querySelector('input').checked));
        $('#cardFields').hidden = el.value !== 'card';
        $('#paypalFields').hidden = el.value !== 'paypal';
        $('#codFields').hidden = el.value !== 'cod';
      });
    });

    $('[data-step-next]')?.addEventListener('click', () => {
      if (checkoutStep === 1 && !validateShipping()) return;
      if (checkoutStep === 2 && !validatePayment()) return;
      if (checkoutStep === 2) checkoutData.cardLast4 = ($('#cCardNum').value || '').replace(/\s/g, '').slice(-4);
      checkoutStep++;
      checkoutData.step = checkoutStep;
      render();
    });

    $('[data-step-back]')?.addEventListener('click', () => {
      checkoutStep = Math.max(1, checkoutStep - 1);
      render();
    });

    $('[data-goto-step]')?.addEventListener('click', (e) => {
      e.preventDefault();
      checkoutStep = Number(e.target.dataset.gotoStep);
      render();
    });

    $('#placeOrder')?.addEventListener('click', async () => {
      const btn = $('#placeOrder');
      if (btn) { btn.disabled = true; btn.textContent = 'Placing order…'; }
      try {
        const name = `${checkoutData.firstName} ${checkoutData.lastName}`.trim();
        const pay = checkoutData.pay || 'card';
        const payload = {
          email: checkoutData.email,
          name,
          payment: pay,
          card: pay === 'card' ? { last4: checkoutData.cardLast4 || ($('#cCardNum')?.value || '').replace(/\s/g, '').slice(-4) } : undefined,
          promo: cartPromo,
          address: {
            address: checkoutData.address, city: checkoutData.city,
            state: checkoutData.state || '', zip: checkoutData.zip, country: checkoutData.country,
          },
          items: Store.cartItems().map(({ product, qty }) => ({ productId: product.id, qty })),
        };
        let order = null;
        let fromServer = false;
        try {
          const res = await API.post('/api/orders', payload);
          order = res.order;
          fromServer = true;
        } catch {
          toast('Server unreachable — saving order locally only.', 'error');
          order = Store.placeOrder({
            address: `${checkoutData.address}, ${checkoutData.city} ${checkoutData.zip}, ${checkoutData.country}`,
            payment: pay, email: checkoutData.email, name, promoCode: cartPromo,
          });
        }
        if (!order) { toast('Your cart is empty.', 'error'); return; }
        if (fromServer) Store.importOrder(order);
        Store.clearCart();
        cartPromo = null;
        toast('Order placed successfully!', 'success');
        location.hash = '#/order/' + order.id;
      } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Place order'; }
      }
    });
  }

  function validateShipping() {
    let ok = true;
    const setErr = (id, msg) => {
      const el = $('#' + id.replace(/^#/, ''));
      const wrap = el.closest('.field');
      const err = wrap.querySelector('.field-err');
      if (msg) { wrap.classList.add('field--err'); if (!err) { const e = document.createElement('p'); e.className = 'field-err'; e.textContent = msg; wrap.appendChild(e); } ok = false; }
      else { wrap.classList.remove('field--err'); err?.remove(); }
    };
    const addressLocked = !!(Store.state.addresses.length && checkoutData.savedAddr && checkoutData.savedAddr !== 'new');

    checkoutData.firstName = $('#cFirstName').value.trim();
    checkoutData.lastName = $('#cLastName').value.trim();
    checkoutData.email = $('#cEmail').value.trim();
    checkoutData.phone = $('#cPhone').value.trim();
    checkoutData.address = $('#cAddress').value.trim();
    checkoutData.city = $('#cCity').value.trim();
    checkoutData.zip = $('#cZip').value.trim();
    checkoutData.country = $('#cCountry').value;

    setErr('#cFirstName', checkoutData.firstName ? '' : 'Required');
    setErr('#cLastName', checkoutData.lastName ? '' : 'Required');
    setErr('#cEmail', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(checkoutData.email) ? '' : 'Enter a valid email');
    setErr('#cPhone', checkoutData.phone ? '' : 'Required');
    if (!addressLocked) {
      setErr('#cAddress', checkoutData.address ? '' : 'Required');
      setErr('#cCity', checkoutData.city ? '' : 'Required');
      setErr('#cZip', checkoutData.zip ? '' : 'Required');
    }
    if (ok) toast('Looks good — on to payment.', 'success');
    return ok;
  }

  function validatePayment() {
    let ok = true;
    const method = checkoutData.pay || 'card';
    if (method === 'card') {
      const numRaw = ($('#cCardNum').value || '').replace(/\s/g, '');
      const exp = $('#cCardExp').value.trim();
      const cvc = $('#cCardCvc').value.trim();
      const cardName = $('#cCardName').value.trim();
      checkoutData.cardNum = numRaw;
      checkoutData.cardType = cardBrand(numRaw);

      const setErr = (id, msg) => {
        const el = $('#' + id.replace(/^#/, '')); const wrap = el.closest('.field');
        const err = wrap.querySelector('.field-err');
        if (msg) { wrap.classList.add('field--err'); if (!err) { const e = document.createElement('p'); e.className = 'field-err'; e.textContent = msg; wrap.appendChild(e); } ok = false; }
        else { wrap.classList.remove('field--err'); err?.remove(); }
      };
      setErr('#cCardNum', luhn(numRaw) ? '' : 'Invalid card number');
      setErr('#cCardExp', validExp(exp) ? '' : 'Use MM/YY and a future date');
      setErr('#cCardCvc', /^\d{3,4}$/.test(cvc) ? '' : '3 or 4 digits');
      setErr('#cCardName', cardName ? '' : 'Required');
    }
    if (ok) toast('Payment details verified.', 'success');
    return ok;
  }

  function cardBrand(num) {
    if (/^4/.test(num)) return 'Visa';
    if (/^5[1-5]/.test(num)) return 'Mastercard';
    if (/^3[47]/.test(num)) return 'Amex';
    return 'Card';
  }
  function luhn(num) {
    if (!/^\d{13,19}$/.test(num)) return false;
    let s = 0, dbl = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let d = +num[i];
      if (dbl) { d *= 2; if (d > 9) d -= 9; }
      s += d; dbl = !dbl;
    }
    return s % 10 === 0;
  }
  function validExp(str) {
    const m = str.match(/^\s*(\d{2})\s*\/\s*(\d{2})\s*$/);
    if (!m) return false;
    const month = +m[1], year = 2000 + +m[2];
    if (month < 1 || month > 12) return false;
    return new Date(year, month, 0) >= new Date();
  }

  /* ============================================================
     ORDER CONFIRMATION
     ============================================================ */

  function viewOrder(id) {
    const order = Store.getOrder(id);
    if (!order) return viewNotFound('Order not found');
    document.title = 'Order confirmed — KIDAMEgebeya';
    const t = order.totals;
    return `
    <div class="container section section--top full-min">
      <div class="order-success card">
        <div class="order-success__icon">${I.check}</div>
        <h1>Thank you, ${escapeHtml(order.name.split(' ')[0] || 'friend')}!</h1>
        <p>Your order <strong>${order.id}</strong> has been placed successfully. A confirmation email is on its way to <strong>${escapeHtml(order.email)}</strong>.</p>
        <div class="order-success__meta">
          <div><span>Estimated delivery</span><strong>${order.estimatedDelivery}</strong></div>
          <div><span>Payment method</span><strong>${order.payment === 'card' ? 'Card' : order.payment === 'paypal' ? 'PayPal' : 'Cash on delivery'}</strong></div>
          <div><span>Status</span><strong class="status-chip">${order.status}</strong></div>
        </div>
      </div>

      <h2 class="h2-sm">Order details — ${order.id}</h2>
      <div class="co">
        <div class="card order__items">
          ${order.items.map((it) => `
            <div class="review-item">
              ${imgTag(it.image, it.name, 'review-item__img')}
              <div><strong>${escapeHtml(it.name)}</strong><span>Qty ${it.qty} · ${money(it.price)} each</span></div>
              <em>${money(it.price * it.qty)}</em>
            </div>`).join('')}
        </div>
        <aside class="card co__summary">
          <dl class="summary__rows">
            <div><dt>Subtotal</dt><dd>${money(t.subtotal)}</dd></div>
            ${t.discount ? `<div><dt>Discount</dt><dd>-${money(t.discount)}</dd></div>` : ''}
            <div><dt>Shipping</dt><dd>${t.shipping === 0 ? 'FREE' : money(t.shipping)}</dd></div>
            <div><dt>Tax</dt><dd>${money(t.tax)}</dd></div>
          </dl>
          <div class="summary__total"><span>Total paid</span><strong>${money(t.total)}</strong></div>
          <div class="order__address">
            <h5>Shipping to</h5>
            <p>${escapeHtml(order.address)}</p>
          </div>
        </aside>
      </div>

      <div class="order-success__cta">
        <a class="btn btn--primary btn--lg" href="#/shop">Continue shopping ${I.arrow}</a>
        <a class="btn btn--ghost btn--lg" href="#/account?tab=orders">View my orders</a>
        <p class="secure-note">${I.lock} Need help? Contact support — hello@kidamegebeya.store</p>
      </div>
    </div>`;
  }

  /* ============================================================
     WISHLIST
     ============================================================ */

  function viewWishlist() {
    document.title = 'Wishlist — KIDAMEgebeya';
    const items = Store.wishlistProducts();
    return `
    <div class="container section section--top full-min">
      <div class="page-head">
        <h1>Your wishlist <em class="count-pill">${items.length}</em></h1>
        <a class="link-arrow" href="#/shop">${I.arrow} Discover more</a>
      </div>
      ${items.length
        ? `<div class="grid grid--products">${items.map(productCard).join('')}</div>`
        : emptyState('Your wishlist is empty', 'Tap the heart on any product to save it here for later.', { href: '#/shop', label: 'Browse products' })}
    </div>`;
  }

  /* ============================================================
     ACCOUNT
     ============================================================ */

  function orderRowHtml(o) {
    const t = o.totals;
    return `
    <div class="order-row">
      <div class="order-row__head">
        <div><strong>${o.id}</strong><span>Placed ${new Date(o.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
        <span class="status-chip">${o.status}</span>
        <strong>${money(t.total)}</strong>
      </div>
      <div class="order-row__items">
        ${o.items.slice(0, 3).map((it) => imgTag(it.image, it.name, 'order-row__img')).join('')}
        <div class="order-row__info">
          <span>${o.items.length} ${pluralize(o.items.length, 'item')} · est. delivery ${o.estimatedDelivery}</span>
          <div class="row">
            <a class="link link--sm" href="#/order/${o.id}">Order details</a>
            ${o.payment !== 'cod' ? '<button class="link link--sm invoice-btn">Download invoice</button>' : ''}
          </div>
        </div>
      </div>
    </div>`;
  }

  function guestOrderList(orders) {
    return orders.map(orderRowHtml).join('');
  }

  function viewAccount() {
    const tab = parseQuery(location.hash).tab || 'profile';
    document.title = 'My account — KIDAMEgebeya';

    if (!Nova.isLoggedIn()) {
      const localOrders = Store.state.orders;
      const showGuestOrders = (tab === 'orders' || tab === 'profile') && localOrders.length;

      if (pendingVerifyEmail) {
        return `
    <div class="container section section--top full-min">
      <div class="page-head">
        <h1>My account</h1>
      </div>
      <div id="accountPane">
        <div class="card auth-card">
          <div class="auth-icon">${I.mail}</div>
          <h3>Check your email</h3>
          <p class="auth-hint">We sent a verification link to <strong>${escapeHtml(pendingVerifyEmail)}</strong>. Click the link in the email to activate your account, then sign in.</p>
          ${pendingVerifyLink ? `<p class="dev-link">Dev mode — no email sent. Open this link directly: <a href="${escapeHtml(pendingVerifyLink)}" rel="nofollow">verify your email</a></p>` : ''}
          <button class="btn btn--ghost btn--block" id="resendVerifyBtn" type="button">Resend verification email</button>
          <p class="auth-hint" style="margin-top:14px"><a href="#/verify?email=${encodeURIComponent(pendingVerifyEmail)}">Or enter a 6-digit code</a> · <a href="#/account" data-clear-pending>Back to sign in</a></p>
        </div>
      </div>
    </div>`;
      }

      return `
    <div class="container section section--top full-min">
      <div class="page-head">
        <h1>My account</h1>
        <p class="muted">Sign in to track orders, sync your wishlist and save addresses.</p>
      </div>
      <div id="accountPane">
        <div class="card auth-card">
          <div class="auth-tabs" role="tablist" id="authTabs">
            <button class="auth-tab is-active" data-auth-tab="login">Sign in</button>
            <button class="auth-tab" data-auth-tab="register">Create account</button>
          </div>
          <form id="loginForm" class="form-stack" novalidate>
            <div class="field"><label>Email address</label><input class="input" type="email" id="aEmail" autocomplete="email" /></div>
            <div class="field"><label>Password</label><input class="input" type="password" id="aPass" autocomplete="current-password" /></div>
            <p class="form-msg" data-msg hidden></p>
            <button class="btn btn--primary btn--lg btn--block" type="submit">Sign in ${I.arrow}</button>
            <div id="verifyPanel" class="verify-panel" hidden>
              <p>You still need to verify your email. Check your inbox and click the link we sent, or send a fresh one.</p>
              <button class="btn btn--ghost btn--sm" id="resendLoginVerify" type="button">Resend verification email</button>
              <div id="resendLoginOut" class="dev-link" hidden></div>
              <p class="auth-hint" style="margin-top:8px"><a href="#/verify" id="verifyCodeLink">Prefer a code? Use a 6-digit code</a></p>
            </div>
            <p class="auth-hint">New here? <a href="#/account?tab=register" data-goto-register>Create an account</a> · <a href="#/forgot">Forgot password?</a></p>
          </form>
          <form id="registerForm" class="form-stack sf-hidden" novalidate>
            <div class="field"><label>Full name</label><input class="input" id="rName" autocomplete="name" /></div>
            <div class="field"><label>Email address</label><input class="input" type="email" id="rEmail" autocomplete="email" /></div>
            <div class="field"><label>Password</label><input class="input" type="password" id="rPass" autocomplete="new-password" /></div>
            <p class="form-msg" data-msg hidden></p>
            <button class="btn btn--primary btn--lg btn--block" type="submit">Create account ${I.arrow}</button>
            <p class="auth-hint">Already have an account? <a href="#/account?tab=profile" data-goto-login>Sign in</a></p>
          </form>
        </div>
        ${showGuestOrders ? `
        <div class="card pane-card">
          <h3 class="pane-title">Recent guest orders</h3>
          ${guestOrderList(localOrders)}
        </div>` : ''}
      </div>
    </div>`;
    }

    const p = Store.state.profile;
    const orders = Store.state.orders;
    const addresses = Store.state.addresses;
    const wish = Store.wishlistProducts();
    const name = p.name || 'Customer';
    const initials = name.split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

    const tabs = [['profile', 'Profile'], ['orders', `Orders${orders.length ? ' (' + orders.length + ')' : ''}`], ['wishlist', `Wishlist${wish.length ? ' (' + wish.length + ')' : ''}`], ['addresses', `Addresses${addresses.length ? ' (' + addresses.length + ')' : ''}`]];

    const pane = {
      profile: `
      <div class="card pane-card">
        <div class="account-hero">
          <span class="avatar">${initials}</span>
          <div><h3>${escapeHtml(name)}</h3><p>${escapeHtml(p.email || 'Add an email to unlock order tracking')}</p></div>
          <button class="btn btn--ghost btn--sm" id="logoutBtn">Sign out</button>
        </div>
        <form id="profileForm" class="form-grid">
          <div class="field"><label>Full name</label><input class="input" id="pName" value="${escapeHtml(p.name || '')}" /></div>
          <div class="field"><label>Email address</label><input class="input" type="email" id="pEmail" value="${escapeHtml(p.email || '')}"/></div>
          <div class="field"><label>Phone</label><input class="input" id="pPhone" value="${escapeHtml(p.phone || '')}"/></div>
          <div class="field"><label>Password</label><input class="input" type="password" placeholder="Leave blank to keep current" /></div>
          <div class="field field--full row row--end"><button class="btn btn--primary" type="submit">Save changes</button></div>
        </form>
        <div class="account-perks">
          <div>${I.truck}<span><strong>Member shipping</strong>Free over $75</span></div>
          <div>${I.gift}<span><strong>Member offers</strong>Early access to drops</span></div>
          <div>${I.refresh}<span><strong>Fast returns</strong>30-day window</span></div>
        </div>
      </div>`,
      orders: `
      <div class="card pane-card">
        <h3 class="pane-title">Order history</h3>
        ${orders.length ? orders.map(orderRowHtml).join('') : emptyState('No orders yet', 'When you place an order, it will appear here with live status.', { href: '#/shop', label: 'Shop now' })}
      </div>`,
      wishlist: `
      <div class="card pane-card">
        <h3 class="pane-title">Saved for later</h3>
        ${wish.length
          ? `<div class="grid grid--products">${wish.map(productCard).join('')}</div>`
          : emptyState('Nothing saved yet', 'Tap the heart on products to save them here.')}
      </div>`,
      addresses: `
      <div class="card pane-card">
        <h3 class="pane-title">Saved addresses <button class="btn btn--dark btn--sm" id="toggleAddressForm">＋ Add address</button></h3>
        <form id="addressForm" class="form-grid sf-hidden" novalidate>
          <div class="field"><label>Label</label><input class="input" id="aLabel" placeholder="Home / Work"/></div>
          <div class="field"><label>Full name</label><input class="input" id="aName" placeholder="Jane Doe" /></div>
          <div class="field field--full"><label>Address line</label><input class="input" id="aLine" placeholder="Street, number, apt" /></div>
          <div class="field"><label>City</label><input class="input" id="aCity" /></div>
          <div class="field"><label>ZIP / Postcode</label><input class="input" id="aZip" /></div>
          <div class="field"><label>Country</label><input class="input" id="aCountry" value="United States"/></div>
          <div class="field"><label>Phone</label><input class="input" id="aPhone" /></div>
          <p class="form-msg" data-msg hidden></p>
          <div class="field field--full row row--end"><button class="btn btn--primary" type="submit">Save address</button></div>
        </form>
        <div class="addr-list">
          ${addresses.length ? addresses.map((a) => `
            <div class="addr-item">
              <div><strong>${escapeHtml(a.label || 'Address')}</strong>
                <span>${escapeHtml([a.name, a.line, a.city, a.zip, a.country].filter(Boolean).join(', '))}</span>
                ${a.phone ? `<em>${escapeHtml(a.phone)}</em>` : ''}
              </div>
              <button class="icon-btn icon-btn--bordered" data-remove-addr="${a.id}" aria-label="Delete address">${I.trash}</button>
            </div>`).join('') : `<p class="muted">No saved addresses yet.</p>`}
        </div>
      </div>`,
    }[tab] || pane.profile;

    return `
    <div class="container section section--top full-min">
      <div class="page-head">
        <h1>My account</h1>
        <div class="account-tabs" role="tablist">
          ${tabs.map(([key, label]) => `<a class="account-tab ${tab === key ? 'is-active' : ''}" href="#/account?tab=${key}">${label}</a>`).join('')}
        </div>
      </div>
      <div id="accountPane">${pane}</div>
    </div>`;
  }

  function mountAccount() {
    const authMsg = $('[data-msg]', $('#accountPane'));
    const showMsg = (msg, ok = false) => { if (authMsg) { authMsg.hidden = false; authMsg.textContent = msg; authMsg.classList.toggle('form-msg--ok', ok); } };

    $$('[data-auth-tab]').forEach((b) =>
      b.addEventListener('click', () => {
        $$('[data-auth-tab]').forEach((x) => x.classList.toggle('is-active', x === b));
        $('#loginForm').classList.toggle('sf-hidden', b.dataset.authTab !== 'login');
        $('#registerForm').classList.toggle('sf-hidden', b.dataset.authTab !== 'register');
        if (authMsg) authMsg.hidden = true;
      }));

    $('#loginForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = $('#aEmail').value.trim();
      const pass = $('#aPass').value;
      if (!email || !pass) { showMsg('Email and password are required.'); return; }
      try {
        await Nova.login(email, pass);
        toast(`Welcome back!`, 'success');
        render();
      } catch (err) {
        showMsg(err.message);
        if (err.code === 'EMAIL_UNVERIFIED') {
          const panel = $('#verifyPanel');
          const btn = $('#resendLoginVerify');
          const codeLink = $('#verifyCodeLink');
          if (panel) panel.hidden = false;
          if (codeLink) codeLink.href = `#/verify?email=${encodeURIComponent(email)}`;
          btn?.addEventListener('click', async () => {
            btn.disabled = true;
            try {
              const res = await API.post('/api/auth/resend-verification', { email });
              const out = $('#resendLoginOut');
              if (out) {
                if (res.devLink) {
                  out.hidden = false;
                  out.innerHTML = `Dev mode — open directly: <a href="${escapeHtml(res.devLink)}" rel="nofollow">verify your email</a>`;
                } else {
                  out.hidden = true;
                }
              }
              toast('A new verification link is on its way.', 'success');
            } catch { toast('Could not resend. Try again in a moment.', 'error'); }
            btn.disabled = false;
          });
        }
      }
    });

    $('#registerForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = $('#rName').value.trim();
      const email = $('#rEmail').value.trim();
      const pass = $('#rPass').value;
      if (!name || !email || !pass) { showMsg('Please fill in every field.'); return; }
      if (pass.length < 6) { showMsg('Password must be at least 6 characters.'); return; }
      try {
        const res = await Nova.register(name, email, pass);
        pendingVerifyEmail = email;
        pendingVerifyLink = res.devLink || null;
        render();
      } catch (err) { showMsg(err.message); }
    });

    $('#resendVerifyBtn')?.addEventListener('click', async () => {
      const btn = $('#resendVerifyBtn');
      if (!pendingVerifyEmail) return;
      btn.disabled = true;
      try {
        const res = await API.post('/api/auth/resend-verification', { email: pendingVerifyEmail });
        if (res.devLink) pendingVerifyLink = res.devLink;
        toast('A new verification link is on its way.', 'success');
        render();
      } catch { toast('Could not resend. Try again in a moment.', 'error'); }
      btn.disabled = false;
    });

    $('[data-clear-pending]')?.addEventListener('click', () => {
      pendingVerifyEmail = null;
      pendingVerifyLink = null;
      render();
    });

    $('#logoutBtn')?.addEventListener('click', async () => {
      await Nova.logout();
      toast('Signed out.', 'info');
      location.hash = '#/account';
      render();
    });

    $('#profileForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = $('#pName').value.trim();
      const email = $('#pEmail').value.trim();
      if (!name) { toast('Please enter your name.', 'error'); return; }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast('Enter a valid email address.', 'error'); return; }
      Store.saveProfile({ name, email, phone: $('#pPhone').value.trim() });
      if (Nova.isLoggedIn()) {
        try { const res = await API.put('/api/profile', { name, email }); Store.adopt({ profile: { name: res.user.name, email: res.user.email } }); }
        catch (err) { toast(err.message, 'error'); }
      }
      toast('Profile updated', 'success');
      render();
    });

    $('#toggleAddressForm')?.addEventListener('click', () => {
      $('#addressForm').classList.toggle('sf-hidden');
    });

    $('#addressForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const line = $('#aLine').value.trim();
      const city = $('#aCity').value.trim();
      const zip = $('#aZip').value.trim();
      const msg = $('[data-msg]');
      msg.hidden = false;
      if (!line || !city || !zip) { msg.textContent = 'Address line, city and ZIP are required.'; return; }
      const address = {
        label: $('#aLabel').value.trim() || 'Home',
        fullName: $('#aName').value.trim(),
        line1: line, city, zip,
        country: $('#aCountry').value.trim(), phone: $('#aPhone').value.trim(),
      };
      Store.addAddress({
        label: address.label, name: address.fullName,
        line, city, zip, country: address.country, phone: address.phone,
      });
      if (Nova.isLoggedIn()) {
        try { const res = await API.post('/api/profile/addresses', { address }); Store.adopt({ addresses: res.addresses }); }
        catch (err) { toast(err.message, 'error'); }
      }
      toast('Address saved', 'success');
      render();
    });

    $$('[data-remove-addr]').forEach((b) =>
      b.addEventListener('click', async () => {
        const serverAddr = Store.state.addresses.find((a) => String(a.id) === String(b.dataset.removeAddr));
        Store.removeAddress(b.dataset.removeAddr);
        if (Nova.isLoggedIn() && serverAddr) {
          try {
            const res = await API.del(`/api/profile/addresses?id=${serverAddr.id}`);
            Store.adopt({ addresses: res.addresses });
          } catch { /* ignore */ }
        }
        toast('Address removed', 'info');
        render();
      }));

    $$('.invoice-btn').forEach((b) =>
      b.addEventListener('click', () => toast('Invoice downloaded (demo)', 'success')));
  }

  /* ============================================================
     ABOUT
     ============================================================ */

  function viewAbout() {
    document.title = 'About — KIDAMEgebeya';
    return `
    <div class="page-head page-head--center container">
      <span class="eyebrow">Our story</span>
      <h1>Thoughtful products,<br>delivered with care.</h1>
      <p>KIDAMEgebeya started in 2018 with a simple belief: buying great things online shouldn't be a gamble. Today we serve 50,000+ customers with an ever-growing catalogue that we test, rate and stand behind.</p>
    </div>

    <section class="container section">
      <div class="banner promo promo--split promo--about">
        <div class="promo__media">${imgTag('https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=1200&q=80&auto=format&fit=crop', '', 'promo__img', 'Studio')}</div>
        <div class="promo__body">
          <span class="eyebrow">Why KIDAMEgebeya</span>
          <h2>We're picky, so you don't have to be.</h2>
          <p>Every product on KIDAMEgebeya is trialled by our team, stress-tested and rated. If it doesn't earn a place, it doesn't make the shelf. The result is a catalogue you can shop with total confidence.</p>
          <ul class="about-list">
            <li>${I.check} 100% products tested in-house</li>
            <li>${I.check} Carbon-neutral delivery on every order</li>
            <li>${I.check} 2-year warranty on everything we sell</li>
          </ul>
        </div>
      </div>
    </section>

    <section class="section section--stats">
      <div class="container grid grid--stats">
        <div class="stat"><strong>50k+</strong><span>Happy customers</span></div>
        <div class="stat"><strong>1.2M</strong><span>Orders shipped</span></div>
        <div class="stat"><strong>4.9/5</strong><span>Average rating</span></div>
        <div class="stat"><strong>30 days</strong><span>Hassle-free returns</span></div>
      </div>
    </section>

    <section class="container section">
      ${sectionHeader('The team', 'The people who test, curate and pack your orders.', '')}
      <div class="grid grid--team">
        ${[
          ['Maya Carter', 'Founder & CEO', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80&auto=format&fit=crop'],
          ['Elias Novak', 'Head of Curation', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80&auto=format&fit=crop'],
          ['Rosa Delgado', 'Design Director', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80&auto=format&fit=crop'],
          ['Felix Andersson', 'Head of Logistics', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80&auto=format&fit=crop'],
        ].map(([n, r, a]) => `
        <div class="card team-card">
          <div class="team-card__media">${imgTag(a, n, 'team-card__img')}</div>
          <h3>${n}</h3><p>${r}</p>
        </div>`).join('')}
      </div>
    </section>

    <section class="container section">
      <div class="banner promo promo--cta">
        <div class="promo__body">
          <h2>Ready to find your next favourite?</h2>
          <p>Browse the catalogue and see what the fuss is about.</p>
        </div>
        <a class="btn btn--primary btn--lg" href="#/shop">Start shopping ${I.arrow}</a>
      </div>
    </section>`;
  }

  /* ============================================================
     CONTACT
     ============================================================ */

  function viewContact() {
    document.title = 'Contact — KIDAMEgebeya';
    return `
    <div class="page-head container">
      ${breadcrumbs([{ label: 'Home', href: '#/home' }, { label: 'Contact' }])}
      <h1>We're here to help</h1>
      <p>Questions about an order, a product or returns? Send us a message below or reach us directly.</p>
    </div>

    <div class="container section section--top">
      <div class="contact">
        <div class="contact__cards">
          <div class="card contact-card">${I.mail}<div><h3>Email us</h3><p>hello@kidamegebeya.store</p><a href="mailto:hello@kidamegebeya.store">Send an email ${I.arrow}</a></div></div>
          <div class="card contact-card">${I.phone}<div><h3>Call us</h3><p>Mon–Fri, 9am–6pm PT</p><a href="tel:+18005550199">+1 (800) 555-0199 ${I.arrow}</a></div></div>
          <div class="card contact-card">${I.pin}<div><h3>Visit us</h3><p>21 Market Street, Suite 400<br />San Francisco, CA 94105</p></div></div>
        </div>

        <div class="card contact__form">
          <h2 class="h2-sm">Send a message</h2>
          <form id="contactForm" class="form-grid" novalidate>
            <div class="field"><label>Your name *</label><input class="input" id="cfName" placeholder="Jane Doe"/></div>
            <div class="field"><label>Email address *</label><input class="input" type="email" id="cfEmail" placeholder="you@example.com"/></div>
            <div class="field"><label>Subject</label>
              <select class="select" id="cfSubject">
                <option>Order support</option><option>Product question</option><option>Returns &amp; refunds</option><option>Partnership</option><option>Something else</option>
              </select>
            </div>
            <div class="field"><label>Order number (optional)</label><input class="input" id="cfOrder" placeholder="e.g. NV-ABC123"/></div>
            <div class="field field--full"><label>Message *</label><textarea class="input" id="cfMsg" rows="6" placeholder="How can we help?"></textarea></div>
            <p class="form-msg" data-msg hidden></p>
            <div class="field field--full row row--end"><button class="btn btn--primary btn--lg" type="submit">${I.mail} Send message</button></div>
          </form>
        </div>
      </div>

      <div class="section">
        <h2 class="section-title">Quick answers</h2>
        <div class="faq">
          <details class="faq-item"><summary>How long does delivery take?</summary><p>Most orders arrive in 2–5 business days. Express shipping (1–2 days) is available at checkout.</p></details>
          <details class="faq-item"><summary>What is your return policy?</summary><p>You have 30 days from delivery to return any item in original condition for a full refund.</p></details>
          <details class="faq-item"><summary>Do you ship internationally?</summary><p>Yes — we deliver to 40+ countries. Duties &amp; taxes are calculated at checkout.</p></details>
        </div>
      </div>
    </div>`;
  }

  function mountContact() {
    $('#contactForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = $('#cfName').value.trim();
      const email = $('#cfEmail').value.trim();
      const msgTxt = $('#cfMsg').value.trim();
      const msg = $('[data-msg]');
      msg.hidden = false;
      if (!name || !email || !msgTxt) { msg.textContent = 'Please fill in your name, email and message.'; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = 'Please enter a valid email address.'; return; }
      msg.textContent = '';
      e.target.reset();
      toast('Message sent! We\'ll reply within one business day.', 'success', 'Thanks for reaching out');
    });
  }

  /* ============================================================
     NOT FOUND
     ============================================================ */

  function viewNotFound(msg = 'Page not found') {
    document.title = '404 — KIDAMEgebeya';
    return `
    <div class="container section section--top full-min">
      ${emptyState(msg, 'The page you’re looking for may have moved or never existed.', { href: '#/home', label: 'Back to home' })}
    </div>`;
  }

  /* ============================================================
     Search overlay
     ============================================================ */

  function bindSearch() {
    searchToggle.addEventListener('click', () => {
      const open = searchOverlay.hidden;
      if (open) {
        searchOverlay.hidden = false;
        document.body.classList.add('search-open');
        setTimeout(() => searchInput.focus(), 50);
      }
    });
    const close = () => { searchOverlay.hidden = true; document.body.classList.remove('search-open'); searchSuggestions.innerHTML = ''; };
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

    document.addEventListener('click', (e) => {
      if (!searchOverlay.hidden && !searchOverlay.contains(e.target) && !searchToggle.contains(e.target)) close();
    });

    searchInput.addEventListener('input', debounce(() => {
      const term = searchInput.value.trim().toLowerCase();
      if (!term) { searchSuggestions.innerHTML = ''; return; }
      const prods = PRODUCTS.filter((p) => [p.name, p.brand, getCategory(p.category)?.name].join(' ').toLowerCase().includes(term)).slice(0, 6);
      const cats = CATEGORIES.filter((c) => c.name.toLowerCase().includes(term)).slice(0, 2);
      searchSuggestions.innerHTML = `
        ${cats.length ? cats.map((c) => `<a href="#/shop?cat=${c.id}" class="suggestion"><span class="suggestion__icon">${I.chevron}</span>${escapeHtml(c.name)} <em>Category</em></a>`).join('') : ''}
        ${prods.length ? prods.map((p) => `
          <a href="#/product/${p.id}" class="suggestion">
            <span class="suggestion__img">${imgTag(p.images[0], p.name, 'suggestion__thumb')}</span>
            <span><strong>${escapeHtml(p.name)}</strong><em>${money(p.price)}</em></span>
          </a>`).join('') : `<span class="suggestion suggestion--none">No results for “${escapeHtml(searchInput.value.trim())}”</span>`}
        <a href="#/shop?q=${encodeURIComponent(searchInput.value.trim())}" class="suggestion suggestion--all">See all results for “${escapeHtml(searchInput.value.trim())}” ${I.arrow}</a>`;
      $$('.suggestion').forEach((s) => s.addEventListener('click', close));
    }, 200));

    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const term = searchInput.value.trim();
      close();
      location.hash = term ? '#/shop?q=' + encodeURIComponent(term) : '#/shop';
    });
  }

  /* ============================================================
     Global delegated interactions
     ============================================================ */

  function bindGlobal() {
    document.addEventListener('click', (e) => {
      const actEl = e.target.closest('[data-action]');
      if (actEl) {
        const action = actEl.dataset.action;
        const id = actEl.dataset.id || actEl.dataset.cartId;
        const el = actEl;

        if (action === 'add') {
          const qtyEl = el.dataset.qtySource ? $('#' + el.dataset.qtySource) : null;
          const qty = qtyEl ? Number(qtyEl.value) || 1 : 1;
          const p = getProduct(el.dataset.id);
          Store.addToCart(el.dataset.id, qty);
          toast(`${qty} × ${p?.name || 'item'} added to cart`, 'success');
        }
        else if (action === 'buy-now') {
          const qtyEl = $('#' + el.dataset.qtySource);
          const qty = qtyEl ? Number(qtyEl.value) || 1 : 1;
          const clicked = $$('.product__buy');
          clicked.forEach((b) => { b.disabled = true; b.textContent = 'Adding…'; });
          setTimeout(() => {
            Store.addToCart(el.dataset.id, qty);
            clicked.forEach((b) => { b.disabled = false; b.innerHTML = `Buy now ${I.arrow}`; });
            location.hash = '#/checkout';
          }, 350);
        }
        else if (action === 'wishlist') {
          const fav = Store.toggleWishlist(el.dataset.id);
          const p = getProduct(el.dataset.id);
          if (fav) {
            el.innerHTML = I.heartFill;
            el.classList.add('is-active');
            toast(`${p?.name || 'Item'} saved to wishlist`, 'success', 'Saved');
          } else {
            el.innerHTML = I.heart;
            el.classList.remove('is-active');
            toast('Removed from wishlist', 'info');
          }
        }
        else if (action === 'remove' && id) {
          Store.removeFromCart(id);
          const row = el.closest('[data-id]') || el.closest('.cart-item');
          row?.animate([{ opacity: 1, transform: 'translateX(0)' }, { opacity: 0, transform: 'translateX(24px)' }], { duration: 220 });
          setTimeout(() => { if (location.hash.startsWith('#/cart')) render(); }, 180);
          toast('Item removed from cart', 'info');
        }
        else if (action === 'qty-up') { changeQty(id, +1); }
        else if (action === 'qty-down') { changeQty(id, -1); }
        else if (action === 'qty-input') { /* handled on change */ }
        else if (action === 'shop-clear') {
          location.hash = setQueryParam(location.hash, 'q', '');
        }
      }
    });

    document.addEventListener('change', (e) => {
      const t = e.target;
      if (t.matches('[data-action="qty-input"]')) {
        const id = t.dataset.cartId || t.dataset.id;
        if (!id) return;
        const p = getProduct(id);
        const val = clamp(Number(t.value) || 1, 1, p.stock);
        t.value = val;
        Store.setQty(id, val);
      }
    });
  }

  function changeQty(id, delta) {
    const items = Store.cartItems();
    const found = items.find((i) => i.product.id === id);
    if (!found) return;
    Store.setQty(id, found.qty + delta);
    if (location.hash.startsWith('#/cart')) render();
  }

  /* ============================================================
     Router
     ============================================================ */

  function viewVerify() {
    const q = parseQuery(location.hash);
    document.title = 'Verify email — KIDAMEgebeya';
    if (!q.token) {
      if (q.email && !verifyOtp) verifyOtp = { email: q.email, sent: false, devOtp: null };
      const o = verifyOtp || { email: '', sent: false, devOtp: null };
      return `
      <div class="container section section--top full-min">
        <div class="card auth-card">
          <div class="auth-icon">${I.mail}</div>
          <h3>Verify with a code</h3>
          <p class="auth-hint">Enter the 6-digit code we emailed to your address. If you haven't requested one, send it first.</p>
          <form id="verifyOtpForm" class="form-stack" novalidate>
            <div class="field"><label>Email address</label><input class="input" type="email" id="vOtpEmail" value="${escapeHtml(o.email || '')}" autocomplete="email" ${o.sent ? 'disabled' : ''} /></div>
            ${o.sent ? `
              ${o.devOtp ? `<p class="dev-link">Dev mode — your code is <strong style="letter-spacing:3px">${escapeHtml(o.devOtp)}</strong></p>` : ''}
              <div class="field"><label>6-digit code</label><input class="input" id="vOtpCode" inputmode="numeric" maxlength="6" placeholder="000000" autocomplete="one-time-code" /></div>
              <button class="btn btn--primary btn--lg btn--block" type="submit">Verify email ${I.arrow}</button>` : `
              <button class="btn btn--primary btn--lg btn--block" type="submit">Send code ${I.arrow}</button>`}
            <p class="form-msg" data-msg hidden></p>
            <p class="auth-hint"><a href="#/account">Back to sign in</a> · <a href="#/forgot">Forgot password?</a></p>
          </form>
        </div>
      </div>`;
    }
    return `
    <div class="container section section--top full-min">
      <div class="card auth-card" style="text-align:center" id="verifyStatus">
        <div class="auth-icon">${I.mail}</div>
        <h3>Verifying your email…</h3>
        <p class="auth-hint">One moment while we confirm your address.</p>
      </div>
    </div>`;
  }

  function mountVerify() {
    const token = parseQuery(location.hash).token;
    const form = $('#verifyOtpForm');
    if (form) {
      const msg = $('#verifyOtpForm [data-msg]');
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        msg.hidden = false;
        const o = verifyOtp || { sent: false, email: '' };
        const btn = $('#verifyOtpForm button[type=submit]');
        if (!o.sent) {
          const email = $('#vOtpEmail').value.trim();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = 'Enter a valid email address.'; return; }
          btn.disabled = true;
          try {
            const res = await API.post('/api/auth/verify/otp', { email });
            verifyOtp = { email, sent: true, devOtp: res.devOtp || null };
            render();
          } catch (err) { msg.textContent = err.message || 'Something went wrong. Try again.'; btn.disabled = false; }
        } else {
          const code = $('#vOtpCode').value.trim();
          if (!/^\d{6}$/.test(code)) { msg.textContent = 'Enter the 6-digit code.'; return; }
          btn.disabled = true;
          try {
            await API.post('/api/auth/verify/otp/confirm', { email: o.email, code });
            pendingVerifyEmail = null;
            pendingVerifyLink = null;
            verifyOtp = null;
            await Nova.init();
            toast('Email verified — welcome to KIDAMEgebeya!', 'success');
            location.hash = '#/account';
          } catch (err) { msg.textContent = err.message || 'Something went wrong. Try again.'; btn.disabled = false; }
        }
      });
      return;
    }
    if (!token) return;
    (async () => {
      const status = $('#verifyStatus');
      try {
        await API.post('/api/auth/verify', { token });
        pendingVerifyEmail = null;
        pendingVerifyLink = null;
        await Nova.init();
        toast('Email verified — welcome to KIDAMEgebeya!', 'success');
        location.hash = '#/account';
      } catch (err) {
        if (status) {
          status.innerHTML = `
            <div class="auth-icon">${I.warning}</div>
            <h3>Link invalid or expired</h3>
            <p class="auth-hint">${escapeHtml(err.message || 'Request a fresh verification email.')}</p>
            <a class="btn btn--primary btn--block" href="#/account">Go to sign in</a>`;
        }
      }
    })();
  }

  function viewForgot() {
    document.title = 'Reset password — KIDAMEgebeya';
    const isCode = forgotOtp.mode === 'otp';
    return `
    <div class="container section section--top full-min">
      <div class="card auth-card">
        <div class="auth-icon">${I.lock}</div>
        ${isCode ? `
        <h3>Reset with a code</h3>
        <p class="auth-hint">We'll email you a 6-digit code, then you can pick a new password.</p>
        <form id="forgotOtpForm" class="form-stack" novalidate>
          <div class="field"><label>Email address</label><input class="input" type="email" id="foEmail" value="${escapeHtml(forgotOtp.email || '')}" autocomplete="email" ${forgotOtp.sent ? 'disabled' : ''} /></div>
          ${forgotOtp.sent ? `
            ${forgotOtp.devOtp ? `<p class="dev-link">Dev mode — your code is <strong style="letter-spacing:3px">${escapeHtml(forgotOtp.devOtp)}</strong></p>` : ''}
            <div class="field"><label>6-digit code</label><input class="input" id="foCode" inputmode="numeric" maxlength="6" placeholder="000000" autocomplete="one-time-code" /></div>
            <div class="field"><label>New password</label><input class="input" type="password" id="foPass" autocomplete="new-password" /></div>
            <div class="field"><label>Confirm password</label><input class="input" type="password" id="foPass2" autocomplete="new-password" /></div>
            <button class="btn btn--primary btn--lg btn--block" type="submit">Reset password ${I.arrow}</button>
            <p class="auth-hint"><a href="#/forgot" data-forgot-mode="link">Prefer the email link? Use a link instead</a></p>` : `
            <button class="btn btn--primary btn--lg btn--block" type="submit">Send code ${I.arrow}</button>
            <p class="auth-hint"><a href="#/forgot" data-forgot-mode="link">Prefer the email link? Use a link instead</a></p>`}
          <p class="form-msg" data-msg hidden></p>
          <p class="auth-hint"><a href="#/account">Back to sign in</a></p>
        </form>` : `
        <h3>Reset your password</h3>
        <p class="auth-hint">Enter your account email and we'll send you a secure reset link.</p>
        <form id="forgotForm" class="form-stack" novalidate>
          <div class="field"><label>Email address</label><input class="input" type="email" id="forgotEmail" autocomplete="email" /></div>
          <p class="form-msg" data-msg hidden></p>
          <button class="btn btn--primary btn--lg btn--block" type="submit">Send reset link ${I.arrow}</button>
          <p class="auth-hint"><a href="#/forgot" data-forgot-mode="otp">Prefer a code? Use a 6-digit code instead</a></p>
          <p class="auth-hint"><a href="#/account">Back to sign in</a></p>
        </form>`}
      </div>
    </div>`;
  }

  function mountForgot() {
    $('#forgotForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = $('#forgotForm [data-msg]');
      const email = $('#forgotEmail').value.trim();
      msg.hidden = false;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = 'Enter a valid email address.'; return; }
      const btn = $('#forgotForm button[type=submit]');
      btn.disabled = true;
      try {
        const res = await API.post('/api/auth/reset/request', { email });
        const link = res.devLink
          ? ` Dev mode — no email sent. Open directly: <a href="${escapeHtml(res.devLink)}" rel="nofollow">reset your password</a>.`
          : '';
        msg.innerHTML = `If an account exists for ${escapeHtml(email)}, a reset link is on its way. Check your inbox.${link}`;
        msg.classList.add('form-msg--ok');
      } catch (err) {
        msg.textContent = err.message || 'Something went wrong. Try again.';
      }
      btn.disabled = false;
    });

    $('#forgotOtpForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = $('#forgotOtpForm [data-msg]');
      msg.hidden = false;
      const btn = $('#forgotOtpForm button[type=submit]');
      if (!forgotOtp.sent) {
        const email = $('#foEmail').value.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = 'Enter a valid email address.'; return; }
        btn.disabled = true;
        try {
          const res = await API.post('/api/auth/reset/otp', { email });
          forgotOtp = { mode: 'otp', email, sent: true, devOtp: res.devOtp || null };
          render();
        } catch (err) { msg.textContent = err.message || 'Something went wrong. Try again.'; btn.disabled = false; }
      } else {
        const code = $('#foCode').value.trim();
        const pass = $('#foPass').value;
        const pass2 = $('#foPass2').value;
        if (!/^\d{6}$/.test(code)) { msg.textContent = 'Enter the 6-digit code.'; return; }
        if (pass.length < 6) { msg.textContent = 'Password must be at least 6 characters.'; return; }
        if (pass !== pass2) { msg.textContent = 'Passwords do not match.'; return; }
        btn.disabled = true;
        try {
          await API.post('/api/auth/reset/otp/confirm', { email: forgotOtp.email, code, password: pass });
          forgotOtp = { mode: 'link', email: '', sent: false, devOtp: null };
          toast('Password updated. Sign in with your new password.', 'success');
          location.hash = '#/account';
        } catch (err) { msg.textContent = err.message || 'Something went wrong. Try again.'; btn.disabled = false; }
      }
    });

    $$('[data-forgot-mode]').forEach((a) => a.addEventListener('click', (e) => {
      e.preventDefault();
      forgotOtp.mode = a.dataset.forgotMode;
      forgotOtp.sent = false;
      render();
    }));
  }

  function viewReset() {
    const q = parseQuery(location.hash);
    document.title = 'Reset password — KIDAMEgebeya';
    if (!q.token) {
      return `
      <div class="container section section--top full-min">
        <div class="card auth-card" style="text-align:center">
          <div class="auth-icon">${I.warning}</div>
          <h3>Invalid reset link</h3>
          <p class="auth-hint">This link is missing or has expired. Request a new one.</p>
          <a class="btn btn--primary btn--block" href="#/forgot">Request a new link</a>
        </div>
      </div>`;
    }
    return `
    <div class="container section section--top full-min">
      <div class="card auth-card">
        <div class="auth-icon">${I.lock}</div>
        <h3>Choose a new password</h3>
        <p class="auth-hint">Pick something strong — at least 6 characters.</p>
        <form id="resetForm" class="form-stack" novalidate>
          <div class="field"><label>New password</label><input class="input" type="password" id="rNewPass" autocomplete="new-password" /></div>
          <div class="field"><label>Confirm password</label><input class="input" type="password" id="rNewPass2" autocomplete="new-password" /></div>
          <p class="form-msg" data-msg hidden></p>
          <button class="btn btn--primary btn--lg btn--block" type="submit">Update password ${I.arrow}</button>
        </form>
      </div>
    </div>`;
  }

  function mountReset() {
    $('#resetForm')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = $('#resetForm [data-msg]');
      const pass = $('#rNewPass').value;
      const pass2 = $('#rNewPass2').value;
      const token = parseQuery(location.hash).token;
      msg.hidden = false;
      if (pass.length < 6) { msg.textContent = 'Password must be at least 6 characters.'; return; }
      if (pass !== pass2) { msg.textContent = 'Passwords do not match.'; return; }
      const btn = $('#resetForm button[type=submit]');
      btn.disabled = true;
      try {
        await API.post('/api/auth/reset/confirm', { token, password: pass });
        toast('Password updated. Sign in with your new password.', 'success');
        location.hash = '#/account';
      } catch (err) {
        msg.textContent = err.message || 'Something went wrong. Try again.';
        btn.disabled = false;
      }
    });
  }

  function routeFor(path, query) {
    if (/^\/product\//.test(path)) return { key: 'product', param: decodeURIComponent(path.split('/')[2]) };
    if (/^\/order\//.test(path)) return { key: 'order', param: decodeURIComponent(path.split('/')[2]) };
    const map = {
      '/home': 'home', '/': 'home', '': 'home',
      '/shop': 'shop', '/categories': 'categories', '/cart': 'cart', '/checkout': 'checkout',
      '/account': 'account', '/wishlist': 'wishlist', '/about': 'about', '/contact': 'contact',
      '/verify': 'verify', '/forgot': 'forgot', '/reset': 'reset',
      '/admin': 'admin',
    };
    return { key: map[path] || 'notfound' };
  }

  const views = {
    home: { render: viewHome, mount: mountHome },
    shop: { render: viewShop, mount: mountShop },
    product: { render: (id) => viewProduct(id), mount: mountProduct },
    categories: { render: viewCategories, mount: () => {} },
    cart: { render: viewCart, mount: mountCart },
    checkout: { render: viewCheckout, mount: mountCheckout },
    account: { render: viewAccount, mount: mountAccount },
    verify: { render: viewVerify, mount: mountVerify },
    forgot: { render: viewForgot, mount: mountForgot },
    reset: { render: viewReset, mount: mountReset },
    wishlist: { render: viewWishlist, mount: () => {} },
    order: { render: (id) => viewOrder(id), mount: () => {} },
    about: { render: viewAbout, mount: () => {} },
    contact: { render: viewContact, mount: mountContact },
    admin: { render: () => Admin.view(), mount: () => Admin.mount() },
    notfound: { render: viewNotFound, mount: () => {} },
  };

  function render() {
    const hash = location.hash || '#/home';
    const path = hash.split('?')[0].replace(/^#/, '');
    const { key, param } = routeFor(path, parseQuery(hash));
    const view = views[key] || views.notfound;
    app.innerHTML = view.render ? view.render(param) : '';
    currentMount = view.mount || (() => {});
    currentMount();
    setActiveNav(key);
    document.body.classList.remove('filters-open');
  }

  function setActiveNav(key) {
    const map = { home: 'home', shop: 'shop', product: 'shop', categories: 'categories', about: 'about', contact: 'contact', admin: 'admin' };
    const active = map[key];
    $$('#mainNav a').forEach((a) => a.classList.toggle('is-active', a.dataset.nav === active));
  }

  window.addEventListener('hashchange', () => { render(); scrollToTop(); });

  /* ============================================================
     Nav chrome: badges, mobile menu, header shadow, fab
     ============================================================ */

  function updateBadges() {
    const c = Store.cartCount();
    const w = Store.wishlistCount();
    const cartBadge = $('#cartBadge'), wBadge = $('#wishlistBadge'), fabBadge = $('#fabBadge');
    cartBadge.hidden = !c; cartBadge.textContent = c > 99 ? '99+' : c;
    wBadge.hidden = !w; wBadge.textContent = w > 99 ? '99+' : w;
    fabBadge.hidden = !c; fabBadge.textContent = c > 99 ? '99+' : c;
    $('#fab').classList.toggle('is-visible', !!c);
    $('#accountLink')?.classList.toggle('is-auth', Nova.isLoggedIn());
  }

  function bindChrome() {
    menuToggle.addEventListener('click', () => {
      const open = document.body.classList.toggle('menu-open');
      menuToggle.setAttribute('aria-expanded', open);
    });
    mainNav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
      document.body.classList.remove('menu-open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }));

    const header = $('#siteHeader');
    const onScroll = () => header.classList.toggle('header--scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ============================================================
     Newsletter (footer)
     ============================================================ */

  function bindNewsletter() {
    $('#footerNewsletterForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = $('#footerNewsletterForm input');
      const msg = $('#footerNewsletter [data-msg]');
      const val = input.value.trim();
      msg.hidden = false;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
        msg.textContent = 'Please enter a valid email address.';
        msg.classList.toggle('form-msg--ok', false);
        input.focus();
        return;
      }
      msg.textContent = 'Welcome aboard! Check your inbox for 10% off. 🎉';
      msg.classList.add('form-msg--ok');
      input.value = '';
      Store.saveProfile({ email: val });
      toast('Subscribed to the KIDAMEgebeya newsletter', 'success');
    });
  }

  /* ============================================================
     Init
     ============================================================ */

  Store.subscribe(() => {
    updateBadges();
    if (location.hash.startsWith('#/cart')) { render(); }
  });

  async function bootstrapCatalog() {
    try {
      const [prod, cats] = await Promise.all([API.get('/api/products'), API.get('/api/categories')]);
      if (prod?.products?.length && cats?.categories?.length) {
        const P = prod.products;
        const C = cats.categories;
        Object.assign(window, {
          PRODUCTS: P,
          CATEGORIES: C,
          getProduct: (id) => P.find((x) => x.id === id),
          getCategory: (id) => C.find((x) => x.id === id),
          relatedProducts: (product, limit = 4) => {
            const sameCat = P.filter((p) => p.category === product.category && p.id !== product.id);
            const others = P.filter((p) => p.category !== product.category && p.id !== product.id);
            return [...sameCat, ...others].slice(0, limit);
          },
        });
      }
    } catch { /* static catalog in data.js remains as fallback */ }
  }

  async function init() {
    await bootstrapCatalog();
    await Nova.init();
    Nova.bind();
    bindSearch();
    bindGlobal();
    bindChrome();
    bindNewsletter();
    window.addEventListener('noverender', render);
    Admin.check();
    updateBadges();
    render();
  }

  init();
})();