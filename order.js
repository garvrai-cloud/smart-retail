/* ===== ORDER SCRIPTS ===== */

const API = 'http://localhost:3000';
  function getCurrencySymbol() {
      if (!localStorage.getItem('currency_symbol')) {
        localStorage.setItem('currency_symbol', '₹');
        localStorage.setItem('currency_rate', '1');
      }
      return localStorage.getItem('currency_symbol') || '₹';
    }
    function getCurrencyRate() {
      return parseFloat(localStorage.getItem('currency_rate') || '1');
    }
    function formatCurrency(amount) {
      const sym  = getCurrencySymbol();
      const rate = getCurrencyRate();
      const val  = parseFloat(String(amount).replace(/[^0-9.]/g,'')) || 0;
      const converted = val * rate;
      return sym + converted.toLocaleString('en-IN', {minimumFractionDigits:2, maximumFractionDigits:2});
    }
let products = [];
let cart = [];
// Load Products from backend
async function loadProducts() {
  try {
    const res = await fetch(`${API}/api/products`);
    products = await res.json();
    renderProducts();
    document.getElementById('status-bar').innerHTML = '🟢 Connected — ' + products.length + ' products loaded from database';
    document.getElementById('status-bar').style.color = '#22c55e';
  } catch (err) {
    document.getElementById('products-grid').innerHTML = '<div style="color:#ef4444;padding:20px;grid-column:span 2;">❌ Cannot connect to backend!<br><br>Make sure <b>npm start</b> is running on your laptop.</div>';
    document.getElementById('status-bar').innerHTML = '🔴 Disconnected — Start backend with npm start';
    document.getElementById('status-bar').style.color = '#ef4444';
  }
}

function getProductEmoji(name, category) {
  const n = (name || '').toLowerCase();
  const c = (category || '').toLowerCase();

  // Match by name keywords first
  if (n.includes('earbud') || n.includes('earphone') || n.includes('airpod')) return '🎧';
  if (n.includes('headphone') || n.includes('headset')) return '🎧';
  if (n.includes('running shoe') || n.includes('shoe') || n.includes('sneaker') || n.includes('footwear')) return '👟';
  if (n.includes('mobile') || n.includes('phone') || n.includes('smartphone') || n.includes('iphone')) return '📱';
  if (n.includes('smartphone case') || n.includes('phone case') || n.includes('cover')) return '📱';
  if (n.includes('watch') || n.includes('smartwatch')) return '⌚';
  if (n.includes('laptop') || n.includes('notebook') || n.includes('macbook')) return '💻';
  if (n.includes('laptop stand') || n.includes('stand')) return '🖥️';
  if (n.includes('wireless') && c.includes('electron')) return '📡';
  if (n.includes('speaker') || n.includes('bluetooth speaker')) return '🔊';
  if (n.includes('tablet') || n.includes('ipad')) return '📟';
  if (n.includes('keyboard')) return '⌨️';
  if (n.includes('mouse')) return '🖱️';
  if (n.includes('camera')) return '📷';
  if (n.includes('tv') || n.includes('television')) return '📺';
  if (n.includes('charger') || n.includes('cable')) return '🔌';
  if (n.includes('bag') || n.includes('backpack')) return '🎒';
  if (n.includes('shirt') || n.includes('tshirt') || n.includes('top')) return '👕';
  if (n.includes('pant') || n.includes('trouser') || n.includes('jeans')) return '👖';
  if (n.includes('bottle') || n.includes('water')) return '🍶';
  if (n.includes('yoga') || n.includes('mat')) return '🧘';
  if (n.includes('book') || n.includes('notebook')) return '📚';
  if (n.includes('pen') || n.includes('pencil')) return '✏️';

  // Fallback by category
  if (c.includes('electron')) return '🔌';
  if (c.includes('footwear') || c.includes('shoe')) return '👟';
  if (c.includes('cloth') || c.includes('fashion')) return '👗';
  if (c.includes('accessory') || c.includes('accessories')) return '💍';
  if (c.includes('office') || c.includes('stationery')) return '🗂️';
  if (c.includes('sport') || c.includes('fitness')) return '🏋️';
  if (c.includes('home') || c.includes('kitchen')) return '🏠';
  if (c.includes('book') || c.includes('education')) return '📚';

  return '📦'; // default
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  grid.innerHTML = products.map((p, i) => `
    <div class="product-card" onclick="addToCart(${p.product_id})">
      <div class="product-emoji">${getProductEmoji(p.name, p.category)}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-category">${p.category}</div>
      <div class="product-price">$${p.price}</div>
      <div class="product-stock">Stock: ${p.stock_quantity} units</div>
      <button class="add-btn">+ Add to Cart</button>
    </div>
  `).join('');
}

function addToCart(productId) {
  const product = products.find(p => p.product_id === productId);
  const existing = cart.find(item => item.product_id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  renderCart();
}

function updateQty(productId, change) {
  const item = cart.find(i => i.product_id === productId);
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.product_id !== productId);
  }
  renderCart();
}

