/* ============================================
   MARWA PARFUMERIE - Complete JavaScript
   ============================================ */

// ============================================
// 0. Store Manager (LocalStorage)
// ============================================
const MarwaStore = {
  getCart() {
    try { return JSON.parse(localStorage.getItem('marwa_cart') || '[]'); }
    catch { return []; }
  },
  setCart(cart) {
    localStorage.setItem('marwa_cart', JSON.stringify(cart));
    this.updateCartUI();
    this.flashBadge('[data-cart-count]');
  },
  addToCart(item) {
    const cart = this.getCart();
    const existing = cart.find((i) => i.name === item.name);
    if (existing) existing.qty = (existing.qty || 1) + 1;
    else cart.push({ ...item, qty: 1 });
    this.setCart(cart);
  },
  removeFromCart(name) {
    this.setCart(this.getCart().filter((i) => i.name !== name));
  },
  updateQty(name, delta) {
    const cart = this.getCart();
    const item = cart.find((i) => i.name === name);
    if (!item) return;
    item.qty = Math.max(1, (item.qty || 1) + delta);
    this.setCart(cart);
  },
  clearCart() {
    this.setCart([]);
  },
  getCartCount() {
    return this.getCart().reduce((s, i) => s + (i.qty || 1), 0);
  },
  getCartTotal() {
    return this.getCart().reduce((s, i) => {
      const p = parseFloat(String(i.price).replace(/[^\d.]/g, '')) || 0;
      return s + p * (i.qty || 1);
    }, 0);
  },
  getWishlist() {
    try { return JSON.parse(localStorage.getItem('marwa_wishlist') || '[]'); }
    catch { return []; }
  },
  setWishlist(list) {
    localStorage.setItem('marwa_wishlist', JSON.stringify(list));
    this.updateWishlistUI();
    this.flashBadge('[data-wishlist-count]');
  },
  toggleWishlist(item) {
    const list = this.getWishlist();
    const idx = list.findIndex((i) => i.name === item.name);
    let added = false;
    if (idx > -1) list.splice(idx, 1);
    else { list.push(item); added = true; }
    this.setWishlist(list);
    return added;
  },
  isInWishlist(name) {
    return this.getWishlist().some((i) => i.name === name);
  },
  updateCartUI() {
    const count = this.getCartCount();
    document.querySelectorAll('[data-cart-count]').forEach((el) => {
      el.textContent = toArabicNum(count);
    });
    document.querySelectorAll('.sidebar-cart-count').forEach((el) => {
      if (el.hasAttribute('data-cart-count')) {
        el.textContent = toArabicNum(count);
      } else {
        el.textContent = toArabicNum(count) + ' عناصر';
      }
    });
    renderCartDrawer();
  },
  updateWishlistUI() {
    const count = this.getWishlist().length;
    document.querySelectorAll('[data-wishlist-count]').forEach((el) => {
      el.textContent = toArabicNum(count);
    });
    document.querySelectorAll('.product-wishlist, .wishlist-btn').forEach((btn) => {
      const name = btn.dataset.productName;
      if (!name) return;
      const icon = btn.querySelector('.material-symbols-outlined');
      if (!icon) return;
      if (this.isInWishlist(name)) {
        icon.style.fontVariationSettings = "'FILL' 1";
        icon.classList.add('filled');
        btn.classList.add('active', 'text-primary');
        btn.classList.remove('text-outline');
      } else {
        icon.style.fontVariationSettings = "'FILL' 0";
        icon.classList.remove('filled');
        btn.classList.remove('active', 'text-primary');
        btn.classList.add('text-outline');
      }
    });
  },
  flashBadge(selector) {
    document.querySelectorAll(selector).forEach((el) => {
      el.classList.add('updated');
      setTimeout(() => el.classList.remove('updated'), 400);
    });
  },
};

// Arabic numerals helper
function toArabicNum(n) {
  return String(n).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[d]);
}

