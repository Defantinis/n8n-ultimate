# Deployment Strategy (CI/CD)

This document outlines the Continuous Integration and Continuous Deployment (CI/CD) strategy for the n8n Ultimate project, using GitHub Actions.

## Overview

The CI/CD pipeline is designed to automate the process of testing, building, and deploying the application. This ensures that every change is automatically validated, reducing the risk of introducing bugs into production.

The pipeline is triggered on every push to the `main` branch and on every pull request targeting `main`.

## Pipeline Stages

The pipeline consists of the following stages, executed in sequence:

### 1. Setup

- **Action**: Checks out the repository's code.
- **Action**: Sets up the Node.js environment.
- **Action**: Caches npm dependencies to speed up subsequent runs.
- **Action**: Installs project dependencies using `npm install`.

### 2. Lint

- **Action**: Runs the linter (`npm run lint`) to check for code quality and style issues.
- **Purpose**: Ensures code consistency and catches potential errors early.

### 3. Test

- **Action**: Runs the test suite (`npm run test`) which includes unit and integration tests.
- **Purpose**: Verifies that the application's logic is correct and that all components work together as expected.

### 4. Build

- **Action**: Compiles the TypeScript code into JavaScript (`npm run build`).
- **Purpose**: Prepares the application for deployment.

### 5. Deploy (Placeholder)

- **Action**: This stage is a placeholder for the actual deployment steps.
- **Purpose**: In a real-world scenario, this stage would deploy the built application to a hosting environment (e.g., AWS, Vercel, a container registry).
- **Example Steps**:
    - Build and push a Docker image.
    - Deploy to a cloud provider like AWS Elastic Beanstalk.
    - Publish the package to npm.

## Health Monitoring

To ensure the application is running correctly in production, a health check endpoint is provided. This endpoint can be used by load balancers, container orchestrators (like Kubernetes), or uptime monitoring services.

### Endpoint

- **Path**: `/api/healthz`
- **Method**: `GET`

### Responses

- **Success (200 OK)**: Indicates that the application is running correctly.
  ```json
  {
    "status": "ok",
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
  ```

- **Error (503 Service Unavailable)**: Indicates that the application is not healthy.
  ```json
  {
    "status": "error",
    "message": "Service is unavailable.",
    "error": "Details about the error."
  }
  ```

### Implementation

The logic for this endpoint is located in `src/api/health-check.ts`. Here is an example of how to integrate it into an Express.js server:

```typescript
import express from 'express';
import { handleHealthCheck } from './src/api/health-check';

const app = express();
const port = 3000;

app.get('/api/healthz', handleHealthCheck);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
```

## Example GitHub Actions Workflow

Here is an example of the GitHub Actions workflow file that should be placed in `.github/workflows/ci.yml`.

```yaml
name: n8n Ultimate CI/CD

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
    - name: Checkout repository
      uses: actions/checkout@v3

    - name: Set up Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}

    - name: Cache npm dependencies
      uses: actions/cache@v3
      with:
        path: ~/.npm
        key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
        restore-keys: |
          ${{ runner.os }}-node-

    - name: Install dependencies
      run: npm install

    - name: Run linter
      run: npm run lint

    - name: Run tests
      run: npm run test

    - name: Build project
      run: npm run build

    - name: Deploy (Placeholder)
      if: github.ref == 'refs/heads/main' && github.event_name == 'push'
      run: echo "Deploying to production..."
``` 