// payment.js — reads URL params, calls backend, redirects to Stripe Checkout

const API_BASE = 'https://schedulerapi-production.up.railway.app/api';

const TIER_INFO = {
  STARTER:    { name: 'Starter',    price: '12.99', workers: 10 },
  GROWTH:     { name: 'Growth',     price: '29.99', workers: 20 },
  BUSINESS:   { name: 'Business',   price: '79.99', workers: 50 },
  ENTERPRISE: { name: 'Enterprise', price: '139.99', workers: 100 },
};

function getParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    workplaceId: params.get('workplaceId'),
    tier: (params.get('tier') || '').toUpperCase(),
    email: params.get('email'),
  };
}

function showError(msg) {
  document.getElementById('loadingState').classList.add('hidden');
  document.getElementById('errorState').classList.remove('hidden');
  document.getElementById('errorMessage').textContent = msg;
}

function retryCheckout() {
  document.getElementById('errorState').classList.add('hidden');
  document.getElementById('loadingState').classList.remove('hidden');
  startCheckout();
}

async function startCheckout() {
  const { workplaceId, tier, email } = getParams();

  if (!workplaceId || !tier) {
    showError('Missing required parameters. Please try again from the app.');
    return;
  }

  const info = TIER_INFO[tier];
  if (!info) {
    showError('Unknown subscription tier: ' + tier);
    return;
  }

  // Update UI
  document.getElementById('tierDisplay').textContent = info.name;
  document.getElementById('priceDisplay').textContent =
    `€${info.price}/month · Up to ${info.workers} workers`;

  try {
    const res = await fetch(`${API_BASE}/subscriptions/create-checkout-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workplaceId: parseInt(workplaceId), tier, email }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || 'Something went wrong. Please try again.');
      return;
    }

    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl;
    } else {
      showError('No checkout URL received. Please try again.');
    }
  } catch (err) {
    showError('Network error. Please check your connection and try again.');
  }
}

// Start on load
startCheckout();
