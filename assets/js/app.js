(function () {
  'use strict';

  const STORAGE_KEY_WORDS = 'kamus_atho_words_v1';
  const STORAGE_KEY_THEME = 'kamus_atho_theme_v1';
  const PLACEHOLDER_MARKER = '[BELUM ADA ARTI';

  // Embedded fallback of the 33 repo entries so offline file:// opens can still recover via the error action button.
  const FALLBACK_WORDS = [
    { id: 'kata-001', word: 'gtw', meaning: 'nggak tau = tidak tau', frequent: true },
    { id: 'kata-002', word: 'codeg', meaning: 'codex chatgpt', frequent: true },
    { id: 'kata-003', word: 'baig', meaning: 'baik', frequent: true },
    { id: 'kata-004', word: 'tidor/tidur', meaning: 'membosankan', frequent: true },
    { id: 'kata-005', word: 'ooo', meaning: '[BELUM ADA ARTI - Klik Susun Kata JSON untuk melengkapi arti]', frequent: true },
    { id: 'kata-006', word: 'cool yeah', meaning: 'kuliah', frequent: false },
    { id: 'kata-007', word: 'agy', meaning: 'antigravity google', frequent: true },
    { id: 'kata-008', word: 'sekumlah', meaning: 'sekolah', frequent: false },
    { id: 'kata-009', word: 'hoemmm', meaning: 'hmmmm', frequent: true },
    { id: 'kata-010', word: 'hmmmm', meaning: 'berpikir', frequent: true },
    { id: 'kata-011', word: 'haiya/hayya', meaning: 'haiya (bahasa cina)', frequent: false },
    { id: 'kata-012', word: 'relief style', meaning: 'style mengetik dengan awal huruf besar dan akhir huruf kecil', frequent: false },
    { id: 'kata-013', word: 'dipsegs', meaning: 'deepseek ai', frequent: true },
    { id: 'kata-014', word: 'uh dumb', meaning: 'adam', frequent: false },
    { id: 'kata-015', word: 'da niga', meaning: 'da capo (visual novel)', frequent: false },
    { id: 'kata-016', word: 'msg', meaning: 'mysubarugweh/myspicagweh', frequent: false },
    { id: 'kata-017', word: 'manuk akal', meaning: 'masuk akal', frequent: true },
    { id: 'kata-018', word: 'athowoilah', meaning: 'panggilan plesetan untuk athoillah', frequent: false },
    { id: 'kata-019', word: 'hooo', meaning: '[BELUM ADA ARTI - Klik Susun Kata JSON untuk melengkapi arti]', frequent: true },
    { id: 'kata-020', word: 'gas', meaning: 'ayo segera', frequent: true },
    { id: 'kata-021', word: 'gtw lagi dah', meaning: 'menyerah dan sudah tidak tau apa lagi yang bisa dilakukan', frequent: true },
    { id: 'kata-022', word: 'copastool', meaning: 'projek github atho64/copastool', frequent: false },
    { id: 'kata-023', word: 'baplo', meaning: 'pablo', frequent: false },
    { id: 'kata-024', word: 'vibecoding', meaning: 'coding dengan ai', frequent: true },
    { id: 'kata-025', word: 'apah iyah', meaning: 'apakah benar?', frequent: true },
    { id: 'kata-026', word: 'iyah', meaning: 'iya', frequent: true },
    { id: 'kata-027', word: 'fronttod', meaning: 'dev/pub vn frontwing', frequent: false },
    { id: 'kata-028', word: 'tl vn', meaning: 'menerjemahkan visual novel', frequent: true },
    { id: 'kata-029', word: 'mikocok', meaning: 'microsoft', frequent: false },
    { id: 'kata-030', word: 'windawg', meaning: 'windows', frequent: false },
    { id: 'kata-031', word: 'indogs', meaning: 'indonesia', frequent: false },
    { id: 'kata-032', word: 'termugs', meaning: 'app android termux', frequent: false },
    { id: 'kata-033', word: 'andorowed', meaning: 'android', frequent: false }
  ];

  const state = {
    repoWords: [],
    words: [],
    searchQuery: '',
    categoryFilter: 'all',
    letterFilter: 'ALL',
    toastTimer: null
  };

  const els = {
    btnTema: document.getElementById('btn-tema'),
    labelTema: document.getElementById('label-tema'),
    btnBukaModal: document.getElementById('btn-buka-modal'),
    btnFooterJson: document.getElementById('btn-footer-json'),
    statTotal: document.getElementById('stat-total'),
    statSering: document.getElementById('stat-sering'),
    statBelum: document.getElementById('stat-belum'),
    inputCari: document.getElementById('input-cari'),
    btnHapusCari: document.getElementById('btn-hapus-cari'),
    filterTabs: Array.from(document.querySelectorAll('.filter-tab')),
    countTabAll: document.getElementById('count-tab-all'),
    countTabFrequent: document.getElementById('count-tab-frequent'),
    countTabIncomplete: document.getElementById('count-tab-incomplete'),
    barAbjad: document.getElementById('bar-abjad'),
    btnResetFilter: document.getElementById('btn-reset-filter'),
    stateLoading: document.getElementById('state-loading'),
    stateError: document.getElementById('state-error'),
    pesanErrorDetail: document.getElementById('pesan-error-detail'),
    btnCobaLagi: document.getElementById('btn-coba-lagi'),
    btnPakaiCadangan: document.getElementById('btn-pakai-cadangan'),
    stateEmpty: document.getElementById('state-empty'),
    judulEmpty: document.getElementById('judul-empty'),
    pesanEmptyDetail: document.getElementById('pesan-empty-detail'),
    btnEmptyReset: document.getElementById('btn-empty-reset'),
    btnEmptyTambah: document.getElementById('btn-empty-tambah'),
    sectionSering: document.getElementById('sering-dipakai'),
    badgeJumlahSering: document.getElementById('badge-jumlah-sering'),
    gridSering: document.getElementById('grid-sering'),
    sectionIndeks: document.getElementById('indeks-kamus'),
    subjudulIndeks: document.getElementById('subjudul-indeks'),
    badgeJumlahTampil: document.getElementById('badge-jumlah-tampil'),
    wadahAbjad: document.getElementById('wadah-abjad'),
    modal: document.getElementById('modal-susun-kata'),
    btnTutupModal: document.getElementById('btn-tutup-modal'),
    formKata: document.getElementById('form-kata'),
    inputIdKata: document.getElementById('input-id-kata'),
    inputNamaKata: document.getElementById('input-nama-kata'),
    inputArtiKata: document.getElementById('input-arti-kata'),
    inputSeringKata: document.getElementById('input-sering-kata'),
    pesanValidasiForm: document.getElementById('pesan-validasi-form'),
    btnResetForm: document.getElementById('btn-reset-form'),
    btnSalinJson: document.getElementById('btn-salin-json'),
    btnUnduhJson: document.getElementById('btn-unduh-json'),
    btnHapusLokal: document.getElementById('btn-hapus-lokal'),
    pratinjauJson: document.getElementById('pratinjau-json'),
    toast: document.getElementById('toast-notifikasi')
  };

  function isMeaningIncomplete(entry) {
    if (!entry || !entry.meaning) return true;
    const text = entry.meaning.trim();
    return text.length === 0 || text.startsWith(PLACEHOLDER_MARKER);
  }

  function getFirstLetter(word) {
    if (!word) return '#';
    const first = word.trim().charAt(0).toUpperCase();
    return /^[A-Z]$/.test(first) ? first : '#';
  }

  function showToast(message) {
    if (!els.toast) return;
    els.toast.textContent = message;
    els.toast.hidden = false;
    if (state.toastTimer) {
      clearTimeout(state.toastTimer);
    }
    state.toastTimer = setTimeout(function () {
      els.toast.hidden = true;
    }, 2800);
  }

  function applyTheme(theme) {
    const resolved = theme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', resolved);
    const isDark = resolved === 'dark';
    els.btnTema.setAttribute('aria-pressed', String(isDark));
    els.labelTema.textContent = isDark ? 'Mode Terang' : 'Mode Gelap';
    try {
      localStorage.setItem(STORAGE_KEY_THEME, resolved);
    } catch (_) {
      // Ignore storage quota errors in private browsing.
    }
  }

  function initTheme() {
    let saved = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY_THEME);
    } catch (_) {
      saved = null;
    }
    if (saved === 'dark' || saved === 'light') {
      applyTheme(saved);
      return;
    }
    applyTheme('light');
  }

  function readLocalOverrides() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_WORDS);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  function saveLocalOverrides(wordsArray) {
    try {
      localStorage.setItem(STORAGE_KEY_WORDS, JSON.stringify(wordsArray));
    } catch (_) {
      showToast('Penyimpanan browser penuh, silakan salin JSON secara manual.');
    }
  }

  function updateStatsAndCounters() {
    const total = state.words.length;
    const frequentCount = state.words.filter(function (w) { return Boolean(w.frequent); }).length;
    const incompleteCount = state.words.filter(isMeaningIncomplete).length;

    els.statTotal.textContent = String(total);
    els.statSering.textContent = String(frequentCount);
    els.statBelum.textContent = String(incompleteCount);

    els.countTabAll.textContent = String(total);
    els.countTabFrequent.textContent = String(frequentCount);
    els.countTabIncomplete.textContent = String(incompleteCount);
    els.pratinjauJson.textContent = JSON.stringify(state.words, null, 2);
  }

  function renderAlphabetBar() {
    const availableLetters = new Set(
      state.words.map(function (item) {
        return getFirstLetter(item.word);
      })
    );

    const letters = ['ALL'].concat('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''));
    els.barAbjad.innerHTML = '';

    letters.forEach(function (letter) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'alpha-btn' + (state.letterFilter === letter ? ' is-active' : '');
      btn.textContent = letter === 'ALL' ? 'Semua' : letter;
      btn.setAttribute('aria-pressed', String(state.letterFilter === letter));

      const hasWords = letter === 'ALL' || availableLetters.has(letter);
      if (!hasWords) {
        btn.disabled = true;
        btn.title = 'Belum ada kata berawalan huruf ' + letter;
      } else {
        btn.addEventListener('click', function () {
          state.letterFilter = letter;
          renderAll();
        });
      }

      els.barAbjad.appendChild(btn);
    });
  }

  function getFilteredWords() {
    const q = state.searchQuery.trim().toLowerCase();
    return state.words.filter(function (entry) {
      if (state.categoryFilter === 'frequent' && !entry.frequent) {
        return false;
      }
      if (state.categoryFilter === 'incomplete' && !isMeaningIncomplete(entry)) {
        return false;
      }
      if (state.letterFilter !== 'ALL' && getFirstLetter(entry.word) !== state.letterFilter) {
        return false;
      }
      if (q.length > 0) {
        const inWord = entry.word.toLowerCase().includes(q);
        const inMeaning = (entry.meaning || '').toLowerCase().includes(q);
        return inWord || inMeaning;
      }
      return true;
    });
  }

  function createWordCard(entry, numberLabel, isFeaturedCard) {
    const article = document.createElement('article');
    article.className = 'word-card' + (isFeaturedCard ? ' word-card-featured' : '');

    const topDiv = document.createElement('div');
    topDiv.className = 'word-card-top';

    const metaRow = document.createElement('div');
    metaRow.className = 'word-meta-row';

    const indexSpan = document.createElement('span');
    indexSpan.className = 'word-index';
    indexSpan.textContent = numberLabel;
    metaRow.appendChild(indexSpan);

    const incomplete = isMeaningIncomplete(entry);
    if (incomplete) {
      const badgeInc = document.createElement('span');
      badgeInc.className = 'badge-incomplete';
      badgeInc.textContent = 'Belum Ada Arti';
      metaRow.appendChild(badgeInc);
    } else if (entry.frequent) {
      const badgeFreq = document.createElement('span');
      badgeFreq.className = 'badge-frequent';
      badgeFreq.innerHTML = '<span aria-hidden="true">△</span> Sering Dipakai';
      metaRow.appendChild(badgeFreq);
    }

    const lemmaHeading = document.createElement('h3');
    lemmaHeading.className = 'word-lemma';
    lemmaHeading.textContent = entry.word;

    const meaningP = document.createElement('p');
    meaningP.className = 'word-meaning' + (incomplete ? ' word-meaning-placeholder' : '');
    meaningP.textContent = entry.meaning;

    topDiv.appendChild(metaRow);
    topDiv.appendChild(lemmaHeading);
    topDiv.appendChild(meaningP);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'word-card-actions';

    const btnCopy = document.createElement('button');
    btnCopy.type = 'button';
    btnCopy.className = 'btn btn-outline btn-card';
    btnCopy.textContent = 'Salin';
    btnCopy.setAttribute('aria-label', 'Salin kata ' + entry.word + ' beserta artinya');
    btnCopy.addEventListener('click', function () {
      const copyText = entry.word + ' = ' + entry.meaning;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(copyText).then(function () {
          btnCopy.textContent = 'Tersalin!';
          showToast('Disalin ke papan klip: ' + copyText);
          setTimeout(function () {
            btnCopy.textContent = 'Salin';
          }, 1600);
        }).catch(function () {
          showToast('Salin manual: ' + copyText);
        });
      } else {
        showToast('Salin: ' + copyText);
      }
    });

    const btnPin = document.createElement('button');
    btnPin.type = 'button';
    btnPin.className = 'btn btn-outline btn-card btn-card-pin' + (entry.frequent ? ' is-pinned' : '');
    btnPin.setAttribute('aria-pressed', String(Boolean(entry.frequent)));
    btnPin.textContent = entry.frequent ? '△ Sering' : 'Tandai Sering';
    btnPin.addEventListener('click', function () {
      entry.frequent = !entry.frequent;
      saveLocalOverrides(state.words);
      renderAll();
      showToast(
        entry.frequent
          ? 'Kata "' + entry.word + '" ditambahkan ke daftar Sering Dipakai.'
          : 'Kata "' + entry.word + '" dilepas dari daftar Sering Dipakai.'
      );
    });

    const btnEdit = document.createElement('button');
    btnEdit.type = 'button';
    btnEdit.className = 'btn btn-ghost btn-card';
    btnEdit.textContent = incomplete ? 'Isi Arti' : 'Ubah';
    btnEdit.addEventListener('click', function () {
      openModalForEntry(entry);
    });

    actionsDiv.appendChild(btnCopy);
    actionsDiv.appendChild(btnPin);
    actionsDiv.appendChild(btnEdit);

    article.appendChild(topDiv);
    article.appendChild(actionsDiv);
    return article;
  }

  function renderFrequentStrip() {
    const isDefaultUnfiltered =
      state.searchQuery.trim() === '' &&
      state.categoryFilter === 'all' &&
      state.letterFilter === 'ALL';

    const frequentWords = state.words.filter(function (w) { return Boolean(w.frequent); });

    if (!isDefaultUnfiltered || frequentWords.length === 0) {
      els.sectionSering.hidden = true;
      return;
    }

    els.sectionSering.hidden = false;
    els.badgeJumlahSering.textContent = frequentWords.length + ' kata';
    els.gridSering.innerHTML = '';

    frequentWords.forEach(function (entry, idx) {
      const num = '#' + String(idx + 1).padStart(3, '0');
      els.gridSering.appendChild(createWordCard(entry, num, true));
    });
  }

  function renderDictionaryIndex(filteredWords) {
    if (filteredWords.length === 0) {
      els.sectionIndeks.hidden = true;
      els.stateEmpty.hidden = false;

      const filterNotes = [];
      if (state.searchQuery.trim() !== '') {
        filterNotes.push('kata kunci "' + state.searchQuery.trim() + '"');
      }
      if (state.categoryFilter === 'frequent') {
        filterNotes.push('kelompok Sering Dipakai');
      } else if (state.categoryFilter === 'incomplete') {
        filterNotes.push('kelompok Perlu Arti');
      }
      if (state.letterFilter !== 'ALL') {
        filterNotes.push('awalan huruf ' + state.letterFilter);
      }

      els.judulEmpty.textContent = 'Tidak ditemukan kata untuk ' + (filterNotes.join(', ') || 'filter saat ini');
      els.pesanEmptyDetail.textContent =
        'Gunakan tombol Reset Pencarian & Filter untuk menampilkan kembali seluruh 33+ kata, atau tambahkan kata baru.';
      return;
    }

    els.stateEmpty.hidden = true;
    els.sectionIndeks.hidden = false;
    els.badgeJumlahTampil.textContent = filteredWords.length + ' kata ditampilkan';

    const sorted = filteredWords.slice().sort(function (a, b) {
      return a.word.localeCompare(b.word, 'id', { sensitivity: 'base' });
    });

    const groups = new Map();
    sorted.forEach(function (entry) {
      const letter = getFirstLetter(entry.word);
      if (!groups.has(letter)) {
        groups.set(letter, []);
      }
      groups.get(letter).push(entry);
    });

    els.wadahAbjad.innerHTML = '';
    let globalCounter = 1;

    Array.from(groups.keys()).sort().forEach(function (letter) {
      const items = groups.get(letter);
      const section = document.createElement('div');
      section.className = 'letter-section';

      const headingRow = document.createElement('div');
      headingRow.className = 'letter-heading-row';

      const crest = document.createElement('span');
      crest.className = 'letter-crest';
      crest.textContent = letter;

      const countSpan = document.createElement('span');
      countSpan.className = 'letter-count';
      countSpan.textContent = items.length + ' kata';

      headingRow.appendChild(crest);
      headingRow.appendChild(countSpan);

      const grid = document.createElement('div');
      grid.className = 'words-grid';

      items.forEach(function (entry) {
        const orderIndex = state.words.findIndex(function (w) { return w.id === entry.id; });
        const displayNum = '#' + String(orderIndex >= 0 ? orderIndex + 1 : globalCounter).padStart(3, '0');
        globalCounter += 1;
        grid.appendChild(createWordCard(entry, displayNum, false));
      });

      section.appendChild(headingRow);
      section.appendChild(grid);
      els.wadahAbjad.appendChild(section);
    });
  }

  function updateFilterControlsUI() {
    els.filterTabs.forEach(function (tab) {
      const active = tab.getAttribute('data-filter') === state.categoryFilter;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-pressed', String(active));
    });

    const hasActiveFilter =
      state.searchQuery.trim() !== '' ||
      state.categoryFilter !== 'all' ||
      state.letterFilter !== 'ALL';

    els.btnResetFilter.hidden = !hasActiveFilter;
    els.btnHapusCari.hidden = state.searchQuery.trim() === '';
  }

  function renderAll() {
    els.stateLoading.hidden = true;
    els.stateError.hidden = true;
    updateStatsAndCounters();
    updateFilterControlsUI();
    renderAlphabetBar();
    renderFrequentStrip();
    const filtered = getFilteredWords();
    renderDictionaryIndex(filtered);
  }

  function resetAllFilters() {
    state.searchQuery = '';
    state.categoryFilter = 'all';
    state.letterFilter = 'ALL';
    els.inputCari.value = '';
    renderAll();
  }

  function openModalForEntry(entry) {
    els.pesanValidasiForm.hidden = true;
    if (entry) {
      els.inputIdKata.value = entry.id;
      els.inputNamaKata.value = entry.word;
      els.inputArtiKata.value = isMeaningIncomplete(entry) ? '' : entry.meaning;
      els.inputSeringKata.checked = Boolean(entry.frequent);
    } else {
      els.inputIdKata.value = '';
      els.inputNamaKata.value = state.searchQuery.trim();
      els.inputArtiKata.value = '';
      els.inputSeringKata.checked = true;
    }

    els.pratinjauJson.textContent = JSON.stringify(state.words, null, 2);
    if (typeof els.modal.showModal === 'function') {
      els.modal.showModal();
    } else {
      els.modal.setAttribute('open', 'open');
    }
    els.inputNamaKata.focus();
  }

  function closeModal() {
    if (typeof els.modal.close === 'function' && els.modal.open) {
      els.modal.close();
    } else {
      els.modal.removeAttribute('open');
    }
  }

  async function loadWordsFromRepo() {
    els.stateLoading.hidden = false;
    els.stateError.hidden = true;
    els.stateEmpty.hidden = true;
    els.sectionSering.hidden = true;
    els.sectionIndeks.hidden = true;

    try {
      const response = await fetch('data/words.json', { cache: 'no-store' });
      if (!response.ok) {
        throw new Error('HTTP ' + response.status + ' saat memuat data/words.json');
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Format data/words.json bukan array JSON.');
      }

      state.repoWords = data.map(function (item, idx) {
        return {
          id: item.id || 'kata-' + String(idx + 1).padStart(3, '0'),
          word: String(item.word || '').trim(),
          meaning: String(item.meaning || '').trim(),
          frequent: Boolean(item.frequent)
        };
      });

      const localData = readLocalOverrides();
      state.words = localData && localData.length >= state.repoWords.length
        ? localData
        : state.repoWords.map(function (w) { return Object.assign({}, w); });

      renderAll();
    } catch (err) {
      els.stateLoading.hidden = true;
      els.stateError.hidden = false;
      els.pesanErrorDetail.textContent =
        'Penyebab: ' + (err && err.message ? err.message : 'Gagal membaca data/words.json') +
        '. Pilih "Gunakan Salinan Data Bawaan" jika Anda membuka file HTML langsung tanpa server lokal.';
    }
  }

  function bindEvents() {
    els.btnTema.addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });

    els.inputCari.addEventListener('input', function (e) {
      state.searchQuery = e.target.value;
      renderAll();
    });

    els.btnHapusCari.addEventListener('click', function () {
      state.searchQuery = '';
      els.inputCari.value = '';
      els.inputCari.focus();
      renderAll();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement !== els.inputCari && !els.modal.open) {
        const tag = document.activeElement ? document.activeElement.tagName : '';
        if (tag !== 'INPUT' && tag !== 'TEXTAREA') {
          e.preventDefault();
          els.inputCari.focus();
        }
      }
    });

    els.filterTabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        state.categoryFilter = tab.getAttribute('data-filter') || 'all';
        renderAll();
      });
    });

    els.btnResetFilter.addEventListener('click', resetAllFilters);
    els.btnEmptyReset.addEventListener('click', resetAllFilters);

    els.btnEmptyTambah.addEventListener('click', function () {
      openModalForEntry(null);
    });

    els.btnBukaModal.addEventListener('click', function () {
      openModalForEntry(null);
    });

    els.btnFooterJson.addEventListener('click', function () {
      openModalForEntry(null);
    });

    els.btnTutupModal.addEventListener('click', closeModal);

    els.btnCobaLagi.addEventListener('click', function () {
      loadWordsFromRepo();
    });

    els.btnPakaiCadangan.addEventListener('click', function () {
      state.repoWords = FALLBACK_WORDS.map(function (w) { return Object.assign({}, w); });
      const localData = readLocalOverrides();
      state.words = localData || state.repoWords.map(function (w) { return Object.assign({}, w); });
      renderAll();
      showToast('Salinan data bawaan (33 kata) berhasil dimuat.');
    });

    els.btnResetForm.addEventListener('click', function () {
      els.inputIdKata.value = '';
      els.inputNamaKata.value = '';
      els.inputArtiKata.value = '';
      els.inputSeringKata.checked = true;
      els.pesanValidasiForm.hidden = true;
      els.inputNamaKata.focus();
    });

    els.formKata.addEventListener('submit', function (e) {
      e.preventDefault();
      const wordVal = els.inputNamaKata.value.trim();
      const meaningVal = els.inputArtiKata.value.trim();
      const frequentVal = Boolean(els.inputSeringKata.checked);

      if (!wordVal || !meaningVal) {
        els.pesanValidasiForm.textContent = 'Mohon isi kolom Kata dan Arti Versi Atho terlebih dahulu.';
        els.pesanValidasiForm.hidden = false;
        return;
      }

      els.pesanValidasiForm.hidden = true;
      const existingId = els.inputIdKata.value.trim();

      if (existingId) {
        const idx = state.words.findIndex(function (w) { return w.id === existingId; });
        if (idx >= 0) {
          state.words[idx].word = wordVal;
          state.words[idx].meaning = meaningVal;
          state.words[idx].frequent = frequentVal;
        }
        showToast('Kata "' + wordVal + '" berhasil diperbarui.');
      } else {
        const existingByName = state.words.find(function (w) {
          return w.word.toLowerCase() === wordVal.toLowerCase();
        });
        if (existingByName) {
          existingByName.word = wordVal;
          existingByName.meaning = meaningVal;
          existingByName.frequent = frequentVal;
          showToast('Kata "' + wordVal + '" yang sudah ada berhasil diperbarui.');
        } else {
          const nextNum = state.words.length + 1;
          state.words.push({
            id: 'kata-' + String(nextNum).padStart(3, '0'),
            word: wordVal,
            meaning: meaningVal,
            frequent: frequentVal
          });
          showToast('Kata baru "' + wordVal + '" berhasil ditambahkan.');
        }
      }

      saveLocalOverrides(state.words);
      renderAll();
      els.inputIdKata.value = '';
      els.inputNamaKata.value = '';
      els.inputArtiKata.value = '';
    });

    els.btnSalinJson.addEventListener('click', function () {
      const jsonString = JSON.stringify(state.words, null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(jsonString).then(function () {
          showToast('Seluruh isi words.json berhasil disalin ke papan klip.');
        }).catch(function () {
          showToast('Gagal menyalin otomatis, silakan blok teks JSON di bawah.');
        });
      }
    });

    els.btnUnduhJson.addEventListener('click', function () {
      const jsonString = JSON.stringify(state.words, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'words.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('File words.json berhasil diunduh.');
    });

    els.btnHapusLokal.addEventListener('click', function () {
      try {
        localStorage.removeItem(STORAGE_KEY_WORDS);
      } catch (_) {
        // Ignore storage error.
      }
      state.words = state.repoWords.map(function (w) { return Object.assign({}, w); });
      renderAll();
      showToast('Data dikembalikan ke isi asli data/words.json di repositori.');
    });
  }

  initTheme();
  bindEvents();
  loadWordsFromRepo();
})();
