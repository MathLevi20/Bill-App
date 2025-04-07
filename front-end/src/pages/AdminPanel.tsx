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
import { Client } from '../types/index';
import { FaCloudUploadAlt, FaFileAlt, FaCog, FaFolder, FaEye, FaTrashAlt, FaExclamationTriangle } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';

const AdminPanel: React.FC = () => {
  const { translate } = useLanguage();
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
      setStatusMessage({ text: translate('min_files_error'), isError: true });
      return;
    }
    if (!selectedClient) {
      setStatusMessage({ text: translate('select_client_error'), isError: true });
      return;
    }
    try {
      setUploading(true);
      setStatusMessage(null);
      for (const file of selectedFiles) {
        await uploadBillPdf(file);
      }
      setStatusMessage({ 
        text: `${selectedFiles.length} ${translate('upload_success')}`, 
        isError: false 
      });
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

  const handleViewPdf = ( fileName: string) => {
    // Use just the filename for the new endpoint
    const pdfUrl = getPdfViewUrl( fileName);
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

  // Add custom styles
  const sectionStyles = `
    bg-white dark:bg-gray-800 
    rounded-lg shadow-md 
    p-6 
    border-t-4 border-primary
    transition-all duration-200
    hover:shadow-lg
  `;

  const titleStyles = `
    text-xl font-semibold 
    text-primary-dark dark:text-gray-200 
    flex items-center
    mb-2
  `;

  const descriptionStyles = `
    text-sm text-gray-600 dark:text-gray-400 
    mb-6
  `;

  const buttonBaseStyles = `
    px-4 py-2 
    rounded-md 
    font-medium 
    transition-all duration-200 
    flex items-center 
    justify-center
    disabled:opacity-50 
    disabled:cursor-not-allowed
  `;

  const primaryButtonStyles = `
    ${buttonBaseStyles}
    bg-primary hover:bg-primary-dark 
    text-white
    shadow-sm hover:shadow-md
  `;

  const dangerButtonStyles = `
    ${buttonBaseStyles}
    bg-error-red hover:bg-red-600 
    text-white
    shadow-sm hover:shadow-md
  `;

  return (
    <div className="space-y-6">
      <motion.h1 
        className="text-2xl font-bold text-primary-dark dark:text-gray-200"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {translate('admin_panel')}
      </motion.h1>

      {/* Upload Section */}
      <motion.section className={sectionStyles}>
        <h2 className={titleStyles}>
          <FaCloudUploadAlt className="mr-2" />
          {translate('upload_section')}
        </h2>
        <p className={descriptionStyles}>{translate('upload_section_desc')}</p>

        {/* Client Selection with improved styles */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {translate('select_client')}
          </label>
          <div className="relative">
            <select
              value={selectedClient}
              onChange={handleClientChange}
              className="
                w-full
                appearance-none
                bg-white dark:bg-gray-700
                border border-gray-300 dark:border-gray-600
                rounded-lg
                py-2 px-4
                pr-10
                text-gray-700 dark:text-gray-200
                leading-tight
                focus:outline-none focus:ring-2 focus:ring-primary
                cursor-pointer
              "
            >
              <option value="">{translate('select_client_placeholder')}</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.name} (#{client.clientNumber})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Drag and drop zone with improved styles */}
        <div
          className={`
            border-2 border-dashed 
            rounded-lg p-8
            text-center cursor-pointer
            transition-all duration-200
            ${isDragActive 
              ? 'border-primary bg-primary bg-opacity-5' 
              : 'border-gray-300 dark:border-gray-600 hover:border-primary-light'
            }
          `}
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
            {isDragActive ? translate('drop_files_here') : translate('drag_drop_files')}
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

        {/* Selected files list with improved styles */}
        {selectedFiles.length > 0 && (
          <div className="mt-6 ">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {selectedFiles.length} {translate('selected_files_count')}
            </h3>
            <ul className="
              border border-gray-200 dark:border-gray-700 
              rounded-lg 
              divide-y divide-gray-200 dark:divide-gray-700
              max-h-48 overflow-y-auto
              bg-white dark:bg-gray-800 
            ">
              {selectedFiles.map((file, index) => (
                <li key={index} className="flex justify-between items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <span className="text-sm text-gray-700 dark:text-gray-200 truncate flex-1">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(index)}
                    className="ml-2 text-error-red hover:text-red-700 text-sm"
                  >
                    {translate('remove')}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Upload button */}
        <div className='mt-5'>
        <motion.button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || !selectedClient || uploading}
          className={primaryButtonStyles}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {uploading ? (
            <>
              <span className="mr-2">{translate('uploading')}</span>
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            </>
          ) : (
            <> 
              <FaCloudUploadAlt className="mr-2" />
              {translate('upload_files')} {selectedFiles.length > 0 ? `(${selectedFiles.length})` : ''}
              </>
          )}
          </motion.button>
        </div>
      </motion.section>

      {/* Process PDF Folder Section */}
      <motion.section className={sectionStyles}>
        <h2 className={titleStyles}>
          <FaCog className="mr-2" />
          {translate('process_pdf_folder')}
        </h2>
        <p className={descriptionStyles}>{translate('process_folder_desc')}</p>
        
        <motion.button
          onClick={handleProcessFolder}
          disabled={processing}
          className={primaryButtonStyles}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {processing ? (
            <>
              <span className="mr-2">{translate('processing')}</span>
              <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
            </>
          ) : (
            <>
              <FaFolder className="mr-2" />
              {translate('process_all_pdfs')}
            </>
          )}
        </motion.button>
      </motion.section>

      {/* Available PDF Files Section */}
      <motion.section className={sectionStyles}>
        <h2 className={titleStyles}>
          <FaFileAlt className="mr-2" />
          {translate('available_pdfs')}
        </h2>
        <p className={descriptionStyles}>{translate('available_pdfs_desc')}</p>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="text-primary-dark">{translate('loading_files')}</span>
          </div>
        ) : pdfFiles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">{translate('no_pdfs')}</div>
        ) : (
          <div>
            {pdfFiles.map((installationData, index) => (
              <div key={index} className="mb-4">
                <h4 className="font-semibold text-primary-dark damb-2">{translate('installation')}: {installationData.installation}</h4>
                <ul className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-64 overflow-y-auto">
                  {installationData.files.map((file, fileIndex) => (
                    <li key={fileIndex} className="p-3  text-sm dark:hover:bg-gray-700 hover:bg-gray-50 ">
                      <div className="flex items-center justify-between">
                        <div className="flex items-centerflex-1 truncate">
                          <FaFileAlt className="text-primary-light mr-2 flex-shrink-0" />
                          <span className="truncate">{file}</span>
                        </div>
                        <button 
                          onClick={() => handleViewPdf( file)}
                          className="ml-2 text-white hover:text-gray-200 flex items-center"
                          title={translate('view_pdf')}
                        >
                          <FaEye className="mr-1" />
                          <span>{translate('view_pdf')}</span>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </motion.section>

      {/* Reset All Bills Section */}
      <motion.section className={sectionStyles}>
        <h2 className={titleStyles}>
          <FaTrashAlt className="text-error-red mr-2" />
          {translate('reset_database')}
        </h2>
        <p className={descriptionStyles}>{translate('reset_database_desc')}</p>
        
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            {translate('reset_warning')}
          </p>
          
          {!showConfirmReset ? (
            <motion.button
              onClick={() => setShowConfirmReset(true)}
              disabled={resetting}
              className={dangerButtonStyles}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaTrashAlt className="mr-2" />
              {translate('reset_all_bills')}
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
                <h3 className="font-bold">{translate('warning')}</h3>
              </div>
              <p className="mb-4 text-gray-700">{translate('confirm_reset')}</p>
              <div className="flex justify-end space-x-3">
                <motion.button
                  type="button"
                  onClick={() => setShowConfirmReset(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={resetting}
                >
                  {translate('cancel')}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={handleResetBills}
                  className={dangerButtonStyles}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={resetting}
                >
                  {resetting ? (
                    <>
                      <span>{translate('deleting')}</span>
                      <span className="ml-2 inline-block h-4 w-4 rounded-full border-2 border-t-transparent border-white animate-spin"></span>
                    </>
                  ) : (
                    <>
                      <FaTrashAlt className="mr-2" />
                      {translate('confirm_delete')}
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* Status Message */}
      <AnimatePresence>
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
      </AnimatePresence>

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
