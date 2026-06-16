// ============================================================
// corridorbook.js — shared Supabase client
// Add this script tag to every HTML page:
// <script src="corridorbook.js"></script>
// ============================================================

const SUPABASE_URL = 'https://fdrfjdbvhoerwpupiaog.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkcmZqZGJ2aG9lcndwdXBpYW9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0NTY4MTMsImV4cCI6MjA5NzAzMjgxM30.FNEZ_ajZCLW2UHZdgqcLXNjQE8z8-d3QEDJnlqyilTQ';

// Load Supabase from CDN if not already loaded
(function loadSupabase() {
  if (window.__cbReady) return;
  const s = document.createElement('script');
  s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  s.onload = function () {
    window._sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    window.__cbReady = true;
    document.dispatchEvent(new Event('cb:ready'));
  };
  document.head.appendChild(s);
})();

// ── Helper: wait for client to be ready ──────────────────────
function cbReady() {
  return new Promise(resolve => {
    if (window.__cbReady) return resolve(window._sb);
    document.addEventListener('cb:ready', () => resolve(window._sb), { once: true });
  });
}

// ============================================================
// AUTH
// ============================================================

const CB = {

  // ── Get current session ────────────────────────────────────
  async getSession() {
    const sb = await cbReady();
    const { data } = await sb.auth.getSession();
    return data.session;
  },

  // ── Get current user profile ───────────────────────────────
  async getProfile() {
    const sb = await cbReady();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return null;
    const { data } = await sb.from('profiles').select('*').eq('id', user.id).single();
    return data;
  },

  // ── Register ───────────────────────────────────────────────
  async register({ email, password, company_name, user_type, modality }) {
    const sb = await cbReady();
    const { data, error } = await sb.auth.signUp({
      email,
      password,
      options: {
        data: { company_name, user_type, modality: modality || null }
      }
    });
    if (error) throw error;
    return data;
  },

  // ── Login ──────────────────────────────────────────────────
  async login({ email, password }) {
    const sb = await cbReady();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  // ── Logout ─────────────────────────────────────────────────
  async logout() {
    const sb = await cbReady();
    await sb.auth.signOut();
    window.location.href = 'index.html';
  },

  // ── Require login — call on protected pages ────────────────
  async requireAuth(redirectTo) {
    const session = await this.getSession();
    if (!session) {
      window.location.href = redirectTo || 'index.html';
      return null;
    }
    return session;
  },

  // ── Auth guard with retry ─────────────────────────────────
  async authGuard({ operatorOnly = false, forwarderOnly = false } = {}) {
    await cbReady();
    let session = await this.getSession();
    if (!session) {
      await new Promise(r => setTimeout(r, 700));
      session = await this.getSession();
    }
    if (!session) { window.location.href = 'index.html'; return null; }
    const profile = await this.getProfile();
    if (!profile) { window.location.href = 'index.html'; return null; }
    if (forwarderOnly && profile.user_type === 'operator') {
      window.location.href = 'operator-portal.html'; return null;
    }
    if (operatorOnly && profile.user_type !== 'operator') {
      window.location.href = 'forwarder-portal.html'; return null;
    }
    return profile;
  },

  // ── Redirect logged-in users away from index ───────────────
  async redirectIfLoggedIn() {
    await cbReady();
    let session = await this.getSession();
    if (!session) {
      await new Promise(r => setTimeout(r, 500));
      session = await this.getSession();
    }
    if (!session) return;
    const profile = await this.getProfile();
    if (!profile) return;
    window.location.href = profile.user_type === 'operator'
      ? 'operator-portal.html'
      : 'search.html';
  },

  // ── Auth guard with retry ─────────────────────────────────
  async authGuard({ operatorOnly = false, forwarderOnly = false } = {}) {
    await cbReady();
    let session = await this.getSession();
    if (!session) {
      await new Promise(r => setTimeout(r, 700));
      session = await this.getSession();
    }
    if (!session) { window.location.href = 'index.html'; return null; }
    const profile = await this.getProfile();
    if (!profile) { window.location.href = 'index.html'; return null; }
    if (forwarderOnly && profile.user_type === 'operator') {
      window.location.href = 'operator-portal.html'; return null;
    }
    if (operatorOnly && profile.user_type !== 'operator') {
      window.location.href = 'forwarder-portal.html'; return null;
    }
    return profile;
  },

  // ── Redirect logged-in users away from index ───────────────
  async redirectIfLoggedIn() {
    await cbReady();
    let session = await this.getSession();
    if (!session) {
      await new Promise(r => setTimeout(r, 500));
      session = await this.getSession();
    }
    if (!session) return;
    const profile = await this.getProfile();
    if (!profile) return;
    window.location.href = profile.user_type === 'operator'
      ? 'operator-portal.html'
      : 'search.html';
  },

  // ── Update nav bar with user info ──────────────────────────
  async initNav() {
    const profile = await this.getProfile();
    if (!profile) return;

    // Find nav-right or nav-links element
    const navRight = document.querySelector('.nav-right') || document.querySelector('.nav-links');
    if (!navRight) return;

    // Remove any existing auth buttons to avoid duplicates
    const existing = navRight.querySelector('.cb-auth-zone');
    if (existing) existing.remove();

    const zone = document.createElement('div');
    zone.className = 'cb-auth-zone';
    zone.style.cssText = 'display:flex;align-items:center;gap:12px;';

    const nameEl = document.createElement('span');
    nameEl.style.cssText = 'font-size:13px;color:rgba(255,255,255,0.7);font-weight:500;';
    nameEl.textContent = profile.company_name;

    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Log out';
    logoutBtn.style.cssText = 'font-size:12px;color:rgba(255,255,255,0.5);background:none;border:1px solid rgba(255,255,255,0.2);border-radius:6px;padding:4px 10px;cursor:pointer;font-family:inherit;';
    logoutBtn.onclick = () => CB.logout();

    zone.appendChild(nameEl);
    zone.appendChild(logoutBtn);
    navRight.appendChild(zone);
  },

  // ============================================================
  // SLOTS
  // ============================================================

  // ── Search slots matching forwarder query ──────────────────
  async getSlots({ origin, destination, date, cargo_weight_kg }) {
    const sb = await cbReady();
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const { data, error } = await sb
      .from('slots')
      .select('*')
      .ilike('origin', `%${origin}%`)
      .ilike('destination', `%${destination}%`)
      .gte('departure_at', startOfDay.toISOString())
      .gte('remaining_kg', cargo_weight_kg)
      .eq('status', 'active');

    if (error) throw error;
    return data || [];
  },

  // ── Get operator's own slots ───────────────────────────────
  async getMySlots() {
    const sb = await cbReady();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return [];
    const { data, error } = await sb
      .from('slots')
      .select('*')
      .eq('operator_id', user.id)
      .order('departure_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  // ── Operator submits a new slot ────────────────────────────
  async submitSlot(slot) {
    const sb = await cbReady();
    const { data: { user } } = await sb.auth.getUser();
    const profile = await this.getProfile();
    if (!user || !profile) throw new Error('Not logged in');

    const { data, error } = await sb.from('slots').insert({
      operator_id:      user.id,
      operator_name:    profile.company_name,
      mode:             slot.mode,
      origin:           slot.origin,
      destination:      slot.destination,
      departure_at:     slot.departure_at,
      arrival_at:       slot.arrival_at,
      price_per_tonne:  slot.price_per_tonne,
      capacity_kg:      slot.capacity_kg,
      remaining_kg:     slot.capacity_kg,
      co2_per_tonne_km: slot.co2_per_tonne_km,
      status:           'active'
    }).select().single();

    if (error) throw error;
    return data;
  },

  // ── Operator cancels a slot ────────────────────────────────
  async cancelSlot(slotId) {
    const sb = await cbReady();
    const { error } = await sb
      .from('slots')
      .update({ status: 'cancelled' })
      .eq('id', slotId);
    if (error) throw error;
  },

  // ============================================================
  // SEARCHES — demand signal logging
  // ============================================================

  async logSearch({ origin, destination, date, cargo_weight_kg, slots }) {
    const sb = await cbReady();
    const { data: { user } } = await sb.auth.getUser();

    const road  = slots.filter(s => s.mode === 'road').length;
    const barge = slots.filter(s => s.mode === 'barge').length;
    const rail  = slots.filter(s => s.mode === 'rail').length;

    const { error } = await sb.from('searches').insert({
      forwarder_id:    user ? user.id : null,
      origin,
      destination,
      requested_date:  date,
      cargo_weight_kg,
      results_road:    road,
      results_barge:   barge,
      results_rail:    rail
    });

    if (error) console.warn('Search log failed:', error.message);
  },

  // ── Get demand signals (operators only) ────────────────────
  async getDemandSignals() {
    const sb = await cbReady();
    const { data, error } = await sb
      .from('demand_signals')
      .select('*');
    if (error) throw error;
    return data || [];
  },

  // ============================================================
  // BOOKINGS
  // ============================================================

  // ── Confirm a booking ──────────────────────────────────────
  async confirmBooking({ slot, cargo_weight_kg }) {
    const sb = await cbReady();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) throw new Error('Not logged in');

    const ref = 'CB-' + Math.random().toString(36).substring(2, 7).toUpperCase();
    const totalPrice = (slot.price_per_tonne * cargo_weight_kg / 1000);

    const { data, error } = await sb.from('bookings').insert({
      reference:        ref,
      forwarder_id:     user.id,
      slot_id:          slot.id,
      operator_id:      slot.operator_id || null,
      operator_name:    slot.operator_name,
      mode:             slot.mode,
      origin:           slot.origin,
      destination:      slot.destination,
      departure_at:     slot.departure_at,
      arrival_at:       slot.arrival_at,
      cargo_weight_kg,
      price_per_tonne:  slot.price_per_tonne,
      total_price:      totalPrice,
      co2_per_tonne_km: slot.co2_per_tonne_km,
      status:           'confirmed'
    }).select().single();

    if (error) throw error;

    // Decrement remaining capacity on the slot
    if (slot.id) {
      const { data: slotRow } = await sb.from('slots')
        .select('remaining_kg')
        .eq('id', slot.id)
        .single();
      if (slotRow && slotRow.remaining_kg >= cargo_weight_kg) {
        await sb.from('slots')
          .update({ remaining_kg: slotRow.remaining_kg - cargo_weight_kg })
          .eq('id', slot.id);
      }
    }

    return data;
  },

  // ── Get forwarder's own bookings ───────────────────────────
  async getMyBookings() {
    const sb = await cbReady();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return [];
    const { data, error } = await sb
      .from('bookings')
      .select('*')
      .eq('forwarder_id', user.id)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  // ── Get booking by reference ───────────────────────────────
  async getBookingByRef(ref) {
    const sb = await cbReady();
    const { data, error } = await sb
      .from('bookings')
      .select('*')
      .eq('reference', ref)
      .single();
    if (error) throw error;
    return data;
  },

  // ── Cancel a booking ───────────────────────────────────────
  async cancelBooking(bookingId) {
    const sb = await cbReady();
    const { error } = await sb
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', bookingId);
    if (error) throw error;
  },

  // ============================================================
  // FEEDBACK
  // ============================================================

  async submitFeedback({ booking_ref, answer }) {
    const sb = await cbReady();
    const { data: { user } } = await sb.auth.getUser();
    const { error } = await sb.from('feedback').insert({
      forwarder_id: user ? user.id : null,
      booking_ref,
      answer
    });
    if (error) throw error;
  },

  async getFeedback() {
    const sb = await cbReady();
    const { data, error } = await sb
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },

  // ============================================================
  // SCORING ALGORITHM
  // ============================================================

  scoreSlots(slots, { sortMode, requestedDate, cargo_weight_kg }) {
    if (!slots.length) return [];

    // Calculate transit hours for each slot
    const withMetrics = slots.map(s => ({
      ...s,
      transit_hours: (new Date(s.arrival_at) - new Date(s.departure_at)) / 36e5,
      total_price:   s.price_per_tonne * cargo_weight_kg / 1000
    }));

    // Min/max for normalisation
    const prices  = withMetrics.map(s => s.total_price);
    const co2s    = withMetrics.map(s => s.co2_per_tonne_km);
    const speeds  = withMetrics.map(s => s.transit_hours);

    const minPrice = Math.min(...prices);  const maxPrice = Math.max(...prices);
    const minCO2   = Math.min(...co2s);    const maxCO2   = Math.max(...co2s);
    const minSpeed = Math.min(...speeds);  const maxSpeed = Math.max(...speeds);

    const norm = (val, min, max) => max === min ? 1 : (max - val) / (max - min);

    // Determine weights
    const hoursUntilDeparture = (new Date(requestedDate) - new Date()) / 36e5;
    const isUrgent = hoursUntilDeparture < 24;

    let weights;
    if (isUrgent) {
      weights = { price: 0.25, co2: 0.15, speed: 0.60 };
    } else if (sortMode === 'price') {
      weights = { price: 0.70, co2: 0.20, speed: 0.10 };
    } else if (sortMode === 'co2') {
      weights = { price: 0.20, co2: 0.70, speed: 0.10 };
    } else if (sortMode === 'speed') {
      weights = { price: 0.25, co2: 0.15, speed: 0.60 };
    } else {
      // Default: balanced with sustainability lean
      weights = { price: 0.40, co2: 0.40, speed: 0.20 };
    }

    // Score each slot
    const scored = withMetrics.map(s => ({
      ...s,
      score_price: norm(s.total_price,   minPrice, maxPrice),
      score_co2:   norm(s.co2_per_tonne_km, minCO2, maxCO2),
      score_speed: norm(s.transit_hours, minSpeed, maxSpeed),
      score_total: (
        norm(s.total_price,      minPrice, maxPrice) * weights.price +
        norm(s.co2_per_tonne_km, minCO2,   maxCO2)  * weights.co2   +
        norm(s.transit_hours,    minSpeed,  maxSpeed) * weights.speed
      )
    }));

    // Sort by total score descending
    scored.sort((a, b) => b.score_total - a.score_total);

    // Flag recommended: top scorer
    // Tiebreak within 5%: prefer lower CO2
    if (scored.length > 1) {
      const topScore = scored[0].score_total;
      const tieGroup = scored.filter(s => topScore - s.score_total < 0.05);
      tieGroup.sort((a, b) => a.co2_per_tonne_km - b.co2_per_tonne_km);
      scored.forEach(s => s.recommended = false);
      tieGroup[0].recommended = true;
    } else if (scored.length === 1) {
      scored[0].recommended = true;
    }

    return scored;
  }

};

// Auto-initNav disabled — each page manages its own nav state

// Expose globally
window.CB = CB;