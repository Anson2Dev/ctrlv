/**
 * File Handler
 * Handles file content and saves it to the appropriate storage
 */

/**
 * Handle file content
 * @param {string} fileContent - The file content (base64 or raw)
 * @param {string} fileName - The file name
 * @param {HTMLElement} contentElement - The element containing the content
 * @returns {Promise<Object>} Result of the file processing
 */
export async function handleFile(fileContent, fileName, contentElement) {
  if (!fileContent || !fileName) {
    return { success: false, message: 'Missing file content or name' };
  }
  
  try {
    // Determine if the content is a data URL
    let blob;
    if (typeof fileContent === 'string' && fileContent.startsWith('data:')) {
      // Extract the MIME type from the data URL
      const mimeType = fileContent.split(',')[0].split(':')[1].split(';')[0] || 'application/octet-stream';
      // Extract the base64 data
      const base64Data = fileContent.split(',')[1];
      // Convert base64 to blob
      blob = base64ToBlob(base64Data, mimeType);
    } else {
      // Assume it's already a blob or raw data
      blob = new Blob([fileContent], { type: 'application/octet-stream' });
    }
    
    // Save the file
    const result = await saveToServer(blob, fileName, 'file');
    
    // Store metadata in the content element
    if (contentElement) {
      contentElement.dataset.savedFileName = fileName;
      contentElement.dataset.savedFileType = 'file';
      contentElement.dataset.savedFileSize = blob.size.toString();
    }
    
    return result;
  } catch (error) {
    console.error('Error handling file:', error);
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
 * Convert base64 to Blob
 * @param {string} base64 - The base64 string
 * @param {string} mimeType - The MIME type
 * @returns {Blob} - The blob
 */
function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteArrays = [];
  
  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
  
  return new Blob(byteArrays, { type: mimeType });
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