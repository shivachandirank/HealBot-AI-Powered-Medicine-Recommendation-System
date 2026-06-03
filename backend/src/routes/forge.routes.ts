import { Router, Request, Response } from 'express';
import { analyzeRequirements } from '../services/architecture.service';
import { generateFullArchitecture } from '../services/generator.service';
import { auditSecurity } from '../services/security.service';
import { generateStrideReport } from '../services/threat.service';
import { generateDevOpsBundle } from '../services/devops.service';
import { generateDiagrams } from '../services/diagram.service';
import { aiDelay } from '../services/ai.service';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

/**
 * POST /api/forge/run
 * Single endpoint that runs the complete pipeline sequentially:
 * analyze → generate → security → STRIDE → devops → diagrams
 * Uses Server-Sent Events (SSE) to stream progress back to the client.
 */
router.post('/run', upload.single('diagram'), async (req: Request, res: Response): Promise<void> => {
  // Set up SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const { requirements, inputType = 'text', umlDescription = '' } = req.body;

    // --- Step 1: Analyze ---
    send('progress', { step: 'analyze', message: 'Analyzing requirements with AI...' });
    const input = inputType === 'uml'
      ? `UML Analysis: ${umlDescription || requirements}`
      : requirements;

    if (!input || input.trim().length < 20) {
      send('error', { message: 'Requirements too short (min 20 characters)' });
      res.end(); return;
    }

    const analysis = await analyzeRequirements(input, inputType as 'text' | 'uml');
    send('step_done', { step: 'analyze', data: analysis });

    await aiDelay(2500); // Breathe between steps

    // --- Step 2: Generate Code ---
    send('progress', { step: 'generate', message: 'Generating backend architecture...' });
    const code = await generateFullArchitecture(analysis);
    send('step_done', { step: 'generate', data: code });

    await aiDelay(3000); // Longer pause before security audit

    // --- Step 3: Security Audit ---
    send('progress', { step: 'security', message: 'Running security audit...' });
    let securityAudit = null;
    try {
      securityAudit = await auditSecurity(code, analysis.description);
      send('step_done', { step: 'security', data: securityAudit });
    } catch (e) {
      send('step_warning', { step: 'security', message: `Security audit skipped: ${(e as Error).message}` });
    }

    await aiDelay(3000);

    // --- Step 4: STRIDE Threat Model ---
    send('progress', { step: 'stride', message: 'Building STRIDE threat model...' });
    let strideReport = null;
    try {
      strideReport = await generateStrideReport(analysis);
      send('step_done', { step: 'stride', data: strideReport });
    } catch (e) {
      send('step_warning', { step: 'stride', message: `STRIDE skipped: ${(e as Error).message}` });
    }

    await aiDelay(3000);

    // --- Step 5: DevOps ---
    send('progress', { step: 'devops', message: 'Generating DevOps configurations...' });
    let devops = null;
    try {
      devops = await generateDevOpsBundle(analysis);
      send('step_done', { step: 'devops', data: devops });
    } catch (e) {
      send('step_warning', { step: 'devops', message: `DevOps generation skipped: ${(e as Error).message}` });
    }

    // --- Step 6: Diagrams (no AI, instant) ---
    send('progress', { step: 'diagrams', message: 'Generating architecture diagrams...' });
    const diagrams = generateDiagrams(analysis);
    send('step_done', { step: 'diagrams', data: diagrams });

    // --- Done ---
    send('done', { message: 'Pipeline complete!' });

  } catch (err) {
    const message = (err as Error).message || 'Pipeline failed';
    console.error('[ForgeRoute] Error:', message);
    send('error', { message });
  } finally {
    res.end();
  }
});

export default router;
