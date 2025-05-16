import path from 'path';
import { load } from 'ts-dotenv';
import { Server } from 'socket.io';

const schema = {
  NODE_ENV: ['development' as const, 'production' as const, 'test' as const],
  PORT: Number,
  MONGO_URI: String,
  CLIENT_ORIGIN: String,
  OCR_SERVICE_URL: String,
  EMBEDDING_SERVICE_URL: String,
  JWT_SECRET: String,
  ENV: ['local' as const, 'remote' as const],
  VM_IP_ADDRESS: String
};

// Default values
const defaults = {
  NODE_ENV: 'development',
  PORT: 3000,
  MONGO_URI: 'mongodb://localhost:27017/garden-takehome',
  CLIENT_ORIGIN: 'http://localhost:3001',
  OCR_SERVICE_URL: 'http://localhost:4001',
  EMBEDDING_SERVICE_URL: 'http://localhost:4000',
  JWT_SECRET: 'secret-key',
  ENV: 'local',
  VM_IP_ADDRESS: 'localhost'
};

// Try to load from .env file
let env;
try {
  env = load(schema, {
    path: path.join(__dirname, '../../../.env')
  });
} catch (error) {
  console.warn('Error loading .env file, using default values:', error);
  env = defaults;
}

// Configure service URLs based on ENV
const clientOrigin = env.ENV === 'local' 
  ? ['http://localhost:3001', 'http://10.27.117.32:3001'] 
  : [`http://${env.VM_IP_ADDRESS}:3001`];
const ocrServiceUrl = env.ENV === 'local' ? 'http://localhost:4001' : `http://${env.VM_IP_ADDRESS}:4001`;
const embeddingServiceUrl = env.ENV === 'local' ? 'http://localhost:4000' : `http://${env.VM_IP_ADDRESS}:4000`;

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  mongoUri: env.MONGO_URI,
  clientOrigin: env.CLIENT_ORIGIN?.split(',').map(origin => origin.trim()) || 
    ['http://localhost:3001'],
  ocrServiceUrl: env.OCR_SERVICE_URL,
  embeddingServiceUrl: env.EMBEDDING_SERVICE_URL,
  jwtSecret: env.JWT_SECRET,
  env: env.ENV,
  vmIpAddress: env.VM_IP_ADDRESS
};

// Add TypeScript declaration for Socket.io in Express Request
declare global {
  namespace Express {
    interface Request {
      io?: Server;
      auth?: {
        username: string;
        sessionToken: string;
      };
    }
  }
}