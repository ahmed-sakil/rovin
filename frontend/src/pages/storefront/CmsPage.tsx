import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StorefrontNavbar } from '../../components/layout/StorefrontNavbar';
import { StorefrontFooter } from '../../components/layout/StorefrontFooter';
import { MobileBottomNav } from '../../components/layout/MobileBottomNav';
import { usePageTitle } from '../../hooks/usePageTitle';
import { FileText, Shield, Clock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

// Lightweight markdown renderer for headings, lists, and paragraphs
function renderMarkdown(content: string) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: string[] = [];
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim();
      if (text) {
        elements.push(
          <p key={`p-${elements.length}`} className="text-sm sm:text-base text-machined-silver font-normal leading-relaxed mb-4">
            {formatInlineText(text)}
          </p>
        );
      }
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-2 text-sm sm:text-base text-machined-silver font-normal mb-5 pl-2">
          {currentList.map((item, i) => (
            <li key={i}>{formatInlineText(item)}</li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      return;
    }

    if (line.startsWith('### ')) {
      flushParagraph();
      flushList();
      const heading = line.replace(/^###\s+/, '');
      elements.push(
        <h3
          key={`h3-${elements.length}`}
          className="font-orbitron font-bold text-base sm:text-lg text-machined-titanium mt-8 mb-3 first:mt-0 flex items-center gap-2 border-b border-fastener-border/60 pb-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-nitro-amber flex-shrink-0" />
          <span>{heading}</span>
        </h3>
      );
    } else if (line.startsWith('## ')) {
      flushParagraph();
      flushList();
      const heading = line.replace(/^##\s+/, '');
      elements.push(
        <h2
          key={`h2-${elements.length}`}
          className="font-orbitron font-bold text-lg sm:text-xl text-machined-titanium mt-10 mb-4 first:mt-0 border-b border-fastener-border pb-2"
        >
          {heading}
        </h2>
      );
    } else if (line.startsWith('# ')) {
      flushParagraph();
      flushList();
      const heading = line.replace(/^#\s+/, '');
      elements.push(
        <h1
          key={`h1-${elements.length}`}
          className="font-orbitron font-black text-xl sm:text-2xl text-machined-titanium mt-10 mb-4 first:mt-0"
        >
          {heading}
        </h1>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      flushParagraph();
      currentList.push(line.replace(/^[-*]\s+/, ''));
    } else {
      currentParagraph.push(line);
    }
  });

  flushParagraph();
  flushList();

  return elements;
}

function formatInlineText(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-machined-titanium">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export const CmsPage: React.FC<{ slugOverride?: string }> = ({ slugOverride }) => {
  const params = useParams<{ slug: string }>();
  const slug = slugOverride || params.slug || 'privacy-policy';

  const [page, setPage] = useState<{ title: string; content: string; updatedAt: string } | null>(null);
  const [loading, setLoading] = useState(true);

  usePageTitle(page?.title || 'Policy & Telemetry', 'ROVIN Platform');

  useEffect(() => {
    const fetchPage = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/cms/pages/${slug}`);
        const data = await res.json();
        if (data.success && data.content) {
          setPage(data.content);
        } else {
          toast.error('Page Not Found');
        }
      } catch {
        toast.error('Network Error fetching content');
      } finally {
        setLoading(false);
      }
    };

    fetchPage();
  }, [slug]);

  return (
    <div className="min-h-screen bg-pitch-obsidian flex flex-col justify-between pb-16 md:pb-0">
      <StorefrontNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-machined-dim hover:text-nitro-amber mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>

        {loading ? (
          <div className="chassis-card p-8 text-center text-xs font-mono text-machined-muted">
            Loading content...
          </div>
        ) : page ? (
          <article className="chassis-card p-6 sm:p-10">
            <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-machined-titanium uppercase mb-3">
              {page.title}
            </h1>

            <div className="flex items-center gap-2 text-[11px] font-mono text-machined-dim pb-6 border-b border-fastener-border mb-6">
              <Clock className="w-3.5 h-3.5" />
              <span>Last updated: {new Date(page.updatedAt).toLocaleDateString()}</span>
            </div>

            <div className="text-machined-silver leading-relaxed">
              {renderMarkdown(page.content)}
            </div>
          </article>
        ) : (
          <div className="chassis-card p-8 text-center text-sm font-mono text-red-400">
            Page not found.
          </div>
        )}
      </main>

      <StorefrontFooter />

      <MobileBottomNav />
    </div>
  );
};
