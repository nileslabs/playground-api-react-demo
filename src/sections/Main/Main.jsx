import { Link } from "react-router";

export function Main() {
  const showcaseModules = [
    {
      title: "E-Commerce Store & Cart",
      path: "/products",
      icon: "🛍️",
      apiFeature: "Dynamic Schema-less Collections (/custom/products)",
      desc: "Create custom products, filter by category, sort prices, and add items to cart. Data persists in your private session overlay without schema migrations.",
      cta: "Explore Store",
      tag: "Dynamic Schemas",
      tagColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Social Discussions & Feed",
      path: "/posts",
      icon: "💬",
      apiFeature:
        "Stateful CRUD & Relational Comments (/posts, /posts/:id/comments)",
      desc: "Publish posts with instant optimistic UI updates and live comments. Created posts stay at the top across page reloads.",
      cta: "Open Social Feed",
      tag: "Stateful CRUD",
      tagColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Team & User Directory",
      path: "/users",
      icon: "👥",
      apiFeature:
        "Universal Full-Text Search & SVG Avatars (/users, /avatars/:seed)",
      desc: "Search 25+ global user profiles in real time, view address details, and render deterministic vector SVG avatar placeholders.",
      cta: "View Directory",
      tag: "Search & Avatars",
      tagColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Task Engine & Kanban",
      path: "/todos",
      icon: "✅",
      apiFeature: "Stateful Checklist Toggling & Status Filters (/todos)",
      desc: "Interactive todo manager. Toggle task completion with instant server synchronization in your private session sandbox.",
      cta: "Open Task Board",
      tag: "Live Mutations",
      tagColor: "text-emerald-400 bg-amber-500/10 border-emerald-500/20",
    },
    {
      title: "JWT Authentication Hub",
      path: "/auth",
      icon: "🔐",
      apiFeature: "Stateless Fake JWT Auth Loops (/auth/login, /auth/me)",
      desc: "Simulate access and refresh token rotation, inspect claims payloads, and access Bearer token protected routes.",
      cta: "Test Auth Loop",
      tag: "Security & JWT",
      tagColor: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
    {
      title: "Vector Media Studio",
      path: "/media",
      icon: "🎨",
      apiFeature:
        "Dynamic Procedural SVG Avatar & Thumbnail Generator (/avatars, /thumbnails)",
      desc: "Generate deterministic vector graphics on the fly for user profile cards, cover thumbnails, and social sharing banners.",
      cta: "Launch Media Studio",
      tag: "SVG Generation",
      tagColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    },
  ];

  return (
    <div className="space-y-10">
      {/* ── 1. Hero Showcase Banner ── */}
      <div className="p-6 sm:p-10 rounded-3xl bg-linear-to-br from-[#12151d] via-[#161a25] to-[#12151d] border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Glow Ambient Decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 blur-3xl pointer-events-none rounded-full" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-cyan-500/5 blur-3xl pointer-events-none rounded-full" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-World Playground API Showcase</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Build Production-Grade Apps with a{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-cyan-400">
                Stateful Mock Backend
              </span>
              .
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              <strong>Pulse Studio</strong> is a full-featured React 19
              application built entirely on top of{" "}
              <strong>Playground API</strong>. Every product created, post
              published, task toggled, and token generated persists in your
              private session overlay without a local database.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <Link
              to="/products"
              className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>🛍️ Test E-Commerce Store</span>
              <span>→</span>
            </Link>
            <a
              href="https://playground.nileslabs.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-sm transition-colors text-center"
            >
              📚 Read API Docs
            </a>
          </div>
        </div>
      </div>

      {/* ── 2. How Playground API Powers This Application (3 Pillar Cards) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-[#12151d] border border-white/10 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg">
            🧠
          </div>
          <h3 className="text-base font-bold text-white">
            1. Stateful Session Overlays
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            When you create a post or product, Playground API stores it in your
            private session sandbox overlay. Subsequent{" "}
            <code className="text-emerald-400 font-mono">GET</code> calls return
            your new item at the top!
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#12151d] border border-white/10 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-lg">
            🛡️
          </div>
          <h3 className="text-base font-bold text-white">
            2. Zero Database Collisions
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Global seed data (100 posts, 25 users, 300 comments) is strictly
            read-only. Your mutations never overwrite or leak into another
            user's session.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#12151d] border border-white/10 space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-lg">
            📡
          </div>
          <h3 className="text-base font-bold text-white">
            3. Live Request Inspector
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Watch real-time HTTP requests, response times, and payloads stream
            directly into the floating dock at the bottom of the screen as you
            interact with the UI.
          </p>
        </div>
      </div>

      {/* ── 3. Interactive Showcase Modules Grid ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Interactive Application Modules
            </h2>
            <p className="text-xs text-slate-400">
              Click any module to experience real-time CRUD and state
              persistence in action:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {showcaseModules.map((m) => (
            <Link
              key={m.title}
              to={m.path}
              className="p-6 rounded-2xl bg-[#12151d] border border-white/10 hover:border-white/20 hover:bg-[#151923] transition-all group flex flex-col justify-between space-y-4 shadow-md"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{m.icon}</span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold border ${m.tagColor}`}
                  >
                    {m.tag}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {m.title}
                  </h3>
                  <code className="text-[11px] text-slate-400 font-mono block mt-1">
                    {m.apiFeature}
                  </code>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {m.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                <span>{m.cta}</span>
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── 4. Quick React Integration Snippet ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#12151d] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>⚡</span>
              <span>How We Integrated Playground API with React 19</span>
            </h3>
            <p className="text-xs text-slate-400">
              Zero configuration: Just fetch from the endpoint and include
              cookies to preserve private state.
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            fetch() + credentials
          </span>
        </div>

        <pre className="p-4 rounded-2xl bg-[#090b10] border border-white/10 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
          <code>{`// 1. Fetch posts with persistent session cookies
const res = await fetch('https://playground.nileslabs.com/api/v1/posts', {
  credentials: 'include', // Preserves your private session sandbox
});
const { data } = await res.json();

// 2. Create a custom post (Persists across page refreshes!)
await fetch('https://playground.nileslabs.com/api/v1/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({
    title: 'New Post from React App',
    body: 'This post is overlaid on top of the baseline dataset!',
    user_id: 1,
  }),
});`}</code>
        </pre>
      </div>
    </div>
  );
}

export default Main;
