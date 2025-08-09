// import React, { useState } from 'react'
// import { uploadPDF } from '../../api/api'
// import Button from '../ui/Button'
// import AdobePdfViewer from '../ui/AdobePdfViewer'
// import Loader from '../common/Loader'

// const UploadSection = ({ onUploadSuccess, loading, setLoading }) => {
//   const [file, setFile] = useState(null)
//   const [pdfFile, setPdfFile] = useState(null)
//   const [persona, setPersona] = useState('business_analyst')
//   const [dragActive, setDragActive] = useState(false)
//   const [isUploaded, setIsUploaded] = useState(false)

//   const personas = [
//     { value: 'student', label: 'Student', description: 'Academic analysis and learning focus' },
//     { value: 'researcher', label: 'Researcher', description: 'Scientific and research methodology' },
//     { value: 'business_analyst', label: 'Business Analyst', description: 'Business intelligence and metrics' },
//     { value: 'legal_professional', label: 'Legal Professional', description: 'Legal document analysis' },
//     { value: 'financial_analyst', label: 'Financial Analyst', description: 'Financial data and reporting' },
//     { value: 'project_manager', label: 'Project Manager', description: 'Project planning and execution' },
//     { value: 'consultant', label: 'Consultant', description: 'Strategic analysis and recommendations' },
//     { value: 'educator', label: 'Educator', description: 'Educational content and curriculum' },
//     { value: 'technical_writer', label: 'Technical Writer', description: 'Technical documentation analysis' },
//     { value: 'executive', label: 'Executive', description: 'Strategic overview and decision making' }
//   ]

//   const handleDrag = (e) => {
//     e.preventDefault()
//     e.stopPropagation()
//     if (e.type === 'dragenter' || e.type === 'dragover') {
//       setDragActive(true)
//     } else if (e.type === 'dragleave') {
//       setDragActive(false)
//     }
//   }

//   const handleDrop = (e) => {
//     e.preventDefault()
//     e.stopPropagation()
//     setDragActive(false)

//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       const droppedFile = e.dataTransfer.files[0]
//       if (droppedFile.type === 'application/pdf') {
//         setFile(droppedFile)
//         setPdfFile(droppedFile)
//         setIsUploaded(false)
//       } else {
//         alert('Please upload a PDF file only')
//       }
//     }
//   }

//   const handleFileChange = (e) => {
//     if (e.target.files && e.target.files[0]) {
//       const selectedFile = e.target.files[0]
//       if (selectedFile.type === 'application/pdf') {
//         setFile(selectedFile)
//         setPdfFile(selectedFile)
//         setIsUploaded(false)
//       } else {
//         alert('Please upload a PDF file only')
//       }
//     }
//   }

//   const handleUpload = async () => {
//     if (!file) {
//       alert('Please select a PDF file first')
//       return
//     }

//     setLoading(true)
//     try {
//         console.log(file, persona)
//       const result = await uploadPDF(file, persona)
//       onUploadSuccess(result)
//       setIsUploaded(true)
//       console.log('Upload successful:', result)
//     } catch (error) {
//       console.error('Upload failed:', error)
//       alert('Upload failed: ' + (error.response?.data?.detail || error.message))
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <section id="upload" className="py-24 bg-gray-900">
//       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="text-center mb-16">
//           <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
//             Document <span className="text-red">Upload</span>
//           </h2>
//           <p className="text-xl text-gray-300 max-w-3xl mx-auto">
//             Upload your PDF document and select your professional role for comprehensive AI-powered analysis.
//           </p>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Upload Form */}
//           <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
//             <h3 className="text-2xl font-semibold text-white mb-6">Document Processing</h3>

//             {/* File Upload Area */}
//             <div
//               className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-all ${
//                 dragActive
//                   ? 'border-red-600 bg-red-600/10'
//                   : 'border-gray-600 hover:border-gray-500'
//               }`}
//               onDragEnter={handleDrag}
//               onDragLeave={handleDrag}
//               onDragOver={handleDrag}
//               onDrop={handleDrop}
//             >
//               <div className="space-y-4">
//                 <div className={`text-6xl ${file ? 'text-green-400' : 'text-gray-500'}`}>
//                   {file ? '✅' : '📄'}
//                 </div>
//                 <div>
//                   <p className="text-gray-300">
//                     {file ? `Selected: ${file.name}` : 'Drag and drop your PDF document here'}
//                   </p>
//                   <label className="cursor-pointer text-red-600 hover:text-red-500 font-medium">
//                     or browse files
//                     <input
//                       type="file"
//                       accept=".pdf"
//                       onChange={handleFileChange}
//                       className="hidden"
//                     />
//                   </label>
//                 </div>
//                 <p className="text-sm text-gray-500">PDF files only, maximum 10MB</p>
//               </div>
//             </div>

