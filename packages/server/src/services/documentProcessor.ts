import axios from 'axios';
import * as cheerio from 'cheerio';
// Remove unused import
// import { JSDOM } from 'jsdom';
import * as fsPromises from 'fs/promises';
import * as fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { createCanvas } from 'canvas';
import pdf from 'pdf-parse';
import { Server } from 'socket.io';
import { config } from '../config';
import { Job, JobStatus, DocumentType, IJob } from '../models/Job';
import { ProcessedDocument, IProcessedDocument } from '../models/ProcessedDocument';
import { ObjectId } from 'mongodb';

// Define chunk interface
interface Chunk {
  text: string;
  embedding: number[];
}

// Define Page interface
interface Page {
  pageNumber: number;
  text: string;
  imageUrl?: string;
  chunks: Chunk[];
}

// Directory for storing files
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fsPromises.access(UPLOAD_DIR);
  } catch {
    await fsPromises.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

// Update job status
async function updateJobStatus(job: IJob, status: JobStatus, message?: string, progress?: number) {
  job.status = status;
  if (progress !== undefined) {
    job.progress = progress;
  }
  
  // Fix for message being undefined
  job.statusHistory.push({
    status,
    timestamp: new Date(),
    message: message || ''
  });
  
  await job.save();
  return job;
}

// Fetch URL content
async function fetchUrl(url: string): Promise<{ content: Buffer; contentType: string }> {
  const response = await axios.get(url, {
    responseType: 'arraybuffer',
    headers: {
      'User-Agent': 'Garden-Takehome/1.0'
    }
  });
  
  return {
    content: Buffer.from(response.data),
    contentType: response.headers['content-type'] || ''
  };
}

// Determine document type based on content type
function determineDocumentType(contentType: string): DocumentType {
  if (contentType.includes('text/html')) {
    return DocumentType.HTML;
  } else if (contentType.includes('application/pdf')) {
    return DocumentType.PDF;
  } else {
    return DocumentType.UNKNOWN;
  }
}

// Extract text from HTML
function extractHtmlText(htmlContent: string): string {
  const $ = cheerio.load(htmlContent);
  
  // Remove script and style elements
  $('script, style, noscript, iframe, head').remove();
  
  // Get text from body
  const text = $('body').text();
  
  // Clean up text
  return text
    .replace(/\s+/g, ' ')  // Replace multiple spaces with a single space
    .trim();
}

// Get page title from HTML
function getHtmlTitle(htmlContent: string): string {
  const $ = cheerio.load(htmlContent);
  const title = $('title').text().trim() || 'Untitled Document';
  return title;
}

// Extract images from PDF (for real implementation, would use pdf.js)
// This is a mock implementation for demonstration
async function pdfToImages(pdfBuffer: Buffer): Promise<string[]> {
  await ensureUploadDir();
  
  const data = await pdf(pdfBuffer);
  const pageCount = data.numpages;
  const imagePaths: string[] = [];
  
  // Create a blank image for each page (in real implementation, would render PDF pages)
  for (let i = 0; i < pageCount; i++) {
    const canvas = createCanvas(800, 1100);
    const ctx = canvas.getContext('2d');
    
    // Fill with white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 800, 1100);
    
    // Add some text
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.fillText(`Page ${i + 1} of PDF`, 50, 50);
    
    const imageId = uuidv4();
    const imagePath = path.join(UPLOAD_DIR, `${imageId}.png`);
    const imageStream = canvas.createPNGStream();
    const writeStream = fs.createWriteStream(imagePath);
    
    await new Promise<void>((resolve, reject) => {
      imageStream.pipe(writeStream);
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
    });
    
    imagePaths.push(`/uploads/${path.basename(imagePath)}`);
  }
  
  return imagePaths;
}

// OCR image using mock service
async function ocrImage(imagePath: string): Promise<string> {
  try {
    // Remove leading slash for local file path
    const localPath = imagePath.startsWith('/uploads/')
      ? path.join(UPLOAD_DIR, '..', imagePath)
      : imagePath;
    
    const imageData = await fsPromises.readFile(localPath);
    
    const response = await axios.post(config.ocrServiceUrl + '/ocr', imageData, {
      headers: {
        'Content-Type': 'image/jpeg'
      }
    });
    
    return response.data.text;
  } catch (error) {
    console.error('OCR service error:', error);
    throw new Error('OCR service failed');
  }
}

// Split text into chunks
function chunkText(text: string, chunkSize: number = 500): string[] {
  const words = text.split(' ');
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (const word of words) {
    if ((currentChunk + word).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = word + ' ';
    } else {
      currentChunk += word + ' ';
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Get embeddings from mock service
async function getEmbeddings(text: string): Promise<number[]> {
  try {
    const response = await axios.post(config.embeddingServiceUrl + '/embed', { text }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.embedding;
  } catch (error) {
    console.error('Embedding service error:', error);
    throw new Error('Embedding service failed');
  }
}

// Process HTML document
async function processHtmlDocument(job: IJob, htmlContent: Buffer): Promise<IProcessedDocument> {
  const htmlString = htmlContent.toString('utf-8');
  
  // Update job status
  await updateJobStatus(job, JobStatus.PROCESSING, 'Extracting text from HTML', 25);
  
  // Extract text
  const extractedText = extractHtmlText(htmlString);
  const title = getHtmlTitle(htmlString);
  
  // Update job status
  await updateJobStatus(job, JobStatus.CHUNKING, 'Chunking text', 50);
  
  // Chunk text
  const textChunks = chunkText(extractedText);
  
  // Update job status
  await updateJobStatus(job, JobStatus.EMBEDDING, 'Generating embeddings', 75);
  
  // Get embeddings for each chunk
  const chunks = await Promise.all(textChunks.map(async (text) => {
    const embedding = await getEmbeddings(text);
    return { text, embedding };
  }));
  
  // Create new document
  const document = new ProcessedDocument({
    url: job.url,
    title,
    documentType: DocumentType.HTML,
    htmlContent: htmlString,
    text: extractedText,
    chunks,
    pages: [{
      pageNumber: 1,
      text: extractedText,
      chunks
    }]
  });
  
  await document.save();
  return document;
}

// Process PDF document
async function processPdfDocument(job: IJob, pdfBuffer: Buffer): Promise<IProcessedDocument> {
  // Update job status
  await updateJobStatus(job, JobStatus.PROCESSING, 'Converting PDF to images', 20);
  
  // Convert PDF to images
  const imagePaths = await pdfToImages(pdfBuffer);
  
  // Update job status
  await updateJobStatus(job, JobStatus.PROCESSING, 'Performing OCR on images', 40);
  
  // Perform OCR on each image
  const pages: Page[] = await Promise.all(imagePaths.map(async (imagePath, index) => {
    const text = await ocrImage(imagePath);
    return { pageNumber: index + 1, imageUrl: imagePath, text, chunks: [] };
  }));
  
  // Update job status
  await updateJobStatus(job, JobStatus.CHUNKING, 'Chunking text', 60);
  
  // Process text chunks for each page
  const allText = pages.map(page => page.text).join('\n\n');
  const textChunks = chunkText(allText);
  
  // Update job status
  await updateJobStatus(job, JobStatus.EMBEDDING, 'Generating embeddings', 80);
  
  // Get embeddings for each chunk
  const chunks: Chunk[] = await Promise.all(textChunks.map(async (text) => {
    const embedding = await getEmbeddings(text);
    return { text, embedding };
  }));
  
  // Distribute chunks to pages based on content
  pages.forEach(page => {
    // Properly cast chunks to Chunk[] to fix TypeScript error
    page.chunks = chunks.filter(chunk => 
      page.text.includes(chunk.text.substring(0, Math.min(50, chunk.text.length)))
    ) as Chunk[];
  });
  
  // Create new document
  const document = new ProcessedDocument({
    url: job.url,
    title: `PDF Document - ${path.basename(job.url)}`,
    documentType: DocumentType.PDF,
    text: allText,
    pages,
    chunks
  });
  
  await document.save();
  return document;
}

// Main processing function
export async function processUrl(jobId: string, io: Server): Promise<void> {
  const job = await Job.findById(jobId);
  if (!job) {
    throw new Error(`Job not found: ${jobId}`);
  }
  
  try {
    // Update job status
    await updateJobStatus(job, JobStatus.FETCHING, 'Fetching document', 10);
    io.emit(`job:${job.id}:status`, { id: job.id, status: job.status, progress: job.progress });
    
    // Fetch URL
    const { content, contentType } = await fetchUrl(job.url);
    
    // Determine document type
    const documentType = determineDocumentType(contentType);
    job.documentType = documentType;
    await job.save();
    
    let document: IProcessedDocument;
    
    // Process based on document type
    if (documentType === DocumentType.HTML) {
      document = await processHtmlDocument(job, content);
    } else if (documentType === DocumentType.PDF) {
      document = await processPdfDocument(job, content);
    } else {
      throw new Error(`Unsupported document type: ${contentType}`);
    }
    
    // Link document to job - Fix ObjectId type issue
    job.document = document._id as unknown as ObjectId;
    job.status = JobStatus.COMPLETED;
    job.progress = 100;
    await job.save();
    
    // Emit completion event
    io.emit(`job:${job.id}:completed`, { 
      id: job.id, 
      documentId: document._id 
    });
    
  } catch (error) {
    console.error(`Error processing job ${jobId}:`, error);
    
    // Update job status to failed
    job.status = JobStatus.FAILED;
    job.error = error instanceof Error ? error.message : String(error);
    job.statusHistory.push({
      status: JobStatus.FAILED,
      timestamp: new Date(),
      message: error instanceof Error ? error.message : String(error)
    });
    await job.save();
    
    // Emit failure event
    io.emit(`job:${job.id}:failed`, { 
      id: job.id, 
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Queue job for processing
export async function queueJob(url: string, io: Server): Promise<IJob> {
  // Create new job
  const job = new Job({ url });
  await job.save();
  
  // Emit job creation event
  io.emit('job:created', { id: job.id, url });
  
  // Process job asynchronously
  processUrl(job.id, io).catch(err => {
    console.error(`Error processing job ${job.id}:`, err);
  });
  
  return job;
}