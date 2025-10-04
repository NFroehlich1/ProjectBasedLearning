/**
 * Script to upload PDFs to Google Gemini File API
 * Run this once to upload all PDFs and save the file IDs
 * 
 * Usage: node upload-pdfs-to-gemini.js
 */

import { GoogleGenerativeAI, GoogleAIFileManager } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Your API Key
const API_KEY = 'AIzaSyAG2op2CcMbHXiWH1DDVM7MklTN97hhpzI'; // Replace with your key

const fileManager = new GoogleAIFileManager(API_KEY);

const PDFs = [
  'Krajcik & Blumenfeld 2006_PBL in Handbook of the Learning Sciences.pdf',
  'Guo et al. 2020_PBL Review.pdf',
  'Condlife et al. 2017_PBL Review.pdf',
  'Blimenfeld et al. 1991_Motivating_project_based_learning_Sustai.pdf',
  'Thomas 2000_Review PBL.pdf'
];

async function uploadPDFs() {
  console.log('📤 Starting PDF upload to Gemini...\n');
  
  const uploadedFiles = [];
  
  for (const pdfName of PDFs) {
    const filePath = path.join(__dirname, pdfName);
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ File not found: ${pdfName}`);
      continue;
    }
    
    try {
      console.log(`⏳ Uploading: ${pdfName}...`);
      
      const uploadResult = await fileManager.uploadFile(filePath, {
        mimeType: 'application/pdf',
        displayName: pdfName
      });
      
      console.log(`✅ Uploaded: ${pdfName}`);
      console.log(`   File URI: ${uploadResult.file.uri}`);
      console.log(`   File Name: ${uploadResult.file.name}\n`);
      
      uploadedFiles.push({
        displayName: pdfName,
        fileUri: uploadResult.file.uri,
        mimeType: uploadResult.file.mimeType
      });
      
    } catch (error) {
      console.error(`❌ Error uploading ${pdfName}:`, error.message);
    }
  }
  
  // Save the file URIs to a JSON file
  const outputPath = path.join(__dirname, 'gemini-files.json');
  fs.writeFileSync(outputPath, JSON.stringify(uploadedFiles, null, 2));
  
  console.log(`\n✅ All uploads complete!`);
  console.log(`📄 File URIs saved to: gemini-files.json`);
  console.log(`\nUploaded ${uploadedFiles.length} files:`);
  uploadedFiles.forEach(f => console.log(`  - ${f.displayName}`));
}

uploadPDFs().catch(console.error);
