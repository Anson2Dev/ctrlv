/**
 * Content Classifier
 * Classifies content based on type (text, URL, image, file)
 * and passes it to the appropriate handler
 */

import { handleText } from './handlers/textHandler.js';
import { handleUrl } from './handlers/urlHandler.js';
import { handleImage } from './handlers/mediaHandler.js';
import { handleFile } from './handlers/fileHandler.js';

/**
 * Classify content and determine its type
 * @param {HTMLElement} contentElement - The element containing the content
 * @returns {Object} Content information including type, size, and format
 */
export function classifyContent(contentElement) {
  if (!contentElement) return null;
  
  // Check if the element contains an image
  const image = contentElement.querySelector('img');
  if (image && image.src) {
    return {
      type: 'Image',
      size: formatFileSize(image.file ? image.file.size : 0),
      format: getImageFormat(image.src),
      element: image
    };
  }
  
  // Check if the element has stored file content (binary file)
  if (contentElement.dataset.fileContent) {
    return {
      type: 'File',
      size: formatFileSize(contentElement.dataset.fileSize || 0),
      format: contentElement.dataset.fileName ? getFileExtension(contentElement.dataset.fileName) : 'unknown',
      element: contentElement
    };
  }
  
  // Get text content
  const text = contentElement.textContent || '';
  
  // Check if the text is a URL
  if (isUrl(text)) {
    return {
      type: 'URL',
      size: formatFileSize(text.length),
      format: 'url',
      element: contentElement,
      url: text.trim()
    };
  }
  
  // Default to text
  return {
    type: 'Text',
    size: formatFileSize(text.length),
    format: 'text',
    element: contentElement
  };
}

/**
 * Process content based on its type
 * @param {HTMLElement} contentElement - The element containing the content
 * @returns {Promise<Object>} Result of the content processing
 */
export async function processContent(contentElement) {
  const contentInfo = classifyContent(contentElement);
  
  if (!contentInfo) return { success: false, message: 'No content to process' };
  
  try {
    switch (contentInfo.type) {
      case 'URL':
        return await handleUrl(contentInfo.url, contentElement);
      case 'Image':
        return await handleImage(contentInfo.element, contentElement);
      case 'File':
        return await handleFile(contentElement.dataset.fileContent, contentElement.dataset.fileName || `file_${Date.now()}`, contentElement);
      case 'Text':
      default:
        return await handleText(contentInfo.element.textContent, contentElement);
    }
  } catch (error) {
    console.error('Error processing content:', error);
    return { success: false, message: `Error: ${error.message}` };
  }
}

/**
 * Check if a string is a valid URL
 * @param {string} text - The text to check
 * @returns {boolean} True if the text is a URL
 */
function isUrl(text) {
  if (!text) return false;
  
  text = text.trim();
  
  // Simple URL validation regex
  const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w.-]*)*\/?$/i;
  return urlRegex.test(text);
}

/**
 * Get the file extension from a filename
 * @param {string} fileName - The file name
 * @returns {string} The file extension
 */
function getFileExtension(fileName) {
  if (!fileName) return 'unknown';
  
  const parts = fileName.split('.');
  if (parts.length > 1) {
    return parts[parts.length - 1].toLowerCase();
  }
  
  return 'unknown';
}

/**
 * Get the image format from a data URL
 * @param {string} dataUrl - The data URL
 * @returns {string} The image format
 */
function getImageFormat(dataUrl) {
  if (!dataUrl || !dataUrl.startsWith('data:')) return 'unknown';
  
  try {
    const mimeType = dataUrl.split(',')[0].split(':')[1].split(';')[0];
    return mimeType.split('/')[1] || 'unknown';
  } catch (error) {
    return 'unknown';
  }
}

/**
 * Format file size in KB
 * @param {number} bytes - The size in bytes
 * @returns {string} - Formatted size
 */
function formatFileSize(bytes) {
  const kb = bytes / 1024;
  return `${kb.toFixed(2)} KB`;
}