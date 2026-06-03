import { Router, Request, Response } from 'express';

const router = Router();

// GET /api/docs/swagger - Return swagger spec from generated code
router.post('/swagger', async (req: Request, res: Response): Promise<void> => {
  try {
    const { swaggerSpec } = req.body;
    if (!swaggerSpec) {
      res.status(400).json({ error: 'swaggerSpec required' });
      return;
    }
    res.json({ success: true, data: { spec: swaggerSpec } });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ error: err.message });
  }
});

export default router;
