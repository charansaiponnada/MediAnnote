import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";

// Basic Markdown to HTML converter to avoid extra dependencies for the demo
function simpleMarkdownToHtml(md: string) {
  return md
    // Headers
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mb-6 text-white">$1</h1>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold mt-10 mb-4 text-[var(--accent-cyan)]">$1</h2>')
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-medium mt-8 mb-3 text-[var(--accent-emerald)]">$1</h3>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
    // Lists
    .replace(/^\- (.*$)/gm, '<li class="ml-4 mb-2 text-[var(--on-surface-variant)]">$1</li>')
    .replace(/^\d\. (.*$)/gm, '<li class="ml-4 mb-2 text-[var(--on-surface-variant)] list-decimal">$1</li>')
    // Code blocks
    .replace(/```(.*?)\n([\s\S]*?)```/gm, '<pre class="bg-black/40 rounded-lg p-4 mb-4 overflow-x-auto border border-white/5 font-mono text-sm text-[var(--accent-cyan)]">$2</pre>')
    // Inline code
    .replace(/`(.*?)`/g, '<code class="bg-white/5 px-1 rounded text-sm font-mono text-[var(--accent-cyan)]">$1</code>')
    // Line breaks/Paragraphs (simple)
    .split('\n\n')
    .map(p => p.trim().startsWith('<') ? p : `<p class="mb-4 text-[var(--primary-fixed)] leading-relaxed">${p}</p>`)
    .join('\n');
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const filePath = path.join(process.cwd(), "docs", slug.join("/"), "index.md");

  if (!fs.existsSync(filePath)) {
    // Check if it's just a file named slug.md
    const alternatePath = path.join(process.cwd(), "docs", `${slug.join("/")}.md`);
    if (!fs.existsSync(alternatePath)) {
      notFound();
    }
    
    const content = fs.readFileSync(alternatePath, "utf-8");
    return (
      <article 
        className="prose prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(content) }}
      />
    );
  }

  const content = fs.readFileSync(filePath, "utf-8");
  return (
    <article 
      className="prose prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: simpleMarkdownToHtml(content) }}
    />
  );
}
