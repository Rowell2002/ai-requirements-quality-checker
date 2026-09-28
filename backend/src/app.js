import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './swagger.js';
import { localAnalyze } from './analyzer.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: '100kb' }));

// Swagger UI documentation
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/swagger.json', (_req, res) => res.json(swaggerDocument));

const healthHandler = (_req, res) => {
  const aiConfigured = Boolean(process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);
  const provider = process.env.GEMINI_API_KEY ? 'gemini' : (process.env.OPENAI_API_KEY ? 'openai' : 'demo');
  res.json({ ok: true, aiConfigured, provider });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);

const systemPrompt = `You are a senior business analyst reviewing software requirements. Return ONLY valid JSON. Do not invent business facts. Score requirement readiness from 0-100 based on clarity, actor, action, permissions, conditions, limits, errors, and testability. Schema: {"score":number,"status":"Ready|Needs Minor Clarification|Needs Clarification","summary":string,"strengths":string[],"missingInformation":string[],"ambiguities":string[],"clarificationQuestions":string[],"acceptanceCriteria":string[],"improvedRequirement":string}. Keep arrays max 6 items and language concise.`;

const analyzeHandler = async (req, res) => {
  try {
    const requirement = String(req.body?.requirement || '').trim();
    if (requirement.length < 10) {
      return res.status(400).json({ error: 'Please enter a requirement with at least 10 characters.' });
    }

    if (process.env.GEMINI_API_KEY) {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
      let response;
      try {
        response = await ai.models.generateContent({
          model,
          contents: `Review this requirement:\n${requirement}`,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        });
      } catch (geminiErr) {
        if (model !== 'gemini-3.5-flash') {
          console.warn(`Model ${model} failed (${geminiErr.message}). Falling back to gemini-3.5-flash...`);
          response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: `Review this requirement:\n${requirement}`,
            config: {
              systemInstruction: systemPrompt,
              responseMimeType: 'application/json',
              temperature: 0.2
            }
          });
        } else {
          throw geminiErr;
        }
      }

      const responseText = response.text?.trim() || '{}';
      const cleanedJson = responseText.replace(/^```json\s*/i, '').replace(/\s*```$/, '');
      const data = JSON.parse(cleanedJson);
      return res.json({ ...data, mode: 'ai', provider: 'gemini' });
    }

    if (process.env.OPENAI_API_KEY) {
      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.2,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Review this requirement:\n${requirement}` }
        ]
      });
      const data = JSON.parse(completion.choices[0].message.content);
      return res.json({ ...data, mode: 'ai', provider: 'openai' });
    }

    return res.json(localAnalyze(requirement));
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Analysis failed. Check the backend console/API configuration, or remove the API key to use demo mode.'
    });
  }
};

app.post('/api/analyze', analyzeHandler);
app.post('/analyze', analyzeHandler);

export default app;
