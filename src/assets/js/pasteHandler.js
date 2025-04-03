/**
 * Paste Handler for PasteBox
 * Handles paste events and delegates content processing to the Content Monitoring Service
 */

import { initContentMonitor, processMonitoredContent } from './contentMonitor.js';

let lastSavedFileName = null;
let lastSavedFileType = 'text';
let lastSavedFileSize = 0;
let contentObserver = null;

/**
 * Initialize paste event listeners and content monitoring
 */
function initPasteHandlers() {
  const pasteContent = document.getElementById('pasteContent');
  const pasteBox = document.getElementById('pasteBox');
  const contentSizes = document.getElementById('content-sizes');
  const contentType = document.getElementById('content-type');
  const sendButton = document.getElementById('sendButton');
  const clearButton = document.getElementById('clearButton');
  const terminal = document.getElementById('terminal');
  
  if (!pasteContent) return;
  
  // Initialize content monitoring service
  contentObserver = initContentMonitor(pasteContent, contentType, contentSizes);
  
  // Listen for paste events
  pasteContent.addEventListener('paste', handlePaste);
  
  // Listen for drag and drop events
  if (pasteBox) {
    pasteBox.addEventListener('dragover', handleDragOver);
    pasteBox.addEventListener('drop', handleDrop);
  }
  
  // Update send button to save content
  if (sendButton) {
    sendButton.removeAttribute('onclick');
    sendButton.addEventListener('click', () => {
      saveContent();
      terminal.classList.remove('hidden');
      updateTerminalStatus('Saving content...');
    });
  }
  
  // Add clear button functionality
  if (clearButton) {
    clearButton.addEventListener('click', clearContent);
  }
}

/**
 * Handle paste events
 * @param {ClipboardEvent} event - The paste event
 */
async function handlePaste(event) {
  event.preventDefault();
  
  const clipboardData = event.clipboardData;
  const pasteContent = document.getElementById('pasteContent');
  
  // Clear previous content
  pasteContent.innerHTML = '';
  
  // Check for images
  if (clipboardData.files && clipboardData.files.length > 0) {
    const file = clipboardData.files[0];
    
    if (file.type.startsWith('image/')) {
      // Handle image paste
      const img = document.createElement('img');
      img.classList.add('max-w-full');
      img.file = file;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
        // The content monitor will detect the image and classify it
      };
      reader.readAsDataURL(file);
      
      pasteContent.appendChild(img);
      return;
    }
  }
  
  // Handle text paste
  const text = clipboardData.getData('text/plain');
  if (text) {
    pasteContent.textContent = text;
    // The content monitor will detect the text and classify it
  }
}

/**
 * Process and save content using the module system
 */
async function saveContent() {
  const pasteContent = document.getElementById('pasteContent');
  
  if (!pasteContent || !pasteContent.textContent && !pasteContent.querySelector('img')) {
    updateTerminalStatus('Nothing to save');
    return;
  }
  
  try {
    // Process content through the module system
    const result = await processMonitoredContent(pasteContent);
    
    if (result.success) {
      lastSavedFileName = result.fileName;
      lastSavedFileType = result.fileType;
      lastSavedFileSize = result.fileSize;
      updateTerminalStatus(result.message);
    } else {
      updateTerminalStatus(`Error: ${result.message}`);
    }
  } catch (error) {
    console.error('Error saving content:', error);
    updateTerminalStatus(`Error: ${error.message}`);
  }
}

// These functions have been replaced by the module system
// Content is now processed through the content monitoring service
// which delegates to the appropriate handler based on content type

/**
 * Format file size in KB
 * @param {number} bytes - The size in bytes
 * @returns {string} - Formatted size
 */
function formatFileSize(bytes) {
  const kb = bytes / 1024;
  return `${kb.toFixed(2)} KB`;
}

// This function has been moved to the individual handler modules
// Each handler module now has its own implementation of this utility function

/**
 * Update terminal status
 * @param {string} message - The status message
 */
