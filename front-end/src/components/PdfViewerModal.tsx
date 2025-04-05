import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaTimes, FaExclamationCircle } from 'react-icons/fa';

interface PdfViewerModalProps {
  pdfUrl: string;
  fileName: string;
  onClose: () => void;
}

const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ pdfUrl, fileName, onClose }) => {
  // Add loading and error states for better user experience
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Prevent clicks within the iframe from closing the modal
  const handleContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  
  const handleIframeLoad = () => {
    setLoading(false);
  };
  
  const handleIframeError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={handleContentClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-primary-dark truncate">
            {fileName}
          </h3>
          <button
            className="p-1 rounded-full hover:bg-gray-200 text-gray-600"
            onClick={onClose}
          >
            <FaTimes size={20} />
          </button>
        </div>
        
        {/* PDF Viewer */}
        <div className="flex-1 w-full relative">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              <span className="ml-3 text-primary-dark">Loading PDF...</span>
            </div>
          )}
          
          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
              <FaExclamationCircle className="text-warning-yellow text-4xl mb-2" />
              <p className="text-gray-700">Failed to load PDF. Please try again later.</p>
            </div>
          )}
          
          <iframe
            src={pdfUrl}
            title={`PDF Viewer - ${fileName}`}
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PdfViewerModal;
