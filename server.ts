import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { analyzeStudyPatterns } from './src/server/aiAnalysisService.ts';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// API route
app.post('/api/analyze-habits', async (req, res) => {
  try {
    const sessions = req.body.sessions || [];
    const analysis = await analyzeStudyPatterns(sessions);
    res.json(analysis);
  } catch (err: unknown) {
    console.error('Server error in /api/analyze-habits:', err);
    res.status(500).json({ error: err instanceof Error ? err.message : 'Server error' });
  }
});

// Serve static frontend files in production
app.use(express.static(path.resolve(process.cwd(), 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
});

if (process.env.NODE_ENV === 'production') {
  app.listen(port, () => {
    console.log(`FOCO 25 fullstack server running on port ${port}`);
  });
}

export default app;
