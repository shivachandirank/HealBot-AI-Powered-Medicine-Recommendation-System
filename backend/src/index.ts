import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import analyzeRoutes from './routes/analyze.routes';
import generateRoutes from './routes/generate.routes';
import securityRoutes from './routes/security.routes';
import threatRoutes from './routes/threat.routes';
import docsRoutes from './routes/docs.routes';
import devopsRoutes from './routes/devops.routes';
import diagramRoutes from './routes/diagram.routes';
import forgeRoutes from './routes/forge.routes';
import { errorHandler } from './middleware/errorHandler.middleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// AI endpoint rate limiter (stricter)
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'AI request limit exceeded, please wait 1 minute.' },
});

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(compression());
app.use(morgan('dev'));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'SecureForge AI Backend',
  });
});

// Routes
app.use('/api/analyze', aiLimiter, analyzeRoutes);
app.use('/api/generate', aiLimiter, generateRoutes);
app.use('/api/security', aiLimiter, securityRoutes);
app.use('/api/threat', aiLimiter, threatRoutes);
app.use('/api/docs', docsRoutes);
app.use('/api/devops', aiLimiter, devopsRoutes);
app.use('/api/diagrams', diagramRoutes);
app.use('/api/forge', forgeRoutes); // Unified pipeline endpoint

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n🔐 SecureForge AI Backend running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 AI Provider: Groq (llama-3.3-70b-versatile)\n`);
});

export default app;
