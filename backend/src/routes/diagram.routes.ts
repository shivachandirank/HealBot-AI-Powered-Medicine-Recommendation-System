import { Router, Request, Response } from 'express';
import { generateDiagrams } from '../services/diagram.service';
import type { AnalysisResult } from '../services/architecture.service';

const router = Router();

// POST /api/diagrams/generate - Generate all architecture diagrams
router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const analysis: AnalysisResult = req.body;
    if (!analysis?.projectName) {
      res.status(400).json({ error: 'Valid analysis result required' });
      return;
    }

    const diagrams = generateDiagrams(analysis);
    res.json({ success: true, data: diagrams });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ error: err.message || 'Diagram generation failed' });
  }
});

export default router;
