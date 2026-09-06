const resumeData = { 
  experience: [{ id: 'e1' }], 
  projects: [{ id: 'p1', included: true }, { id: 'p2', included: false }] 
};

function simulateBackendSanitization(parsedResponse) {
  const validExpIds = new Set((resumeData.experience || []).map(e => e.id));
  const validProjIds = new Set((resumeData.projects || []).filter(p => p.included).map(p => p.id));
  
  if (Array.isArray(parsedResponse.suggestions)) {
    parsedResponse.suggestions = parsedResponse.suggestions.filter(s => {
      if (!['summary', 'experience', 'projects'].includes(s.section)) return false;
      if (!['high', 'medium', 'low', 'info'].includes(s.severity)) return false;
      if (typeof s.issue !== 'string' || typeof s.recommendation !== 'string') return false;
      if (typeof s.originalText !== 'string' || typeof s.suggestedText !== 'string') return false;
      
      if (s.section === 'summary') {
        if (s.itemId !== 'summary' && s.itemId !== null) return false;
      } else if (s.section === 'experience') {
        if (typeof s.itemId !== 'string' || !validExpIds.has(s.itemId)) return false;
      } else if (s.section === 'projects') {
        if (typeof s.itemId !== 'string' || !validProjIds.has(s.itemId)) return false;
      }
      return true;
    });
  }
  return parsedResponse.suggestions.length;
}

function t(name, section, itemId) {
  const count = simulateBackendSanitization({
    suggestions: [{ section, itemId, severity: 'low', issue: 'a', recommendation: 'b', originalText: 'c', suggestedText: 'd' }]
  });
  console.log(name, count > 0 ? 'PASS' : 'FAIL');
}

console.log('--- ITEM ID SECURITY TESTS ---');
t('1. valid project ID', 'projects', 'p1');
t('2. valid experience ID', 'experience', 'e1');

const c3 = simulateBackendSanitization({ suggestions: [{ section: 'projects', itemId: 'fake', severity: 'low', issue: 'a', recommendation: 'b', originalText: 'c', suggestedText: 'd' }] });
console.log('3. fake ID', c3 === 0 ? 'PASS' : 'FAIL');

const c4 = simulateBackendSanitization({ suggestions: [{ section: 'experience', itemId: 'p1', severity: 'low', issue: 'a', recommendation: 'b', originalText: 'c', suggestedText: 'd' }] });
console.log('4. project ID supplied to exp', c4 === 0 ? 'PASS' : 'FAIL');

const c5 = simulateBackendSanitization({ suggestions: [{ section: 'projects', itemId: 'e1', severity: 'low', issue: 'a', recommendation: 'b', originalText: 'c', suggestedText: 'd' }] });
console.log('5. exp ID supplied to project', c5 === 0 ? 'PASS' : 'FAIL');

const c6 = simulateBackendSanitization({ suggestions: [{ section: 'summary', itemId: null, severity: 'low', issue: 'a', recommendation: 'b', originalText: 'c', suggestedText: 'd' }] });
console.log('6. null ID', c6 === 1 ? 'PASS' : 'FAIL'); // Summary accepts null

const c7 = simulateBackendSanitization({ suggestions: [{ section: 'projects', itemId: 123, severity: 'low', issue: 'a', recommendation: 'b', originalText: 'c', suggestedText: 'd' }] });
console.log('7. numeric ID', c7 === 0 ? 'PASS' : 'FAIL');

const c8 = simulateBackendSanitization({ suggestions: [{ section: 'projects', itemId: 'p2', severity: 'low', issue: 'a', recommendation: 'b', originalText: 'c', suggestedText: 'd' }] });
console.log('8. excluded project ID', c8 === 0 ? 'PASS' : 'FAIL');