// ============================================
// 1. Canvas Animation
// ============================================
(function initCanvasAtmosphere() {
  const canvas = document.getElementById('luxury-petals-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;

  function resize() {
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const petals = [];
  const count = 28;
  for (let i = 0; i < count; i++) {
    petals.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 6 + 4,
      color: Math.random() > 0.4 ? 'rgba(216, 167, 177, 0.45)' : 'rgba(201, 169, 106, 0.4)',
      tilt: Math.floor(Math.random() * 10) - 10,
      tiltInc: Math.random() * 0.05 + 0.02,
      speed: Math.random() * 0.7 + 0.3,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < count; i++) {
      const p = petals[i];
      ctx.beginPath();
      ctx.lineWidth = p.r / 2;
      ctx.strokeStyle = p.color;
      ctx.fillStyle = p.color;
      ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
      ctx.bezierCurveTo(p.x + p.tilt, p.y + p.r * 1.5, p.x - p.r, p.y + p.r * 1.5, p.x - p.r, p.y);
      ctx.bezierCurveTo(p.x - p.r, p.y - p.r * 1.5, p.x + p.tilt, p.y - p.r * 1.5, p.x + p.tilt + p.r / 4, p.y);
      ctx.fill();

      p.tilt += p.tiltInc;
      p.y += p.speed;
      p.x += Math.sin(p.tilt) * 0.5;
      if (p.y > height) { p.x = Math.random() * width; p.y = -20; }
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ============================================
// 2. Toast
// ============================================
function showToast(message) {
  const toast = document.getElementById('cart-toast');
  const toastText = document.getElementById('cart-toast-text');
  if (!toast || !toastText) return;
  toastText.textContent = message;
  toast.classList.add('active');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('active'), 3200);
}

// ============================================
// 3. Add to Cart
// ============================================
function addToCartNotification(productName, price) {
  // Find product card by matching title
  let card = null;
  document.querySelectorAll('.product-card, .bundle-card').forEach((c) => {
    const title = c.querySelector('.product-title, .bundle-title, h3, h2');
    if (title && title.textContent.trim() === productName) card = c;
  });

  if (!price && card) {
    const priceEl = card.querySelector('.product-price-value, .bundle-new-price');
    if (priceEl) price = priceEl.textContent.replace(/\s+/g, ' ').trim();
  }
  if (!price) price = '0 ر.س';

  const imgEl = card?.querySelector('.product-image-frame img, .bundle-image img');
  const image = imgEl?.src || '';

  MarwaStore.addToCart({ name: productName, price, image, qty: 1 });
  showToast(`تمت إضافة "${productName}" إلى حقيبة التسوق`);
  setTimeout(openCartDrawer, 200);
}

// ============================================
// 4. Wishlist Init
// ============================================
function initWishlistButtons() {
  document.querySelectorAll('.product-wishlist, .wishlist-btn').forEach((btn) => {
    const card = btn.closest('.product-card') || btn.closest('[data-name]');
    if (card && !btn.dataset.productName) {
      const titleEl = card.querySelector('.product-title, h3, h2');
      if (titleEl) btn.dataset.productName = titleEl.textContent.trim();
    }
  });

  MarwaStore.updateWishlistUI();

  document.querySelectorAll('.product-wishlist, .wishlist-btn').forEach((btn) => {
    if (btn.dataset.wishlistBound === '1') return;
    btn.dataset.wishlistBound = '1';

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const name = btn.dataset.productName || 'منتج';
      const card = btn.closest('.product-card');
      const priceEl = card?.querySelector('.product-price-value');
      const imgEl = card?.querySelector('.product-image-frame img');
      const item = {
        name,
        price: priceEl?.textContent.replace(/\s+/g, ' ').trim() || '',
        image: imgEl?.src || '',
      };
      const added = MarwaStore.toggleWishlist(item);
      showToast(added ? 'تمت الإضافة إلى قائمة أمنياتكِ' : 'تمت الإزالة من قائمة أمنياتكِ');
    });
  });
}

// ============================================
// 5. Filter Tabs
// ============================================
function initFilterTabs() {
  const filterButtons = document.querySelectorAll('.filter-btn[data-filter]');
  const productCards = document.querySelectorAll('[data-category]');
  if (!filterButtons.length) return;

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      const filterValue = button.getAttribute('data-filter');
      productCards.forEach((card) => {
        const categories = card.getAttribute('data-category')?.split(' ') || [];
        card.style.display = (filterValue === 'all' || categories.includes(filterValue)) ? 'flex' : 'none';
      });
    });
  });
}

// ============================================
// 6. Quick View Modal
// ============================================
function openQuickView(title, price, desc) {
  const modal = document.getElementById('quick-view-modal');
  if (!modal) return;
  const titleEl = document.getElementById('modal-title');
  const priceEl = document.getElementById('modal-price');
  const descEl = document.getElementById('modal-desc');
  const addBtn = document.getElementById('modal-add-btn');
  if (titleEl) titleEl.textContent = title;
  if (priceEl) priceEl.textContent = price;
  if (descEl) descEl.textContent = desc;
  if (addBtn) addBtn.onclick = () => { addToCartNotification(title, price); closeQuickView(); };
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeQuickView() {
  const modal = document.getElementById('quick-view-modal');
  if (!modal) return;
  modal.classList.remove('active');
  document.body.style.overflow = '';
}

// ============================================
// 7. Mobile Menu
// ============================================
function initMobileMenu() {
  const toggle = document.getElementById('mobile-menu-toggle');
  const sidebar = document.getElementById('sidebar');
  if (!toggle || !sidebar) return;
  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    const icon = toggle.querySelector('.material-symbols-outlined');
    if (icon) icon.textContent = sidebar.classList.contains('open') ? 'close' : 'menu';
  });
}

