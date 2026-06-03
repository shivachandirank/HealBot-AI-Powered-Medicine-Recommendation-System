import { Router } from 'express';
import multer from 'multer';
import {
  createProject,
  uploadUml,
  getProject,
  listProjects,
  generateArchitecture,
  getArchitecture,
  getSecurityReport,
  getThreatModel,
  getApiDocs,
  getDevOps,
  getDiagrams,
  downloadProject,
} from '../controllers/projectController';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', listProjects);
router.post('/', createProject);
router.post('/upload', upload.single('diagram'), uploadUml);
router.get('/:id', getProject);
router.post('/:id/generate', generateArchitecture);
router.get('/:id/architecture', getArchitecture);
router.get('/:id/security', getSecurityReport);
router.get('/:id/threats', getThreatModel);
router.get('/:id/api-docs', getApiDocs);
router.get('/:id/devops', getDevOps);
router.get('/:id/diagrams', getDiagrams);
router.get('/:id/download', downloadProject);

export default router;
