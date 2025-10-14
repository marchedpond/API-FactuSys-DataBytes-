// setup.js for Jest
// Load environment variables and basic test configuration

require('dotenv').config({ path: './.env' });

// Increase default timeout for slow operations (if needed)
jest.setTimeout(20000);

// Optional: silence console logs during tests
// const originalConsole = console.log;
// beforeAll(() => { console.log = () => {}; });
// afterAll(() => { console.log = originalConsole; });
