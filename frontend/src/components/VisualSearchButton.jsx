// src/components/VisualSearchButton.jsx
import React, { useRef, useState } from "react";
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

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsScanning(true);

    try {
      // 1. Convert the image
      const imagePart = await fileToGenerativePart(file);

      // 2. Call Gemini 1.5 Flash (Fastest model for vision)
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      // THIS IS WHERE YOU PROMPT IT:
      const prompt = "Act as a precise product identification engine. Identify the specific brand and model of the electronic device in this image. RULES: 1. Output ONLY the model name (e.g., 'iPhone 15 Pro'). 2. If you are uncertain, output the most likely category and brand (e.g., 'Logitech Mouse'). 3. If no electronics are visible, output 'Unknown'. 4. Do not use bolding, markdown, or punctuation. 5. Do not talk to the user.";

      // 3. Wait for Google to analyze the image
      const result = await model.generateContent([prompt, imagePart]);
      const searchTerm = result.response.text().trim();

      console.log("Gemini identified:", searchTerm);

      // 4. Redirect to your existing backend search using the URL!
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

  return (
    <div className="relative flex items-center h-full">
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
        type="button" // Important so it doesn't submit the search form!
        onClick={() => fileInputRef.current?.click()}
        disabled={isScanning}
        className={`w-8 h-8 flex items-center justify-center rounded-full transition-all ${
          isScanning 
            ? "text-[#003d9b] cursor-wait" 
            : "text-[#191c1d]/40 hover:bg-[#191c1d]/5 hover:text-[#191c1d]"
        }`}
        title="Search by Photo"
      >
        {isScanning ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Camera size={16} />
        )}
      </button>
    </div>
  );
}