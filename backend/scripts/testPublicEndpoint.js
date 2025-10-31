import axios from 'axios';

async function testPublic() {
  try {
    console.log('🧪 Testing public suggestions endpoint...\n');
    
    const response = await axios.get('http://localhost:5000/api/suggestions/public');
    console.log('Response structure:');
    console.log(JSON.stringify(response.data, null, 2));
    
    const data = response.data.data;
    console.log('\n📊 Data analysis:');
    console.log('- data type:', typeof data);
    console.log('- data.data exists:', !!data?.data);
    console.log('- Is array:', Array.isArray(data));
    
    if (data?.data) {
      console.log('- data.data is array:', Array.isArray(data.data));
      console.log('- data.data length:', data.data.length);
    }
    
    if (Array.isArray(data)) {
      console.log('- Direct array length:', data.length);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testPublic();

