// import React, { useState, useEffect } from 'react'
// import Navbar from './components/ui/Navbar'
// import HeroSection from './components/sections/HeroSection'
// import AboutSection from './components/sections/AboutSection'
// import FeaturesSection from './components/sections/FeaturesSection'
// import UploadSection from './components/sections/UploadSection'
// import ResultsSection from './components/sections/ResultsSection'
// import PdfRedirectViewer from './components/pdf/PdfRedirectViewer'

// function App() {
//   const [uploadData, setUploadData] = useState(null)
//   const [loading, setLoading] = useState(false)
//   const [currentSection, setCurrentSection] = useState('home')

//   useEffect(() => {
//     const handleScroll = () => {
//       const sections = ['home', 'about', 'features', 'upload']
//       const scrollPosition = window.scrollY + 100

//       for (const section of sections) {
//         const element = document.getElementById(section)
//         if (element && scrollPosition >= element.offsetTop && scrollPosition < element.offsetTop + element.offsetHeight) {
//           setCurrentSection(section)
//           break
//         }
//       }
//     }

//     window.addEventListener('scroll', handleScroll)
//     return () => window.removeEventListener('scroll', handleScroll)
//   }, [])

//   const handleUploadSuccess = (data) => {
//     setUploadData(data)
//     setTimeout(() => {
//       document.getElementById('results')?.scrollIntoView({ 
//         behavior: 'smooth',
//         block: 'start'
//       })
//     }, 500)
//   }

//   return (
//     <div className="min-h-screen bg-black">
//       <Navbar currentSection={currentSection} />
      
//       <main className="relative">
//         <HeroSection />
//         <AboutSection />
//         <FeaturesSection />
//         <UploadSection 
//           onUploadSuccess={handleUploadSuccess}
//           loading={loading}
//           setLoading={setLoading}
//         />
        
//         {uploadData && (
//           <ResultsSection data={uploadData} />
//         )}
//       </main>
//     </div>
//   )
// }

// export default App

import React, { useState, useEffect } from 'react'
import Navbar from './components/ui/Navbar'
import HeroSection from './components/sections/HeroSection'
import AboutSection from './components/sections/AboutSection'
import FeaturesSection from './components/sections/FeaturesSection'
import UploadSection from './components/sections/UploadSection'
import ResultsSection from './components/sections/ResultsSection'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  const [uploadData, setUploadData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [currentSection, setCurrentSection] = useState('home')

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['home', 'about', 'features', 'upload']
      const scrollPosition = window.scrollY + 100

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element && scrollPosition >= element.offsetTop && scrollPosition < element.offsetTop + element.offsetHeight) {
          setCurrentSection(section)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleUploadSuccess = (data) => {
    setUploadData(data)
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 500)
  }

  return (
    <div className="App">
      <Navbar currentSection={currentSection} />
      <main>
        <HeroSection />
        <AboutSection />
        <FeaturesSection />
        <UploadSection
          onUploadSuccess={handleUploadSuccess}
          loading={loading}
          setLoading={setLoading}
        />
        {uploadData && (
          <ResultsSection
            uploadData={uploadData}
            onWorkflowComplete={() => setUploadData(null)}
          />
        )}
      </main>

      {/* Global Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  )
}

export default App
