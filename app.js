document.addEventListener('DOMContentLoaded', () => {
  const $ = sel => document.querySelector(sel);
  const ls = {
    get: key => JSON.parse(localStorage.getItem(key) || 'null'),
    set: (key, val) => localStorage.setItem(key, JSON.stringify(val))
  };

  let DATA = {};

  const symptomSel = $('#symptom');
  const symptomResult = $('#symptomResult');

  const fetchData = async () => {
    try {
      const response = await fetch('app_data.json');
      if (!response.ok) throw new Error('Network response was not ok.');
      DATA = await response.json();
      return true;
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      symptomSel.innerHTML = '<option value="">Error loading data</option>';
      return false;
    }
  };

  const buildSymptomDropdown = () => {
    symptomSel.innerHTML = '<option value="">— choose symptom —</option>';
    for (const key in DATA.symptoms) {
      const option = document.createElement('option');
      option.value = key;
      option.textContent = key;
      symptomSel.appendChild(option);
    }
  };

  const renderSymptomResult = (key) => {
    if (!key || !DATA.symptoms[key]) {
      symptomResult.classList.remove('block');
      symptomResult.innerHTML = '';
      return;
    }
    const d = DATA.symptoms[key];
    symptomResult.innerHTML = `
      <div class="bg-gray-100 p-4 rounded shadow">
        <p><strong>Likely causes:</strong> ${d.causes}</p>
        <p><strong>Suggested actions:</strong> ${d.actions}</p>
      </div>`;
    symptomResult.classList.add('block');
    ls.set('lastSymptom', key);
  };

  const setupEventListeners = () => {
    symptomSel.addEventListener('change', e => renderSymptomResult(e.target.value));
  };

  const initializeApp = async () => {
    const success = await fetchData();
    if (!success) return;

    buildSymptomDropdown();
    setupEventListeners();

    const lastSym = ls.get('lastSymptom');
    if (lastSym && DATA.symptoms[lastSym]) {
      symptomSel.value = lastSym;
      renderSymptomResult(lastSym);
    }
  };

  initializeApp();
});


// --- Toasts ---
function showToast(message, type = 'info') {
  const host = document.getElementById('toastHost');
  if (!host) return;
  const el = document.createElement('div');
  const base = 'pointer-events-auto px-4 py-2 rounded-lg shadow border text-sm animate-in';
  const styles = {
    info: 'bg-white text-gray-900 border-gray-200',
    success: 'bg-green-50 text-green-900 border-green-200',
    error: 'bg-red-50 text-red-900 border-red-200'
  };
  el.className = `${base} ${styles[type] || styles.info}`;
  el.style.animation = 'toast-in .18s ease';
  el.textContent = message;
  host.appendChild(el);
  setTimeout(() => {
    el.style.animation = 'toast-out .18s ease forwards';
    setTimeout(() => host.removeChild(el), 200);
  }, 2400);
}

// --- Email validation UI ---
(function() {
  const emailInput = document.getElementById('emailTo');
  const help = document.getElementById('emailHelp');
  const btn = document.getElementById('emailBtn');
  const isValid = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v||'').trim());

  const refresh = () => {
    const ok = isValid(emailInput?.value);
    if (!emailInput || !help || !btn) return;
    help.classList.toggle('hidden', ok);
    emailInput.setAttribute('aria-invalid', String(!ok));
    btn.disabled = !ok;
    btn.classList.toggle('opacity-50', !ok);
    btn.classList.toggle('cursor-not-allowed', !ok);
  };

  emailInput?.addEventListener('input', refresh);
  document.addEventListener('DOMContentLoaded', refresh);
})();

// Hook into existing email send to show a toast
(function() {
  const emailBtn = document.getElementById('emailBtn');
  const emailTo = document.getElementById('emailTo');
  if (!emailBtn) return;
  emailBtn.addEventListener('click', () => {
    if (!emailTo) return;
    if (emailBtn.disabled) return;
    // Toast on attempt (the mail client will open)
    setTimeout(() => showToast('Email draft opened', 'success'), 300);
  });
})();

// --- iOS install hint ---
(function() {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isInStandalone = window.navigator.standalone === true;
  const iosHint = document.getElementById('iosHint');
  const closeBtn = document.getElementById('iosHintClose');
  const KEY = 'iosHintDismissedV1';

  if (!isIOS || isInStandalone) return;
  if (localStorage.getItem(KEY)) return;

  // Delay to avoid interrupting initial interaction
  setTimeout(() => {
    iosHint?.classList.remove('hidden');
  }, 3000);

  closeBtn?.addEventListener('click', () => {
    iosHint?.classList.add('hidden');
    try { localStorage.setItem(KEY, '1'); } catch(e){}
  });
})();
