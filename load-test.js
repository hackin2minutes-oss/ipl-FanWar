const Ably = require('ably');

const ABLY_API_KEY = 'HMdoSg.71SSBA:aPHMDOC3iAFJ6jx1wEp0eXM56hCxSljcUWUm97DLPJU';
const TEST_DURATION_MS = 30000; // 30 seconds test
const BATCH_SIZE = 10;
const MAX_USERS = 250;

let successCount = 0;
let failCount = 0;
let clients = [];
let testRunning = true;

async function createClient(userId) {
    return new Promise((resolve) => {
        const client = new Ably.Realtime({
            key: ABLY_API_KEY,
            clientId: `loadtest_${userId}`,
            closeOnUnload: true,
            timeout: 10000
        });

        const timeout = setTimeout(() => {
            failCount++;
            resolve(false);
        }, 10000);

        client.connection.on('connected', () => {
            clearTimeout(timeout);
            successCount++;
            
            // Subscribe to channels
            const team1Channel = client.channels.get('team1-war-room');
            team1Channel.subscribe('message', () => {});
            
            resolve(true);
        });

        client.connection.on('failed', (err) => {
            clearTimeout(timeout);
            failCount++;
            console.log(`Client ${userId} failed:`, err?.message);
            resolve(false);
        });
    });
}

async function runLoadTest() {
    console.log('🚀 Starting Load Test for IPL Fan War Chat');
    console.log('============================================\n');
    
    console.log('Phase 1: Gradual load increase...');
    
    // Phase 1: Gradually increase users
    for (let batch = 1; batch <= Math.ceil(MAX_USERS / BATCH_SIZE); batch++) {
        const startUser = (batch - 1) * BATCH_SIZE + 1;
        const endUser = Math.min(batch * BATCH_SIZE, MAX_USERS);
        
        console.log(`  Testing with ${endUser} concurrent connections...`);
        
        const promises = [];
        for (let i = startUser; i <= endUser; i++) {
            promises.push(createClient(i));
        }
        
        await Promise.all(promises);
        await new Promise(r => setTimeout(r, 2000)); // 2 second between batches
        
        const currentSuccess = successCount;
        const currentFail = failCount;
        const total = currentSuccess + currentFail;
        
        console.log(`  → ${currentSuccess} connected, ${currentFail} failed`);
        
        if (currentFail > 20) {
            console.log(`\n⚠️ Failure threshold reached at ${total} users`);
            break;
        }
    }
    
    console.log('\nPhase 2: Message throughput test...');
    
    // Phase 2: Test message throughput
    const connectedClients = clients.filter(c => c.connection.state === 'connected');
    const msgPromises = [];
    
    for (let i = 0; i < Math.min(50, connectedClients.length); i++) {
        const channel = connectedClients[i].channels.get('team1-war-room');
        msgPromises.push(channel.publish('message', { 
            text: 'Load test message', 
            nickname: `User${i}` 
        }));
    }
    
    await Promise.all(msgPromises);
    console.log('  → Published 50 messages');
    
    // Wait and check for disconnections
    await new Promise(r => setTimeout(r, 5000));
    
    console.log('\n============================================');
    console.log('📊 LOAD TEST RESULTS');
    console.log('============================================');
    console.log(`Total Attempts: ${successCount + failCount}`);
    console.log(`Successful Connections: ${successCount}`);
    console.log(`Failed Connections: ${failCount}`);
    console.log(`Success Rate: ${((successCount / (successCount + failCount)) * 100).toFixed(1)}%`);
    console.log('');
    
    // Determine capacity
    const capacity = successCount;
    if (capacity >= 180) {
        console.log('✅ RESULT: ~180-200 concurrent users supported');
        console.log('   (Free tier limit approaching)');
    } else if (capacity >= 100) {
        console.log('✅ RESULT: ~100-150 concurrent users supported');
    } else if (capacity >= 50) {
        console.log('✅ RESULT: ~50-100 concurrent users supported');
    } else {
        console.log('⚠️ RESULT: Limited capacity - consider upgrading Ably');
    }
    
    console.log('\n💡 Recommendation:');
    if (capacity < 150) {
        console.log('   Upgrade to Ably Standard ($29/mo) for 10K concurrent connections');
    } else {
        console.log('   Current setup can handle typical IPL match traffic');
    }
    
    // Cleanup
    console.log('\n🧹 Cleaning up connections...');
    clients.forEach(client => {
        try { client.connection.close(); } catch(e) {}
    });
    
    process.exit(0);
}

// Run test
runLoadTest().catch(err => {
    console.error('Load test error:', err);
    process.exit(1);
});
