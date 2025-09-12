#!/usr/bin/env node

const http = require('http');
const url = require('url');

const BACKEND_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const MAX_RETRIES = 30; // 30 seconds timeout
const RETRY_INTERVAL = 1000; // 1 second between retries

console.log('🔄 Waiting for backend to be ready...');

function checkBackend() {
  return new Promise((resolve, reject) => {
    const parsedUrl = url.parse(BACKEND_URL);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 80,
      path: '/health',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Backend is ready!');
        resolve(true);
      } else {
        reject(new Error(`Backend returned status ${res.statusCode}`));
      }
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function waitForBackend() {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      await checkBackend();
      return;
    } catch (error) {
      if (i === 0) {
        console.log(`⏳ Backend not ready yet (${BACKEND_URL}/health), waiting...`);
      }
      
      if (i === MAX_RETRIES - 1) {
        console.error('❌ Backend failed to start within timeout period');
        console.error('💡 Try running: npm run dev:backend (in a separate terminal)');
        process.exit(1);
      }
      
      // Show progress dots
      process.stdout.write('.');
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
    }
  }
}

// Handle process termination gracefully
process.on('SIGINT', () => {
  console.log('\n🛑 Cancelled waiting for backend');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Terminated waiting for backend');
  process.exit(0);
});

waitForBackend().catch((error) => {
  console.error('❌ Error waiting for backend:', error.message);
  process.exit(1);
});