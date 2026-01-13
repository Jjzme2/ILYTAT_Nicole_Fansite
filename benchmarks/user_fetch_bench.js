
import { performance } from 'perf_hooks';

// Simulate a User document
const createMockUser = (id) => ({
    id: `user_${id}`,
    data: () => ({
        email: `user${id}@example.com`,
        role: 'user',
        isSubscriber: Math.random() > 0.5,
        createdAt: new Date(),
        // Add some "weight" to the object to simulate real data
        profile: {
            bio: "Lorem ipsum dolor sit amet ".repeat(10),
            avatar: "https://example.com/avatar.jpg",
            settings: { theme: 'dark', notifications: true }
        }
    })
});

// Mock Firestore Snapshot
const createMockSnapshot = (count) => {
    const docs = [];
    for (let i = 0; i < count; i++) {
        docs.push(createMockUser(i));
    }
    return { docs };
};

async function runBenchmark() {
    console.log('--- ⚡ Performance Benchmark: User Fetch Processing ---');

    // Scenario 1: Unbounded Fetch (Current Implementation)
    // Simulating fetching 5000 users (a reasonable "bad case" for an admin dashboard over time)
    const LARGE_DATASET_SIZE = 5000;
    console.log(`\nScenario 1: Unbounded Fetch (${LARGE_DATASET_SIZE} users)`);

    const startMemory1 = process.memoryUsage().heapUsed;
    const start1 = performance.now();

    // 1. Simulate Network Latency + Data Transfer (simulated delay proportional to size)
    // We assume ~0.1ms per record for transfer/parsing overhead in a real network scenario
    // This is just a rough proxy for the "blocking" nature of large payloads
    await new Promise(r => setTimeout(r, LARGE_DATASET_SIZE * 0.05));

    // 2. Simulate Client-side Processing (The actual code in admin.vue)
    const snapshot1 = createMockSnapshot(LARGE_DATASET_SIZE);
    const userList1 = snapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const end1 = performance.now();
    const endMemory1 = process.memoryUsage().heapUsed;

    const time1 = end1 - start1;
    const memory1 = (endMemory1 - startMemory1) / 1024 / 1024; // MB

    console.log(`Time: ${time1.toFixed(2)} ms`);
    console.log(`Memory Delta: ${memory1.toFixed(2)} MB`);
    console.log(`Processed Items: ${userList1.length}`);


    // Scenario 2: Paginated Fetch (Optimized Implementation)
    const PAGE_SIZE = 20;
    console.log(`\nScenario 2: Paginated Fetch (${PAGE_SIZE} users)`);

    const startMemory2 = process.memoryUsage().heapUsed;
    const start2 = performance.now();

    // 1. Simulate Network Latency + Data Transfer
    await new Promise(r => setTimeout(r, PAGE_SIZE * 0.05));

    // 2. Simulate Client-side Processing
    const snapshot2 = createMockSnapshot(PAGE_SIZE);
    const userList2 = snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const end2 = performance.now();
    const endMemory2 = process.memoryUsage().heapUsed;

    const time2 = end2 - start2;
    const memory2 = (endMemory2 - startMemory2) / 1024 / 1024; // MB

    console.log(`Time: ${time2.toFixed(2)} ms`);
    console.log(`Memory Delta: ${memory2.toFixed(2)} MB`);
    console.log(`Processed Items: ${userList2.length}`);

    // Comparison
    console.log('\n--- 📊 Results ---');
    console.log(`Speed Improvement: ${(time1 / time2).toFixed(1)}x faster`);
    console.log(`Memory Reduction: ${(1 - (memory2/memory1)).toFixed(1)}% (Approximate)`); // Can be noisy in JS
}

runBenchmark();
