import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  listPdfFiles, 
  processBillsFolder, 
  uploadBillPdf, 
  getClients,
  getPdfViewUrl,
  resetAllBills
} from '../services/api';
import PdfViewerModal from '../components/PdfViewerModal';
import { Client } from '../types';
import { FaCloudUploadAlt, FaFileAlt, FaCog, FaFolder, FaEye, FaTrashAlt, FaExclamationTriangle } from 'react-icons/fa';

const AdminPanel: React.FC = () => {
  const [pdfFiles, setPdfFiles] = useState<{ installation: string, files: string[] }[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [viewingPdf, setViewingPdf] = useState<{ url: string, fileName: string } | null>(null);
  const [resetting, setResetting] = useState(false);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPdfFiles = async () => {
    try {
      setLoading(true);
      const files = await listPdfFiles();
      if (Array.isArray(files)) {
        setPdfFiles(files);
      } else {
        setPdfFiles([]);
        setStatusMessage({ text: 'Invalid data format from server.', isError: true });
      }
    } catch (error) {
      setPdfFiles([]);
      setStatusMessage({ text: 'Failed to load PDF files.', isError: true });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientsData = await getClients();
        setClients(clientsData);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    fetchPdfFiles();
    fetchData();
  }, []);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList).filter(file => file.type === 'application/pdf');
    if (newFiles.length === 0) {
      setStatusMessage({ text: 'Please select valid PDF files.', isError: true });
      return;
    }
    setSelectedFiles(prev => [...prev, ...newFiles]);
    setStatusMessage(null);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClient(e.target.value);
  };

  const handleClickDropZone = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setStatusMessage({ text: 'Please select at least one file to upload.', isError: true });
      return;
    }
    if (!selectedClient) {
      setStatusMessage({ text: 'Please select a client.', isError: true });
      return;
    }
    try {
      setUploading(true);
      setStatusMessage(null);
      for (const file of selectedFiles) {
        await uploadBillPdf(file);
      }
      setStatusMessage({ text: `${selectedFiles.length} file(s) uploaded successfully.`, isError: false });
      setSelectedFiles([]);
      fetchPdfFiles();
    } catch (error) {
      setStatusMessage({ text: 'Failed to upload files.', isError: true });
    } finally {
      setUploading(false);
    }
  };

  const handleProcessFolder = async () => {
    try {
      setProcessing(true);
      setStatusMessage(null);
      await processBillsFolder();
      setStatusMessage({ text: 'Folder processed successfully.', isError: false });
      fetchPdfFiles();
    } catch (error) {
      setStatusMessage({ text: 'Failed to process folder.', isError: true });
    } finally {
      setProcessing(false);
    }
  };

  const handleViewPdf = (installation: string, fileName: string) => {
    // Use just the filename for the new endpoint
    const pdfUrl = getPdfViewUrl(installation, fileName);
    setViewingPdf({ url: pdfUrl, fileName });
  };

  const handleResetBills = async () => {
    try {
      setResetting(true);
      setStatusMessage(null);
      const result = await resetAllBills();
      setStatusMessage({ 
        text: `${result.message} ${result.deletedCount} bills were deleted.`, 
        isError: false 
      });
      setShowConfirmReset(false);
    } catch (error) {
      setStatusMessage({ text: 'Failed to reset bills. Please try again.', isError: true });
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.h1 
        className="text-2xl font-bold text-primary-dark"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Admin Panel
      </motion.h1>

      {/* Upload Bill PDF Section */}
      <motion.div 
        className="bg-white rounded-lg shadow-md p-4 md:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex items-center mb-4">
          <FaCloudUploadAlt className="text-primary mr-2 text-xl" />
          <h2 className="text-xl font-semibold text-primary-dark">Upload Bill PDF</h2>
        </div>
        
        <div className="mb-4">
          <label htmlFor="client-select" className="block text-sm font-medium text-primary-dark mb-1">
            Select Client
          </label>
          <select
            id="client-select"
            value={selectedClient}
            onChange={handleClientChange}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          >
            <option value="">-- Select a client --</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name} (#{client.clientNumber})
              </option>
            ))}
          </select>
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-primary bg-green-50' : 'border-gray-300 hover:border-primary-light'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClickDropZone}
        >
          <div className="text-5xl text-center text-primary-light mb-2">
            <FaFileAlt className="inline-block" />
          </div>
          <p className="text-gray-600">
            {isDragActive ? 'Drop PDF files here...' : 'Drag and drop PDF files here, or click to select files'}
          </p>
        </div>

        <input
          ref={fileInputRef}
          id="file-upload"
          type="file"
          accept=".pdf"
          multiple
          onChange={handleFileInputChange}
          className="hidden"
        />

        {selectedFiles.length > 0 && (
          <div className="mt-4">
            <h3 className="text-sm font-medium text-primary-dark mb-2">
              Selected Files ({selectedFiles.length})
            </h3>
            <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-48 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <li key={index} className="flex justify-between items-center p-2 hover:bg-gray-50">
                  <span className="text-sm text-gray-700 truncate flex-1">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="ml-2 text-error-red hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4">
          <motion.button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || !selectedClient || uploading}
            className={`flex items-center px-4 py-2 rounded-md shadow-sm text-white font-medium ${
              uploading || selectedFiles.length === 0 || !selectedClient 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary hover:bg-primary-dark'
            }`}
            whileHover={selectedFiles.length > 0 && !!selectedClient && !uploading ? { scale: 1.03 } : {}}
            whileTap={selectedFiles.length > 0 && !!selectedClient && !uploading ? { scale: 0.98 } : {}}
          >
            {uploading ? (
              <>
                <span className="mr-2">Uploading...</span>
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
              </>
            ) : (
              <>
                <FaCloudUploadAlt className="mr-2" />
                Upload {selectedFiles.length > 0 ? `(${selectedFiles.length} files)` : ''}
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* Process PDF Folder Section */}
      <motion.div 
        className="bg-white rounded-lg shadow-md p-4 md:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="flex items-center mb-4">
          <FaCog className="text-primary mr-2 text-xl" />
          <h2 className="text-xl font-semibold text-primary-dark">Process PDF Folder</h2>
        </div>
        
        <motion.button
          onClick={handleProcessFolder}
          disabled={processing}
          className={`flex items-center px-4 py-2 rounded-md shadow-sm text-white font-medium ${
            processing ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'
          }`}
          whileHover={!processing ? { scale: 1.03 } : {}}
          whileTap={!processing ? { scale: 0.98 } : {}}
        >
          {processing ? (
            <>
              <span className="mr-2">Processing...</span>
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            </>
          ) : (
            <>
              <FaFolder className="mr-2" />
              Process All PDFs in Folder
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Available PDF Files Section */}
      <motion.div 
        className="bg-white rounded-lg shadow-md p-4 md:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <FaFileAlt className="text-primary mr-2 text-xl" />
            <h2 className="text-xl font-semibold text-primary-dark">Available PDF Files</h2>
          </div>
          {loading && (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
          )}
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-primary-dark">Loading files...</span>
          </div>
        ) : pdfFiles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No PDF files available.</div>
        ) : (
          <div>
            {pdfFiles.map((installationData, index) => (
              <div key={index} className="mb-4">
                <h4 className="font-semibold text-primary-dark mb-2">Installation: {installationData.installation}</h4>
                <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-64 overflow-y-auto">
                  {installationData.files.map((file, fileIndex) => (
                    <li key={fileIndex} className="p-3 text-sm text-gray-700 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center flex-1 truncate">
                          <FaFileAlt className="text-primary-light mr-2 flex-shrink-0" />
                          <span className="truncate">{file}</span>
                        </div>
                        <button 
                          onClick={() => handleViewPdf(installationData.installation, file)}
                          className="ml-2 text-primary hover:text-primary-dark flex items-center"
                          title="View PDF"
                        >
                          <FaEye className="mr-1" />
                          <span>View</span>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Reset All Bills Section */}
      <motion.div 
        className="bg-white rounded-lg shadow-md p-4 md:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <div className="flex items-center mb-4">
          <FaTrashAlt className="text-error-red mr-2 text-xl" />
          <h2 className="text-xl font-semibold text-primary-dark">Reset Database</h2>
        </div>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            This action will delete all bills from the database. This cannot be undone.
          </p>
          
          {!showConfirmReset ? (
            <motion.button
              onClick={() => setShowConfirmReset(true)}
              disabled={resetting}
              className="flex items-center px-4 py-2 rounded-md shadow-sm text-white font-medium bg-error-red hover:bg-red-600"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaTrashAlt className="mr-2" />
              Reset All Bills
            </motion.button>
          ) : (
            <motion.div 
              className="bg-red-50 border border-error-red p-4 rounded-md"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="flex items-center text-error-red mb-2">
                <FaExclamationTriangle className="mr-2" />
                <h3 className="font-bold">Warning: This action cannot be undone</h3>
              </div>
              <p className="mb-4 text-gray-700">Are you sure you want to delete all bills?</p>
              <div className="flex justify-end space-x-3">
                <motion.button
                  type="button"
                  onClick={() => setShowConfirmReset(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={resetting}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="button"
                  onClick={handleResetBills}
                  className="flex items-center px-4 py-2 bg-error-red border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={resetting}
                >
                  {resetting ? (
                    <>
                      <span>Deleting...</span>
                      <span className="ml-2 inline-block h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></span>
                    </>
                  ) : (
                    <>
                      <FaTrashAlt className="mr-2" />
                      Yes, Delete All Bills
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Status Message */}
      {statusMessage && (
        <motion.div
          className={`p-4 rounded-lg ${
            statusMessage.isError ? 'bg-red-50 text-error-red' : 'bg-green-50 text-accent'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {statusMessage.text}
        </motion.div>
      )}

      {/* PDF Viewer Modal */}
      <AnimatePresence>
        {viewingPdf && (
          <PdfViewerModal
            pdfUrl={viewingPdf.url}
            fileName={viewingPdf.fileName}
            onClose={() => setViewingPdf(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminPanel;
