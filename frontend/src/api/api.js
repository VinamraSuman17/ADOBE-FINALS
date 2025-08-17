import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 180000, // Increased for multiple files
})

// Existing single file upload
export const uploadPDF = async (file, persona) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('persona', persona)
  
  const response = await api.post('/upload/', formData)
  return response.data
}

// ✅ New multiple files upload
export const uploadMultiplePDFs = async (files, persona) => {
  
  const formData = new FormData()
  
  // Append all files
  files.forEach((file, index) => {
    formData.append('files', file)
  })
  
  // Append persona
  formData.append('persona', persona)
  
  // Debug FormData
  for (let [key, value] of formData.entries()) {
  }
  
  try {
    const response = await api.post('/upload-multiple/', formData)
    return response.data
  } catch (error) {
    console.error('❌ Multiple upload failed:', error)
    throw error
  }
}

export const healthCheck = async () => {
  const response = await api.get('/health/')
  return response.data
}

export default api


// Add this to your frontend/src/api/api.js file

// ✅ Generate Podcast API call
export const generatePodcast = async (analysisData, selectedText, sessionId) => {
  const formData = new FormData();
  formData.append('analysis_data', JSON.stringify(analysisData));
  formData.append('selected_text', selectedText);
  formData.append('session_id', sessionId);
  formData.append('voice_config', JSON.stringify({
    speaker1: "en-US-JennyNeural",
    speaker2: "en-US-GuyNeural"
  }));

  const response = await api.post('/generate-podcast/', formData);
  return response.data;
};

// ✅ Get Session Podcasts
export const getSessionPodcasts = async (sessionId) => {
  const response = await api.get(`/session/${sessionId}/podcasts/`);
  return response.data;
};

// ✅ Stream Audio File
export const getAudioUrl = (filename) => {
  return `${api.defaults.baseURL}/audio/${filename}`;
};
