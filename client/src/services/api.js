const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Universal fetch wrapper for API communication
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('careertrack_token');

  const isFormData = options.body instanceof FormData;
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // If downloading a file (e.g. CSV)
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('text/csv')) {
      if (!res.ok) throw new Error('Failed to download CSV');
      return await res.text();
    }

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      let errorMsg = data.message;
      if (!errorMsg) {
        if (res.status === 500) {
          errorMsg = 'Backend server error (500). Please check if the backend server is running on port 5000.';
        } else if (res.status === 503) {
          errorMsg = 'Backend server is unreachable on port 5000. Please ensure the backend server is running with `npm run dev:server` or `npm run dev`.';
        } else {
          errorMsg = `Request failed with status ${res.status}`;
        }
      }
      const error = new Error(errorMsg);
      error.status = res.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  // Auth
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  getMe: () => request('/auth/me', { method: 'GET' }),
  updatePassword: (payload) => request('/auth/password', { method: 'PUT', body: payload }),

  // Profile
  getProfile: () => request('/profile', { method: 'GET' }),
  updateProfile: (payload) => request('/profile', { method: 'PUT', body: payload }),
  addSkill: (skill) => request('/profile/skills', { method: 'POST', body: { skill } }),
  removeSkill: (skillName) => request(`/profile/skills/${encodeURIComponent(skillName)}`, { method: 'DELETE' }),

  // Applications
  getApplications: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/applications${query ? `?${query}` : ''}`, { method: 'GET' });
  },
  getApplicationById: (id) => request(`/applications/${id}`, { method: 'GET' }),
  createApplication: (payload) => request('/applications', { method: 'POST', body: payload }),
  updateApplication: (id, payload) => request(`/applications/${id}`, { method: 'PUT', body: payload }),
  deleteApplication: (id) => request(`/applications/${id}`, { method: 'DELETE' }),
  extractSkills: (text) => request('/applications/extract-skills', { method: 'POST', body: { text } }),
  exportApplicationsCSV: () => request('/applications/export/csv', { method: 'GET' }),

  // Interviews
  getInterviews: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/interviews${query ? `?${query}` : ''}`, { method: 'GET' });
  },
  getInterviewById: (id) => request(`/interviews/${id}`, { method: 'GET' }),
  createInterview: (payload) => request('/interviews', { method: 'POST', body: payload }),
  updateInterview: (id, payload) => request(`/interviews/${id}`, { method: 'PUT', body: payload }),
  deleteInterview: (id) => request(`/interviews/${id}`, { method: 'DELETE' }),

  // Resumes
  getResumes: () => request('/resumes', { method: 'GET' }),
  getResumeById: (id) => request(`/resumes/${id}`, { method: 'GET' }),
  createResume: (payload) => request('/resumes', { method: 'POST', body: payload }),
  updateResume: (id, payload) => request(`/resumes/${id}`, { method: 'PUT', body: payload }),
  deleteResume: (id) => request(`/resumes/${id}`, { method: 'DELETE' }),
  parseResumeFile: (formData) =>
    request('/resumes/parse', {
      method: 'POST',
      body: formData,
    }),
  importResumeFile: (formData) =>
    request('/resumes/import', {
      method: 'POST',
      body: formData,
    }),

  // Reminders
  getReminders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/reminders${query ? `?${query}` : ''}`, { method: 'GET' });
  },
  createReminder: (payload) => request('/reminders', { method: 'POST', body: payload }),
  updateReminder: (id, payload) => request(`/reminders/${id}`, { method: 'PUT', body: payload }),
  toggleReminder: (id) => request(`/reminders/${id}/toggle`, { method: 'PATCH' }),
  deleteReminder: (id) => request(`/reminders/${id}`, { method: 'DELETE' }),

  // Dashboard & Analytics
  getDashboard: () => request('/analytics/dashboard', { method: 'GET' }),

  // Learning Progress & Skill Gaps
  getLearning: () => request('/learning', { method: 'GET' }),
  updateLearningStatus: (skillName, payload) =>
    request(`/learning/${encodeURIComponent(skillName)}`, { method: 'PUT', body: payload }),
};

export default api;
