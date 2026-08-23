import LogoIcon from '@/components/LogoIcon';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#0c0e14] border-t border-white/10 text-slate-400 text-xs mt-auto">
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand & Tagline */}
          <div className="flex items-center gap-3">
            <LogoIcon size={24} className="w-6 h-6 shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-bold text-white">
                Pulse Studio
              </span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="text-slate-400">
                Showcase application powered by Playground API
              </span>
            </div>
          </div>

          {/* Links & Attribution */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-slate-400">
            <span>© {currentYear} Playground API</span>
            <span className="hidden sm:inline text-slate-600">•</span>
            <a
              href="https://playground.nileslabs.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
            >
              API Documentation
            </a>
            <span className="hidden sm:inline text-slate-600">•</span>
            <a
              href="https://github.com/nileslabs/playground_api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-white transition-colors"
            >
              GitHub
            </a>
            <span className="hidden sm:inline text-slate-600">•</span>
            <span>Created by Nilesh Kumar</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
