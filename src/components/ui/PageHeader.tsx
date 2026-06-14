'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, className }: PageHeaderProps) {
  const pathname = usePathname();

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = () => {
    if (!pathname) return null;
    const segments = pathname.split('/').filter(Boolean);
    
    // Do not show breadcrumbs on root or auth pages
    if (segments.length === 0 || segments.includes('login') || segments.includes('register')) {
      return null;
    }

    return (
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex items-center space-x-2 text-xs font-mono text-text-muted">
          <li>
            <Link href="/overview" className="hover:text-text-primary transition-colors">
              BRANDAVOX
            </Link>
          </li>
          {segments.map((segment, index) => {
            const path = `/${segments.slice(0, index + 1).join('/')}`;
            const isLast = index === segments.length - 1;
            const displaySegment = segment
              .replace(/-/g, ' ')
              .replace(/\[.*\]/g, '') // remove router slugs
              .toUpperCase();

            // Ignore dynamic UUID paths or long hashes for breadcrumbs readability
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
            if (isUUID) return null;

            return (
              <li key={path} className="flex items-center space-x-2">
                <span>/</span>
                {isLast ? (
                  <span className="text-text-primary font-medium">{displaySegment}</span>
                ) : (
                  <Link href={path} className="hover:text-text-primary transition-colors">
                    {displaySegment}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  };

  return (
    <div className={cn('flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border-custom pb-6 mb-8', className)}>
      <div className="flex-1">
        {generateBreadcrumbs()}
        <h1 className="font-display text-3xl font-bold tracking-tight text-text-primary">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-text-muted mt-1.5 font-sans leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-3 self-start md:self-center">
          {actions}
        </div>
      )}
    </div>
  );
}
export default PageHeader;
