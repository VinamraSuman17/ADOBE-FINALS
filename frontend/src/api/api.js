// import axios from 'axios'

// const api = axios.create({
//   baseURL: ' http://127.0.0.1:8080',
//   timeout: 30000, // 30 second timeout
// })

// export const uploadPDF = async (file, persona) => {
//   console.log('Uploading:', file, persona)
  
//   const formData = new FormData()
//   formData.append('file', file)
//   formData.append('persona', persona)
  
// //   console.log('FormData created:', formData)
// console.log('File:', formData.get('file'))
// console.log('Persona:', formData.get('persona'))
  
//   try {
//     // ✅ NO Content-Type header needed for FormData
//     const response = await api.post('/upload/', formData)
//     console.log('Upload response:', response)
//     return response.data
//   } catch (error) {
//     console.error('Upload error:', error.response?.data || error.message)
//     throw error
//   }
// }

// export const healthCheck = async () => {
//   try {
//     const response = await api.get('/health/')
//     return response.data
//   } catch (error) {
//     console.error('Health check error:', error)
//     throw error
//   }
// }

// export default api



import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 180000, // Increased for multiple files
})

// Existing single file upload
export const uploadPDF = async (file, persona) => {
  // console.log(file, persona)
  const formData = new FormData()
  formData.append('file', file)
  formData.append('persona', persona)
  
  const response = await api.post('/upload/', formData)
  return response.data
}

// ✅ New multiple files upload
export const uploadMultiplePDFs = async (files, persona) => {
  console.log(`Uploading ${files.length} files with persona: ${persona}`)
  
  const formData = new FormData()
  
  // Append all files
  files.forEach((file, index) => {
    formData.append('files', file)
    console.log(`📄 Added file ${index + 1}: ${file.name}`)
  })
  
  // Append persona
  formData.append('persona', persona)
  
  // Debug FormData
  for (let [key, value] of formData.entries()) {
    console.log(`FormData: ${key}`, value)
  }
  
  try {
    const response = await api.post('/upload-multiple/', formData)
    console.log('✅ Multiple upload successful:', response.data)
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
