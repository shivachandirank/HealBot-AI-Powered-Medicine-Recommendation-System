import { Router, Request, Response } from 'express';
import { generateStrideReport } from '../services/threat.service';
import type { AnalysisResult } from '../services/architecture.service';

const router = Router();

// POST /api/threat/stride - Generate STRIDE threat model
router.post('/stride', async (req: Request, res: Response): Promise<void> => {
  try {
    const analysis: AnalysisResult = req.body;
    if (!analysis?.projectName) {
      res.status(400).json({ error: 'Valid analysis result required' });
      return;
    }

    const report = await generateStrideReport(analysis);
    res.json({ success: true, data: report });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ error: err.message || 'Threat modeling failed' });
  }
});

export default router;
