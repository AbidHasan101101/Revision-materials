// HSC Science Revision Master - Application Logic (v3 with Custom Syllabus & Day/Night Mode)
// Features:
// - Free-form revision checking (any box in any order)
// - Custom Syllabus & Tasks Engine (add subjects, add chapters, delete custom items, reset to default)
// - Day / Night Mode Switcher (Pale Oceanic Day vs Midnight Cyan Night)
// - Lazy AudioContext on user interaction
// - Local date arithmetic & pace hints ("N days left • ~X tasks/day")
// - Bitmask URL hash sharing (#s=...) + legacy JSON (#share=...)
// - Safe imports protecting user profile data
// - Accessibility: aria-pressed, aria-label, 40px touch targets, sticky column, focus rings

(function () {
  'use strict';

  const STORAGE_KEY_DATA = 'hsc_tracker_data_v1';
  const STORAGE_KEY_META = 'hsc_tracker_meta_v1';
  const STORAGE_KEY_CONFIG = 'hsc_tracker_config_v1';
  const STORAGE_KEY_SYLLABUS = 'hsc_tracker_custom_syllabus_v1';
  const STORAGE_KEY_THEME = 'hsc_tracker_theme_v1';

  // Application State
  const state = {
    meta: {
      name: '',
      roll: '',
      startDate: '',
      targetDate: ''
    },
    config: {
      soundEnabled: true
    },
    theme: 'light', // 'light' or 'dark'
    syllabus: [], // Active syllabus (default + user additions)
    checks: {}, // key: "chapId_stageId" -> true
    activeSubject: 'all', // 'all' or subjectId
    paperFilter: 'all', // 'all', '1', '2'
    statusFilter: 'all', // 'all', 'completed', 'inprogress', 'pending'
    searchQuery: ''
  };

  // Dynamic caches updated whenever syllabus changes
  let ALL_CHAPTERS = [];
  let VALID_KEYS = new Set();

  function updateCaches() {
    ALL_CHAPTERS = [];
    VALID_KEYS = new Set();
    const stages = REVISION_STAGES.map(s => s.id);

    state.syllabus.forEach(sub => {
      sub.sections.forEach(sec => {
        sec.chapters.forEach(chap => {
          ALL_CHAPTERS.push(chap);
          stages.forEach(stg => {
            VALID_KEYS.add(`${chap.id}_${stg}`);
          });
        });
      });
    });
  }

  // Deep clone helper
  function cloneData(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Lazy AudioContext
  let audioCtx = null;
  function playSuccessSound() {
    if (!state.config.soundEnabled) return;
    try {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        audioCtx = new AudioContextClass();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.1);
      osc.frequency.setValueAtTime(783.99, now + 0.2);
      osc.frequency.setValueAtTime(1046.50, now + 0.3);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.55);
    } catch (e) {
      console.warn('Audio feedback failed:', e);
    }
  }

  // Toast Notification
  function showToast(msg, duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.innerHTML = `<span>⚡</span> <span>${msg}</span>`;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, duration);
  }

  // Theme Management (Day / Night Mode)
  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    if (savedTheme === 'dark' || savedTheme === 'light') {
      state.theme = savedTheme;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      state.theme = 'dark';
    } else {
      state.theme = 'light';
    }
    applyTheme();
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', state.theme);
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.innerHTML = state.theme === 'dark'
        ? '<span>🌙 Night Mode</span>'
        : '<span>☀️ Day Mode</span>';
      themeBtn.setAttribute('title', `Current theme: ${state.theme}. Click to switch.`);
    }
  }

  window.toggleTheme = function () {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY_THEME, state.theme);
    applyTheme();
    showToast(`Switched to ${state.theme === 'dark' ? 'Night 🌙' : 'Day ☀️'} Mode`);
  };

  // Local Storage Save & Load
  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(state.checks));
      localStorage.setItem(STORAGE_KEY_META, JSON.stringify(state.meta));
      localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(state.config));
      localStorage.setItem(STORAGE_KEY_SYLLABUS, JSON.stringify(state.syllabus));
    } catch (e) {
      console.error('Failed to save to local storage', e);
    }
  }

  function loadState() {
    try {
      // Load custom syllabus or fallback to default SYLLABUS_DATA
      const savedSyllabus = localStorage.getItem(STORAGE_KEY_SYLLABUS);
      if (savedSyllabus) {
        state.syllabus = JSON.parse(savedSyllabus);
      } else {
        state.syllabus = cloneData(SYLLABUS_DATA);
      }
      updateCaches();

      const savedData = localStorage.getItem(STORAGE_KEY_DATA);
      const savedMeta = localStorage.getItem(STORAGE_KEY_META);
      const savedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);

      if (savedData) state.checks = JSON.parse(savedData);
      if (savedMeta) Object.assign(state.meta, JSON.parse(savedMeta));
      if (savedConfig) Object.assign(state.config, JSON.parse(savedConfig));
    } catch (e) {
      console.error('Failed to parse local storage data', e);
      state.syllabus = cloneData(SYLLABUS_DATA);
      updateCaches();
    }
  }

  // Bitmask Encoding & Decoding Helpers
  function bytesToBase64Url(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  function base64UrlToBytes(base64url) {
    let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  function encodeBitmask(checks) {
    const numBytes = Math.ceil((ALL_CHAPTERS.length * 6) / 8);
    const bytes = new Uint8Array(numBytes);
    ALL_CHAPTERS.forEach((chap, i) => {
      REVISION_STAGES.forEach((stg, s) => {
        if (checks[`${chap.id}_${stg.id}`]) {
          const bitIdx = i * 6 + s;
          bytes[Math.floor(bitIdx / 8)] |= (1 << (bitIdx % 8));
        }
      });
    });
    return bytesToBase64Url(bytes);
  }

  function decodeBitmask(base64url) {
    const tickedKeys = [];
    try {
      const bytes = base64UrlToBytes(base64url);
      ALL_CHAPTERS.forEach((chap, i) => {
        REVISION_STAGES.forEach((stg, s) => {
          const bitIdx = i * 6 + s;
          const byteIdx = Math.floor(bitIdx / 8);
          if (byteIdx < bytes.length && (bytes[byteIdx] & (1 << (bitIdx % 8))) !== 0) {
            tickedKeys.push(`${chap.id}_${stg.id}`);
          }
        });
      });
    } catch (e) {
      console.error('Failed to decode bitmask', e);
    }
    return tickedKeys;
  }

  // Check URL Share on Startup
  function checkUrlShare() {
    const hash = window.location.hash;
    if (!hash) return;

    let importedKeys = [];
    let senderName = 'Peer';

    if (hash.startsWith('#s=')) {
      try {
        const hashParams = new URLSearchParams(hash.substring(1));
        const sParam = hashParams.get('s');
        senderName = hashParams.get('n') || 'Peer';
        if (sParam) {
          importedKeys = decodeBitmask(sParam);
        }
      } catch (err) {
        console.warn('Failed to parse #s= share link', err);
        return;
      }
    } else if (hash.startsWith('#share=')) {
      try {
        const encoded = hash.replace('#share=', '');
        const jsonStr = decodeURIComponent(atob(encoded));
        const sharedData = JSON.parse(jsonStr);
        if (sharedData.meta && sharedData.meta.name) {
          senderName = sharedData.meta.name;
        }
        if (Array.isArray(sharedData.checks)) {
          importedKeys = sharedData.checks;
        }
      } catch (err) {
        console.warn('Failed to parse #share= JSON share link', err);
        return;
      }
    } else {
      return;
    }

    const validTickedKeys = importedKeys.filter(k => VALID_KEYS.has(k));

    const banner = document.getElementById('share-import-banner');
    const bannerText = document.getElementById('share-import-text');
    if (banner && bannerText) {
      bannerText.innerText = `Viewing shared checklist from "${senderName}" (${validTickedKeys.length} tasks ticked)`;
      banner.classList.remove('hidden');

      const confirmBtn = document.getElementById('btn-confirm-import');
      const dismissBtn = document.getElementById('btn-dismiss-import');

      if (confirmBtn) {
        confirmBtn.onclick = () => {
          state.checks = {};
          validTickedKeys.forEach(k => {
            state.checks[k] = true;
          });
          saveState();
          banner.classList.add('hidden');
          window.location.hash = '';
          renderAll();
          showToast(`Imported ${validTickedKeys.length} ticked milestones successfully! Your profile details were preserved.`);
        };
      }

      if (dismissBtn) {
        dismissBtn.onclick = () => {
          banner.classList.add('hidden');
          window.location.hash = '';
        };
      }
    }
  }

  // Generate Compact Share URL
  function generateShareUrl() {
    const base64url = encodeBitmask(state.checks);
    const baseUrl = window.location.origin + window.location.pathname;
    const nameParam = state.meta.name && state.meta.name.trim()
      ? `&n=${encodeURIComponent(state.meta.name.trim())}`
      : '';
    return `${baseUrl}#s=${base64url}${nameParam}`;
  }

  // Generate Text Summary for Social/Messaging
  function generateSummaryText() {
    const stats = calculateStats();
    const days = getDaysRemaining();
    const studentName = state.meta.name ? state.meta.name : 'HSC Aspirant';
    const rollInfo = state.meta.roll ? ` (${state.meta.roll})` : '';

    let text = `🎓 HSC Science Revision Master\n`;
    text += `👤 Student: ${studentName}${rollInfo}\n`;
    text += `📊 Overall Revision: ${stats.overallPct}% (${stats.totalChecked} / ${stats.totalTasks} milestones)\n`;
    if (days !== null) {
      text += `⏱ Target Exam in: ${days > 0 ? days + ' days' : 'Exam day!'}\n`;
    }
    text += `------------------------------------\n`;

    state.syllabus.forEach(sub => {
      const subStat = stats.subjectStats[sub.id] || { pct: 0 };
      const bar = '■'.repeat(Math.round(subStat.pct / 10)) + '□'.repeat(10 - Math.round(subStat.pct / 10));
      text += `${sub.icon} ${sub.nameEn}: ${subStat.pct}% [${bar}]\n`;
    });

    text += `------------------------------------\n`;
    text += `Track progress with HSC Science Revision Master 🚀`;
    return text;
  }

  // Local date parsing
  function getDaysRemaining() {
    if (!state.meta.targetDate) return null;
    const parts = state.meta.targetDate.split('-');
    if (parts.length !== 3) return null;

    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);

    const targetDate = new Date(y, m, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  }

  // Calculate Comprehensive Stats
  function calculateStats() {
    let totalTasks = 0;
    let totalChecked = 0;
    const stageStats = {};
    REVISION_STAGES.forEach(s => stageStats[s.id] = { total: 0, checked: 0, pct: 0 });
    const subjectStats = {};

    state.syllabus.forEach(sub => {
      let subTotal = 0;
      let subChecked = 0;

      sub.sections.forEach(sec => {
        sec.chapters.forEach(chap => {
          REVISION_STAGES.forEach(stg => {
            totalTasks++;
            subTotal++;
            stageStats[stg.id].total++;

            const key = `${chap.id}_${stg.id}`;
            if (state.checks[key]) {
              totalChecked++;
              subChecked++;
              stageStats[stg.id].checked++;
            }
          });
        });
      });

      const subPct = subTotal > 0 ? Math.round((subChecked / subTotal) * 100) : 0;
      subjectStats[sub.id] = { total: subTotal, checked: subChecked, pct: subPct };
    });

    REVISION_STAGES.forEach(s => {
      stageStats[s.id].pct = stageStats[s.id].total > 0
        ? Math.round((stageStats[s.id].checked / stageStats[s.id].total) * 100)
        : 0;
    });

    const overallPct = totalTasks > 0 ? Math.round((totalChecked / totalTasks) * 100) : 0;

    return { totalTasks, totalChecked, overallPct, stageStats, subjectStats };
  }

  // Free-Form Toggle Checkpoint Handler
  function handleCheckToggle(chapId, stageIndex, el) {
    const stage = REVISION_STAGES[stageIndex];
    const key = `${chapId}_${stage.id}`;
    const willBeChecked = !state.checks[key];

    state.checks[key] = willBeChecked;

    if (willBeChecked) {
      let allDone = true;
      REVISION_STAGES.forEach(s => {
        if (!state.checks[`${chapId}_${s.id}`]) allDone = false;
      });
      if (allDone) {
        playSuccessSound();
        showToast(`🎉 Chapter Complete! Keep grinding!`);
      }
    }

    saveState();
    renderStats();
    renderSubjectTabs();

    if (state.statusFilter !== 'all') {
      renderTable();
    } else {
      updateRowVisuals(chapId);
    }
  }

  // Row Quick Actions
  function completeRow(chapId) {
    REVISION_STAGES.forEach(s => state.checks[`${chapId}_${s.id}`] = true);
    saveState();
    playSuccessSound();
    renderStats();
    renderSubjectTabs();
    if (state.statusFilter !== 'all') {
      renderTable();
    } else {
      updateRowVisuals(chapId);
    }
    showToast('Chapter marked 100% complete!');
  }

  function resetRow(chapId) {
    REVISION_STAGES.forEach(s => state.checks[`${chapId}_${s.id}`] = false);
    saveState();
    renderStats();
    renderSubjectTabs();
    if (state.statusFilter !== 'all') {
      renderTable();
    } else {
      updateRowVisuals(chapId);
    }
    showToast('Chapter reset.');
  }

  function updateRowVisuals(chapId) {
    const rowEl = document.getElementById(`row-${chapId}`);
    if (!rowEl) return;

    let checkedCount = 0;
    REVISION_STAGES.forEach((s, idx) => {
      const btn = rowEl.querySelector(`[data-stage="${idx}"]`);
      const isChecked = !!state.checks[`${chapId}_${s.id}`];
      if (btn) {
        btn.setAttribute('aria-pressed', isChecked ? 'true' : 'false');
        if (isChecked) {
          checkedCount++;
          btn.classList.add('checked');
          btn.innerText = '✓';
        } else {
          btn.classList.remove('checked');
          btn.innerText = '';
        }
      }
    });

    const statusBadge = rowEl.querySelector('.status-badge');
    if (statusBadge) {
      if (checkedCount === 6) {
        statusBadge.className = 'status-badge px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#0077B6] text-white shadow-sm';
        statusBadge.innerText = '100% Done';
        rowEl.classList.add('fully-done');
      } else if (checkedCount > 0) {
        const pct = Math.round((checkedCount / 6) * 100);
        statusBadge.className = 'status-badge px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--badge-active-bg)] text-[var(--badge-active-text)] border border-[var(--border-cyan)]';
        statusBadge.innerText = `${pct}% Active`;
        rowEl.classList.remove('fully-done');
      } else {
        statusBadge.className = 'status-badge px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--pill-bg)] text-[var(--text-muted)] border border-[var(--border-cyan)]';
        statusBadge.innerText = 'Pending';
        rowEl.classList.remove('fully-done');
      }
    }
  }

  // Render Stats Overview & Pace Hint
  function renderStats() {
    const stats = calculateStats();

    // Overall Ring
    const pctEl = document.getElementById('stat-overall-pct');
    const countsEl = document.getElementById('stat-overall-counts');
    const ringPath = document.getElementById('stat-ring-path');

    if (pctEl) pctEl.innerText = `${stats.overallPct}%`;
    if (countsEl) countsEl.innerText = `${stats.totalChecked} / ${stats.totalTasks}`;
    if (ringPath) ringPath.setAttribute('stroke-dasharray', `${stats.overallPct}, 100`);

    // Days Countdown & Pace Hint
    const countdownEl = document.getElementById('meta-countdown-text');
    if (countdownEl) {
      const days = getDaysRemaining();
      const remainingTasks = stats.totalTasks - stats.totalChecked;

      if (days === null) {
        countdownEl.innerText = 'Set your exam date';
      } else if (days <= 0) {
        if (remainingTasks === 0) {
          countdownEl.innerText = `🎉 All ${stats.totalTasks} tasks complete!`;
        } else {
          countdownEl.innerText = '⏱ 0 days left • Exam date reached';
        }
      } else {
        if (remainingTasks === 0) {
          countdownEl.innerText = `⏱ ${days} days left • All complete! 🎉`;
        } else {
          const pace = (remainingTasks / days).toFixed(1);
          countdownEl.innerText = `⏱ ${days} days left • ~${pace} tasks/day to finish`;
        }
      }
    }

    // Stages pills breakdown
    const stageContainer = document.getElementById('stage-pills-container');
    if (stageContainer) {
      stageContainer.innerHTML = REVISION_STAGES.map(stg => {
        const sStat = stats.stageStats[stg.id] || { checked: 0, total: 0, pct: 0 };
        return `
          <div class="bg-[var(--card-bg)] border border-[var(--border-cyan)] rounded-2xl p-2.5 text-center shadow-xs">
            <span class="text-[10px] uppercase font-bold text-[var(--accent-ocean)] tracking-wider block">${stg.short}</span>
            <div class="font-black text-sm text-[var(--text-dark-blue)] mt-0.5">${sStat.checked} / ${sStat.total}</div>
            <div class="w-full bg-[var(--pill-bg)] h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div class="bg-[var(--accent-ocean)] h-full rounded-full transition-all duration-500" style="width: ${sStat.pct}%"></div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // Render Subject Tabs with + Custom Subject Button
  function renderSubjectTabs() {
    const container = document.getElementById('subject-tabs-list');
    if (!container) return;

    const stats = calculateStats();
    let html = `
      <button onclick="setSubject('all')" class="px-5 py-3 rounded-2xl font-extrabold text-xs whitespace-nowrap transition flex items-center gap-2.5 ${
        state.activeSubject === 'all'
          ? 'bg-[#0077B6] text-white shadow-lg shadow-[#0077B6]/30'
          : 'bg-[var(--card-bg)] hover:bg-[var(--sky-light)] text-[var(--text-dark-blue)] border border-[var(--border-cyan)]'
      }">
        <span>📚 All Subjects</span>
        <span class="${state.activeSubject === 'all' ? 'bg-white/20 text-white' : 'bg-[var(--pill-bg)] text-[var(--accent-ocean)]'} px-2 py-0.5 rounded-lg text-[11px] font-bold">${stats.overallPct}%</span>
      </button>
    `;

    state.syllabus.forEach(sub => {
      const sStat = stats.subjectStats[sub.id] || { pct: 0 };
      const isActive = state.activeSubject === sub.id;
      html += `
        <button onclick="setSubject('${sub.id}')" class="px-5 py-3 rounded-2xl font-extrabold text-xs whitespace-nowrap transition flex items-center gap-2.5 ${
          isActive
            ? 'bg-[#0077B6] text-white shadow-lg shadow-[#0077B6]/30'
            : 'bg-[var(--card-bg)] hover:bg-[var(--sky-light)] text-[var(--text-dark-blue)] border border-[var(--border-cyan)]'
        }">
          <span>${sub.icon} ${sub.nameEn}</span>
          ${sub.isCustom ? `<span class="text-[9px] bg-amber-500/20 text-amber-500 px-1 rounded">Custom</span>` : ''}
          <span class="${isActive ? 'bg-white/20 text-white' : 'bg-[var(--pill-bg)] text-[var(--accent-ocean)]'} px-2 py-0.5 rounded-lg text-[11px] font-bold">${sStat.pct}%</span>
        </button>
      `;
    });

    // Add Subject Button
    html += `
      <button onclick="openCustomSyllabusModal('subject')" class="px-4 py-3 rounded-2xl font-extrabold text-xs whitespace-nowrap transition flex items-center gap-2 bg-[var(--sky-light)] text-[var(--accent-ocean)] hover:bg-[var(--surface-cyan)] border border-[var(--border-cyan)] shadow-xs">
        <span>➕ New Subject</span>
      </button>
    `;

    container.innerHTML = html;
  }

  // Render Revision Matrix Table
  function renderTable() {
    const container = document.getElementById('matrix-table-container');
    if (!container) return;

    let subjectsToRender = state.syllabus;
    if (state.activeSubject !== 'all') {
      subjectsToRender = state.syllabus.filter(s => s.id === state.activeSubject);
    }

    const query = state.searchQuery.trim().toLowerCase();
    let renderedBlocks = '';

    subjectsToRender.forEach(sub => {
      let filteredSections = [];

      sub.sections.forEach(sec => {
        // Paper filter
        if (state.paperFilter === '1' && sec.paper !== 1 && sec.paper !== 0) return;
        if (state.paperFilter === '2' && sec.paper !== 2 && sec.paper !== 0) return;

        // Search & status filter
        const matchedChapters = sec.chapters.filter(chap => {
          const matchQuery = !query ||
            chap.title.toLowerCase().includes(query) ||
            (chap.titleEn && chap.titleEn.toLowerCase().includes(query)) ||
            (chap.author && chap.author.toLowerCase().includes(query));

          if (!matchQuery) return false;

          let checkedCount = 0;
          REVISION_STAGES.forEach(s => {
            if (state.checks[`${chap.id}_${s.id}`]) checkedCount++;
          });

          if (state.statusFilter === 'completed' && checkedCount < 6) return false;
          if (state.statusFilter === 'pending' && checkedCount > 0) return false;
          if (state.statusFilter === 'inprogress' && (checkedCount === 0 || checkedCount === 6)) return false;

          return true;
        });

        if (matchedChapters.length > 0) {
          filteredSections.push({ ...sec, chapters: matchedChapters });
        }
      });

      if (filteredSections.length === 0) return;

      renderedBlocks += `
        <div class="bg-[var(--card-bg)] rounded-3xl overflow-hidden shadow-xl border-2 border-[var(--border-cyan)] mb-8">
          <!-- Subject Banner -->
          <div class="bg-[var(--surface-cyan)] px-6 py-4 border-b border-[var(--border-cyan)] flex flex-wrap items-center justify-between gap-3">
            <div class="flex items-center gap-3">
              <span class="text-2xl">${sub.icon}</span>
              <div>
                <h2 class="text-lg font-black text-[var(--text-dark-blue)] flex items-center gap-2">
                  <span>${sub.name}</span>
                  <span class="font-medium text-sm text-[var(--accent-ocean)]">(${sub.nameEn})</span>
                  ${sub.isCustom ? `<span class="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full font-bold">Custom</span>` : ''}
                </h2>
                <p class="text-xs text-[var(--text-dark-blue)]/80 font-semibold">HSC Curriculum Matrix</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button onclick="openCustomSyllabusModal('chapter', '${sub.id}', '${sub.sections[0]?.id || ''}')" class="text-xs font-bold bg-[var(--white)] text-[var(--accent-ocean)] px-3 py-1.5 rounded-xl border border-[var(--border-cyan)] hover:bg-[var(--sky-light)] transition shadow-xs flex items-center gap-1.5 no-print">
                <span>➕ Add Chapter</span>
              </button>
              ${sub.isCustom ? `
                <button onclick="deleteCustomSubject('${sub.id}')" title="Delete Custom Subject" class="text-xs font-bold bg-red-500/10 text-red-500 px-2.5 py-1.5 rounded-xl hover:bg-red-500/20 transition no-print">
                  🗑 Delete
                </button>
              ` : ''}
              <span class="text-xs font-bold text-[var(--text-dark-blue)] bg-[var(--white)] px-3 py-1.5 rounded-xl shadow-xs border border-[var(--border-cyan)]">
                ${filteredSections.reduce((acc, s) => acc + s.chapters.length, 0)} Chapters
              </span>
            </div>
          </div>

          <!-- Tables per Section -->
          ${filteredSections.map(sec => `
            <div class="border-b border-[var(--subtle-divide)] last:border-b-0">
              <div class="bg-[var(--sky-light)]/60 px-6 py-2.5 border-b border-[var(--border-cyan)]/60 flex items-center justify-between">
                <h3 class="text-xs font-black uppercase tracking-wider text-[var(--text-dark-blue)] flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-[var(--accent-ocean)]"></span>
                  ${sec.name} <span class="text-[var(--accent-ocean)] font-semibold text-[11px]">— ${sec.nameEn}</span>
                </h3>
                <button onclick="openCustomSyllabusModal('chapter', '${sub.id}', '${sec.id}')" class="text-[11px] font-bold text-[var(--accent-ocean)] hover:underline flex items-center gap-1 no-print">
                  <span>+ Add Chapter</span>
                </button>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                  <thead>
                    <tr class="bg-[var(--table-head-bg)] border-b border-[var(--border-cyan)]/60 text-[11px] uppercase tracking-wider text-[var(--text-dark-blue)] font-extrabold">
                      <th class="py-3 px-4 w-12 text-center">#</th>
                      <th class="py-3 px-4 min-w-[220px] sticky-col">Chapter / Topic</th>
                      ${REVISION_STAGES.map(s => `
                        <th class="py-3 px-2 text-center min-w-[90px]">
                          <div class="flex flex-col items-center">
                            <span>${s.short}</span>
                            <span class="text-[9px] text-[var(--accent-ocean)] font-bold">${s.subtitle || ''}</span>
                          </div>
                        </th>
                      `).join('')}
                      <th class="py-3 px-4 text-center w-28">Status</th>
                      <th class="py-3 px-3 text-center w-16 no-print">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[var(--subtle-divide)] text-xs">
                    ${sec.chapters.map(chap => {
                      let checkedCount = 0;
                      REVISION_STAGES.forEach(s => {
                        if (state.checks[`${chap.id}_${s.id}`]) checkedCount++;
                      });
                      const isComplete = checkedCount === 6;

                      return `
                        <tr id="row-${chap.id}" class="topic-row ${isComplete ? 'fully-done' : ''}">
                          <td class="py-3 px-4 text-center font-extrabold text-[var(--accent-ocean)]">${chap.no}</td>
                          <td class="py-3 px-4 sticky-col">
                            <div class="flex items-center gap-2">
                              <span class="font-bold text-[var(--text-dark-blue)] text-sm bangla">${chap.title}</span>
                              ${chap.isCustom ? `<span class="text-[9px] bg-amber-500/20 text-amber-500 px-1 rounded font-bold">Custom</span>` : ''}
                            </div>
                            ${chap.titleEn ? `<div class="text-[11px] text-[var(--accent-ocean)] font-medium">${chap.titleEn}</div>` : ''}
                            ${chap.author ? `<div class="text-[11px] text-[var(--accent-ocean)] font-medium bangla">লেখক: ${chap.author}</div>` : ''}
                          </td>
                          ${REVISION_STAGES.map((stg, idx) => {
                            const isChecked = !!state.checks[`${chap.id}_${stg.id}`];
                            return `
                              <td class="py-3 px-2 text-center">
                                <button data-stage="${idx}" onclick="toggleStage('${chap.id}', ${idx}, this)" class="stage-btn ${isChecked ? 'checked' : ''}" aria-pressed="${isChecked ? 'true' : 'false'}" aria-label="${chap.title}: ${stg.title}">
                                  ${isChecked ? '✓' : ''}
                                </button>
                              </td>
                            `;
                          }).join('')}
                          <td class="py-3 px-4 text-center">
                            <span class="status-badge px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isComplete
                                ? 'bg-[#0077B6] text-white shadow-sm font-extrabold'
                                : checkedCount > 0
                                ? 'bg-[var(--badge-active-bg)] text-[var(--badge-active-text)] border border-[var(--border-cyan)]'
                                : 'bg-[var(--pill-bg)] text-[var(--text-muted)] border border-[var(--border-cyan)]'
                            }">
                              ${isComplete ? '100% Done' : checkedCount > 0 ? `${Math.round((checkedCount / 6) * 100)}% Active` : 'Pending'}
                            </span>
                          </td>
                          <td class="py-3 px-3 text-center no-print">
                            <div class="flex items-center justify-center gap-1">
                              <button onclick="quickComplete('${chap.id}')" aria-label="Mark all complete" title="Mark All Complete" class="w-7 h-7 rounded-lg bg-[var(--sky-light)] hover:bg-[var(--surface-cyan)] text-[var(--text-dark-blue)] font-bold text-[10px] transition border border-[var(--border-cyan)]">
                                ✓✓
                              </button>
                              <button onclick="quickReset('${chap.id}')" aria-label="Reset chapter" title="Reset Chapter" class="w-7 h-7 rounded-lg bg-[var(--sky-light)] hover:bg-[var(--surface-cyan)] text-slate-500 font-bold text-[10px] transition border border-[var(--border-cyan)]">
                                ↺
                              </button>
                              ${chap.isCustom ? `
                                <button onclick="deleteCustomChapter('${chap.id}')" aria-label="Delete chapter" title="Delete custom chapter" class="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold text-[10px] transition">
                                  ✕
                                </button>
                              ` : ''}
                            </div>
                          </td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    });

    if (!renderedBlocks) {
      renderedBlocks = `
        <div class="bg-[var(--card-bg)] rounded-3xl p-12 text-center border-2 border-[var(--border-cyan)] shadow-md my-8">
          <div class="text-4xl mb-3">🔍</div>
          <h3 class="text-base font-bold text-[var(--text-dark-blue)]">No matching chapters found</h3>
          <p class="text-xs text-[var(--accent-ocean)] mt-1">Try adjusting your search query, status filter, or add custom chapters.</p>
          <button onclick="resetFilters()" class="mt-4 px-4 py-2 bg-[#0077B6] text-white rounded-xl text-xs font-bold transition">
            Clear Filters
          </button>
        </div>
      `;
    }

    container.innerHTML = renderedBlocks;
  }

  // Global functions exposed to window
  window.toggleStage = handleCheckToggle;
  window.quickComplete = completeRow;
  window.quickReset = resetRow;

  window.setSubject = function (subId) {
    state.activeSubject = subId;
    renderSubjectTabs();
    renderTable();
  };

  window.setPaperFilter = function (val) {
    state.paperFilter = val;
    document.querySelectorAll('.paper-filter-btn').forEach(btn => {
      const match = btn.getAttribute('data-paper') === val;
      btn.className = `paper-filter-btn px-3.5 py-2 rounded-xl text-xs font-bold transition ${
        match ? 'bg-[#0077B6] text-white shadow-sm' : 'bg-[var(--card-bg)] text-[var(--text-dark-blue)] hover:bg-[var(--sky-light)] border border-[var(--border-cyan)]'
      }`;
    });
    renderTable();
  };

  window.setStatusFilter = function (val) {
    state.statusFilter = val;
    renderTable();
  };

  window.handleSearchInput = function (val) {
    state.searchQuery = val;
    renderTable();
  };

  window.resetFilters = function () {
    state.searchQuery = '';
    state.paperFilter = 'all';
    state.statusFilter = 'all';
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';
    const statusSelect = document.getElementById('status-filter-select');
    if (statusSelect) statusSelect.value = 'all';
    window.setPaperFilter('all');
  };

  window.toggleSound = function (enabled) {
    state.config.soundEnabled = enabled;
    saveState();
    const btn = document.getElementById('sound-toggle-btn');
    if (btn) btn.innerText = enabled ? '🔊 Enabled' : '🔇 Muted';
    showToast(`Completion Sounds: ${enabled ? 'ON' : 'OFF'}`);
  };

  // Custom Syllabus Creation & Management Engine
  window.openCustomSyllabusModal = function (tab = 'chapter', preSubjectId = '', preSectionId = '') {
    const modal = document.getElementById('custom-syllabus-modal');
    if (!modal) return;

    // Populate subjects dropdown
    const subSelect = document.getElementById('custom-chapter-subject-select');
    if (subSelect) {
      subSelect.innerHTML = state.syllabus.map(s => `
        <option value="${s.id}" ${s.id === preSubjectId ? 'selected' : ''}>${s.icon} ${s.name} (${s.nameEn})</option>
      `).join('');
    }

    updateSectionDropdown(preSubjectId || state.syllabus[0]?.id, preSectionId);
    window.switchCustomModalTab(tab);
    modal.classList.remove('hidden');
  };

  window.closeCustomSyllabusModal = function () {
    document.getElementById('custom-syllabus-modal')?.classList.add('hidden');
  };

  window.switchCustomModalTab = function (tabName) {
    document.querySelectorAll('.custom-modal-tab-btn').forEach(btn => {
      const isCurrent = btn.getAttribute('data-tab') === tabName;
      btn.className = `custom-modal-tab-btn px-4 py-2 font-bold text-xs rounded-xl transition ${
        isCurrent ? 'bg-[#0077B6] text-white shadow-sm' : 'bg-[var(--sky-light)] text-[var(--text-dark-blue)] hover:bg-[var(--surface-cyan)]'
      }`;
    });

    document.getElementById('custom-tab-chapter')?.classList.toggle('hidden', tabName !== 'chapter');
    document.getElementById('custom-tab-subject')?.classList.toggle('hidden', tabName !== 'subject');
    document.getElementById('custom-tab-manage')?.classList.toggle('hidden', tabName !== 'manage');

    if (tabName === 'manage') {
      renderManageCustomList();
    }
  };

  function updateSectionDropdown(subjectId, preSectionId = '') {
    const secSelect = document.getElementById('custom-chapter-section-select');
    if (!secSelect) return;
    const sub = state.syllabus.find(s => s.id === subjectId) || state.syllabus[0];
    if (sub) {
      secSelect.innerHTML = sub.sections.map(sec => `
        <option value="${sec.id}" ${sec.id === preSectionId ? 'selected' : ''}>${sec.name} (${sec.nameEn})</option>
      `).join('');
    }
  }

  window.handleSubjectChangeInModal = function (subjectId) {
    updateSectionDropdown(subjectId);
  };

  // Add Chapter Handler
  window.submitAddCustomChapter = function () {
    const subSelect = document.getElementById('custom-chapter-subject-select');
    const secSelect = document.getElementById('custom-chapter-section-select');
    const titleBnInput = document.getElementById('custom-chapter-title-bn');
    const titleEnInput = document.getElementById('custom-chapter-title-en');

    const subId = subSelect?.value;
    const secId = secSelect?.value;
    const titleBn = titleBnInput?.value?.trim();
    const titleEn = titleEnInput?.value?.trim();

    if (!titleBn) {
      alert('Please enter a Chapter / Topic title.');
      titleBnInput?.focus();
      return;
    }

    const sub = state.syllabus.find(s => s.id === subId);
    if (!sub) return;
    const sec = sub.sections.find(sc => sc.id === secId) || sub.sections[0];
    if (!sec) return;

    const newId = `cust_chap_${Date.now()}`;
    const nextNo = sec.chapters.length + 1;

    sec.chapters.push({
      id: newId,
      no: nextNo,
      title: titleBn,
      titleEn: titleEn || '',
      isCustom: true
    });

    saveState();
    updateCaches();
    renderAll();
    window.closeCustomSyllabusModal();

    if (titleBnInput) titleBnInput.value = '';
    if (titleEnInput) titleEnInput.value = '';

    showToast(`✓ Added "${titleBn}" to ${sub.name}!`);
  };

  // Add Subject Handler
  window.submitAddCustomSubject = function () {
    const nameBnInput = document.getElementById('custom-subject-name-bn');
    const nameEnInput = document.getElementById('custom-subject-name-en');
    const iconInput = document.getElementById('custom-subject-icon');
    const papersSelect = document.getElementById('custom-subject-papers');

    const nameBn = nameBnInput?.value?.trim();
    const nameEn = nameEnInput?.value?.trim() || nameBn;
    const icon = iconInput?.value?.trim() || '📘';
    const paperType = papersSelect?.value || 'single';

    if (!nameBn) {
      alert('Please enter a Subject Name.');
      nameBnInput?.focus();
      return;
    }

    const newSubId = `cust_sub_${Date.now()}`;
    let sections = [];

    if (paperType === 'two') {
      sections = [
        { id: `${newSubId}_sec1`, paper: 1, name: '১ম পত্র', nameEn: '1st Paper', chapters: [] },
        { id: `${newSubId}_sec2`, paper: 2, name: '২য় পত্র', nameEn: '2nd Paper', chapters: [] }
      ];
    } else {
      sections = [
        { id: `${newSubId}_sec0`, paper: 0, name: 'সকল অধ্যায়', nameEn: 'All Chapters', chapters: [] }
      ];
    }

    state.syllabus.push({
      id: newSubId,
      name: nameBn,
      nameEn: nameEn,
      icon: icon,
      isCustom: true,
      sections: sections
    });

    saveState();
    updateCaches();
    state.activeSubject = newSubId; // Switch tab to new subject
    renderAll();
    window.closeCustomSyllabusModal();

    if (nameBnInput) nameBnInput.value = '';
    if (nameEnInput) nameEnInput.value = '';

    showToast(`✓ Created new subject "${nameBn}"! Now add chapters to it.`);
  };

  // Delete Custom Chapter
  window.deleteCustomChapter = function (chapId) {
    if (!confirm('Are you sure you want to delete this custom chapter?')) return;

    state.syllabus.forEach(sub => {
      sub.sections.forEach(sec => {
        sec.chapters = sec.chapters.filter(c => c.id !== chapId);
      });
    });

    // Remove any checkmark records for this chapter
    REVISION_STAGES.forEach(s => {
      delete state.checks[`${chapId}_${s.id}`];
    });

    saveState();
    updateCaches();
    renderAll();
    showToast('Custom chapter deleted.');
  };

  // Delete Custom Subject
  window.deleteCustomSubject = function (subId) {
    if (!confirm('Are you sure you want to delete this custom subject and all its chapters?')) return;

    state.syllabus = state.syllabus.filter(s => s.id !== subId);
    if (state.activeSubject === subId) state.activeSubject = 'all';

    saveState();
    updateCaches();
    renderAll();
    showToast('Custom subject deleted.');
  };

  // Reset to Official Default Syllabus
  window.resetToDefaultSyllabus = function () {
    if (!confirm('Revert syllabus to the official default HSC Science syllabus? Custom subjects and custom chapters will be cleared!')) return;

    state.syllabus = cloneData(SYLLABUS_DATA);
    localStorage.removeItem(STORAGE_KEY_SYLLABUS);
    updateCaches();
    renderAll();
    window.closeCustomSyllabusModal();
    showToast('Syllabus restored to official default.');
  };

  function renderManageCustomList() {
    const listContainer = document.getElementById('manage-custom-items-list');
    if (!listContainer) return;

    const customSubs = state.syllabus.filter(s => s.isCustom);
    const customChaps = [];
    state.syllabus.forEach(sub => {
      sub.sections.forEach(sec => {
        sec.chapters.forEach(c => {
          if (c.isCustom) customChaps.push({ ...c, subjectName: sub.name, sectionName: sec.name });
        });
      });
    });

    if (customSubs.length === 0 && customChaps.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-6 text-xs text-[var(--accent-ocean)]">
          No custom subjects or chapters created yet. Use the tabs above to create your own!
        </div>
      `;
      return;
    }

    let html = '';
    if (customSubs.length > 0) {
      html += `<h4 class="font-bold text-xs uppercase tracking-wider text-[var(--text-dark-blue)] mb-2">Custom Subjects</h4><div class="space-y-1.5 mb-4">`;
      customSubs.forEach(s => {
        html += `
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-[var(--sky-light)]/50 border border-[var(--border-cyan)] text-xs">
            <span class="font-bold text-[var(--text-dark-blue)]">${s.icon} ${s.name} (${s.nameEn})</span>
            <button onclick="deleteCustomSubject('${s.id}')" class="text-red-500 hover:text-red-700 font-bold px-2 py-1 bg-red-500/10 rounded-lg">Delete</button>
          </div>
        `;
      });
      html += `</div>`;
    }

    if (customChaps.length > 0) {
      html += `<h4 class="font-bold text-xs uppercase tracking-wider text-[var(--text-dark-blue)] mb-2">Custom Chapters</h4><div class="space-y-1.5 max-h-48 overflow-y-auto">`;
      customChaps.forEach(c => {
        html += `
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-[var(--sky-light)]/50 border border-[var(--border-cyan)] text-xs">
            <div>
              <span class="font-bold text-[var(--text-dark-blue)] bangla">${c.title}</span>
              <span class="text-[10px] text-[var(--accent-ocean)] block">${c.subjectName} • ${c.sectionName}</span>
            </div>
            <button onclick="deleteCustomChapter('${c.id}')" class="text-red-500 hover:text-red-700 font-bold px-2 py-1 bg-red-500/10 rounded-lg">Delete</button>
          </div>
        `;
      });
      html += `</div>`;
    }

    listContainer.innerHTML = html;
  }

  // Share Modal Handling
  window.openShareModal = function () {
    const modal = document.getElementById('share-modal');
    if (!modal) return;
    const urlInput = document.getElementById('share-link-input');
    if (urlInput) urlInput.value = generateShareUrl();
    const summaryInput = document.getElementById('share-summary-text');
    if (summaryInput) summaryInput.value = generateSummaryText();
    modal.classList.remove('hidden');
  };

  window.closeShareModal = function () {
    document.getElementById('share-modal')?.classList.add('hidden');
  };

  window.copyShareLink = function () {
    const url = generateShareUrl();
    navigator.clipboard.writeText(url).then(() => {
      showToast('Compact share link copied to clipboard!');
    }).catch(() => {
      prompt('Copy this link:', url);
    });
  };

  window.copySummaryText = function () {
    const text = generateSummaryText();
    navigator.clipboard.writeText(text).then(() => {
      showToast('Progress Summary copied! Ready to paste into WhatsApp / Messenger.');
    }).catch(() => {
      prompt('Copy text:', text);
    });
  };

  // JSON Export & Import (Includes custom syllabus)
  window.exportJsonBackup = function () {
    const fileNameSafe = state.meta.name ? state.meta.name.replace(/\s+/g, '_') : 'my_study_tracker';
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      meta: state.meta,
      checks: state.checks,
      config: state.config,
      syllabus: state.syllabus,
      exportDate: new Date().toISOString()
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `hsc-revision-backup-${fileNameSafe}-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup JSON file downloaded!');
  };

  window.importJsonBackup = function (fileInput) {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported.syllabus)) {
          state.syllabus = imported.syllabus;
          updateCaches();
        }
        if (imported.checks && typeof imported.checks === 'object') {
          state.checks = {};
          Object.keys(imported.checks).forEach(k => {
            if (VALID_KEYS.has(k) && imported.checks[k]) {
              state.checks[k] = true;
            }
          });
        }
        if (imported.meta && typeof imported.meta === 'object') {
          Object.assign(state.meta, imported.meta);
        }
        if (imported.config && typeof imported.config === 'object') {
          Object.assign(state.config, imported.config);
        }
        saveState();
        refreshInputValues();
        renderAll();
        showToast('Backup restored successfully!');
      } catch (err) {
        alert('Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
    fileInput.value = '';
  };

  window.resetAllData = function () {
    if (confirm('Are you sure you want to reset all checked progress? This cannot be undone unless you have a backup!')) {
      state.checks = {};
      saveState();
      renderAll();
      showToast('All progress reset.');
    }
  };

  // Bind event listeners once on startup
  function bindInputListenersOnce() {
    const nameInput = document.getElementById('meta-student-name');
    const rollInput = document.getElementById('meta-student-roll');
    const targetInput = document.getElementById('meta-target-date');

    if (nameInput) {
      nameInput.addEventListener('input', (e) => {
        state.meta.name = e.target.value;
        saveState();
      });
    }
    if (rollInput) {
      rollInput.addEventListener('input', (e) => {
        state.meta.roll = e.target.value;
        saveState();
      });
    }
    if (targetInput) {
      targetInput.addEventListener('change', (e) => {
        state.meta.targetDate = e.target.value;
        saveState();
        renderStats();
      });
    }
  }

  // Refresh input element values without re-attaching listeners
  function refreshInputValues() {
    const nameInput = document.getElementById('meta-student-name');
    const rollInput = document.getElementById('meta-student-roll');
    const targetInput = document.getElementById('meta-target-date');
    const soundBtn = document.getElementById('sound-toggle-btn');

    if (nameInput) nameInput.value = state.meta.name || '';
    if (rollInput) rollInput.value = state.meta.roll || '';
    if (targetInput) targetInput.value = state.meta.targetDate || '';
    if (soundBtn) soundBtn.innerText = state.config.soundEnabled ? '🔊 Enabled' : '🔇 Muted';
  }

  function renderAll() {
    renderStats();
    renderSubjectTabs();
    renderTable();
  }

  // Service Worker Registration
  function registerServiceWorker() {
    if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch((err) => {
          console.warn('ServiceWorker registration skipped or failed:', err);
        });
      });
    }
  }

  // Initialization
  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadState();
    bindInputListenersOnce();
    refreshInputValues();
    checkUrlShare();
    renderAll();
    registerServiceWorker();
  });

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      state,
      calculateStats,
      getDaysRemaining,
      encodeBitmask,
      decodeBitmask,
      bytesToBase64Url,
      base64UrlToBytes
    };
  }

})();
