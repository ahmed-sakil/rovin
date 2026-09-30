import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { StorefrontNavbar } from '../../components/layout/StorefrontNavbar';
import { MobileBottomNav } from '../../components/layout/MobileBottomNav';
import { usePageTitle } from '../../hooks/usePageTitle';
import { FileText, Shield, Clock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

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
      <StorefrontNavbar onOpenAuth={() => {}} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-machined-dim hover:text-nitro-amber mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Hangar
        </Link>

        {loading ? (
          <div className="chassis-card p-8 text-center text-xs font-mono text-machined-muted">
            CALIBRATING TRANSMISSION...
          </div>
        ) : page ? (
          <article className="chassis-card p-6 sm:p-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-nitro-amber shadow-nitro-sm"></span>
              <span className="telemetry-tag border-nitro-amber/40 text-nitro-amber text-[10px]">
                OFFICIAL SPECIFICATION
              </span>
            </div>

            <h1 className="font-orbitron font-black text-2xl sm:text-3xl text-machined-titanium uppercase mb-3">
              {page.title}
            </h1>

            <div className="flex items-center gap-2 text-[11px] font-mono text-machined-dim pb-6 border-b border-fastener-border mb-6">
              <Clock className="w-3.5 h-3.5" />
              <span>Calibrated on: {new Date(page.updatedAt).toLocaleDateString()}</span>
            </div>

            <div className="text-sm font-normal text-machined-silver leading-relaxed whitespace-pre-line space-y-4">
              {page.content}
            </div>
          </article>
        ) : (
          <div className="chassis-card p-8 text-center text-sm font-mono text-red-400">
            Content transmission not found.
          </div>
        )}
      </main>

      <footer className="border-t border-fastener-border py-6 px-6 text-center text-xs text-machined-dim bg-pitch-deep">
        <span className="font-mono">ROVIN BANGLADESH &bull; PRECISION TELEMETRY PROTOCOL</span>
      </footer>

      <MobileBottomNav onOpenAuth={() => {}} />
    </div>
  );
};
