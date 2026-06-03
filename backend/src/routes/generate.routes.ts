import { Router, Request, Response } from 'express';
import { generateFullArchitecture } from '../services/generator.service';
import type { AnalysisResult } from '../services/architecture.service';

const router = Router();

// POST /api/generate/architecture - Generate full architecture from analysis
router.post('/architecture', async (req: Request, res: Response): Promise<void> => {
  try {
    const analysis: AnalysisResult = req.body;

    if (!analysis?.projectName || !analysis?.entities) {
      res.status(400).json({ error: 'Valid analysis result required (run /api/analyze first)' });
      return;
    }

    const generated = await generateFullArchitecture(analysis);
    res.json({ success: true, data: generated });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ error: err.message || 'Code generation failed' });
  }
});

export default router;
