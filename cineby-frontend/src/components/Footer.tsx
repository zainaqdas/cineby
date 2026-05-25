const CURRENT_YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white/60">NitFlix</span>
          </div>
          <p className="text-xs text-white/30">
            Powered by TMDB &amp; VidSrc &middot; &copy; {CURRENT_YEAR}
          </p>
        </div>
      </div>
    </footer>
  );
}
