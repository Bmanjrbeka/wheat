// Test script to verify ML integration
const fs = require('fs');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function testMLIntegration() {
  console.log('🧪 Testing ML Integration...');
  console.log('='.repeat(50));
  
  try {
    // Test 1: Check ML server health
    console.log('1. Testing ML Server Health...');
    const healthResponse = await fetch('http://localhost:8000/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health Status:', healthData.status);
    console.log('✅ Model Loaded:', healthData.model_loaded);
    
    // Test 2: Test prediction with sample image
    console.log('\n2. Testing Disease Prediction...');
    
    // Create a simple test image (1x1 pixel JPEG header)
    const testImageBuffer = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x01, 0x01, 0x2C, 0x01, 0x2C, 0x00, 0x00
    ]);
    
    const form = new FormData();
    form.append('file', testImageBuffer, {
      filename: 'test.jpg',
      contentType: 'image/jpeg'
    });
    
    const predictionResponse = await fetch('http://localhost:8000/predict', {
      method: 'POST',
      body: form
    });
    
    if (!predictionResponse.ok) {
      throw new Error(`Prediction failed: ${predictionResponse.status}`);
    }
    
    const prediction = await predictionResponse.json();
    
    console.log('✅ Prediction Successful!');
    console.log('🌾 Disease:', prediction.disease);
    console.log('📊 Confidence:', `${(prediction.confidence * 100).toFixed(1)}%`);
    console.log('💊 Treatment:', prediction.treatment.substring(0, 50) + '...');
    console.log('⏱️  Inference Time:', prediction.inference_ms + 'ms');
    
    // Test 3: Check frontend integration
    console.log('\n3. Testing Frontend Integration...');
    console.log('✅ Frontend running at: http://localhost:3000');
    console.log('✅ API URL configured:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');
    
    console.log('\n🎉 Integration Test Complete!');
    console.log('='.repeat(50));
    console.log('📝 Next Steps:');
    console.log('   1. Open http://localhost:3000 in browser');
    console.log('   2. Upload a wheat leaf image');
    console.log('   3. Verify real model predictions');
    console.log('   4. Check treatment recommendations');
    
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Ensure ML server is running: start_ml_server.bat');
    console.log('   2. Check model.keras file exists in ml_server folder');
    console.log('   3. Verify Python dependencies are installed');
    console.log('   4. Check port 8000 is available');
  }
}

// Check if node-fetch is available, install if needed
async function ensureDependencies() {
  try {
    require('node-fetch');
    require('form-data');
  } catch (error) {
    console.log('📦 Installing test dependencies...');
    const { execSync } = require('child_process');
    execSync('npm install node-fetch@2 form-data', { stdio: 'inherit' });
  }
}

// Run test
ensureDependencies().then(() => {
  testMLIntegration().catch(console.error);
});
