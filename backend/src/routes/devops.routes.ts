import { Router, Request, Response } from 'express';
import { generateDevOpsBundle } from '../services/devops.service';
import type { AnalysisResult } from '../services/architecture.service';

const router = Router();

// POST /api/devops/generate - Generate DevOps bundle
router.post('/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const analysis: AnalysisResult = req.body;
    if (!analysis?.projectName) {
      res.status(400).json({ error: 'Valid analysis result required' });
      return;
    }

    const bundle = await generateDevOpsBundle(analysis);
    res.json({ success: true, data: bundle });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ error: err.message || 'DevOps generation failed' });
  }
});

export default router;
