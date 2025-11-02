// Passive Reports Admin Panel JS
// Fetches rows from Supabase table `passive_report` and renders them into the table body
// All logic is contained in this single file, including Supabase client initialization.

(function () {
	// 1) Configure your Supabase credentials here
	const SUPABASE_URL = 'https://hrfwntixjesvexqjeviv.supabase.co';
	const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZndudGl4amVzdmV4cWpldml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjE3MTQsImV4cCI6MjA3NDk5NzcxNH0.UaiP3UhfqS6Li6JSAEjsJkAYPfvsqkSgsSGoatOstxs';

	// 2) Utility: dynamically load a script
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

	// 3) Initialize Supabase client (loaded on demand)
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

	// 4) DOM helpers
	function show(el) { if (el) el.classList.remove('hidden'); }
	function hide(el) { if (el) el.classList.add('hidden'); }
	function setText(el, text) { if (el) el.textContent = text; }

	// 5) Render rows into the table body safely
	function renderRows(tbody, rows) {
		tbody.innerHTML = '';
		if (!rows || rows.length === 0) {
			const tr = document.createElement('tr');
			const td = document.createElement('td');
			td.colSpan = 5;
			td.textContent = 'No reports found.';
			tr.appendChild(td);
			tbody.appendChild(tr);
			return;
		}

		rows.forEach((row) => {
			const tr = document.createElement('tr');

			const tdGender = document.createElement('td');
			tdGender.textContent = row.gender ?? '';

			const tdDate = document.createElement('td');
			// Format date_of_incident as a local date string when possible
			let dateText = '';
			if (row.date_of_incident) {
				try {
					const d = new Date(row.date_of_incident);
					dateText = isNaN(d.getTime()) ? String(row.date_of_incident) : d.toLocaleDateString();
				} catch { dateText = String(row.date_of_incident); }
			}
			tdDate.textContent = dateText;

			const tdType = document.createElement('td');
			// Postgres folds unquoted identifiers to lower case; Supabase returns lowercased keys
			tdType.textContent = (row.reporttype ?? row.reportType ?? '') || '';

			const tdExplanation = document.createElement('td');
			tdExplanation.textContent = row.explanation ?? '';

			const tdLocation = document.createElement('td');
			tdLocation.textContent = row.victim_location ?? '';

			tr.append(tdGender, tdDate, tdType, tdExplanation, tdLocation);
			tbody.appendChild(tr);
		});
	}

	// 6) Fetch reports from Supabase
	async function fetchReports() {
		const loadingEl = document.getElementById('loading');
		const errorEl = document.getElementById('error');
		const tableEl = document.getElementById('reports-table');
		const tbodyEl = document.getElementById('reports-body');

		show(loadingEl);
		hide(errorEl);
		hide(tableEl);

		try {
			const sb = await getSupabaseClient();
			// Select all columns, latest first
			const { data, error } = await sb
				.from('passive_report')
				.select('*')
				.order('created_at', { ascending: false });

			if (error) {
				throw error;
			}

			renderRows(tbodyEl, data);
			hide(loadingEl);
			show(tableEl);
		} catch (err) {
			console.error('Failed to fetch reports:', err);
			setText(errorEl, 'Failed to load reports. Please check your connection, credentials, or RLS policies.');
			hide(loadingEl);
			show(errorEl);
		}
	}

	// 7) Initialize on DOMContentLoaded
	document.addEventListener('DOMContentLoaded', () => {
		fetchReports();
	});
})();