// ============================================
// 8. Cart Drawer
// ============================================
function ensureCartDrawer() {
  if (document.getElementById('cart-drawer')) return;
  const drawer = document.createElement('div');
  drawer.id = 'cart-drawer';
  drawer.className = 'cart-drawer';
  drawer.innerHTML = `
    <div class="cart-drawer-backdrop" onclick="closeCartDrawer()"></div>
    <aside class="cart-drawer-panel">
      <header class="cart-drawer-header">
        <div>
          <span class="section-label">حقيبة التسوق</span>
          <h3 class="cart-drawer-title">منتجاتكِ المختارة</h3>
        </div>
        <button class="cart-drawer-close" onclick="closeCartDrawer()" type="button" aria-label="إغلاق">
          <span class="material-symbols-outlined">close</span>
        </button>
      </header>
      <div class="cart-drawer-body" id="cart-drawer-body"></div>
      <footer class="cart-drawer-footer">
        <div class="cart-total-row">
          <span>المجموع الكلي</span>
          <strong id="cart-total">٠ ر.س</strong>
        </div>
        <button class="cart-checkout-btn" type="button" onclick="checkoutCart()">
          <span class="material-symbols-outlined">lock</span>
          <span>إتمام الشراء</span>
        </button>
        <button class="cart-continue-btn" type="button" onclick="closeCartDrawer()">متابعة التسوق</button>
      </footer>
    </aside>
  `;
  document.body.appendChild(drawer);
}
function openCartDrawer() {
  ensureCartDrawer();
  renderCartDrawer();
  document.getElementById('cart-drawer').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeCartDrawer() {
  const d = document.getElementById('cart-drawer');
  if (d) d.classList.remove('active');
  document.body.style.overflow = '';
}
function renderCartDrawer() {
  const body = document.getElementById('cart-drawer-body');
  const total = document.getElementById('cart-total');
  if (!body) return;
  const cart = MarwaStore.getCart();
  if (!cart.length) {
    body.innerHTML = `
      <div class="cart-empty">
        <span class="material-symbols-outlined">shopping_bag</span>
        <p>حقيبتكِ فارغة حالياً</p>
        <span>ابدئي بإضافة عطوركِ المفضلة</span>
      </div>`;
    if (total) total.textContent = '٠ ر.س';
    return;
  }
  body.innerHTML = cart.map((item) => {
    const name = item.name.replace(/"/g, '&quot;');
    const price = item.price || '0 ر.س';
    const img = item.image
      ? `<img src="${item.image}" alt="${name}" />`
      : `<div class="cart-item-noimg"><span class="material-symbols-outlined">local_florist</span></div>`;
    return `
      <div class="cart-item">
        <div class="cart-item-img">${img}</div>
        <div class="cart-item-info">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-price">${price}</span>
          <div class="cart-item-qty">
            <button onclick="changeQty('${name}', -1)" type="button" aria-label="نقص">−</button>
            <span>${toArabicNum(item.qty || 1)}</span>
            <button onclick="changeQty('${name}', 1)" type="button" aria-label="زيادة">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeCartItem('${name}')" type="button" aria-label="حذف">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    `;
  }).join('');
  const tot = MarwaStore.getCartTotal();
  if (total) total.textContent = toArabicNum(Math.round(tot)) + ' ر.س';
}
function changeQty(name, delta) { MarwaStore.updateQty(name, delta); }
function removeCartItem(name) {
  MarwaStore.removeFromCart(name);
  showToast('تمت إزالة المنتج من الحقيبة');
}

// ============================================
// ✅ CHECKOUT CART - UPDATED
// ============================================
function checkoutCart() {
  const cart = MarwaStore.getCart();
  if (!cart.length) {
    showToast('حقيبتكِ فارغة، أضيفي منتجات أولاً');
    return;
  }
  // Redirect to checkout page
  closeCartDrawer();
  setTimeout(() => {
    window.location.href = 'checkout.html';
  }, 300);
}

// ============================================
// 9. Search
// ============================================
function initSearch() {
  const inputs = document.querySelectorAll('.header-search input');
  if (!inputs.length) return;

  inputs.forEach((input) => {
    const wrapper = input.parentElement;
    if (!wrapper) return;
    wrapper.style.position = 'relative';

    const results = document.createElement('div');
    results.className = 'search-results';
    wrapper.appendChild(results);

    let debounceTimer;
    input.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      const q = e.target.value.trim();
      if (q.length < 1) {
        results.classList.remove('active');
        results.innerHTML = '';
        return;
      }
      debounceTimer = setTimeout(() => renderSearchResults(q, results), 150);
    });

    input.addEventListener('focus', (e) => {
      if (e.target.value.trim().length >= 1) {
        renderSearchResults(e.target.value.trim(), results);
      }
    });

    document.addEventListener('click', (e) => {
      if (!wrapper.contains(e.target)) results.classList.remove('active');
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') results.classList.remove('active');
    });
  });
}

