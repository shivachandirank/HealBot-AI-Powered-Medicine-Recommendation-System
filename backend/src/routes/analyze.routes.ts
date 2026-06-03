import { Router, Request, Response } from 'express';
import multer from 'multer';
import { analyzeRequirements } from '../services/architecture.service';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'text/plain'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// POST /api/analyze/text - Analyze text requirements
router.post('/text', async (req: Request, res: Response): Promise<void> => {
  try {
    const { requirements } = req.body;
    if (!requirements || typeof requirements !== 'string') {
      res.status(400).json({ error: 'requirements field is required (string)' });
      return;
    }
    if (requirements.length < 50) {
      res.status(400).json({ error: 'Requirements must be at least 50 characters' });
      return;
    }

    const result = await analyzeRequirements(requirements, 'text');
    res.json({ success: true, data: result });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

// POST /api/analyze/uml - Analyze UML diagram (image + optional description)
router.post('/uml', upload.single('diagram'), async (req: Request, res: Response): Promise<void> => {
  try {
    const description = req.body?.description || '';
    const fileBuffer = req.file?.buffer;

    // Since Groq doesn't support vision, we use the text description
    const input = fileBuffer
      ? `UML Diagram Analysis Request:\n${description || 'Extract all entities, relationships, and workflows from this UML diagram.'}\n\nFile: ${req.file?.originalname || 'diagram'}`
      : description;

    if (!input.trim()) {
      res.status(400).json({ error: 'Either upload a diagram or provide a description' });
      return;
    }

    const result = await analyzeRequirements(input, 'uml');
    res.json({ success: true, data: result });
  } catch (error: unknown) {
    const err = error as Error;
    res.status(500).json({ error: err.message || 'UML analysis failed' });
  }
});

export default router;