//             {/* Persona Selection */}
//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-300 mb-3">
//                 Professional Role Selection
//               </label>
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
//                 {personas.map((p) => (
//                   <div
//                     key={p.value}
//                     onClick={() => setPersona(p.value)}
//                     className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
//                       persona === p.value
//                         ? 'border-red-600 bg-red-600/10'
//                         : 'border-gray-600 hover:border-gray-500'
//                     }`}
//                   >
//                     <div className="font-medium text-sm text-white">{p.label}</div>
//                     <div className="text-xs text-gray-400">{p.description}</div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Processing Status */}
//             {file && (
//               <div className="mb-4 p-3 bg-gray-700 rounded-lg border border-gray-600">
//                 <div className="flex items-center justify-between">
//                   <div>
//                     <div className="text-sm text-white font-medium">Ready for Analysis</div>
//                     <div className="text-xs text-gray-400">File: {file.name} • Persona: {persona}</div>
//                   </div>
//                   <div className="text-2xl">
//                     {isUploaded ? '✅' : '⏳'}
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Upload Button */}
//             <Button
//               variant="primary"
//               size="lg"
//               onClick={handleUpload}
//               disabled={!file || loading}
//               className="w-full"
//             >
//               {loading ? <Loader /> : (
//                 <>
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
//                   </svg>
//                   <span>Process Document</span>
//                 </>
//               )}
//             </Button>
//           </div>

//           {/* Adobe PDF Viewer */}
//           <AdobePdfViewer pdfFile={pdfFile} isUploaded={isUploaded} />
//         </div>
//       </div>
//     </section>
//   )
// }

// export default UploadSection

import React, { useState } from "react";
import { uploadPDF, uploadMultiplePDFs } from "../../api/api";
import Button from "../ui/Button";
import AdobePdfViewer from "../ui/AdobePdfViewer";
import Loader from "../common/Loader";
// import SimplePdfViewer from "../ui/SimplePdfViewer";