function getSearchableProducts() {
  const products = [];
  document.querySelectorAll('.product-card, .bundle-card, .portal-card').forEach((card) => {
    const titleEl = card.querySelector('.product-title, .bundle-title, .portal-title, h3, h2');
    const descEl = card.querySelector('.product-desc, .bundle-desc, .portal-subtitle, p');
    const priceEl = card.querySelector('.product-price-value, .bundle-new-price');
    const linkEl = card.closest('a') || card.querySelector('a');
    const link = linkEl?.getAttribute('href') || '#';
    if (!titleEl) return;
    products.push({
      name: titleEl.textContent.trim(),
      desc: descEl?.textContent.trim() || '',
      price: priceEl?.textContent.replace(/\s+/g, ' ').trim() || '',
      link,
      element: card,
    });
  });
  return products;
}

function renderSearchResults(query, container) {
  const products = getSearchableProducts();
  const q = query.toLowerCase();
  const matches = products.filter((p) =>
    p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
  ).slice(0, 6);

  if (!matches.length) {
    container.innerHTML = `
      <div class="search-empty">
        <span class="material-symbols-outlined">search_off</span>
        <span>لا توجد نتائج مطابقة لـ "${query}"</span>
      </div>`;
    container.classList.add('active');
    return;
  }

  container.innerHTML = matches.map((p) => {
    const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const highlighted = p.name.replace(new RegExp(`(${safeQuery})`, 'gi'), '<mark>$1</mark>');
    return `
      <div class="search-result-item">
        <span class="material-symbols-outlined">local_florist</span>
        <div>
          <div class="search-result-name">${highlighted}</div>
          <div class="search-result-desc">${p.desc.substring(0, 70)}${p.desc.length > 70 ? '...' : ''}</div>
        </div>
        ${p.price ? `<span class="search-result-price">${p.price}</span>` : ''}
      </div>
    `;
  }).join('');

  container.classList.add('active');

  container.querySelectorAll('.search-result-item').forEach((item, idx) => {
    item.addEventListener('click', () => {
      const product = matches[idx];
      container.classList.remove('active');
      if (product.element) {
        product.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        product.element.style.transition = 'box-shadow 0.4s';
        product.element.style.boxShadow = '0 0 0 3px var(--color-secondary), 0 20px 40px rgba(123,83,92,0.2)';
        setTimeout(() => { product.element.style.boxShadow = ''; }, 2000);
      } else if (product.link && product.link !== '#') {
        window.location.href = product.link;
      }
    });
  });
}

// ============================================
// 10. Header Buttons
// ============================================
function initHeaderButtons() {
  document.querySelectorAll('.header-action-btn').forEach((btn) => {
    const text = btn.textContent;
    if (text.includes('المفضلة')) {
      btn.addEventListener('click', openWishlistDrawer);
    } else if (text.includes('الحقيبة')) {
      btn.addEventListener('click', openCartDrawer);
    }
  });

  document.querySelectorAll('.sidebar-cart-info').forEach((el) => {
    el.addEventListener('click', openCartDrawer);
  });
}

