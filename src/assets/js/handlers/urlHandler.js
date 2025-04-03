/**
 * URL Handler
 * Handles URL content, fetches and parses it, and triggers appropriate actions
 */

/**
 * Handle URL content
 * @param {string} url - The URL to process
 * @param {HTMLElement} contentElement - The element containing the content
 * @returns {Promise<Object>} Result of the URL processing
 */
export async function handleUrl(url, contentElement) {
  if (!url) {
    return { success: false, message: 'No URL to process' };
  }
  
  try {
    // Clean and validate the URL
    url = url.trim();
    if (!isValidUrl(url)) {
      return { success: false, message: 'Invalid URL format' };
    }
    
    // Fetch URL metadata
    const metadata = await fetchUrlMetadata(url);
    
    // Store metadata in the content element
    if (contentElement) {
      contentElement.dataset.url = url;
      contentElement.dataset.urlTitle = metadata.title || '';
      contentElement.dataset.urlDescription = metadata.description || '';
      contentElement.dataset.urlImage = metadata.image || '';
    }
    
    // If the URL is an image, download it
    if (metadata.isImage) {
      return await downloadImage(url, contentElement);
    }
    
    // If the URL is a video, handle it accordingly
    if (metadata.isVideo) {
      return await handleVideoUrl(url, contentElement);
    }
    
    // For regular URLs, just store the metadata
    return {
      success: true,
      message: 'URL processed successfully',
      url,
      metadata
    };
  } catch (error) {
    console.error('Error handling URL:', error);
    return { success: false, message: `Error: ${error.message}` };
  }
}

/**
 * Check if a string is a valid URL
 * @param {string} url - The URL to validate
 * @returns {boolean} True if the URL is valid
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Fetch metadata for a URL
 * @param {string} url - The URL to fetch metadata for
 * @returns {Promise<Object>} The URL metadata
 */
async function fetchUrlMetadata(url) {
  try {
    // Determine if the URL is an image or video based on extension or content type
    const extension = url.split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const videoExtensions = ['mp4', 'webm', 'ogg', 'mov'];
    
    const isImage = imageExtensions.includes(extension);
    const isVideo = videoExtensions.includes(extension);
    
    // For images and videos, we can return basic metadata
    if (isImage || isVideo) {
      return {
        title: url.split('/').pop(),
        description: `${isImage ? 'Image' : 'Video'} from ${url}`,
        image: isImage ? url : '',
        isImage,
        isVideo
      };
    }
    
    // For other URLs, we would typically fetch the page and extract metadata
    // However, due to CORS restrictions in the browser, this would require a server-side proxy
    // For now, we'll return basic information
    return {
      title: url,
      description: `Link to ${url}`,
      image: '',
      isImage: false,
      isVideo: false
    };
  } catch (error) {
    console.error('Error fetching URL metadata:', error);
    return {
      title: url,
      description: '',
      image: '',
      isImage: false,
      isVideo: false
    };
  }
}

/**
 * Download an image from a URL
 * @param {string} url - The image URL
 * @param {HTMLElement} contentElement - The element containing the content
 * @returns {Promise<Object>} Result of the download
 */
async function downloadImage(url, contentElement) {
  try {
    // Fetch the image
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const fileName = `image_${Date.now()}.${getImageExtension(url, blob.type)}`;
    
    // Save the image
    const result = await saveToServer(blob, fileName, 'image');
    
    // Store metadata in the content element
    if (contentElement) {
      contentElement.dataset.savedFileName = fileName;
      contentElement.dataset.savedFileType = 'image';
      contentElement.dataset.savedFileSize = blob.size.toString();
    }
    
    return {
      success: true,
      message: `Image downloaded and saved as ${fileName}`,
      fileName,
      fileType: 'image',
      fileSize: blob.size
    };
  } catch (error) {
    console.error('Error downloading image:', error);
    return { success: false, message: `Error: ${error.message}` };
  }
}

/**
 * Handle a video URL
 * @param {string} url - The video URL
 * @param {HTMLElement} contentElement - The element containing the content
 * @returns {Promise<Object>} Result of the handling
 */
async function handleVideoUrl(url, contentElement) {
  // For now, we'll just store the URL
  // In a more advanced implementation, we could download the video or create an embed
  if (contentElement) {
    contentElement.dataset.videoUrl = url;
  }
  
  return {
    success: true,
    message: 'Video URL processed',
    url,
    fileType: 'video'
  };
}

/**
 * Get image extension from URL or MIME type
 * @param {string} url - The image URL
 * @param {string} mimeType - The MIME type
 * @returns {string} The image extension
 */
function getImageExtension(url, mimeType) {
  // Try to get extension from URL
  const urlExtension = url.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(urlExtension)) {
    return urlExtension;
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