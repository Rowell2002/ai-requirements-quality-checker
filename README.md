# RequirementReady AI

A 1-hour-demo-friendly AI Requirements Quality Checker with separate Node.js backend and React frontend.

## What it does
- Scores requirement readiness (0-100)
- Highlights missing information and ambiguity
- Generates clarification questions
- Suggests acceptance criteria
- Rewrites the requirement into a stronger version
- Runs immediately in deterministic **Demo Mode** with no external credentials
- Optionally uses an OpenAI-compatible configured API via the backend

## Folder structure
```text
ai-requirements-quality-checker/
├── backend/
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── analyzer.js
│       └── server.js
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       └── styles.css
├── .gitignore
├── package.json
└── README.md
```

## Fastest setup
Prerequisite: Node.js 18+.

### Terminal 1 - backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```
Backend runs on http://localhost:5000.

### Terminal 2 - frontend
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173.

## Optional AI mode
Edit `backend/.env`:
```env
OPENAI_API_KEY=your-key-here
OPENAI_MODEL=gpt-4o-mini
PORT=5000
```
Restart backend. If no key is configured, the tool intentionally uses local Demo Mode so your pitch is not dependent on internet/API availability.

## Demo script
1. Select **Vague**: `Users should be able to export reports.`
2. Click **Review Requirement**.
3. Show low readiness, missing permission/format/limits, and clarification questions.
4. Select **Detailed** and run again.
5. Show the improved score and explain the before/after effect.
6. Click **Copy** to copy the improved requirement and acceptance criteria.

## Production next steps
- Connect Azure DevOps/Jira work items.
- Add organization-specific Definition of Ready rules.
- Store review history and measure score improvement/rework reduction.
- Add authentication and enterprise-approved model/provider.

## Note
The readiness score is an assistive heuristic/AI output and should not be treated as a formal approval gate without team-defined rules and human review.
