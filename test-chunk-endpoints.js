// Test script for new chunk endpoints
import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testChunkEndpoints() {
  console.log('🧪 Testing Chunk Endpoints...\n');

  // Test 1: Save a new chunk
  console.log('Test 1: Save a new chunk');
  const newChunk = {
    chapterId: "1",
    sectionId: "intro",
    content: "The party enters the dark forest, hearing whispers from the shadows.",
    metadata: {
      tone: "mysterious",
      tags: ["forest", "introduction"]
    }
  };

  try {
    const saveResponse = await fetch(`${BASE_URL}/api/chunks/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newChunk)
    });

    const saveResult = await saveResponse.json();
    console.log('✅ Save response:', saveResult);
  } catch (error) {
    console.error('❌ Save failed:', error.message);
  }

  // Test 2: Update the same chunk (should replace)
  console.log('\nTest 2: Update the same chunk');
  const updatedChunk = {
    chapterId: "1",
    sectionId: "intro",
    content: "The party enters the mysterious dark forest, hearing ancient whispers from the shadows.",
    metadata: {
      tone: "mysterious",
      tags: ["forest", "introduction", "ancient"]
    }
  };

  try {
    const updateResponse = await fetch(`${BASE_URL}/api/chunks/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedChunk)
    });

    const updateResult = await updateResponse.json();
    console.log('✅ Update response:', updateResult);
  } catch (error) {
    console.error('❌ Update failed:', error.message);
  }

  // Test 3: Retrieve chunks
  console.log('\nTest 3: Retrieve chunks');
  try {
    const getResponse = await fetch(`${BASE_URL}/api/chunks/get?chapterId=1&sectionId=intro`);
    const chunks = await getResponse.json();
    console.log('✅ Retrieved chunks:', chunks);
    console.log('Number of chunks found:', chunks.length);
  } catch (error) {
    console.error('❌ Retrieval failed:', error.message);
  }

  // Test 3b: Retrieve all chunks
  console.log('\nTest 3b: Retrieve all chunks');
  try {
    const getAllResponse = await fetch(`${BASE_URL}/api/chunks/get`);
    const allChunks = await getAllResponse.json();
    console.log('✅ All chunks:', allChunks);
    console.log('Total chunks found:', allChunks.length);
  } catch (error) {
    console.error('❌ All chunks retrieval failed:', error.message);
  }

  // Test 4: Test JSON parsing validation
  console.log('\nTest 4: Test broken JSON handling');
  try {
    const brokenResponse = await fetch(`${BASE_URL}/api/chunks/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chapterId: "2",
        sectionId: "test",
        content: "Test content"
        // Missing metadata - should still work
      })
    });

    const brokenResult = await brokenResponse.json();
    console.log('✅ No metadata response:', brokenResult);
  } catch (error) {
    console.error('❌ Broken test failed:', error.message);
  }

  console.log('\n🎉 All tests completed!');
}

testChunkEndpoints().catch(console.error);