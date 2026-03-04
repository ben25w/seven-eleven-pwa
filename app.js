// ===== STATE =====
let selectedItems = [];
let allItems = [];

// ===== DOM REFERENCES =====
const splashScreen = document.getElementById('splashScreen');
const gameScreen = document.getElementById('gameScreen');
const itemsGrid = document.getElementById('itemsGrid');
const calcStrip = document.getElementById('calcStrip');
const calcImg1 = document.getElementById('calcImg1');
const calcImg2 = document.getElementById('calcImg2');
const calcPrice1 = document.getElementById('calcPrice1');
const calcPrice2 = document.getElementById('calcPrice2');
const calcTotal = document.getElementById('calcTotal');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');

// ===== REGISTER SERVICE WORKER (PWA) =====
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}

// ===== RANDOM PRICE =====
function getRandomPrice(filename) {
  const saved = JSON.parse(localStorage.getItem('item_prices') || '{}');
  const range = saved[filename];
  if (range) {
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  }
  return Math.floor(Math.random() * 5) + 1;
}

// ===== SPLASH → GAME =====
startBtn.addEventListener('click', () => {
  splashScreen.classList.add('hidden');
  gameScreen.classList.remove('hidden');
  loadItems();
});

// ===== LOAD ITEMS =====
// ===== LOAD ITEMS =====
async function loadItems() {
  try {
    const res = await fetch('/api/images');
    const data = await res.json();

    if (!data.images || data.images.length === 0) {
      itemsGrid.innerHTML = '<div class="loading">No items uploaded yet. Ask your teacher! 😊</div>';
      return;
    }

    const active = JSON.parse(localStorage.getItem('active_items') || '[]');

    // Try to filter by active, but fall back to ALL images if none match
    let filtered = active.length > 0
      ? data.images.filter(img => active.includes(img.filename))
      : data.images;

    // Safety net — if active list exists but nothing matched, show everything
    if (filtered.length === 0) {
      filtered = data.images;
    }

    allItems = filtered.map(img => ({
      imageUrl: img.url,
      filename: img.filename,
      price: getRandomPrice(img.filename)
    }));

    renderItems(allItems);
  } catch (error) {
    itemsGrid.innerHTML = '<div class="loading">Could not load items. Please refresh. 😕</div>';
    console.error('Error loading items:', error);
  }
}


// ===== RENDER ITEMS =====
function renderItems(items) {
  itemsGrid.innerHTML = '';

  items.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.dataset.index = index;

    card.innerHTML = `
      <img src="${item.imageUrl}" alt="Product ${index + 1}" loading="lazy">
      <div class="item-price">฿${item.price}</div>
    `;

    card.addEventListener('click', () => selectItem(index, card));
    itemsGrid.appendChild(card);
  });
}

// ===== SELECT ITEM =====
function selectItem(index, card) {
  if (card.classList.contains('selected')) {
    card.classList.remove('selected');
    selectedItems = selectedItems.filter(i => i !== index);
    updateAllCardStates();
    hideCalcStrip();
    return;
  }

  if (selectedItems.length >= 2) return;

  selectedItems.push(index);
  card.classList.add('selected');
  updateAllCardStates();

  if (selectedItems.length === 2) {
    showTotal();
  }
}

// ===== UPDATE CARD STATES =====
function updateAllCardStates() {
  const cards = itemsGrid.querySelectorAll('.item-card');
  cards.forEach((card, index) => {
    if (selectedItems.length === 2 && !selectedItems.includes(index)) {
      card.classList.add('disabled');
    } else {
      card.classList.remove('disabled');
    }
  });
}

// ===== SHOW TOTAL =====
function showTotal() {
  const item1 = allItems[selectedItems[0]];
  const item2 = allItems[selectedItems[1]];
  const total = item1.price + item2.price;

  calcImg1.src = item1.imageUrl;
  calcImg1.alt = 'Item 1';
  calcImg2.src = item2.imageUrl;
  calcImg2.alt = 'Item 2';
  calcPrice1.textContent = `฿${item1.price}`;
  calcPrice2.textContent = `฿${item2.price}`;
  calcTotal.textContent = `฿${total}`;

  calcStrip.classList.remove('hidden');
}

// ===== HIDE CALC STRIP =====
function hideCalcStrip() {
  if (selectedItems.length < 2) {
    calcStrip.classList.add('hidden');
  }
}

// ===== RESET =====
resetBtn.addEventListener('click', () => {
  selectedItems = [];
  calcStrip.classList.add('hidden');

  allItems = allItems.map(item => ({
    ...item,
    price: getRandomPrice(item.filename)
  }));

  renderItems(allItems);
});
