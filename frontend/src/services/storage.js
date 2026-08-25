const KEYS = {
  checklists: 'firstbump_checklists',
  diary: 'firstbump_diary',
  agenda: 'firstbump_agenda',
  settings: 'firstbump_settings',
  contractions: 'firstbump_contractions',
};

function generateId() {
  return Date.now() + Math.floor(Math.random() * 1000);
}

function getAll(key) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveAll(key, items) {
  localStorage.setItem(key, JSON.stringify(items));
}

export const storage = {
  // ── Checklists ──────────────────────────────────────────────────────────────
  getChecklists: (category = '') => {
    const items = getAll(KEYS.checklists);
    return category ? items.filter(i => i.category === category) : items;
  },
  createChecklistItem: (data) => {
    const items = getAll(KEYS.checklists);
    const newItem = { ...data, id: generateId() };
    items.push(newItem);
    saveAll(KEYS.checklists, items);
    return newItem;
  },
  updateChecklistItem: (id, data) => {
    const items = getAll(KEYS.checklists);
    const idx = items.findIndex(i => i.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...data };
      saveAll(KEYS.checklists, items);
      return items[idx];
    }
    return null;
  },
  deleteChecklistItem: (id) => {
    const items = getAll(KEYS.checklists).filter(i => i.id !== id);
    saveAll(KEYS.checklists, items);
    return { ok: true };
  },

  // ── Diary ────────────────────────────────────────────────────────────────────
  getDiaryEntries: () => {
    return getAll(KEYS.diary).sort((a, b) => b.date.localeCompare(a.date));
  },
  createDiaryEntry: (data) => {
    const entries = getAll(KEYS.diary);
    const newEntry = { ...data, id: generateId() };
    entries.push(newEntry);
    saveAll(KEYS.diary, entries);
    return newEntry;
  },
  deleteDiaryEntry: (id) => {
    const entries = getAll(KEYS.diary).filter(e => e.id !== id);
    saveAll(KEYS.diary, entries);
    return { ok: true };
  },

  // ── Agenda ───────────────────────────────────────────────────────────────────
  getAgendaEvents: () => {
    return getAll(KEYS.agenda).sort((a, b) => a.date.localeCompare(b.date));
  },
  createAgendaEvent: (data) => {
    const events = getAll(KEYS.agenda);
    const newEvent = { ...data, id: generateId() };
    events.push(newEvent);
    saveAll(KEYS.agenda, events);
    return newEvent;
  },
  deleteAgendaEvent: (id) => {
    const events = getAll(KEYS.agenda).filter(e => e.id !== id);
    saveAll(KEYS.agenda, events);
    return { ok: true };
  },

  // ── Contractions ─────────────────────────────────────────────────────────────
  getContractions: () => {
    const items = getAll(KEYS.contractions);
    return items.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  },
  createContraction: (data) => {
    const items = getAll(KEYS.contractions);
    const newItem = { ...data, id: generateId() };
    items.push(newItem);
    saveAll(KEYS.contractions, items);
    return newItem;
  },
  deleteContraction: (id) => {
    const items = getAll(KEYS.contractions).filter(i => i.id !== id);
    saveAll(KEYS.contractions, items);
    return { ok: true };
  },
  clearContractions: () => {
    saveAll(KEYS.contractions, []);
    return { ok: true };
  },

  // ── Settings ─────────────────────────────────────────────────────────────────
  getSetting: (key) => {
    const settings = JSON.parse(localStorage.getItem(KEYS.settings) || '{}');
    return settings[key] ? { key, value: settings[key] } : null;
  },
  setSetting: (key, value) => {
    const settings = JSON.parse(localStorage.getItem(KEYS.settings) || '{}');
    settings[key] = value;
    localStorage.setItem(KEYS.settings, JSON.stringify(settings));
    return { key, value };
  },

  // ── Export / Import ──────────────────────────────────────────────────────────
  exportData: () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      checklists: getAll(KEYS.checklists),
      diary: getAll(KEYS.diary),
      agenda: getAll(KEYS.agenda),
      contractions: getAll(KEYS.contractions),
      settings: JSON.parse(localStorage.getItem(KEYS.settings) || '{}'),
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `firstbump-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importData: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.checklists)    saveAll(KEYS.checklists, data.checklists);
          if (data.diary)         saveAll(KEYS.diary, data.diary);
          if (data.agenda)        saveAll(KEYS.agenda, data.agenda);
          if (data.contractions)  saveAll(KEYS.contractions, data.contractions);
          if (data.settings)      localStorage.setItem(KEYS.settings, JSON.stringify(data.settings));
          resolve(data);
        } catch (err) {
          reject(new Error('Arquivo inválido. Certifique-se de importar um backup do FirstBump.'));
        }
      };
      reader.readAsText(file);
    });
  },
};