function renderCart() {
  const cartDiv = document.getElementById('cart-items');
  const totalDiv = document.getElementById('cart-total');

  if (cart.length === 0) {
    cartDiv.innerHTML = '<div class="cart-empty">No items yet 🛍️<br>Click a product to add!</div>';
    totalDiv.textContent = getCurrencySymbol() + '0.00';
    return;
  }

  cartDiv.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
      </div>
      <div class="cart-controls">
        <button class="qty-btn" onclick="updateQty(${item.product_id}, -1)">−</button>
        <span class="qty-display">${item.quantity}</span>
        <button class="qty-btn" onclick="updateQty(${item.product_id}, 1)">+</button>
        <span class="remove-btn" onclick="updateQty(${item.product_id}, -99)">×</span>
      </div>
    </div>
  `).join('');

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  totalDiv.textContent = formatCurrency(total);
}

async function placeOrder() {
  const name = document.getElementById('customer-name').value.trim();
  const email = document.getElementById('customer-email').value.trim();
  const countryCode = document.getElementById('country-code').value;
  const phoneNumber = document.getElementById('customer-phone').value.trim();
  const phone = countryCode + ' ' + phoneNumber;
  const payment = document.getElementById('payment-method').value;

  if (!name || !email || !phoneNumber) {
    alert('⚠️ Please fill in all your details!');
    return;
  }
  if (cart.length === 0) {
    alert('⚠️ Please add at least one item to cart!');
    return;
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const btn = document.getElementById('place-order-btn');
  btn.disabled = true;
  btn.textContent = '⏳ Placing Order...';

  try {
    const res = await fetch(`${API}/api/orders/new`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        payment_method: payment,
        items: cart,
        total_amount: total.toFixed(2)
      })
    });

    const data = await res.json();

    if (data.success) {
      document.getElementById('success-order-id').textContent = `Order ID: #${data.order_id}`;
      document.getElementById('success-overlay').classList.add('show');
    } else {
      alert('Error: ' + (data.error || 'Unknown error'));
    }
  } catch (err) {
    alert('❌ Failed to place order! Make sure backend is running.');
  }

  btn.disabled = false;
  btn.textContent = '✅ Place Order';
}

function resetOrder() {
  cart = [];
  renderCart();
  document.getElementById('customer-name').value = '';
  document.getElementById('customer-email').value = '';
  document.getElementById('customer-phone').value = '';
  document.getElementById('success-overlay').classList.remove('show');
}

/* =======================
   PARTICLE BACKGROUND
   (same as index.html)
======================= */
const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const particles = Array.from({ length: 50 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: Math.random() * 2 + 1,
  dx: Math.random() - 0.5,
  dy: Math.random() - 0.5
}));

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fill();
    p.x += p.dx;
    p.y += p.dy;
    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
  });
  requestAnimationFrame(animateParticles);
}
animateParticles();

/* =======================
   CURSOR GLOW EFFECT
   (same as index.html)
======================= */
const cursor = document.getElementById("cursor");
window.addEventListener("mousemove", e => {
  cursor.style.left = e.clientX - 9 + "px";
  cursor.style.top = e.clientY - 9 + "px";
});