function updateTerminalStatus(message) {
  const terminal = document.getElementById('terminal');
  const statusDiv = terminal.querySelector('.mt-2.text-gray-400');
  
  if (statusDiv) {
    statusDiv.innerHTML = `
      ${message}
      <br />
      ${lastSavedFileName ? `File: ${lastSavedFileName}` : ''}
      <br />
      ${lastSavedFileSize ? `Size: ${formatFileSize(lastSavedFileSize)}` : ''}
      <br />
      ${lastSavedFileName ? 'Save location: Server src/download directory' : ''}
    `;
  }
}

/**
 * Handle dragover events
 * @param {DragEvent} event - The dragover event
 */
function handleDragOver(event) {
  event.preventDefault();
  event.stopPropagation();
  event.dataTransfer.dropEffect = 'copy';
  
  // Add a visual indicator that files can be dropped
  const pasteBox = document.getElementById('pasteBox');
  if (pasteBox) {
    pasteBox.classList.add('drag-over');
  }
}

/**
 * Handle drop events
 * @param {DragEvent} event - The drop event
 */
async function handleDrop(event) {
  event.preventDefault();
  event.stopPropagation();
  
  const pasteContent = document.getElementById('pasteContent');
  const contentType = document.getElementById('content-type');
  const contentSizes = document.getElementById('content-sizes');
  const pasteBox = document.getElementById('pasteBox');
  
  // Remove visual indicator
  if (pasteBox) {
    pasteBox.classList.remove('drag-over');
  }
  
  // Check if files were dropped
  if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
    const file = event.dataTransfer.files[0];
    
    // Clear previous content
    pasteContent.innerHTML = '';
    
    if (file.type.startsWith('image/')) {
      // Handle image file
      const img = document.createElement('img');
      img.classList.add('max-w-full');
      img.file = file;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
        // The content monitor will detect the image and classify it
      };
      reader.readAsDataURL(file);
      
      pasteContent.appendChild(img);
    } else if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.csv')) {
      // Handle text file
      const reader = new FileReader();
      reader.onload = (e) => {
        pasteContent.textContent = e.target.result;
        // The content monitor will detect the text and classify it
      };
      reader.readAsText(file);
    } else {
      // Handle other file types as binary
      pasteContent.textContent = `File: ${file.name}`;
      
      // For binary files, store the data URL for processing by the file handler
      const reader = new FileReader();
      reader.onload = (e) => {
        // Store the data URL and file information for the file handler
        pasteContent.dataset.fileContent = e.target.result;
        pasteContent.dataset.fileName = file.name;
        pasteContent.dataset.fileSize = file.size.toString();
        
        // The content monitor will detect the file data and classify it
      };
      reader.readAsDataURL(file);
    }
  } else if (event.dataTransfer.getData('text')) {
    // Handle dropped text
    const text = event.dataTransfer.getData('text');
    pasteContent.textContent = text;
    // The content monitor will detect the text and classify it
  }
  
  // The content monitor will automatically update the UI based on the content type
}

/**
 * Clear content from paste box
 */
function clearContent() {
  const pasteContent = document.getElementById('pasteContent');
  const contentSizes = document.getElementById('content-sizes');
  const contentType = document.getElementById('content-type');
  const terminal = document.getElementById('terminal');
  
  if (pasteContent) {
    // Clear content
    pasteContent.innerHTML = '';
    pasteContent.textContent = '';
    
    // Remove any stored file content
    if (pasteContent.dataset.fileContent) {
      delete pasteContent.dataset.fileContent;
    }
    
    // Reset display values
    contentSizes.textContent = '0 KB';
    contentType.textContent = 'Text';
    
    // Reset saved file info
    lastSavedFileName = null;
    lastSavedFileType = 'text';
    lastSavedFileSize = 0;
    
    // Hide terminal if visible
    if (terminal && !terminal.classList.contains('hidden')) {
      terminal.classList.add('hidden');
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initPasteHandlers);