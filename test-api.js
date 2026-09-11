// Quick API endpoint test
const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function testEndpoints() {
    console.log('🧪 Testing CAPSTACK API Endpoints\n');

    const tests = [
        {
            name: 'Health Check',
            url: `${BASE_URL}/health`,
            method: 'GET',
        },
        {
            name: 'Salary Prediction (5 years)',
            url: `${BASE_URL}/api/insights/salary-prediction?experience=5`,
            method: 'GET',
        },
        {
            name: 'Career Stability',
            url: `${BASE_URL}/api/insights/career-stability?age=30&industry=IT&profession=Developer`,
            method: 'GET',
        },
        {
            name: 'Portfolio Recommendations',
            url: `${BASE_URL}/api/insights/portfolio-recommendations?riskProfile=moderate`,
            method: 'GET',
        },
        {
            name: 'Stock Data',
            url: `${BASE_URL}/api/insights/stock-data?limit=10`,
            method: 'GET',
        },
        {
            name: 'Benefits Stats',
            url: `${BASE_URL}/api/insights/benefits-comparison`,
            method: 'GET',
        },
        {
            name: 'Insights Summary',
            url: `${BASE_URL}/api/insights/summary`,
            method: 'GET',
        },
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        try {
            const response = await axios.get(test.url, { timeout: 5000 });

            if (response.status === 200) {
                console.log(`✓ PASS: ${test.name}`);
                console.log(`  Status: ${response.status}`);
                if (response.data.success !== undefined) {
                    console.log(`  Success: ${response.data.success}`);
                }
                passed++;
            } else {
                console.log(`✗ FAIL: ${test.name} - Status ${response.status}`);
                failed++;
            }
        } catch (error) {
            console.log(`✗ FAIL: ${test.name}`);
            if (error.code === 'ECONNREFUSED') {
                console.log(`  Error: Server not running`);
            } else {
                console.log(`  Error: ${error.message}`);
            }
            failed++;
        }
        console.log('');
    }

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
    process.exit(failed > 0 ? 1 : 0);
}

testEndpoints();
