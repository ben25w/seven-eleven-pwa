const DEFAULT_PIN = '1234';

// ===== PIN =====
function getPin() {
  return localStorage.getItem('teacher_pin') || DEFAULT_PIN;
}

function checkPin() {
  const entered = document.getElementById('pin-input').value;
  if (entered === getPin()) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
    loadImageLibrary();
  } else {
    document.getElementById('login-error').style.display = 'block';
    document.getElementById('pin-input').value = '';
  }
}

document.getElementById('pin-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkPin();
});

// ===== LOAD IMAGE LIBRARY =====
async function loadImageLibrary() {
  const grid = document.getElementById('image-library');
  grid.innerHTML = '<p style="color:#aaa">Loading images...</p>';

  try {
    const res = await fetch('/api/images');
    const data = await res.json();
    const active = JSON.parse(localStorage.getItem('active_items') || '[]');

    if (data.images.length === 0) {
      grid.innerHTML = '<p style="color:#aaa">No images yet. Take some photos below!</p>';
      return;
    }

    grid.innerHTML = '';
    data.images.forEach(img => {
      const isActive = active.includes(img.filename);
      const tile = document.createElement('div');
      tile.className = 'img-tile' + (isActive ? ' active' : '');
      tile.dataset.filename = img.filename;
      tile.innerHTML = `
        <img src="${img.url}" alt="${img.filename}">
        <div class="tick">✓</div>
        <button class="delete-btn" onclick="deleteImage(event, '${img.filename}')">✕</button>
      `;
      tile.addEventListener('click', () => toggleActive(tile, img.filename));
      grid.appendChild(tile);
    });
  } catch (err) {
    grid.innerHTML = '<p style="color:#ff6b6b">Could not load images. Check your R2 binding.</p>';
  }
}

// ===== TOGGLE ACTIVE =====
function toggleActive(tile, filename) {
  let active = JSON.parse(localStorage.getItem('active_items') || '[]');
  if (active.includes(filename)) {
    active = active.filter(f => f !== filename);
    tile.classList.remove('active');
  } else {
    active.push(filename);
    tile.classList.add('active');
  }
  localStorage.setItem('active_items', JSON.stringify(active));
}

// ===== DELETE IMAGE =====
async function deleteImage(event, filename) {
  // Stop the click from also toggling active
  event.stopPropagation();

  if (!confirm(`Delete this image permanently?`)) return;

  try {
    const res = await fetch('/api/images', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename })
    });
    const data = await res.json();

    if (data.success) {
      // Remove from active_items in localStorage too
      let active = JSON.parse(localStorage.getItem('active_items') || '[]');
      active = active.filter(f => f !== filename);
      localStorage.setItem('active_items', JSON.stringify(active));

      // Refresh the grid
      loadImageLibrary();
    } else {
      alert('Could not delete. Try again.');
    }
  } catch (err) {
    alert('Delete failed. Check connection.');
  }
}

// ===== UPLOAD PHOTO =====
async function uploadPhoto() {
  const input = document.getElementById('camera-input');
  const file = input.files[0];
  if (!file) return;

  const status = document.getElementById('upload-status');
  status.textContent = '⏳ Uploading...';
  status.style.color = '#ffd700';
  status.style.display = 'block';

  const formData = new FormData();
  formData.append('image', file);

  try {
    const res = await fetch('/api/images', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();

    if (data.success) {
      status.textContent = '✅ Uploaded! Scroll up to activate it.';
      status.style.color = '#4caf50';
      input.value = '';
      loadImageLibrary();
    } else {
      status.textContent = '❌ Upload failed. Try again.';
      status.style.color = '#ff6b6b';
    }
  } catch (err) {
    status.textContent = '❌ Upload failed. Check connection.';
    status.style.color = '#ff6b6b';
  }
}

// ===== CHANGE PIN =====
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