/* =======================
   COUNTRY FLAG DROPDOWN
======================= */
const COUNTRIES = [
  {flag:'🇮🇳',name:'India',dial:'+91'},
  {flag:'🇺🇸',name:'United States',dial:'+1'},
  {flag:'🇬🇧',name:'United Kingdom',dial:'+44'},
  {flag:'🇦🇺',name:'Australia',dial:'+61'},
  {flag:'🇨🇦',name:'Canada',dial:'+1'},
  {flag:'🇯🇵',name:'Japan',dial:'+81'},
  {flag:'🇨🇳',name:'China',dial:'+86'},
  {flag:'🇩🇪',name:'Germany',dial:'+49'},
  {flag:'🇫🇷',name:'France',dial:'+33'},
  {flag:'🇮🇹',name:'Italy',dial:'+39'},
  {flag:'🇪🇸',name:'Spain',dial:'+34'},
  {flag:'🇵🇹',name:'Portugal',dial:'+351'},
  {flag:'🇳🇱',name:'Netherlands',dial:'+31'},
  {flag:'🇧🇪',name:'Belgium',dial:'+32'},
  {flag:'🇸🇪',name:'Sweden',dial:'+46'},
  {flag:'🇳🇴',name:'Norway',dial:'+47'},
  {flag:'🇩🇰',name:'Denmark',dial:'+45'},
  {flag:'🇫🇮',name:'Finland',dial:'+358'},
  {flag:'🇨🇭',name:'Switzerland',dial:'+41'},
  {flag:'🇦🇹',name:'Austria',dial:'+43'},
  {flag:'🇵🇱',name:'Poland',dial:'+48'},
  {flag:'🇬🇷',name:'Greece',dial:'+30'},
  {flag:'🇹🇷',name:'Turkey',dial:'+90'},
  {flag:'🇷🇺',name:'Russia',dial:'+7'},
  {flag:'🇺🇦',name:'Ukraine',dial:'+380'},
  {flag:'🇰🇷',name:'South Korea',dial:'+82'},
  {flag:'🇸🇬',name:'Singapore',dial:'+65'},
  {flag:'🇲🇾',name:'Malaysia',dial:'+60'},
  {flag:'🇮🇩',name:'Indonesia',dial:'+62'},
  {flag:'🇵🇭',name:'Philippines',dial:'+63'},
  {flag:'🇹🇭',name:'Thailand',dial:'+66'},
  {flag:'🇻🇳',name:'Vietnam',dial:'+84'},
  {flag:'🇧🇩',name:'Bangladesh',dial:'+880'},
  {flag:'🇵🇰',name:'Pakistan',dial:'+92'},
  {flag:'🇱🇰',name:'Sri Lanka',dial:'+94'},
  {flag:'🇳🇵',name:'Nepal',dial:'+977'},
  {flag:'🇦🇪',name:'UAE',dial:'+971'},
  {flag:'🇸🇦',name:'Saudi Arabia',dial:'+966'},
  {flag:'🇶🇦',name:'Qatar',dial:'+974'},
  {flag:'🇰🇼',name:'Kuwait',dial:'+965'},
  {flag:'🇧🇭',name:'Bahrain',dial:'+973'},
  {flag:'🇴🇲',name:'Oman',dial:'+968'},
  {flag:'🇮🇱',name:'Israel',dial:'+972'},
  {flag:'🇮🇷',name:'Iran',dial:'+98'},
  {flag:'🇪🇬',name:'Egypt',dial:'+20'},
  {flag:'🇳🇬',name:'Nigeria',dial:'+234'},
  {flag:'🇰🇪',name:'Kenya',dial:'+254'},
  {flag:'🇬🇭',name:'Ghana',dial:'+233'},
  {flag:'🇿🇦',name:'South Africa',dial:'+27'},
  {flag:'🇪🇹',name:'Ethiopia',dial:'+251'},
  {flag:'🇹🇿',name:'Tanzania',dial:'+255'},
  {flag:'🇺🇬',name:'Uganda',dial:'+256'},
  {flag:'🇧🇷',name:'Brazil',dial:'+55'},
  {flag:'🇲🇽',name:'Mexico',dial:'+52'},
  {flag:'🇦🇷',name:'Argentina',dial:'+54'},
  {flag:'🇨🇴',name:'Colombia',dial:'+57'},
  {flag:'🇨🇱',name:'Chile',dial:'+56'},
  {flag:'🇵🇪',name:'Peru',dial:'+51'},
  {flag:'🇻🇪',name:'Venezuela',dial:'+58'},
  {flag:'🇳🇿',name:'New Zealand',dial:'+64'},
];

let selectedCountry = COUNTRIES[0];
let filteredCountries = [...COUNTRIES];

function renderCountryList(list) {
  const ul = document.getElementById('country-list');
  ul.innerHTML = list.map((c, i) => `
    <div class="country-option ${c.dial === selectedCountry.dial && c.name === selectedCountry.name ? 'selected' : ''}"
         onclick="selectCountry(${COUNTRIES.indexOf(c)})">
      <span class="opt-flag">${c.flag}</span>
      <span class="opt-name">${c.name}</span>
      <span class="opt-dial">${c.dial}</span>
    </div>
  `).join('');
}

function selectCountry(index) {
  selectedCountry = COUNTRIES[index];
  document.getElementById('selected-flag').textContent = selectedCountry.flag;
  document.getElementById('selected-dial').textContent = selectedCountry.dial;
  document.getElementById('country-code').value = selectedCountry.dial;
  closeCountryDropdown();
  renderCountryList(filteredCountries);
}

function toggleCountryDropdown() {
  const sel = document.getElementById('country-selected');
  const drop = document.getElementById('country-dropdown');
  const isOpen = drop.classList.contains('open');
  if (isOpen) {
    closeCountryDropdown();
  } else {
    sel.classList.add('open');
    drop.classList.add('open');
    document.getElementById('country-search').value = '';
    filteredCountries = [...COUNTRIES];
    renderCountryList(filteredCountries);
    setTimeout(() => document.getElementById('country-search').focus(), 50);
  }
}

function closeCountryDropdown() {
  document.getElementById('country-selected').classList.remove('open');
  document.getElementById('country-dropdown').classList.remove('open');
}

function filterCountries(query) {
  const q = query.toLowerCase();
  filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(q) || c.dial.includes(q)
  );
  renderCountryList(filteredCountries);
}

// Close dropdown when clicking outside
document.addEventListener('click', function(e) {
  if (!document.getElementById('country-selector').contains(e.target)) {
    closeCountryDropdown();
  }
});

// Initialize list
renderCountryList(COUNTRIES);

// Start
loadProducts();