/**
 * Media Handler
 * Handles image, video and audio content and saves it to the appropriate storage
 */

/**
 * Handle image content
 * @param {HTMLImageElement} imageElement - The image element
 * @param {HTMLElement} contentElement - The element containing the content
 * @returns {Promise<Object>} Result of the image processing
 */
export async function handleImage(imageElement, contentElement) {
  if (!imageElement || !imageElement.src) {
    return { success: false, message: 'No image content to process' };
  }
  
  try {
    // Get image data
    const imageUrl = imageElement.src;
    let blob;
    
    // If the image has a file property (from paste event), use that
    if (imageElement.file && imageElement.file instanceof Blob) {
      blob = imageElement.file;
    } else {
      // Otherwise, fetch the image data from the src URL
      blob = await fetchImageAsBlob(imageUrl);
    }
    
    // Determine file extension based on mime type or src
    const fileExtension = getImageExtension(imageUrl, blob.type);
    const fileName = `image_${Date.now()}.${fileExtension}`;
    
    // Save the image
    const result = await saveToServer(blob, fileName, 'image');
    
    // Store metadata in the content element
    if (contentElement) {
      contentElement.dataset.savedFileName = fileName;
      contentElement.dataset.savedFileType = 'image';
      contentElement.dataset.savedFileSize = blob.size.toString();
    }
    
    return result;
  } catch (error) {
    console.error('Error handling image:', error);
    return { success: false, message: `Error: ${error.message}` };
  }
}

/**
 * Handle video content
 * @param {HTMLVideoElement} videoElement - The video element
 * @param {HTMLElement} contentElement - The element containing the content
 * @returns {Promise<Object>} Result of the video processing
 */
export async function handleVideo(videoElement, contentElement) {
  if (!videoElement || !videoElement.src) {
    return { success: false, message: 'No video content to process' };
  }
  
  try {
    // Get video data
    const videoUrl = videoElement.src;
    let blob;
    
    // If the video has a file property, use that
    if (videoElement.file && videoElement.file instanceof Blob) {
      blob = videoElement.file;
    } else {
      // Otherwise, fetch the video data from the src URL
      blob = await fetchVideoAsBlob(videoUrl);
    }
    
    // Determine file extension based on mime type or src
    const fileExtension = getVideoExtension(videoUrl, blob.type);
    const fileName = `video_${Date.now()}.${fileExtension}`;
    
    // Save the video
    const result = await saveToServer(blob, fileName, 'video');
    
    // Store metadata in the content element
    if (contentElement) {
      contentElement.dataset.savedFileName = fileName;
      contentElement.dataset.savedFileType = 'video';
      contentElement.dataset.savedFileSize = blob.size.toString();
    }
    
    return result;
  } catch (error) {
    console.error('Error handling video:', error);
    return { success: false, message: `Error: ${error.message}` };
  }
}

/**
 * Handle audio content
 * @param {HTMLAudioElement} audioElement - The audio element
 * @param {HTMLElement} contentElement - The element containing the content
 * @returns {Promise<Object>} Result of the audio processing
 */
export async function handleAudio(audioElement, contentElement) {
  if (!audioElement || !audioElement.src) {
    return { success: false, message: 'No audio content to process' };
  }
  
  try {
    // Get audio data
    const audioUrl = audioElement.src;
    let blob;
    
    // If the audio has a file property, use that
    if (audioElement.file && audioElement.file instanceof Blob) {
      blob = audioElement.file;
    } else {
      // Otherwise, fetch the audio data from the src URL
      blob = await fetchAudioAsBlob(audioUrl);
    }
    
    // Determine file extension based on mime type or src
    const fileExtension = getAudioExtension(audioUrl, blob.type);
    const fileName = `audio_${Date.now()}.${fileExtension}`;
    
    // Save the audio
    const result = await saveToServer(blob, fileName, 'audio');
    
    // Store metadata in the content element
    if (contentElement) {
      contentElement.dataset.savedFileName = fileName;
      contentElement.dataset.savedFileType = 'audio';
      contentElement.dataset.savedFileSize = blob.size.toString();
    }
    
    return result;
  } catch (error) {
    console.error('Error handling audio:', error);
    return { success: false, message: `Error: ${error.message}` };
  }
}

