document.addEventListener("DOMContentLoaded", function() {
    // Mobile nav toggle
    const menuToggle = document.getElementById('menuToggle');
    const navList = document.getElementById('primary-nav');
    if (menuToggle && navList) {
        menuToggle.addEventListener('click', () => {
            const isOpen = navList.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    const slides = document.querySelectorAll(".slide");
    let index = 0;

    function showSlides() {
        slides.forEach((slide) => {
            slide.classList.remove("active");
        });
        slides[index].classList.add("active");
        index = (index + 1) % slides.length;
    }

    showSlides();
    setInterval(showSlides, 3000);
});

//Supabase
// Supabase client (replace with your project values)

  const SUPABASE_URL = 'https://hrfwntixjesvexqjeviv.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZndudGl4amVzdmV4cWpldml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjE3MTQsImV4cCI6MjA3NDk5NzcxNH0.UaiP3UhfqS6Li6JSAEjsJkAYPfvsqkSgsSGoatOstxs';

  // ✅ Initialize Supabase client immediately
  import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
  const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  // ✅ Helper function for getting user location
  async function getLocationString() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          resolve(`${latitude.toFixed(6)},${longitude.toFixed(6)}`);
        },
        () => resolve(null),
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
      );
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('quick-report');
    const submitBtn = document.getElementById('submitquick');

    if (!input || !submitBtn) return;

    submitBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      const reportText = (input.value || '').trim();
      if (!reportText) {
        alert('Please enter your report first.');
        return;
      }

      submitBtn.disabled = true;
      const prevText = submitBtn.textContent;
      submitBtn.textContent = 'Submitting...';

      try {
        const location = await getLocationString();
        const now = new Date();
        const date = now.toISOString().slice(0, 10);
        const time = now.toTimeString().slice(0, 8);

        const { error } = await supabaseClient
          .from('quick_report')
          .insert([{ report: reportText, location, date, time }]);

        if (error) {
          console.error('Supabase insert error:', error);
          alert('❌ Failed to submit report.');
        } else {
          input.value = '';
          alert('✅ Report submitted successfully!');
        }
      } catch (err) {
        console.error('Unexpected error:', err);
        alert('⚠️ Unexpected error occurred.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = prevText;
      }
    });
  });