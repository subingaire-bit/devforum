// Licensed under MIT - DevForum Project
import { marked } from "marked";
import { mangle } from "marked-mangle";
import { gfmHeadingId } from "marked-gfm-heading-id";
import DOMPurify from "isomorphic-dompurify";

// Configure marked with security extensions
marked.use(mangle());
marked.use(gfmHeadingId({ prefix: "heading-" }));

// Custom renderer for code blocks with syntax highlighting support
const renderer = new marked.Renderer();

// marked v5+ expects a Code object instead of separate arguments
renderer.code = ({ text, lang, escaped }) => {
  // Validate language to prevent injection via class names
  const validLang = !!(lang && /^[a-z0-9_-]+$/i.test(lang));
  
  // Escape HTML entities in the code content
  const escapedCode = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  return `<pre class="code-block"><code${validLang ? ` class="language-${lang}"` : ""}>${escapedCode}</code></pre>`;
};

// Register the custom renderer
marked.setOptions({ renderer });

export function renderMarkdown(content: string): string {
  if (!content?.trim()) return "";
  
  // Parse markdown to HTML
  // Note: headerIds is no longer a core option; handled by gfmHeadingId extension above
  const rawHtml = marked.parse(content, {
    breaks: true,
    gfm: true,
  }) as string;
  
  // Sanitize to prevent XSS while preserving allowed tags
  const sanitized = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "del", "code", "pre", "blockquote",
      "ul", "ol", "li", "h1", "h2", "h3", "h4", "h5", "h6", "hr",
      "a", "img", "table", "thead", "tbody", "tr", "th", "td", "span"
    ],
    ALLOWED_ATTR: [
      "href", "src", "alt", "title", "class", "id", "target", "rel",
      "align", "valign", "colspan", "rowspan"
    ],
    ALLOW_DATA_ATTR: false,
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "style"],
    ADD_ATTR: ["target", "rel"],
  });
  
  return sanitized;
}

export function stripMarkdown(content: string): string {
  return content
    .replace(/#{1,6}\s*/g, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}