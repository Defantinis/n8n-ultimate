import express from 'express';
import aiServiceRouter from './api/ai-service.js';

const app = express();
const port = 3000;

app.use(express.json());

// Simple root endpoint
app.get('/', (req, res) => {
  res.send('n8n-ultimate AI service is running.');
});

// Use the AI service router
app.use(aiServiceRouter);

app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
}); 