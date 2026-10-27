import React from 'react';
import { FOOTER_LINKS } from './data';

export default function Footer() {
  return (
    <footer
      className="mt-20 md:mt-24 flex flex-col items-center justify-between gap-6 border-t border-border py-8 sm:flex-row"
      role="contentinfo"
    >
      {/* Copyright */}
      <p className="text-[14px] text-textMuted font-normal">
        © 2026 HopFlow. All rights reserved.
      </p>

      {/* Links */}
      <nav
        className="flex flex-wrap items-center justify-center gap-6"
        aria-label="Footer Navigation"
      >
        {FOOTER_LINKS.map((link) => (
          <a
            key={link.label}
            href={link.href}
            {...(link.external
              ? { target: '_blank', rel: 'noopener noreferrer' }
              : {})}
            className="text-[14px] text-textMuted transition-colors duration-150 hover:text-white"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </footer>
  );
}