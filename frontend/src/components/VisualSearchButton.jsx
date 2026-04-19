import React, { useRef, useState, useEffect } from "react";
import { Camera, Loader2, X, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
const genAI = new GoogleGenerativeAI(apiKey);

export default function VisualSearchButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Helper function to convert the File object into the Base64 format Gemini needs
  const fileToGenerativePart = async (blobOrFile) => {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(blobOrFile);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: blobOrFile.type },
    };
  };

  const closeModal = () => {
    if (isScanning) return; // Prevent closing while scanning
    setIsModalOpen(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setImageUrl("");
  };

  // --- Drag and Drop Handlers ---
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  // --- Clipboard Paste Listener ---
  useEffect(() => {
    const handlePaste = (e) => {
      // Only capture paste events if the modal is open
      if (!isModalOpen) return;
      
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          handleFile(file);
          break; // Only grab the first image
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [isModalOpen]);

  // --- Search Execution ---
  const handleSearch = async () => {
    if ((!selectedFile && !imageUrl) || isScanning) return;

    setIsScanning(true);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Use 1.5 flash for images, 2.5 flash is text only currently
      
      // FIXED PROMPT: Instructs Gemini to generalize the result.
      const prompt = `
        Analyze this image and identify the primary electronics product. 
        Return ONLY the single, broad category name of the product. Do NOT include the brand, model, or any other details.
        For example: 
        - If the image is a 'Sony WH-1000XM6', return 'Headphone'. 
        - If it is an 'Apple iPhone 15 Pro Max', return 'Smartphone'. 
        - If it is a 'Samsung Galaxy Watch 6', return 'Watch'.
        - If it is a 'Dell XPS 15', return 'Laptop'.
        - If it is an 'iPad Pro', return 'Tablet'.
        - If no electronics are visible, output 'Unknown'.
        Return nothing but the single category word.
      `;

      let imagePart;

      // Handle either local file or URL
      if (selectedFile) {
        imagePart = await fileToGenerativePart(selectedFile);
      } else if (imageUrl) {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          imagePart = await fileToGenerativePart(blob);
        } catch (fetchError) {
          console.error("Failed to fetch image from URL", fetchError);
          alert("Could not load image from that URL. Please try downloading it and uploading the file instead.");
          setIsScanning(false);
          return;
        }
      }

      const result = await model.generateContent([prompt, imagePart]);
      let searchTerm = result.response.text().trim();
      
      // Clean up quotes if Gemini adds them
      searchTerm = searchTerm.replace(/['"]+/g, '');

      console.log("Gemini identified:", searchTerm);

      if (searchTerm !== 'Unknown' && searchTerm !== '') {
        closeModal();
        navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      } else {
        alert("We couldn't identify any electronics in that image. Try a clearer photo!");
      }

    } catch (error) {
      console.error("Gemini Visual Search failed:", error);
      alert("Failed to analyze image. Please try again.");
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <div className="relative flex items-center h-full group">
        <button
          type="button" 
          onClick={() => setIsModalOpen(true)}
          className="w-8 h-8 flex items-center justify-center rounded-full transition-all text-[#191c1d]/40 hover:bg-[#191c1d]/5 hover:text-[#191c1d]"
          title="Search by image"
        >
          <Camera size={16} />
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#191c1d]/40 backdrop-blur-sm p-4">
          <div 
            className="bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] w-full max-w-xl overflow-hidden font-sans animate-in fade-in zoom-in-95 duration-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#191c1d]/10">
              <div className="flex items-center gap-2 text-[#003d9b]">
                <Camera size={20} />
                <h3 className="font-bold text-lg tracking-tight">Search by Image</h3>
              </div>
              <button 
                type="button"
                onClick={closeModal}
                disabled={isScanning}
                className="p-2 text-[#191c1d]/40 hover:text-[#d32f2f] hover:bg-[#ffebee] rounded-full transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              {!previewUrl ? (
                <div
                  className={`relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl transition-all duration-200 ${
                    dragActive 
                      ? "border-[#003d9b] bg-[#003d9b]/5" 
                      : "border-[#191c1d]/15 bg-[#f8f9fa] hover:bg-[#f3f4f5]"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <ImageIcon size={48} className={`mb-4 ${dragActive ? 'text-[#003d9b]' : 'text-[#191c1d]/20'}`} />
                  <p className="text-[#191c1d] font-medium text-center">
                    Drag an image here, paste from clipboard, or{" "}
                    <button 
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="text-[#003d9b] font-semibold hover:underline"
                    >
                      upload a file
                    </button>
                  </p>
                  <p className="text-sm text-[#191c1d]/40 mt-2">Supports JPG, PNG, WEBP</p>
                </div>
              ) : (
                <div className="relative w-full h-64 bg-[#f8f9fa] rounded-xl border border-[#191c1d]/10 overflow-hidden flex items-center justify-center group">
                  <img src={previewUrl} alt="Preview" className="max-h-full max-w-full object-contain" />
                  {!isScanning && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        type="button"
                        onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                        className="bg-white text-[#d32f2f] px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors"
                      >
                        <X size={16} /> Remove Image
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-[#191c1d]/10" />
                </div>
                <div className="relative flex justify-center text-[11px] font-bold tracking-widest uppercase">
                  <span className="bg-white px-4 text-[#191c1d]/40">
                    Or
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Paste image link here"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  disabled={!!previewUrl || isScanning}
                  className="flex-1 h-12 px-4 bg-[#f3f4f5] border border-transparent focus:bg-white focus:border-[#003d9b]/30 focus:shadow-[0_0_0_4px_rgba(0,61,155,0.05)] rounded-lg transition-all text-[15px] text-[#191c1d] placeholder:text-[#191c1d]/40 outline-none disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={(!selectedFile && !imageUrl) || isScanning}
                  className="h-12 px-8 bg-[#003d9b] hover:bg-[#003d9b]/90 text-white font-medium text-[15px] rounded-lg shadow-[0_10px_20px_rgba(0,61,155,0.15)] transition-all disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px] flex justify-center items-center"
                >
                  {isScanning ? <Loader2 size={20} className="animate-spin" /> : "Search"}
                </button>
              </div>

            </div>
          </div>
          
          <div className="fixed inset-0 z-[-1]" onClick={closeModal} />
        </div>
      )}
    </>
  );
}