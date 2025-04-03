/**
 * Content Monitoring Service
 * Monitors content pasted into the PasteBox and passes it to the Content Classifier
 */

import { classifyContent, processContent } from './contentClassifier.js';

/**
 * Initialize the content monitoring service
 * @param {HTMLElement} pasteContent - The paste content element
 * @param {HTMLElement} contentType - The content type display element
 * @param {HTMLElement} contentSizes - The content size display element
 * @returns {MutationObserver} The observer instance
 */
export function initContentMonitor(pasteContent, contentType, contentSizes) {
  if (!pasteContent) return;
  
  // Set up a MutationObserver to monitor changes to the paste content
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList' || mutation.type === 'characterData') {
        // Content has changed, classify it
        const contentInfo = classifyContent(pasteContent);
        
        // Update the UI with content information
        if (contentInfo) {
          contentType.textContent = contentInfo.type;
          contentSizes.textContent = contentInfo.size;
          
          // Store content metadata for later use
          pasteContent.dataset.contentType = contentInfo.type;
          pasteContent.dataset.contentSize = contentInfo.size;
          pasteContent.dataset.contentFormat = contentInfo.format || '';
        }
      }
    }
  });
  
  // Start observing the paste content element
  observer.observe(pasteContent, {
    childList: true,
    characterData: true,
    subtree: true
  });
  
  return observer;
}

/**
 * Process the monitored content
 * @param {HTMLElement} pasteContent - The paste content element
 * @returns {Promise<Object>} Result of the content processing
 */
export async function processMonitoredContent(pasteContent) {
  if (!pasteContent) {
    return { success: false, message: 'No content element provided' };
  }
  
  try {
    // Process the content based on its type
    return await processContent(pasteContent);
  } catch (error) {
    console.error('Error processing monitored content:', error);
    return { success: false, message: `Error: ${error.message}` };
  }
}

/**
 * Stop the content monitoring service
 * @param {MutationObserver} observer - The observer to disconnect
 */
export function stopContentMonitor(observer) {
  if (observer) {
    observer.disconnect();
  }
}