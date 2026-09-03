const KEYS = {
  checklists: 'firstbump_checklists',
  diary: 'firstbump_diary',
  agenda: 'firstbump_agenda',
  settings: 'firstbump_settings',
  contractions: 'firstbump_contractions',
  weights: 'firstbump_weights',
  favoriteNames: 'firstbump_favorite_names',
  customNames: 'firstbump_custom_names',
  birthPlan: 'firstbump_birth_plan',
  kickSessions: 'firstbump_kick_sessions',
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

  // ── Weight Tracking ──────────────────────────────────────────────────────────
  getWeights: () => {
    const items = getAll(KEYS.weights);
    return items.sort((a, b) => new Date(b.date) - new Date(a.date));
  },
  createWeight: (data) => {
    const items = getAll(KEYS.weights);
    const newItem = { ...data, id: generateId() };
    items.push(newItem);
    saveAll(KEYS.weights, items);
    return newItem;
  },
  deleteWeight: (id) => {
    const items = getAll(KEYS.weights).filter(i => i.id !== id);
    saveAll(KEYS.weights, items);
    return { ok: true };
  },

  // ── Baby Names Favorites & Custom Names ──────────────────────────────────────
  getFavoriteNames: () => {
    const items = getAll(KEYS.favoriteNames);
    return items.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  },
  toggleFavoriteName: (nameItem) => {
    const items = getAll(KEYS.favoriteNames);
    const existingIndex = items.findIndex((i) => i.name.toLowerCase() === nameItem.name.toLowerCase());
    if (existingIndex !== -1) {
      items.splice(existingIndex, 1);
      saveAll(KEYS.favoriteNames, items);
      return { favorited: false };
    } else {
      const newItem = {
        ...nameItem,
        id: nameItem.id || generateId(),
        rating: nameItem.rating || 5,
        notes: nameItem.notes || '',
        favoritedAt: new Date().toISOString(),
      };
      items.push(newItem);
      saveAll(KEYS.favoriteNames, items);
      return { favorited: true, item: newItem };
    }
  },
  updateFavoriteName: (nameStr, data) => {
    const items = getAll(KEYS.favoriteNames);
    const idx = items.findIndex((i) => i.name.toLowerCase() === nameStr.toLowerCase());
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...data };
      saveAll(KEYS.favoriteNames, items);
      return items[idx];
    }
    return null;
  },
  removeFavoriteName: (nameStr) => {
    const items = getAll(KEYS.favoriteNames).filter((i) => i.name.toLowerCase() !== nameStr.toLowerCase());
    saveAll(KEYS.favoriteNames, items);
    return { ok: true };
  },
  getCustomNames: () => {
    return getAll(KEYS.customNames);
  },
  createCustomName: (data) => {
    const items = getAll(KEYS.customNames);
    const newItem = { ...data, id: generateId(), isCustom: true };
    items.push(newItem);
    saveAll(KEYS.customNames, items);
    return newItem;
  },
  deleteCustomName: (id) => {
    const items = getAll(KEYS.customNames).filter((i) => i.id !== id);
    saveAll(KEYS.customNames, items);
    return { ok: true };
  },

  // ── Birth Plan (Plano de Parto) ──────────────────────────────────────────────
  getBirthPlan: () => {
    const data = localStorage.getItem(KEYS.birthPlan);
    return data ? JSON.parse(data) : null;
  },
  saveBirthPlan: (data) => {
    localStorage.setItem(KEYS.birthPlan, JSON.stringify(data));
    return data;
  },

  // ── Kick Counter (Contador de Chutes / Movimentos Fetais) ─────────────────────
  getKickSessions: () => {
    const items = getAll(KEYS.kickSessions);
    return items.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  },
  createKickSession: (data) => {
    const items = getAll(KEYS.kickSessions);
    const newItem = { ...data, id: generateId() };
    items.push(newItem);
    saveAll(KEYS.kickSessions, items);
    return newItem;
  },
  deleteKickSession: (id) => {
    const items = getAll(KEYS.kickSessions).filter((i) => i.id !== id);
    saveAll(KEYS.kickSessions, items);
    return { ok: true };
  },
  clearKickSessions: () => {
    saveAll(KEYS.kickSessions, []);
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
      weights: getAll(KEYS.weights),
      favoriteNames: getAll(KEYS.favoriteNames),
      customNames: getAll(KEYS.customNames),
      birthPlan: JSON.parse(localStorage.getItem(KEYS.birthPlan) || 'null'),
      kickSessions: getAll(KEYS.kickSessions),
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
          if (data.weights)       saveAll(KEYS.weights, data.weights);
          if (data.favoriteNames) saveAll(KEYS.favoriteNames, data.favoriteNames);
          if (data.customNames)   saveAll(KEYS.customNames, data.customNames);
          if (data.birthPlan)     localStorage.setItem(KEYS.birthPlan, JSON.stringify(data.birthPlan));
          if (data.kickSessions)  saveAll(KEYS.kickSessions, data.kickSessions);
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
