$css = @"

/* Markdown AI Output Styling */
.markdown-content {
  line-height: 1.6;
}
.markdown-content p {
  margin-bottom: 0.75rem;
}
.markdown-content p:last-child {
  margin-bottom: 0;
}
.markdown-content ul {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
}
.markdown-content ol {
  list-style-type: decimal;
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
}
.markdown-content li {
  margin-bottom: 0.25rem;
}
.markdown-content strong {
  font-weight: 700;
  color: inherit;
}
.markdown-content code {
  background-color: rgba(0,0,0,0.05);
  padding: 0.1rem 0.25rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.875em;
}
.markdown-content pre {
  background-color: #1e293b;
  color: #f8fafc;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 0.75rem;
}
.markdown-content pre code {
  background-color: transparent;
  padding: 0;
  color: inherit;
}
"@
Add-Content -Path src/index.css -Value $css
