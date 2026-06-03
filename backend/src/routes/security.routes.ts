import { Router, Request, Response } from 'express';
import { auditSecurity, generateSecurityCode } from '../services/security.service';
import type { GeneratedCode } from '../services/generator.service';

const router = Router();

// POST /api/security/audit - Run security audit on generated code
router.post('/audit', async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, projectDescription } = req.body as {
      code: GeneratedCode;
      projectDescription: string;
    };

    if (!code) {
      res.status(400).json({ error: 'Generated code required' });
      return;
    }

    const result = await auditSecurity(code, projectDescription || 'Node.js application');
    res.json({ success: true, data: result });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ error: err.message || 'Security audit failed' });
  }
});

// GET /api/security/generate - Generate security utilities code
router.post('/generate', async (_req: Request, res: Response): Promise<void> => {
  try {
    const securityCode = await generateSecurityCode();
    res.json({ success: true, data: securityCode });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ error: err.message || 'Security code generation failed' });
  }
});

export default router;