const UploadSection = ({ onUploadSuccess, loading, setLoading }) => {
  const [files, setFiles] = useState([]);
  const [singleFile, setSingleFile] = useState(null);
  const [persona, setPersona] = useState("business_analyst");
  const [dragActive, setDragActive] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [uploadMode, setUploadMode] = useState("single");
  const [useAdobeViewer] = useState(true);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);

  // 🆕 Summaries state
  const [multiSummaries, setMultiSummaries] = useState([]);
  const [combinedSummary, setCombinedSummary] = useState("");
  const [singleSummary, setSingleSummary] = useState("");

  const personas = [
    { value: "student", label: "Student", description: "Academic analysis and learning focus" },
    { value: "researcher", label: "Researcher", description: "Scientific and research methodology" },
    { value: "business_analyst", label: "Business Analyst", description: "Business intelligence and metrics" },
    { value: "legal_professional", label: "Legal Professional", description: "Legal document analysis" },
    { value: "financial_analyst", label: "Financial Analyst", description: "Financial data and reporting" },
    { value: "project_manager", label: "Project Manager", description: "Project planning and execution" },
    { value: "consultant", label: "Consultant", description: "Strategic analysis and recommendations" },
    { value: "educator", label: "Educator", description: "Educational content and curriculum" },
    { value: "technical_writer", label: "Technical Writer", description: "Technical documentation analysis" },
    { value: "executive", label: "Executive", description: "Strategic overview and decision making" }
  ];

  const goPrev = () => {
    setCurrentFileIndex((prev) => (prev > 0 ? prev - 1 : files.length - 1));
  };

  const goNext = () => {
    setCurrentFileIndex((prev) => (prev < files.length - 1 ? prev + 1 : 0));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files) handleFileSelection(e.dataTransfer.files);
  };

  const handleFileChange = (e) => {
    if (e.target.files) handleFileSelection(e.target.files);
  };

  const handleFileSelection = (fileList) => {
    const pdfFiles = Array.from(fileList).filter((file) => file.type === "application/pdf");
    if (pdfFiles.length === 0) {
      alert("Please upload PDF files only");
      return;
    }

    if (uploadMode === "single") {
      if (pdfFiles.length > 1) return alert("Select only one PDF in single mode");
      setSingleFile(pdfFiles[0]);
      setFiles([]);
    } else {
      if (pdfFiles.length > 5) return alert("Maximum 5 files for multiple mode");
      setFiles(pdfFiles);
      setSingleFile(null);
    }
    setIsUploaded(false);
  };

  const handleUpload = async () => {
    if (uploadMode === "single" && !singleFile) return alert("Please select a PDF");
    if (uploadMode === "multiple" && files.length === 0) return alert("Please select PDF files");

    setLoading(true);
    try {
      let result;
      if (uploadMode === "single") {
        result = await uploadPDF(singleFile, persona);
        setSingleSummary(result.analysis?.summary || "");
      } else {
        result = await uploadMultiplePDFs(files, persona);
        setMultiSummaries(result.individual_results || []);
        setCombinedSummary(result.combined_summary || "");
      }
      onUploadSuccess?.(result);
      setIsUploaded(true);
    } catch (error) {
      alert("Upload failed: " + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <section id="upload" className="py-24 bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-6">
            Document <span className="text-red">Upload</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Upload your PDFs for AI analysis — single or multiple comparison mode.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT - Upload Form */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            {/* Mode Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">Upload Mode</label>
              <div className="flex space-x-4">
                <button
                  onClick={() => { setUploadMode("single"); setFiles([]); setSingleFile(null); }}
                  className={`px-4 py-2 rounded-lg text-sm ${uploadMode === "single" ? "bg-red-600 text-white" : "bg-gray-700 text-gray-300"}`}
                >📄 Single PDF</button>
                <button
                  onClick={() => { setUploadMode("multiple"); setFiles([]); setSingleFile(null); }}
                  className={`px-4 py-2 rounded-lg text-sm ${uploadMode === "multiple" ? "bg-red-600 text-white" : "bg-gray-700 text-gray-300"}`}
                >📚 Multiple PDFs</button>
              </div>
            </div>

            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 ${dragActive ? "border-red-600 bg-red-600/10" : "border-gray-600"}`}
              onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
            >
              <div className={`text-6xl ${ (uploadMode === "single" && singleFile) || (uploadMode==="multiple" && files.length>0) ? "text-green-400" : "text-gray-500"}`}>
                📄
              </div>
              <p className="text-gray-300">
                {uploadMode === "single"
                  ? singleFile ? `Selected: ${singleFile.name}` : "Drag & drop your PDF"
                  : files.length > 0 ? `Selected: ${files.length} files` : "Drag & drop PDFs (max 5)"}
              </p>
              <label className="cursor-pointer text-red-600 hover:text-red-500">
                or browse files
                <input type="file" accept=".pdf" multiple={uploadMode === "multiple"} onChange={handleFileChange} className="hidden" />
              </label>
            </div>

            {/* Files List - Multiple Mode */}
            {uploadMode === "multiple" && files.length > 0 && (
              <div className="mb-6 space-y-2 max-h-32 overflow-y-auto">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-gray-700 rounded p-2">
                    <span className="text-sm text-white truncate">{file.name}</span>
                    <button onClick={() => removeFile(idx)} className="text-red-400 hover:text-red-300 ml-2">✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* Persona Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3">Professional Role</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                {personas.map(p => (
                  <div key={p.value} onClick={() => setPersona(p.value)}
                    className={`cursor-pointer p-3 rounded-lg border-2 ${persona === p.value ? "border-red-600 bg-red-600/10" : "border-gray-600"}`}>
                    <div className="font-medium text-sm text-white">{p.label}</div>
                    <div className="text-xs text-gray-400">{p.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upload Button */}
            <Button variant="primary" size="lg" onClick={handleUpload}
              disabled={(uploadMode==="single" && !singleFile) || (uploadMode==="multiple" && files.length===0) || loading}
              className="w-full">
              {loading ? <Loader /> : uploadMode === "single" ? "Analyze Document" : `Compare & Rank ${files.length} Docs`}
            </Button>
          </div>

          {/* RIGHT - Viewer + Summaries */}
          {uploadMode === "single" ? (
            <div>
              {useAdobeViewer
                ? <AdobePdfViewer pdfFile={singleFile} isUploaded={isUploaded} />
                : <SimplePdfViewer pdfFile={singleFile} isUploaded={isUploaded} />}
              {isUploaded && singleSummary && (
                <div className="mt-4 bg-gray-700 p-4 rounded-lg">
                  <h4 className="text-white font-medium mb-2">📄 Summary</h4>
                  <p className="text-gray-300 whitespace-pre-line">{singleSummary}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              {files.length > 0 && (
                <>
                  {/* Navigation */}
                  <div className="flex items-center gap-4">
                    <button onClick={goPrev} className="p-2 bg-gray-700 rounded hover:bg-gray-600">⬅</button>
                    <div className="flex-1 min-h-[500px] bg-gray-900 rounded">
                      {useAdobeViewer
                        ? <AdobePdfViewer pdfFile={files[currentFileIndex]} isUploaded={isUploaded} />
                        : <SimplePdfViewer pdfFile={files[currentFileIndex]} isUploaded={isUploaded} />}
                    </div>
                    <button onClick={goNext} className="p-2 bg-gray-700 rounded hover:bg-gray-600">➡</button>
                  </div>

                  {/* File Counter */}
                  <div className="text-gray-400 text-sm mt-2 text-center">
                    File {currentFileIndex + 1} of {files.length}
                  </div>

                  {/* Individual Summary */}
                  {isUploaded && multiSummaries.length > 0 && (
                    <div className="mt-4 bg-gray-700 p-4 rounded-lg">
                      <h4 className="text-white font-medium mb-2">
                        📄 Summary — {multiSummaries[currentFileIndex]?.title || multiSummaries[currentFileIndex]?.filename}
                      </h4>
                      <p className="text-gray-300 whitespace-pre-line">
                        {multiSummaries[currentFileIndex]?.summary || "No summary available"}
                      </p>
                    </div>
                  )}

                  {/* Combined Summary */}
                  {isUploaded && combinedSummary && (
                    <div className="mt-4 bg-gray-800 p-4 rounded-lg border border-gray-600">
                      <h4 className="text-white font-medium mb-2">📝 Combined Summary</h4>
                      <p className="text-gray-300 whitespace-pre-line">{combinedSummary}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default UploadSection;

