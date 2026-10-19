import { Suspense } from 'react';
import { NavLinks, NavLinksFallback } from './nav-links';

export default function Sidebar() {
  return (
    <aside className="sticky top-0 h-dvh py-4 px-2 sm:py-8 sm:px-4 overflow-y-auto">
      <nav aria-label="Main">
        <Suspense fallback={<NavLinksFallback />}>
          <NavLinks />
        </Suspense>
      </nav>
    </aside>
  );
}
