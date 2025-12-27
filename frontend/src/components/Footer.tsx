'use client';

import React from 'react';
import { Blocks, Github, Twitter, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-vault-border py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-stacks-purple to-bitcoin-gold flex items-center justify-center">
              <Blocks className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-white">Stacks Capsule</span>
              <p className="text-xs text-gray-500">Decentralized Time-Locked Assets</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://explorer.stacks.co"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Stacks Explorer
            </a>
            <a
              href="https://docs.stacks.co"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Stacks Docs
            </a>
          </div>

          {/* Social */}
          <div className="flex items-center gap-4">
            <a
              href="#"
              className="p-2 rounded-lg bg-vault-card text-gray-400 hover:text-white hover:bg-vault-border transition-all"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="p-2 rounded-lg bg-vault-card text-gray-400 hover:text-white hover:bg-vault-border transition-all"
            >
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-vault-border text-center">
          <p className="text-sm text-gray-500">
            Built on{' '}
            <a href="https://stacks.co" target="_blank" rel="noopener noreferrer" className="text-stacks-purple-light hover:underline">
              Stacks
            </a>
            , secured by{' '}
            <a href="https://bitcoin.org" target="_blank" rel="noopener noreferrer" className="text-bitcoin-gold hover:underline">
              Bitcoin
            </a>
          </p>
          <p className="text-xs text-gray-600 mt-2">
            © {new Date().getFullYear()} Stacks Capsule. Open source software.
          </p>
        </div>
      </div>
    </footer>
  );
}

