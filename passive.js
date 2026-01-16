// All JavaScript for passive.html lives here
(function () {
  // 1) Supabase dynamic loader and client init
  // Replace these with your real project credentials
  const SUPABASE_URL = 'Supabse-URL';
  const SUPABASE_ANON_KEY = 'ANON-KEY';

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

  // 2) Page behavior
  document.addEventListener('DOMContentLoaded', () => {
    // Navbar toggle (icon-based)
    const menuIcon = document.getElementById('menuIcon');
    const closeIcon = document.getElementById('closeIcon');
    const navList = document.getElementById('primary-nav');
    if (menuIcon && closeIcon && navList) {
      menuIcon.addEventListener('click', () => {
        navList.classList.add('open');
        menuIcon.style.display = 'none';
        closeIcon.style.display = 'block';
      });

      closeIcon.addEventListener('click', () => {
        navList.classList.remove('open');
        closeIcon.style.display = 'none';
        menuIcon.style.display = 'block';
      });
    }

    // Show/hide details section based on report type
    const reportType = document.getElementById('report-type');
    const detailsSection = document.getElementById('details-section');
    if (reportType && detailsSection) {
      const toggleDetails = () => {
        if (reportType.value) {
          detailsSection.classList.remove('hidden');
        } else {
          detailsSection.classList.add('hidden');
        }
      };
      reportType.addEventListener('change', toggleDetails);
      toggleDetails();
    }

    // Optional: Calendar button support if present
    const calendarButtons = document.querySelectorAll('.calendar-button');
    if (calendarButtons.length) {
      calendarButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const targetId = btn.getAttribute('data-target');
          const input = targetId ? document.getElementById(targetId) : btn.previousElementSibling;
          if (input && input.type === 'date') {
            if (typeof input.showPicker === 'function') {
              input.showPicker();
            } else {
              input.focus();
              try { input.click(); } catch (_) { /* no-op */ }
            }
          }
        });
      });
    }

    // Submit handler: insert into Supabase
    const submitBtn = document.getElementById('submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        const genderEl = document.querySelector('#gender input[name="survivor"]:checked');
        const dateInput = document.getElementById('incident-date');
        const reportTypeEl = document.getElementById('report-type');
        const explanationEl = document.getElementById('description');
        const locationEl = document.getElementById('location');

        const payload = {
          gender: genderEl ? genderEl.value : '',
          date_of_incident: dateInput ? dateInput.value : '',
          reporttype: reportTypeEl ? reportTypeEl.value : '',
          explanation: explanationEl ? explanationEl.value.trim() : '',
          victim_location: locationEl ? locationEl.value.trim() : ''
        };

        const errors = [];
        if (!payload.gender) errors.push('Select survivor gender');
        if (!payload.date_of_incident) errors.push('Choose the date of incident');
        if (!payload.reporttype) errors.push('Select a report type');
        if (!payload.explanation) errors.push('Provide a brief explanation');
        if (errors.length) {
          alert(errors.join('\n'));
          return;
        }

        try {
          const sb = await getSupabaseClient();
          const { error } = await sb.from('passive_report').insert([payload]);
          if (error) {
            console.error('Insert error:', error);
            alert('Failed to submit report. Please try again.');
            return;
          }
          alert('Report submitted successfully!');
          const form = document.querySelector('form');
          if (form) form.reset();
          if (detailsSection) detailsSection.classList.add('hidden');
        } catch (err) {
          console.error('Unexpected error:', err);
          alert('An unexpected error occurred.');
        }
      });
    }
  });
})();
    
