// src/components/VisualSearchButton.jsx
import React, { useRef, useState, useEffect } from "react";
import { Camera, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini
const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 
const genAI = new GoogleGenerativeAI(apiKey);

export default function VisualSearchButton() {
  const fileInputRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const navigate = useNavigate();

  // Helper function to convert the File object into the Base64 format Gemini needs
  const fileToGenerativePart = async (file) => {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  };

  // 1. EXTRACTED LOGIC: Now a reusable function for both file selection and pasting
  const processImage = async (file) => {
    if (!file || isScanning) return;

    setIsScanning(true);

    try {
      // Convert the image
      const imagePart = await fileToGenerativePart(file);

      // Call Gemini 1.5 Flash (Fastest model for vision)
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = "Act as a precise product identification engine. Identify the specific brand and model of the electronic device in this image. RULES: 1. Output ONLY the model name (e.g., 'iPhone 15 Pro'). 2. If you are uncertain, output the most likely category and brand (e.g., 'Logitech Mouse'). 3. If no electronics are visible, output 'Unknown'. 4. Do not use bolding, markdown, or punctuation. 5. Do not talk to the user.";

      // Wait for Google to analyze the image
      const result = await model.generateContent([prompt, imagePart]);
      const searchTerm = result.response.text().trim();

      console.log("Gemini identified:", searchTerm);

      // Redirect to your existing backend search using the URL!
      if (searchTerm !== 'Unknown' && searchTerm !== '') {
        navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
      } else {
        alert("We couldn't identify any electronics in that image. Try a clearer photo!");
      }

    } catch (error) {
      console.error("Gemini Visual Search failed:", error);
      alert("Failed to analyze image. Please try again.");
    } finally {
      setIsScanning(false);
      // Reset the hidden input so they can take another picture if they want
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // 2. FILE INPUT HANDLER: Triggers when they click the camera icon and select a file
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      processImage(file);
    }
  };

  // 3. GLOBAL PASTE LISTENER: Intercepts Ctrl+V / Cmd+V
  useEffect(() => {
    const handlePaste = (event) => {
      // Check if there is clipboard data
      const items = event.clipboardData?.items;
      if (!items) return;

      // Loop through clipboard items to find an image
      let imageFile = null;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          imageFile = items[i].getAsFile();
          break;
        }
      }

      // If an image was pasted, process it!
      if (imageFile) {
        event.preventDefault(); // Stop the image from pasting into the text input
        processImage(imageFile);
      }
    };

    // Attach the listener to the whole document
    document.addEventListener("paste", handlePaste);

    // Cleanup the listener when the component unmounts
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [isScanning, navigate]); // Added dependencies to ensure state is fresh

  return (
    <div className="relative flex items-center h-full group">
      {/* The Hidden HTML5 File/Camera Input */}
      <input
        type="file"
        accept="image/*"
        capture="environment" // Opens rear camera on mobile
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* The Camera Icon Button */}
      <button
        type="button" 
        onClick={() => fileInputRef.current?.click()}
        disabled={isScanning}
        className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${
          isScanning 
            ? "text-[#003d9b] cursor-wait" 
            : "text-[#191c1d]/40 hover:bg-[#191c1d]/5 hover:text-[#191c1d]"
        }`}
        title="Click to upload, or press Ctrl+V to paste an image!"
      >
        {isScanning ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Camera size={16} />
        )}
      </button>
      
      {/* Optional: Tiny tooltip on hover to educate users they can paste */}
      <div className="absolute top-10 right-0 w-32 bg-gray-800 text-white text-[10px] text-center py-1 px-2 rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-50">
        Click to upload or <br/> <b>Ctrl+V</b> to paste
      </div>
    </div>
  );
}