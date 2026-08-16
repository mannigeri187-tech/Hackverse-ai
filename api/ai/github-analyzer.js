import { authenticateServerRequest, sanitizeEnvString } from '../shared/supabase.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Helper to safely parse GitHub Owner and Repo from various URL formats
function parseGitHubUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.trim().match(/github\.com\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)/);
  if (!match) return null;
  return {
    owner: match[1],
    repo: match[2].replace(/\.git$/, '')
  };
}

export default async function handler(req, res) {
  // Setup CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = sanitizeEnvString(process.env.GEMINI_API_KEY);
  if (!apiKey) {
    return res.status(500).json({ error: 'Gemini API key is not configured on server.' });
  }

  try {
    // 1. Authenticate user from Bearer token
    const { user, error: authError } = await authenticateServerRequest(req);
    if (authError || !user) {
      return res.status(401).json({ error: authError || 'Unauthorized user session.' });
    }

    // 2. Validate GitHub URL
    const { repoUrl, workspaceContext } = req.body;
    const parsed = parseGitHubUrl(repoUrl);

    if (!parsed) {
      return res.status(400).json({ 
        error: 'Please enter a valid public GitHub repository URL (e.g. https://github.com/owner/repo).' 
      });
    }

    const { owner, repo } = parsed;

    // 3. Fetch Public Repository Metadata via GitHub REST API (No auth required for public repos)
    const headers = {
      'User-Agent': 'HackVerse-AI-Analyzer',
      'Accept': 'application/vnd.github.v3+json'
    };

    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    if (!repoRes.ok) {
      if (repoRes.status === 404) {
        return res.status(404).json({ 
          error: 'Repository not found or unavailable. Please verify that this is a public repository.' 
        });
      }
      if (repoRes.status === 403) {
        return res.status(403).json({ 
          error: 'GitHub API rate limit reached or access forbidden. Please try again in a few moments.' 
        });
      }
      return res.status(repoRes.status).json({ 
        error: `GitHub returned status ${repoRes.status}. Unable to access repository.` 
      });
    }

    const repoData = await repoRes.json();
    if (repoData.private) {
      return res.status(400).json({ 
        error: 'This analyzer currently supports public repositories only.' 
      });
    }

    // Fetch README (if available)
    let readmeContent = 'No README detected.';
    try {
      const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
      if (readmeRes.ok) {
        const readmeJson = await readmeRes.json();
        if (readmeJson.content) {
          const buff = Buffer.from(readmeJson.content, 'base64');
          readmeContent = buff.toString('utf-8').slice(0, 3000); // Limit README to 3000 chars for efficient AI prompt
        }
      }
    } catch {
      readmeContent = 'No README detected or failed to read.';
    }

    // Fetch Repository File Tree (default branch top 50 files)
    let fileList = [];
    try {
      const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${repoData.default_branch || 'main'}?recursive=1`, { headers });
      if (treeRes.ok) {
        const treeJson = await treeRes.json();
        if (Array.isArray(treeJson.tree)) {
          fileList = treeJson.tree.map(f => f.path).slice(0, 70); // Top 70 representative paths
        }
      }
    } catch {
      fileList = ['(Tree lookup unavailable)'];
    }

    // Fetch Languages breakdown
    let languages = {};
    try {
      const langRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, { headers });
      if (langRes.ok) {
        languages = await langRes.json();
      }
    } catch {
      languages = {};
    }

    // Fetch package.json (if present) for dependencies summary
    let packageInfo = null;
    try {
      const pkgRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${repoData.default_branch || 'main'}/package.json`, { headers });
      if (pkgRes.ok) {
        const pkgData = await pkgRes.json();
        packageInfo = {
          name: pkgData.name,
          scripts: Object.keys(pkgData.scripts || {}),
          dependencies: Object.keys(pkgData.dependencies || {}).slice(0, 15),
          devDependencies: Object.keys(pkgData.devDependencies || {}).slice(0, 10),
        };
      }
    } catch {
      packageInfo = null;
    }

    // 4. Construct AI System Prompt for Gemini
    const prompt = `You are the elite GitHub Hackathon Project Analyzer on HackVerse AI.
Analyze the following public GitHub repository details and provide an objective, actionable technical assessment of its hackathon readiness, codebase organization, and demo preparedness.

REPOSITORY DETAILS:
- Name: "${repoData.full_name}"
- Description: "${repoData.description || 'No description provided'}"
- Default Branch: "${repoData.default_branch}"
- Stars: ${repoData.stargazers_count}, Forks: ${repoData.forks_count}, Open Issues: ${repoData.open_issues_count}
- Languages: ${JSON.stringify(languages)}
- Package.json detected: ${packageInfo ? JSON.stringify(packageInfo) : 'None'}
- File Structure Sample (${fileList.length} files):
${fileList.slice(0, 50).map(f => `  - ${f}`).join('\n')}

README SNIPPET:
"""
${readmeContent}
"""

${workspaceContext ? `OPTIONAL WORKSPACE CONTEXT: Project "${workspaceContext.project_name || ''}" (${workspaceContext.hackathon_title || ''})` : ''}

ANALYSIS REQUIREMENTS:
1. Objectively score each category from 0 to 100 based on standard hackathon judging criteria.
2. Distinguish clearly between "Detected" items and "Not enough information to determine".
3. Provide concrete strengths, potential issues, missing items (e.g. LICENSE, env examples, test scripts, demo gif), recommended improvements, and an actionable 5-step Demo Checklist for judges.
4. Calculate an overall hackathon readiness score (0-100). Do not make fake winning guarantees.
5. Return STRICTLY a valid JSON object matching the exact schema below.

JSON SCHEMA:
{
  "overview": "Clear 2-3 sentence technical overview of what the repository contains and its apparent MVP status",
  "tech_stack": ["React", "TypeScript", "Node.js", "Tailwind CSS"],
  "repository_structure": [
    {"folder": "src/components", "purpose": "UI components"},
    {"folder": "api", "purpose": "Serverless endpoints"}
  ],
  "scores": {
    "project_structure": 85,
    "documentation": 78,
    "code_organization": 82,
    "setup_experience": 80,
    "feature_completeness": 75,
    "demo_readiness": 70,
    "technical_quality": 85,
    "hackathon_readiness": 80
  },
  "strengths": [
    "Well-structured modular source code layout.",
    "Comprehensive package.json script definitions for dev and build."
  ],
  "issues": [
    "No environment variable template (.env.example) found.",
    "Missing automated tests or lint scripts."
  ],
  "missing_items": [
    "No demo video / screenshot preview in README",
    "Missing clear setup / running commands in documentation"
  ],
  "improvements": [
    "Add a quickstart section with step-by-step local execution instructions.",
    "Include an architecture diagram or API workflow explanation."
  ],
  "demo_checklist": [
    "Verify local environment variables run without runtime errors.",
    "Pre-record a 60-second backup demo video in case of live network hiccups.",
    "Ensure the landing page renders in under 2 seconds on judges' browsers.",
    "Double check that all sample data is populated and functional."
  ],
  "overall_score": 80
}`;

    // 5. Generate with active Gemini models
    const genAI = new GoogleGenerativeAI(apiKey);
    const activeModels = ['gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];
    let rawText = '';
    let lastError = null;

    for (const modelName of activeModels) {
      try {
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: { responseMimeType: "application/json" }
        });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        rawText = response.text().trim();
        if (rawText) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!rawText) throw lastError || new Error('Failed to generate GitHub analysis from Gemini AI');

    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const aiAnalysisResult = JSON.parse(cleaned);

    return res.status(200).json({
      repo_metadata: {
        name: repoData.full_name,
        description: repoData.description,
        html_url: repoData.html_url,
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        default_branch: repoData.default_branch,
      },
      ...aiAnalysisResult
    });
  } catch (err) {
    console.error('GitHub Analyzer Error:', err?.message || err);
    return res.status(500).json({ 
      error: 'Unable to analyze this repository. Please try again.',
      details: err?.message || 'Server error'
    });
  }
}
