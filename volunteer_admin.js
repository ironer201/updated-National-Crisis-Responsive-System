// Volunteer Admin Panel: fetch and render `volunteers` table
// Everything is contained in this one file (including Supabase client loading)

(function () {
  // 1) Supabase credentials (from your snippet)
  const SUPABASE_URL = 'Supabase-URL';
  const SUPABASE_ANON_KEY = 'Aeon-Key';

  // 2) Load Supabase JS dynamically
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  async function getSupabaseClient() {
    if (!window.supabase) {
      await loadScript('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4');
    }
    if (!window.sb) {
      const { createClient } = window.supabase;
      window.sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
    return window.sb;
  }

  // 3) DOM helpers
  function $(id) { return document.getElementById(id); }
  function show(el) { el && el.classList.remove('hidden'); }
  function hide(el) { el && el.classList.add('hidden'); }
  function setText(el, txt) { if (el) el.textContent = txt; }

  // 4) Render rows into table
  function renderRows(tbody, rows) {
    tbody.innerHTML = '';
    if (!rows || rows.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 8;
      td.textContent = 'No volunteers found.';
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }

    rows.forEach((row) => {
      const tr = document.createElement('tr');

      const tdName = document.createElement('td');
      tdName.textContent = row.full_name ?? '';

      const tdEmail = document.createElement('td');
      tdEmail.textContent = row.email ?? '';

      const tdPhone = document.createElement('td');
      tdPhone.textContent = row.phone ?? '';

      const tdAddress = document.createElement('td');
      // In your form you used notes -> address; we map to address column
      tdAddress.textContent = row.address ?? '';

      const tdbloodGroup = document.createElement('td');
      tdbloodGroup.textContent = row.bloodGroup ?? '';
      
      const tdReligion = document.createElement('td');
      tdReligion.textContent = row.religion ?? '';

      const tdRole = document.createElement('td');
      tdRole.textContent = row.role ?? '';

      const tdAvailability = document.createElement('td');
      tdAvailability.textContent = row.availability ?? '';

      const tdCreated = document.createElement('td');
      let createdText = '';
      if (row.created_at) {
        try {
          const d = new Date(row.created_at);
          createdText = isNaN(d.getTime()) ? String(row.created_at) : d.toLocaleString();
        } catch { createdText = String(row.created_at); }
      }
      tdCreated.textContent = createdText;

      tr.append(tdName, tdEmail, tdPhone, tdAddress, tdbloodGroup,tdReligion, tdRole, tdAvailability, tdCreated);
      tbody.appendChild(tr);
    });
  }

  // 5) Fetch volunteers
  async function fetchVolunteers() {
    const loadingEl = $('loading');
    const errorEl = $('error');
    const tableEl = $('volunteer-table');
    const tbodyEl = $('volunteer-body');

    show(loadingEl);
    hide(errorEl);
    hide(tableEl);

    try {
      const sb = await getSupabaseClient();
      const { data, error } = await sb
        .from('volunteers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      renderRows(tbodyEl, data);
      hide(loadingEl);
      show(tableEl);
    } catch (err) {
      console.error('Failed to fetch volunteers:', err);
      setText(errorEl, 'Failed to load volunteers. Check credentials, connection, or RLS policies.');
      hide(loadingEl);
      show(errorEl);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    fetchVolunteers();
  });
})();
