/**
 * API endpoint for saving files to the server
 * This endpoint receives file data and saves it to the src/download directory
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory path for src/download
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const downloadDir = path.join(__dirname, '../../download');

export const POST = async ({ request }) => {
  try {
    // Parse the request body
    const data = await request.json();
    const { fileName, fileContent, fileType } = data;
    
    if (!fileName || (!fileContent && fileType !== 'image')) {
      return new Response(JSON.stringify({ success: false, message: 'Missing required fields' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
    
    // Ensure the download directory exists
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }
    
    const filePath = path.join(downloadDir, fileName);
    
    // Save the file based on type
    if (fileType === 'image') {
      // For images, the content is a base64 data URL
      // Extract the base64 data from the data URL
      const base64Data = fileContent.split(',')[1];
      fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
    } else {
      // For text files
      // Check if the content is a data URL (starts with data:)
      if (fileContent.startsWith('data:')) {
        // Extract and decode the base64 data
        const base64Data = fileContent.split(',')[1];
        const decodedText = Buffer.from(base64Data, 'base64').toString('utf-8');
        fs.writeFileSync(filePath, decodedText);
      } else {
        // Regular text content
        fs.writeFileSync(filePath, fileContent);
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: `File saved as ${fileName}`,
      filePath: `/download/${fileName}`
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error saving file:', error);
    return new Response(JSON.stringify({ success: false, message: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};