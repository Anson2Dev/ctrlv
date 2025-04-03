/**
 * Text Handler
 * Handles plain text content and saves it to the appropriate storage
 */

/**
 * Handle text content
 * @param {string} text - The text content
 * @param {HTMLElement} contentElement - The element containing the content
 * @returns {Promise<Object>} Result of the text processing
 */
export async function handleText(text, contentElement) {
  if (!text) {
    return { success: false, message: 'No text content to process' };
  }
  
  try {
    // Generate a filename for the text
    const fileName = `text_${Date.now()}.txt`;
    const blob = new Blob([text], { type: 'text/plain' });
    
    // Save the text file
    const result = await saveToServer(blob, fileName, 'text');
    
    // Store metadata in the content element
    if (contentElement) {
      contentElement.dataset.savedFileName = fileName;
      contentElement.dataset.savedFileType = 'text';
      contentElement.dataset.savedFileSize = blob.size.toString();
    }
    
    return result;
  } catch (error) {
    console.error('Error handling text:', error);
    return { success: false, message: `Error: ${error.message}` };
  }
}

/**
 * Save content to server
 * @param {Blob} blob - The blob to save
 * @param {string} fileName - The file name
 * @param {string} fileType - The file type
 * @returns {Promise<Object>} Result of the save operation
 */
async function saveToServer(blob, fileName, fileType) {
  try {
    // Convert blob to base64 for sending to server
    const fileContent = await blobToBase64(blob);
    
    // Send file to server API endpoint
    const response = await fetch('/api/saveFile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fileName,
        fileContent,
        fileType
      })
    });
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to save file');
    }
    
    return {
      success: true,
      message: `Saved to server as ${fileName}`,
      fileName,
      fileType,
      fileSize: blob.size
    };
  } catch (error) {
    console.error('Error saving file to server:', error);
    return { success: false, message: `Error: ${error.message}` };
  }
}

/**
 * Convert Blob to base64 string
 * @param {Blob} blob - The blob to convert
 * @returns {Promise<string>} - Base64 string
 */
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}