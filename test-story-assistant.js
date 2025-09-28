// Test script for Story IDE patch-based system
const testStoryIDE = async () => {
    try {
        console.log('🧪 Testing Story IDE Patch-Based System...\n');
        
        // Test 1: Chat mode (asking a question)
        console.log('Test 1: Chat Mode (Question)');
        console.log('Sending: "What elements make a good D&D encounter?"');
        
        let response = await fetch('http://localhost:3000/api/story-assistant', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'What elements make a good D&D encounter?',
                documentText: '',
                metadata: { title: 'Test Story' }
            })
        });
        
        let data = await response.json();
        console.log('✅ Response mode:', data.mode);
        console.log('📝 Message:', data.message?.substring(0, 200) + '...\n');
        
        // Test 2: Patch mode (adding content)
        console.log('Test 2: Patch Mode (Adding Content)');
        console.log('Sending: "Add an encounter with goblins to Chapter 1"');
        
        const sampleDocument = `# The Lost Mine
## Chapter 1: Goblin Ambush
The party travels down the Triboar Trail when they notice something amiss.

## Chapter 2: Cragmaw Hideout
The trail leads to a cave complex.`;

        response = await fetch('http://localhost:3000/api/story-assistant', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Add an encounter with goblins to Chapter 1',
                documentText: sampleDocument,
                metadata: { title: 'The Lost Mine', editId: 'test123' }
            })
        });
        
        data = await response.json();
        console.log('✅ Response mode:', data.mode);
        if (data.mode === 'patch') {
            console.log('📝 Explanation:', data.explanation);
            console.log('🔧 Patch preview:');
            console.log(data.patch?.substring(0, 300) + '...');
        } else {
            console.log('📝 Message:', data.message?.substring(0, 200) + '...');
        }
        
        console.log('\n✅ Story IDE tests completed!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
};

testStoryIDE();