cd ..
cd backend

start cmd /k "npx jest --config jest.config.ts"
start cmd /k "npx jest --config jest-e2e.json"