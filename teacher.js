// ─── CONFIGURATION ───────────────────────────────────────────
// These must match your actual image filenames in the /images/ folder
const ITEMS = [
  'item1.png',
  'item2.png',
  'item3.png',
  'item4.png',
  'item5.png',
  'item6.png',
  'item7.png',
  'item8.png'
];

// Default price ranges (min, max in baht) per image filename
const DEFAULT_PRICES = {
  'item1.png': { min: 1, max: 5 },
  'item2.png': { min: 1, max: 5 },
  'item3.png': { min: 1, max: 5 },
  'item4.png': { min: 1, max: 5 },
  'item5.png': { min: 1, max: 5 },
  'item6.png': { min: 1, max: 5 },
  'item7.png': { min: 1, max: 5 },
  'item8.png': { min: 1, max: 5 }
};


const DEFAULT_PIN = '1234';
// ─────────────────────────────────────────────────────────────

function getPin() {
  return localStorage.getItem('teacher_pin') || DEFAULT_PIN;
}

function checkPin() {
  const entered = document.getElementById('pin-input').value;
  if (entered === getPin()) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    buildPriceRows();
  } else {
    document.getElementById('login-error').style.display = 'block';
    document.getElementById('pin-input').value = '';
  }
}

document.getElementById('pin-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkPin();
});

function buildPriceRows() {
  const saved = JSON.parse(localStorage.getItem('item_prices') || '{}');
  const container = document.getElementById('price-rows');
  container.innerHTML = '';

  ITEMS.forEach(filename => {
    const prices = saved[filename] || DEFAULT_PRICES[filename] || { min: 5, max: 50 };
    const row = document.createElement('div');
    row.className = 'item-row';
    row.innerHTML = `
      <img src="/images/${filename}" alt="${filename}" onerror="this.style.opacity='0.2'">
      <input type="number" id="min_${filename}" value="${prices.min}" min="1" max="999">
      <span>to</span>
      <input type="number" id="max_${filename}" value="${prices.max}" min="1" max="999">
      <span>฿</span>
    `;
    container.appendChild(row);
  });
}

function savePrices() {
  const prices = {};
  ITEMS.forEach(filename => {
    const min = parseInt(document.getElementById('min_' + filename).value) || 5;
    const max = parseInt(document.getElementById('max_' + filename).value) || 50;
    prices[filename] = { min: Math.min(min, max), max: Math.max(min, max) };
  });
  localStorage.setItem('item_prices', JSON.stringify(prices));
  const msg = document.getElementById('price-saved');
  msg.style.display = 'block';
  setTimeout(() => msg.style.display = 'none', 3000);
}

function changePin() {
  const newPin = document.getElementById('new-pin').value.trim();
  if (newPin.length < 4) {
    alert('PIN must be at least 4 digits.');
    return;
  }
  localStorage.setItem('teacher_pin', newPin);
  document.getElementById('new-pin').value = '';
  const msg = document.getElementById('pin-saved');
  msg.style.display = 'block';
  setTimeout(() => msg.style.display = 'none', 3000);
}

function logout() {
  document.getElementById('dashboard').style.display = 'none';
  document.getElementById('login-screen').style.display = 'flex';
  document.getElementById('pin-input').value = '';
}
