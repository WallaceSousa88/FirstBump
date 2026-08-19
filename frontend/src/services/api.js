const API_URL = 'http://localhost:8000';

export const api = {
  // Checklists
  getChecklists: async (category = '') => {
    const url = category ? `${API_URL}/checklists/?category=${category}` : `${API_URL}/checklists/`;
    const res = await fetch(url);
    return res.json();
  },
  createChecklistItem: async (data) => {
    const res = await fetch(`${API_URL}/checklists/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  updateChecklistItem: async (id, data) => {
    const res = await fetch(`${API_URL}/checklists/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteChecklistItem: async (id) => {
    const res = await fetch(`${API_URL}/checklists/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Diary
  getDiaryEntries: async () => {
    const res = await fetch(`${API_URL}/diary/`);
    return res.json();
  },
  createDiaryEntry: async (data) => {
    const res = await fetch(`${API_URL}/diary/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteDiaryEntry: async (id) => {
    const res = await fetch(`${API_URL}/diary/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Agenda
  getAgendaEvents: async () => {
    const res = await fetch(`${API_URL}/agenda/`);
    return res.json();
  },
  createAgendaEvent: async (data) => {
    const res = await fetch(`${API_URL}/agenda/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },
  deleteAgendaEvent: async (id) => {
    const res = await fetch(`${API_URL}/agenda/${id}`, { method: 'DELETE' });
    return res.json();
  },

  // Settings
  getSetting: async (key) => {
    const res = await fetch(`${API_URL}/settings/${key}`);
    if (!res.ok) return null;
    return res.json();
  },
  setSetting: async (key, value) => {
    const res = await fetch(`${API_URL}/settings/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value })
    });
    return res.json();
  }
};