/**
 * Fetch image as blob
 * @param {string} url - The image URL
 * @returns {Promise<Blob>} The image blob
 */
async function fetchImageAsBlob(url) {
  // If it's a data URL, convert it to blob
  if (url.startsWith('data:')) {
    return dataURLToBlob(url);
  }
  
  // Otherwise, fetch it
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }
  
  return await response.blob();
}

/**
 * Fetch video as blob
 * @param {string} url - The video URL
 * @returns {Promise<Blob>} The video blob
 */
async function fetchVideoAsBlob(url) {
  // If it's a data URL, convert it to blob
  if (url.startsWith('data:')) {
    return dataURLToBlob(url);
  }
  
  // Otherwise, fetch it
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch video: ${response.statusText}`);
  }
  
  return await response.blob();
}

/**
 * Fetch audio as blob
 * @param {string} url - The audio URL
 * @returns {Promise<Blob>} The audio blob
 */
async function fetchAudioAsBlob(url) {
  // If it's a data URL, convert it to blob
  if (url.startsWith('data:')) {
    return dataURLToBlob(url);
  }
  
  // Otherwise, fetch it
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch audio: ${response.statusText}`);
  }
  
  return await response.blob();
}

/**
 * Convert data URL to blob
 * @param {string} dataUrl - The data URL
 * @returns {Blob} The blob
 */
function dataURLToBlob(dataUrl) {
  const parts = dataUrl.split(';base64,');
  const contentType = parts[0].split(':')[1] || 'application/octet-stream';
  const raw = window.atob(parts[1]);
  const rawLength = raw.length;
  const uInt8Array = new Uint8Array(rawLength);
  
  for (let i = 0; i < rawLength; ++i) {
    uInt8Array[i] = raw.charCodeAt(i);
  }
  
  return new Blob([uInt8Array], { type: contentType });
}

/**
 * Get image extension from URL or MIME type
 * @param {string} url - The image URL
 * @param {string} mimeType - The MIME type
 * @returns {string} The image extension
 */
function getImageExtension(url, mimeType) {
  // Try to get extension from URL
  if (url && !url.startsWith('data:')) {
    const urlExtension = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(urlExtension)) {
      return urlExtension;
    }
  }
  
  // Fall back to MIME type
  if (mimeType) {
    const mimeExtension = mimeType.split('/').pop();
    if (mimeExtension === 'jpeg') return 'jpg';
    if (mimeExtension === 'svg+xml') return 'svg';
    return mimeExtension;
  }
  
  // Default to png
  return 'png';
}

/**
 * Get video extension from URL or MIME type
 * @param {string} url - The video URL
 * @param {string} mimeType - The MIME type
 * @returns {string} The video extension
 */
function getVideoExtension(url, mimeType) {
  // Try to get extension from URL
  if (url && !url.startsWith('data:')) {
    const urlExtension = url.split('.').pop().toLowerCase();
    if (['mp4', 'webm', 'ogg', 'mov'].includes(urlExtension)) {
      return urlExtension;
    }
  }
  
  // Fall back to MIME type
  if (mimeType) {
    const mimeExtension = mimeType.split('/').pop();
    if (mimeExtension === 'quicktime') return 'mov';
    return mimeExtension;
  }
  
  // Default to mp4
  return 'mp4';
}

/**
 * Get audio extension from URL or MIME type
 * @param {string} url - The audio URL
 * @param {string} mimeType - The MIME type
 * @returns {string} The audio extension
 */
function getAudioExtension(url, mimeType) {
  // Try to get extension from URL
  if (url && !url.startsWith('data:')) {
    const urlExtension = url.split('.').pop().toLowerCase();
    if (['mp3', 'wav', 'ogg', 'aac', 'm4a'].includes(urlExtension)) {
      return urlExtension;
    }
  }
  
  // Fall back to MIME type
  if (mimeType) {
    const mimeExtension = mimeType.split('/').pop();
    if (mimeExtension === 'mpeg') return 'mp3';
    if (mimeExtension === 'mp4') return 'm4a';
    return mimeExtension;
  }
  
  // Default to mp3
  return 'mp3';
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