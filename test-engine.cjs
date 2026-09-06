const fs = require('fs');
const tsCode = fs.readFileSync('./src/utils/resume/jobMatchEngine.ts', 'utf8');
const jsCode = tsCode.replace(/import type.*?;/g, '')
  .replace(/export interface[\s\S]*?}/g, '')
  .replace(/export function/g, 'function')
  .replace(/: [a-zA-Z\[\]<>'| ]+/g, '')
  .replace(/ as const/g, '')
  .replace(/\?: /g, ': ');

try {
  eval(jsCode);
} catch (e) {
  console.log('Eval error:', e);
}

const TEST_A_JD = "Frontend Developer. React, TypeScript, JavaScript, HTML, CSS.";
const TEST_A_RESUME = { summary: 'Frontend Developer', skills: ['React', 'TypeScript', 'JavaScript', 'HTML', 'CSS'], projects: [{name: 'Web', description: 'React', included: true}] };
console.log("TEST A - Strong Match:", calculateJobMatch(TEST_A_RESUME, TEST_A_JD).score > 80 ? 'PASS' : 'FAIL');

const TEST_B_JD = "Cloud Engineer. AWS, Docker, Kubernetes, Terraform.";
const TEST_B_RESUME = { summary: 'Cloud Engineer', skills: ['React', 'TypeScript', 'Figma'], projects: [{name: 'Web', description: 'Frontend', included: true}] };
console.log("TEST B - Weak Tech Match:", calculateJobMatch(TEST_B_RESUME, TEST_B_JD).score < 40 ? 'PASS' : 'FAIL');

const TEST_C_JD = "React Developer. React, TypeScript.";
const TEST_C_RESUME = { summary: 'React Developer', projects: [{name: 'A', technologies: ['React', 'TypeScript'], included: true}, {name: 'B', technologies: ['Photoshop'], included: true}] };
console.log("TEST C - Unrelated Projects:", calculateJobMatch(TEST_C_RESUME, TEST_C_JD).details.experienceScore > 0 ? 'PASS' : 'FAIL');

const TEST_D_RESUME = { summary: 'React Developer', projects: [{name: 'A', technologies: ['React', 'TypeScript'], included: false}] };
console.log("TEST D - Excluded Relevant Project:", calculateJobMatch(TEST_D_RESUME, TEST_C_JD).details.experienceScore === 0 ? 'PASS' : 'FAIL');

const TEST_E_JD = "Data Scientist";
const TEST_E_RESUME = { summary: "Frontend Developer", skills: ['React', 'TypeScript'] };
console.log("TEST E - Role Mismatch:", calculateJobMatch(TEST_E_RESUME, TEST_E_JD).details.titleRelevanceScore === 0 ? 'PASS' : 'FAIL');

const TEST_F_JD = "Frontend Developer";
const TEST_F_RESUME = { summary: "Frontend developer building React applications." };
console.log("TEST F - Role Match:", calculateJobMatch(TEST_F_RESUME, TEST_F_JD).details.titleRelevanceScore > 0 ? 'PASS' : 'FAIL');

const TEST_G_JD = "Go, R, C";
const TEST_G_RESUME = { summary: "Good program core" };
console.log("TEST G - Boundary Safety:", calculateJobMatch(TEST_G_RESUME, TEST_G_JD).matchedSkills.length === 0 ? 'PASS' : 'FAIL');

const TEST_H_JD = "QuantumComputingFramework";
const TEST_H_RESUME = { summary: "quantumcomputingframework " + "a ".repeat(500) };
console.log("TEST H - Unknown Tech:", calculateJobMatch(TEST_H_RESUME, TEST_H_JD).score === 0 ? 'PASS' : 'FAIL');
