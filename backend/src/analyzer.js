const checks = [
  { key: 'actor', label: 'Target user / role', re: /\b(user|users|admin|manager|employee|customer|agent|developer|qa|role)\b/i, q: 'Which user roles can perform this action?' },
  { key: 'action', label: 'Clear action / capability', re: /\b(can|should|must|able to|allow|create|export|update|delete|view|send|approve|assign|login|log in)\b/i, q: 'What exact action must the user be able to perform?' },
  { key: 'format', label: 'Output / format', re: /\b(csv|excel|xlsx|pdf|json|email|report|file|screen|dashboard)\b/i, q: 'What output format or result is expected?' },
  { key: 'permission', label: 'Permissions / authorization', re: /\b(permission|role|admin|manager|authorized|access|restricted)\b/i, q: 'Who is allowed and not allowed to use this feature?' },
  { key: 'limit', label: 'Limits / constraints', re: /\b(max|maximum|minimum|limit|up to|timeout|size|records|mb|seconds|minutes)\b/i, q: 'Are there volume, size, performance, or timeout limits?' },
  { key: 'condition', label: 'Conditions / filters', re: /\b(filter|filtered|when|if|only|selected|date range|status)\b/i, q: 'What conditions or filters should affect the behavior?' },
  { key: 'error', label: 'Failure / error behavior', re: /\b(error|fail|failure|invalid|unavailable|message|retry)\b/i, q: 'What should happen when the operation fails or input is invalid?' },
  { key: 'success', label: 'Testable success outcome', re: /\b(display|download|receive|created|saved|generated|assigned|redirect|success|successfully)\b/i, q: 'What observable result proves the requirement is complete?' }
];

export function localAnalyze(requirement) {
  const text = requirement.trim();
  const assessed = checks.map(c => ({...c, present: c.re.test(text)}));
  const present = assessed.filter(x => x.present);
  const missing = assessed.filter(x => !x.present);
  const specificityBonus = Math.min(16, Math.floor(text.length / 35) * 4);
  const score = Math.min(96, Math.max(18, Math.round((present.length / checks.length) * 80 + specificityBonus)));
  const status = score >= 80 ? 'Ready' : score >= 60 ? 'Needs Minor Clarification' : 'Needs Clarification';
  const questions = missing.slice(0, 5).map(x => x.q);
  const ambiguities = [];
  if (/\b(fast|quick|easy|user-friendly|appropriate|etc\.?|some|maybe|probably)\b/i.test(text)) ambiguities.push('Contains subjective or vague wording that is not directly testable.');
  if (!/[.!?]$/.test(text)) ambiguities.push('The requirement reads like a note rather than a finalized, testable statement.');
  if (text.length < 55) ambiguities.push('The requirement is very short and may omit important business rules or edge cases.');
  if (!ambiguities.length && missing.length) ambiguities.push('Core intent is understandable, but important implementation-independent business details are missing.');
  const actor = /\b(managers?|admins?|employees?|customers?|users?)\b/i.exec(text)?.[0] || 'authorized user';
  const acceptanceCriteria = [
    `Given an ${actor}, when the requested action is performed, then the expected business outcome is produced successfully.`,
    missing.some(x=>x.key==='permission') ? 'Access is allowed only for explicitly authorized roles.' : 'The stated role and access rules are enforced.',
    missing.some(x=>x.key==='error') ? 'If the operation cannot be completed, the user receives a clear and actionable error message.' : 'Defined failure behavior is handled consistently.',
    missing.some(x=>x.key==='condition') ? 'Any applicable filters or conditions are preserved and applied to the result.' : 'The stated conditions and filters are honored.'
  ];
  return {
    mode: 'demo', score, status,
    summary: score >= 80 ? 'The requirement is reasonably testable, with only limited clarification needed.' : 'The intent is understandable, but missing details could create developer, QA, or stakeholder rework.',
    strengths: present.slice(0,4).map(x => x.label),
    missingInformation: missing.slice(0,6).map(x => x.label),
    ambiguities: ambiguities.slice(0,4),
    clarificationQuestions: questions,
    acceptanceCriteria,
    improvedRequirement: buildImproved(text, missing)
  };
}

function buildImproved(text, missing) {
  const additions = [];
  if (missing.some(x=>x.key==='permission')) additions.push('Only explicitly authorized roles should have access.');
  if (missing.some(x=>x.key==='condition')) additions.push('The result should respect any filters or selections active when the action is performed.');
  if (missing.some(x=>x.key==='limit')) additions.push('Define an agreed maximum volume and acceptable processing time before implementation.');
  if (missing.some(x=>x.key==='error')) additions.push('If processing fails, show a clear error without creating a partial or duplicate result.');
  return `${text.replace(/[.\s]+$/, '')}. ${additions.join(' ')}`.trim();
}
