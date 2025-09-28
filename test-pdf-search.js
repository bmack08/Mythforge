// Test PDF search functionality
const testPDFSearch = async () => {
    try {
        console.log('🔍 Testing PDF Search...\n');
        
        const response = await fetch('http://localhost:3000/api/pdf-search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: 'goblin'
            })
        });
        
        const data = await response.json();
        console.log('✅ PDF Search Response:');
        console.log('Success:', data.success);
        console.log('Message:', data.message?.substring(0, 200) + '...');
        console.log('Results found:', data.results?.length || 0);
        
        if (data.results && data.results.length > 0) {
            console.log('\nFirst result:');
            console.log('Source:', data.results[0].source);
            console.log('Content:', data.results[0].content?.substring(0, 100) + '...');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

testPDFSearch();