// ============================================
// 11. Wishlist Drawer
// ============================================
function ensureWishlistDrawer() {
  if (document.getElementById('wishlist-drawer')) return;
  const drawer = document.createElement('div');
  drawer.id = 'wishlist-drawer';
  drawer.className = 'cart-drawer';
  drawer.innerHTML = `
    <div class="cart-drawer-backdrop" onclick="closeWishlistDrawer()"></div>
    <aside class="cart-drawer-panel">
      <header class="cart-drawer-header">
        <div>
          <span class="section-label">قائمة الأمنيات</span>
          <h3 class="cart-drawer-title">مفضلاتكِ</h3>
        </div>
        <button class="cart-drawer-close" onclick="closeWishlistDrawer()" type="button" aria-label="إغلاق">
          <span class="material-symbols-outlined">close</span>
        </button>
      </header>
      <div class="cart-drawer-body" id="wishlist-drawer-body"></div>
    </aside>
  `;
  document.body.appendChild(drawer);
}
function openWishlistDrawer() {
  ensureWishlistDrawer();
  renderWishlistDrawer();
  document.getElementById('wishlist-drawer').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeWishlistDrawer() {
  const d = document.getElementById('wishlist-drawer');
  if (d) d.classList.remove('active');
  document.body.style.overflow = '';
}
function renderWishlistDrawer() {
  const body = document.getElementById('wishlist-drawer-body');
  if (!body) return;
  const list = MarwaStore.getWishlist();
  if (!list.length) {
    body.innerHTML = `
      <div class="cart-empty">
        <span class="material-symbols-outlined">favorite</span>
        <p>قائمة الأمنيات فارغة</p>
        <span>اضغطي على ♡ في المنتجات لإضافتها</span>
      </div>`;
    return;
  }
  body.innerHTML = list.map((item) => {
    const name = item.name.replace(/"/g, '&quot;');
    const img = item.image
      ? `<img src="${item.image}" alt="${name}" />`
      : `<div class="cart-item-noimg"><span class="material-symbols-outlined">favorite</span></div>`;
    return `
      <div class="cart-item">
        <div class="cart-item-img">${img}</div>
        <div class="cart-item-info">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-price">${item.price || ''}</span>
          <button class="wishlist-add-cart" onclick="wishlistAddToCart('${name}')" type="button">
            <span class="material-symbols-outlined" style="font-size:1rem;">shopping_bag</span>
            <span>أضيفي للحقيبة</span>
          </button>
        </div>
        <button class="cart-item-remove" onclick="wishlistRemove('${name}')" type="button" aria-label="حذف">
          <span class="material-symbols-outlined">delete</span>
        </button>
      </div>
    `;
  }).join('');
}
function wishlistRemove(name) {
  const item = MarwaStore.getWishlist().find((i) => i.name === name);
  if (item) MarwaStore.toggleWishlist(item);
  renderWishlistDrawer();
}
function wishlistAddToCart(name) {
  const item = MarwaStore.getWishlist().find((i) => i.name === name);
  if (!item) return;
  MarwaStore.addToCart({ name: item.name, price: item.price, image: item.image, qty: 1 });
  closeWishlistDrawer();
  showToast('تمت إضافة المنتج إلى الحقيبة');
  setTimeout(openCartDrawer, 300);
}

// ============================================
// 12. Escape & Overlay
// ============================================
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeQuickView();
    closeCartDrawer();
    closeWishlistDrawer();
  }
});
document.addEventListener('click', (e) => {
  const modal = document.getElementById('quick-view-modal');
  if (modal && e.target === modal) closeQuickView();
});

// ============================================
// 13. Auto-Fix Header Badges
// ============================================
function autoFixBadges() {
  document.querySelectorAll('.header-action-btn').forEach((btn) => {
    const text = btn.textContent;
    const badge = btn.querySelector('.header-badge');
    if (!badge) return;
    if (text.includes('المفضلة') && !badge.hasAttribute('data-wishlist-count')) {
      badge.setAttribute('data-wishlist-count', '');
      badge.textContent = '٠';
    }
    if (text.includes('الحقيبة') && !badge.hasAttribute('data-cart-count')) {
      badge.setAttribute('data-cart-count', '');
      badge.textContent = '٠';
    }
  });
  document.querySelectorAll('.sidebar-cart-count').forEach((el) => {
    if (!el.hasAttribute('data-cart-count')) {
      el.setAttribute('data-cart-count', '');
      el.textContent = '٠';
    }
  });
}

// ============================================
// 14. Init
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  autoFixBadges();
  ensureCartDrawer();
  initWishlistButtons();
  initFilterTabs();
  initMobileMenu();
  initSearch();
  initHeaderButtons();
  MarwaStore.updateCartUI();
  MarwaStore.updateWishlistUI();
});

// ============================================
// Global Exports
// ============================================
window.MarwaStore = MarwaStore;
window.addToCartNotification = addToCartNotification;
window.openQuickView = openQuickView;
window.closeQuickView = closeQuickView;
window.openCartDrawer = openCartDrawer;
window.closeCartDrawer = closeCartDrawer;
window.changeQty = changeQty;
window.removeCartItem = removeCartItem;
window.checkoutCart = checkoutCart;
window.showToast = showToast;
window.openWishlistDrawer = openWishlistDrawer;
window.closeWishlistDrawer = closeWishlistDrawer;
window.wishlistRemove = wishlistRemove;
window.wishlistAddToCart = wishlistAddToCart;