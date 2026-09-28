export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'AI Requirements Quality Checker API',
    version: '1.0.0',
    description: 'API for evaluating software requirements readiness and testability using Google Gemini AI or local heuristic analysis.'
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local development server'
    }
  ],
  paths: {
    '/api/health': {
      get: {
        summary: 'Health check and AI status',
        description: 'Checks backend status and whether an AI provider (e.g. Gemini) is configured.',
        responses: {
          '200': {
            description: 'Backend status and configuration info',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean', example: true },
                    aiConfigured: { type: 'boolean', example: true },
                    provider: { type: 'string', example: 'gemini' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/analyze': {
      post: {
        summary: 'Analyze requirement text',
        description: 'Evaluates requirement clarity, missing details, testability, acceptance criteria, and improved wording.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['requirement'],
                properties: {
                  requirement: {
                    type: 'string',
                    description: 'The requirement text to evaluate (at least 10 characters).',
                    example: 'Managers must be able to export monthly financial reports as CSV files with date filtering.'
                  }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Detailed requirement quality analysis',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    score: { type: 'integer', example: 88 },
                    status: {
                      type: 'string',
                      enum: ['Ready', 'Needs Minor Clarification', 'Needs Clarification'],
                      example: 'Ready'
                    },
                    summary: { type: 'string', example: 'The requirement is well-defined with clear actor and output format.' },
                    strengths: {
                      type: 'array',
                      items: { type: 'string' },
                      example: ['Target user / role', 'Clear action / capability', 'Output / format']
                    },
                    missingInformation: {
                      type: 'array',
                      items: { type: 'string' },
                      example: ['Limits / constraints', 'Failure / error behavior']
                    },
                    ambiguities: {
                      type: 'array',
                      items: { type: 'string' },
                      example: []
                    },
                    clarificationQuestions: {
                      type: 'array',
                      items: { type: 'string' },
                      example: ['What should happen if the report export exceeds 50,000 rows?']
                    },
                    acceptanceCriteria: {
                      type: 'array',
                      items: { type: 'string' },
                      example: [
                        'Given a logged-in manager, when they choose a date range and click export, then a CSV file is generated.'
                      ]
                    },
                    improvedRequirement: {
                      type: 'string',
                      example: 'Managers must be able to export monthly financial reports as CSV files with date filtering. Define maximum report row limit and error feedback if export fails.'
                    },
                    mode: { type: 'string', example: 'ai' },
                    provider: { type: 'string', example: 'gemini' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Invalid input (e.g. requirement too short)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string', example: 'Please enter a requirement with at least 10 characters.' }
                  }
                }
              }
            }
          },
          '500': {
            description: 'Server or AI error',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    error: { type: 'string', example: 'Analysis failed. Check the backend console/API configuration, or remove the API key to use demo mode.' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
