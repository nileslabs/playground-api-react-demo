import { useState, useMemo, useEffect } from "react";
import { mediaApi } from "@/api/media";
import HowItWorksBanner from "@/components/common/HowItWorksBanner";

const AVATAR_PRESETS = [
  "alex.dev",
  "sarah_connor",
  "neo_matrix",
  "eva_ai",
  "quantum_coder",
  "cyber_samurai",
  "alice.smith",
  "bruce_wayne",
  "tony_stark",
  "diana_prince",
  "ada_lovelace",
  "turing_machine",
  "apollo_11",
  "stellar_blade",
  "pixel_master",
];

const THUMBNAIL_PRESETS = [
  {
    seed: "react-19-guide",
    text: "React 19 Deep Dive",
    description: "Server Actions, Optimistic UI & Streaming Masterclass",
    width: 1200,
    height: 630,
  },
  {
    seed: "graphql-mastery",
    text: "GraphQL API Sandbox",
    description:
      "Query and Mutation Schema Gateway with Realtime Subscriptions",
    width: 1200,
    height: 630,
  },
  {
    seed: "cloud-architecture",
    text: "Cloud Microservices",
    description:
      "Distributed Systems, Event Streaming & Kubernetes Deployments",
    width: 800,
    height: 450,
  },
  {
    seed: "database-indexing",
    text: "PostgreSQL & Prisma Indexing",
    description: "High-throughput Query Optimization and B-Tree Tuning",
    width: 600,
    height: 400,
  },
  {
    seed: "typescript-enterprise",
    text: "Enterprise TypeScript 5.8",
    description: "Zero-latency Type Inference and Strict Mode Patterns",
    width: 600,
    height: 400,
  },
  {
    seed: "sandbox-isolation",
    text: "Session State Isolation",
    description: "Stateless HMAC Identity Tokens with Zero Cross-talk",
    width: 600,
    height: 400,
  },
];

const SIZE_PRESETS = [32, 64, 96, 128, 256, 512];

const DIMENSION_PRESETS = [
  { label: "1200 × 630 (OG / Social)", width: 1200, height: 630 },
  { label: "800 × 450 (16:9 Media)", width: 800, height: 450 },
  { label: "600 × 400 (Blog Card)", width: 600, height: 400 },
  { label: "400 × 400 (1:1 Square)", width: 400, height: 400 },
];

function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg =
    type === "success"
      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300"
      : "bg-amber-500/20 border-emerald-500/40 text-emerald-300";

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl border backdrop-blur-md shadow-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 ${bg}`}
    >
      <span>{type === "success" ? "✓" : "ℹ"}</span>
      <span>{message}</span>
    </div>
  );
}

const Media = () => {
  const [activeTab, setActiveTab] = useState("avatars"); // "avatars" | "thumbnails" | "gallery" | "specs"
  const [toast, setToast] = useState(null);

  // Avatar state: Draft vs Committed
  const [avatarDraftSeed, setAvatarDraftSeed] = useState("nilesh_developer");
  const [avatarDraftSize, setAvatarDraftSize] = useState(160);
  const [avatarDraftRounded, setAvatarDraftRounded] = useState(true);

  const [avatarSeed, setAvatarSeed] = useState("nilesh_developer");
  const [avatarSize, setAvatarSize] = useState(160);
  const [avatarRounded, setAvatarRounded] = useState(true);
  const [avatarCodeTab, setAvatarCodeTab] = useState("url"); // "url" | "html" | "jsx" | "markdown" | "svg"
  const [avatarRawSvg, setAvatarRawSvg] = useState("");

  const isAvatarDirty =
    avatarDraftSeed !== avatarSeed ||
    avatarDraftSize !== avatarSize ||
    avatarDraftRounded !== avatarRounded;

  // Thumbnail state: Draft vs Committed
  const [thumbDraftSeed, setThumbDraftSeed] = useState("react-19-mastery");
  const [thumbDraftText, setThumbDraftText] = useState(
    "React 19 Server Components",
  );
  const [thumbDraftDescription, setThumbDraftDescription] = useState(
    "Comprehensive guide to fullstack architecture & state machines",
  );
  const [thumbDraftWidth, setThumbDraftWidth] = useState(1200);
  const [thumbDraftHeight, setThumbDraftHeight] = useState(630);

  const [thumbSeed, setThumbSeed] = useState("react-19-mastery");
  const [thumbText, setThumbText] = useState("React 19 Server Components");
  const [thumbDescription, setThumbDescription] = useState(
    "Comprehensive guide to fullstack architecture & state machines",
  );
  const [thumbWidth, setThumbWidth] = useState(1200);
  const [thumbHeight, setThumbHeight] = useState(630);
  const [thumbCodeTab, setThumbCodeTab] = useState("url");
  const [thumbRawSvg, setThumbRawSvg] = useState("");

  const isThumbDirty =
    thumbDraftSeed !== thumbSeed ||
    thumbDraftText !== thumbText ||
    thumbDraftDescription !== thumbDescription ||
    thumbDraftWidth !== thumbWidth ||
    thumbDraftHeight !== thumbHeight;

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Generate / Apply Actions
  const handleGenerateAvatar = (customSeed, customSize, customRounded) => {
    const nextSeed =
      (customSeed !== undefined ? customSeed : avatarDraftSeed).trim() ||
      "user";
    const nextSize = customSize !== undefined ? customSize : avatarDraftSize;
    const nextRounded =
      customRounded !== undefined ? customRounded : avatarDraftRounded;

    setAvatarDraftSeed(nextSeed);
    setAvatarDraftSize(nextSize);
    setAvatarDraftRounded(nextRounded);

    setAvatarSeed(nextSeed);
    setAvatarSize(nextSize);
    setAvatarRounded(nextRounded);

    showToast("Avatar generated!");
  };

  const handleGenerateThumbnail = (
    customSeed,
    customText,
    customDesc,
    customWidth,
    customHeight,
  ) => {
    const nextSeed =
      (customSeed !== undefined ? customSeed : thumbDraftSeed).trim() || "post";
    const nextText = customText !== undefined ? customText : thumbDraftText;
    const nextDesc =
      customDesc !== undefined ? customDesc : thumbDraftDescription;
    const nextWidth = customWidth !== undefined ? customWidth : thumbDraftWidth;
    const nextHeight =
      customHeight !== undefined ? customHeight : thumbDraftHeight;

    setThumbDraftSeed(nextSeed);
    setThumbDraftText(nextText);
    setThumbDraftDescription(nextDesc);
    setThumbDraftWidth(nextWidth);
    setThumbDraftHeight(nextHeight);

    setThumbSeed(nextSeed);
    setThumbText(nextText);
    setThumbDescription(nextDesc);
    setThumbWidth(nextWidth);
    setThumbHeight(nextHeight);

    showToast("Thumbnail generated!");
  };

  // Compute live URLs from committed states (rate-limit safe)
  const avatarUrl = useMemo(() => {
    return mediaApi.getAvatarUrl(avatarSeed, {
      size: avatarSize,
      rounded: avatarRounded,
    });
  }, [avatarSeed, avatarSize, avatarRounded]);

  const thumbUrl = useMemo(() => {
    return mediaApi.getThumbnailUrl(thumbSeed, {
      width: thumbWidth,
      height: thumbHeight,
      text: thumbText,
      description: thumbDescription,
    });
  }, [thumbSeed, thumbWidth, thumbHeight, thumbText, thumbDescription]);

  // Load avatar raw SVG when code tab is active
  useEffect(() => {
    if (avatarCodeTab !== "svg") return;
    let active = true;

    const fetchAvatarSvg = async () => {
      try {
        const svg = await mediaApi.getAvatarSvg(avatarSeed, {
          size: avatarSize,
          rounded: avatarRounded,
        });
        if (active) setAvatarRawSvg(svg);
      } catch {
        if (active) setAvatarRawSvg("<!-- Failed to load SVG -->");
      }
    };

    fetchAvatarSvg();
    return () => {
      active = false;
    };
  }, [avatarSeed, avatarSize, avatarRounded, avatarCodeTab]);

  // Load thumbnail raw SVG when code tab is active
  useEffect(() => {
    if (thumbCodeTab !== "svg") return;
    let active = true;

    const fetchThumbSvg = async () => {
      try {
        const svg = await mediaApi.getThumbnailSvg(thumbSeed, {
          width: thumbWidth,
          height: thumbHeight,
          text: thumbText,
          description: thumbDescription,
        });
        if (active) setThumbRawSvg(svg);
      } catch {
        if (active) setThumbRawSvg("<!-- Failed to load SVG -->");
      }
    };

    fetchThumbSvg();
    return () => {
      active = false;
    };
  }, [
    thumbSeed,
    thumbWidth,
    thumbHeight,
    thumbText,
    thumbDescription,
    thumbCodeTab,
  ]);

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} copied to clipboard!`);
    } catch {
      showToast("Failed to copy", "warn");
    }
  };

  const rollRandomAvatarSeed = () => {
    const pool = AVATAR_PRESETS.filter((s) => s !== avatarDraftSeed);
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    handleGenerateAvatar(chosen, avatarDraftSize, avatarDraftRounded);
  };

  const handleDownloadAvatar = () => {
    mediaApi.downloadSvg(avatarUrl, `avatar-${avatarSeed}.svg`);
    showToast(`Downloading avatar-${avatarSeed}.svg!`);
  };

  const handleDownloadThumbnail = () => {
    mediaApi.downloadSvg(thumbUrl, `thumbnail-${thumbSeed}.svg`);
    showToast(`Downloading thumbnail-${thumbSeed}.svg!`);
  };

  return (
    <div className="space-y-6">
      {/* ── Sleek Unified Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Vector Media Studio
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              /avatars & /thumbnails
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Generate deterministic vector SVG avatar placeholders and landscape
            thumbnails on the fly.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono text-emerald-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Procedural SVG Engine Active</span>
          </span>
        </div>
      </div>

      {/* ── API Feature Explainer Banner ── */}
      <HowItWorksBanner
        title="Vector Media Studio & Deterministic SVG Engine (/avatars & /thumbnails)"
        subtitle="Generate beautiful procedural SVG avatars, card cover images, and social sharing banners on the fly with zero external CDNs or graphic design tools. Pass any seed string to generate consistent, deterministic SVG graphics."
        badge="Procedural SVG API"
        endpoint="GET /api/v1/avatars/:seed"
        codeSnippet={`// 1. Generate direct avatar URL for any seed
const avatarUrl = 'https://playground.nileslabs.com/api/v1/avatars/alex.dev?size=128&rounded=true';
// <img src={avatarUrl} alt="Avatar" />

// 2. Generate custom thumbnail banner SVG
const thumbUrl = 'https://playground.nileslabs.com/api/v1/thumbnails/react-19?width=1200&height=630&text=React+19+Guide';
// <img src={thumbUrl} alt="Cover" />`}
        payloadExample={{
          seed: "alex.dev",
          size: 128,
          rounded: true,
          format: "image/svg+xml",
        }}
      />

      {/* ── Studio Navigation Tabs ── */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/10 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("avatars")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "avatars"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <span>👤</span>
          <span>Avatar Studio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("thumbnails")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "thumbnails"
              ? "bg-white/10 text-white shadow-md shadow-emerald-600/10"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <span>🖼️</span>
          <span>Cover & Thumbnail Studio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("gallery")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "gallery"
              ? "bg-white/10 text-white shadow-md shadow-emerald-600/10"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <span>✨</span>
          <span>Inspiration Gallery</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("specs")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "specs"
              ? "bg-white/10 text-white shadow-md shadow-emerald-600/10"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <span>⚡</span>
          <span>API Specification</span>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────── TAB 1: AVATARS STUDIO */}
      {activeTab === "avatars" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Form */}
          <div className="lg:col-span-5 space-y-6 p-6 rounded-2xl bg-[#12151d] border border-[rgba(255,255,255,0.08)] shadow-xl">
            <div className="border-b border-[rgba(255,255,255,0.08)] pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>🎨</span>
                  <span>Avatar Parameters</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Customize seed identifier, pixel dimensions, and shape mask.
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 ${
                  isAvatarDirty
                    ? "bg-amber-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isAvatarDirty ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                />
                {isAvatarDirty ? "Pending" : "Active"}
              </span>
            </div>

            {/* Seed Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">
                  Seed String / Identifier{" "}
                  <span className="text-emerald-400">*</span>
                </label>
                <button
                  type="button"
                  onClick={rollRandomAvatarSeed}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer flex items-center gap-1"
                >
                  <span>🎲 Roll Random</span>
                </button>
              </div>
              <input
                type="text"
                value={avatarDraftSeed}
                onChange={(e) => setAvatarDraftSeed(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGenerateAvatar();
                }}
                placeholder="e.g. bret, alice, user-10"
                className="w-full bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono transition-colors"
              />
              <p className="text-[11px] text-slate-500">
                Determines deterministic gradient hash and rendered initials.
                Press Enter to generate.
              </p>
            </div>

            {/* Seed Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Popular Presets:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AVATAR_PRESETS.slice(0, 8).map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() =>
                      handleGenerateAvatar(
                        preset,
                        avatarDraftSize,
                        avatarDraftRounded,
                      )
                    }
                    className={`px-2 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                      avatarSeed === preset
                        ? "bg-amber-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-[#0c0e14] text-slate-400 hover:text-white border border-[rgba(255,255,255,0.08)]"
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Slider & Presets */}
            <div className="space-y-2 pt-2 border-t border-[rgba(255,255,255,0.08)]">
              <div className="flex items-center justify-between text-xs">
                <label className="font-semibold text-slate-300">
                  Dimension Size
                </label>
                <span className="font-mono text-emerald-400 font-bold">
                  {avatarDraftSize} × {avatarDraftSize} px
                </span>
              </div>
              <input
                type="range"
                min="32"
                max="512"
                step="8"
                value={avatarDraftSize}
                onChange={(e) => setAvatarDraftSize(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex items-center gap-1.5 pt-1">
                {SIZE_PRESETS.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() =>
                      handleGenerateAvatar(
                        avatarDraftSeed,
                        sz,
                        avatarDraftRounded,
                      )
                    }
                    className={`flex-1 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                      avatarDraftSize === sz
                        ? "bg-amber-500/20 text-emerald-300 border border-emerald-500/40 font-bold"
                        : "bg-[#0c0e14] text-slate-400 hover:text-white border border-[rgba(255,255,255,0.08)]"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Shape Toggle */}
            <div className="space-y-2 pt-2 border-t border-[rgba(255,255,255,0.08)]">
              <label className="text-xs font-semibold text-slate-300">
                Avatar Border Shape
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAvatarDraftRounded(true)}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    avatarDraftRounded
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-bold shadow-xs"
                      : "bg-[#0c0e14] border-[rgba(255,255,255,0.08)] text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full border-2 border-current" />
                  <span>Circular (rounded=true)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarDraftRounded(false)}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    !avatarDraftRounded
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-bold shadow-xs"
                      : "bg-[#0c0e14] border-[rgba(255,255,255,0.08)] text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="w-4 h-4 rounded-md border-2 border-current" />
                  <span>Squircle (rounded=false)</span>
                </button>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-4 border-t border-[rgba(255,255,255,0.08)] space-y-3">
              {/* On-Demand Generate Button */}
              <button
                type="button"
                onClick={() => handleGenerateAvatar()}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 ${
                  isAvatarDirty
                    ? "bg-linear-to-r bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 hover:brightness-110 ring-2 ring-emerald-500/30"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-[rgba(255,255,255,0.08)]"
                }`}
              >
                <span>⚡</span>
                <span>
                  {isAvatarDirty
                    ? "Generate Avatar (Changes Pending)"
                    : "Regenerate Avatar"}
                </span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(avatarUrl, "Direct Avatar URL")
                  }
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/10 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>🔗 Copy Direct URL</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadAvatar}
                  className="px-4 py-2.5 rounded-xl bg-[#0c0e14] hover:bg-[#131d33] border border-[rgba(255,255,255,0.08)] text-slate-200 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                  title="Download SVG"
                >
                  <span>⬇ Download SVG</span>
                </button>
              </div>
            </div>
          </div>

          {/* Live Preview & Code Generator */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Canvas Box */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#12151d] border border-[rgba(255,255,255,0.08)] shadow-xl flex flex-col items-center justify-center min-h-80 relative overflow-hidden group">
              {/* Subtle background grid pattern */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(#94a3b8 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />

              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="p-2 rounded-3xl bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] shadow-2xl transition-transform duration-300 group-hover:scale-105">
                  <img
                    src={avatarUrl}
                    alt={avatarSeed}
                    width={Math.min(avatarSize, 220)}
                    height={Math.min(avatarSize, 220)}
                    className="object-contain"
                    style={{
                      width: `${Math.min(avatarSize, 220)}px`,
                      height: `${Math.min(avatarSize, 220)}px`,
                    }}
                  />
                </div>

                <div className="text-center space-y-1">
                  <div className="text-sm font-bold text-white font-mono">
                    seed: "{avatarSeed}"
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    {avatarSize} × {avatarSize} px ·{" "}
                    {avatarRounded ? "Circular" : "Squircle"}
                  </div>
                </div>
              </div>
            </div>

            {/* Code Snippets Panel */}
            <div className="p-5 rounded-2xl bg-[#12151d] border border-[rgba(255,255,255,0.08)] space-y-3">
              <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3">
                <div className="flex items-center gap-1.5">
                  {[
                    { key: "url", label: "Direct URL" },
                    { key: "jsx", label: "React JSX" },
                    { key: "html", label: "HTML <img>" },
                    { key: "markdown", label: "Markdown" },
                    { key: "svg", label: "Raw SVG" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setAvatarCodeTab(tab.key)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        avatarCodeTab === tab.key
                          ? "bg-amber-500/20 text-emerald-300 border border-emerald-500/30"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    let code = avatarUrl;
                    if (avatarCodeTab === "jsx") {
                      code = `<img src="${avatarUrl}" alt="${avatarSeed}" width={${avatarSize}} height={${avatarSize}} />`;
                    } else if (avatarCodeTab === "html") {
                      code = `<img src="${avatarUrl}" alt="${avatarSeed}" width="${avatarSize}" height="${avatarSize}" />`;
                    } else if (avatarCodeTab === "markdown") {
                      code = `![Avatar for ${avatarSeed}](${avatarUrl})`;
                    } else if (avatarCodeTab === "svg") {
                      code = avatarRawSvg;
                    }
                    copyToClipboard(code, "Snippet");
                  }}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer flex items-center gap-1"
                >
                  <span>📋 Copy Code</span>
                </button>
              </div>

              {/* Code output area */}
              <div className="p-4 rounded-xl bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] font-mono text-xs text-emerald-300/90 overflow-x-auto whitespace-pre">
                {avatarCodeTab === "url" && avatarUrl}
                {avatarCodeTab === "jsx" &&
                  `<img src="${avatarUrl}" alt="${avatarSeed}" width={${avatarSize}} height={${avatarSize}} />`}
                {avatarCodeTab === "html" &&
                  `<img src="${avatarUrl}" alt="${avatarSeed}" width="${avatarSize}" height="${avatarSize}" />`}
                {avatarCodeTab === "markdown" &&
                  `![Avatar for ${avatarSeed}](${avatarUrl})`}
                {avatarCodeTab === "svg" &&
                  (avatarRawSvg || "<!-- Loading vector SVG XML... -->")}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── TAB 2: THUMBNAILS STUDIO */}
      {activeTab === "thumbnails" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls Form */}
          <div className="lg:col-span-5 space-y-6 p-6 rounded-2xl bg-[#12151d] border border-[rgba(255,255,255,0.08)] shadow-xl">
            <div className="border-b border-[rgba(255,255,255,0.08)] pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>🖼️</span>
                  <span>Cover Thumbnail Parameters</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Landscape vector image placeholders with mesh gradients and
                  custom labels.
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 ${
                  isThumbDirty
                    ? "bg-amber-500/20 text-emerald-300 border border-emerald-500/30 animate-pulse"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isThumbDirty ? "bg-amber-400" : "bg-emerald-400"
                  }`}
                />
                {isThumbDirty ? "Pending" : "Active"}
              </span>
            </div>

            {/* Seed Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Seed Identifier <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                value={thumbDraftSeed}
                onChange={(e) => setThumbDraftSeed(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGenerateThumbnail();
                }}
                placeholder="e.g. post-1, react-course, rust-engine"
                className="w-full bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono transition-colors"
              />
              <p className="text-[11px] text-slate-500">
                Controls background linear gradient color palette hashing.
              </p>
            </div>

            {/* Custom Headline Label */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Custom Headline Title (Optional)
              </label>
              <input
                type="text"
                value={thumbDraftText}
                onChange={(e) => setThumbDraftText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleGenerateThumbnail();
                }}
                placeholder="e.g. Building Modern Fullstack Apps"
                className="w-full bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
              <p className="text-[11px] text-slate-500">
                Multilined automatically with smart word-wrapping.
              </p>
            </div>

            {/* Subtitle / Description Text */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">
                Subtitle / Description Text (Optional)
              </label>
              <textarea
                rows={2}
                value={thumbDraftDescription}
                onChange={(e) => setThumbDraftDescription(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerateThumbnail();
                  }
                }}
                placeholder="e.g. Comprehensive walkthrough of server components and edge computing"
                className="w-full bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
              />
              <p className="text-[11px] text-slate-500">
                Rendered beneath title in elegant secondary typography. Press
                Enter to generate.
              </p>
            </div>

            {/* Dimension Presets */}
            <div className="space-y-2 pt-2 border-t border-[rgba(255,255,255,0.08)]">
              <label className="text-xs font-semibold text-slate-300">
                Aspect Ratio & Dimension Presets
              </label>
              <div className="grid grid-cols-2 gap-2">
                {DIMENSION_PRESETS.map((dp) => (
                  <button
                    key={dp.label}
                    type="button"
                    onClick={() => {
                      handleGenerateThumbnail(
                        thumbDraftSeed,
                        thumbDraftText,
                        thumbDraftDescription,
                        dp.width,
                        dp.height,
                      );
                    }}
                    className={`p-2.5 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                      thumbDraftWidth === dp.width &&
                      thumbDraftHeight === dp.height
                        ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-bold"
                        : "bg-[#0c0e14] border-[rgba(255,255,255,0.08)] text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="text-white font-semibold">
                      {dp.width} × {dp.height}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {dp.label.split("(")[1]?.replace(")", "") || ""}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Width & Height Sliders */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[rgba(255,255,255,0.08)]">
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-400">Width</span>
                  <span className="font-mono text-emerald-400">
                    {thumbDraftWidth}px
                  </span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="1600"
                  step="20"
                  value={thumbDraftWidth}
                  onChange={(e) => setThumbDraftWidth(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-400">Height</span>
                  <span className="font-mono text-emerald-400">
                    {thumbDraftHeight}px
                  </span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="20"
                  value={thumbDraftHeight}
                  onChange={(e) => setThumbDraftHeight(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Actions Bar */}
            <div className="pt-4 border-t border-[rgba(255,255,255,0.08)] space-y-3">
              {/* On-Demand Generate Button */}
              <button
                type="button"
                onClick={() => handleGenerateThumbnail()}
                className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 ${
                  isThumbDirty
                    ? "bg-linear-to-r bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 hover:brightness-110 ring-2 ring-emerald-500/30"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-[rgba(255,255,255,0.08)]"
                }`}
              >
                <span>⚡</span>
                <span>
                  {isThumbDirty
                    ? "Generate Thumbnail (Changes Pending)"
                    : "Regenerate Thumbnail"}
                </span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(thumbUrl, "Direct Thumbnail URL")
                  }
                  className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/10 cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>🔗 Copy Direct URL</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadThumbnail}
                  className="px-4 py-2.5 rounded-xl bg-[#0c0e14] hover:bg-[#131d33] border border-[rgba(255,255,255,0.08)] text-slate-200 text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>⬇ Download SVG</span>
                </button>
              </div>
            </div>
          </div>

          {/* Live Preview & Code Generator */}
          <div className="lg:col-span-7 space-y-6">
            {/* Live Canvas Box */}
            <div className="p-6 rounded-2xl bg-[#12151d] border border-[rgba(255,255,255,0.08)] shadow-xl flex flex-col items-center justify-center relative overflow-hidden group">
              <div className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl border border-[rgba(255,255,255,0.08)] transition-transform duration-300 group-hover:scale-[1.02]">
                <img
                  src={thumbUrl}
                  alt={thumbSeed}
                  className="w-full h-auto object-cover"
                />
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs font-mono text-slate-400">
                <span>
                  {thumbWidth} × {thumbHeight} px
                </span>
                <span>•</span>
                <span>seed: "{thumbSeed}"</span>
              </div>
            </div>

            {/* Code Snippets Panel */}
            <div className="p-5 rounded-2xl bg-[#12151d] border border-[rgba(255,255,255,0.08)] space-y-3">
              <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.08)] pb-3">
                <div className="flex items-center gap-1.5">
                  {[
                    { key: "url", label: "Direct URL" },
                    { key: "jsx", label: "React JSX" },
                    { key: "html", label: "HTML <img>" },
                    { key: "markdown", label: "Markdown" },
                    { key: "svg", label: "Raw SVG" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setThumbCodeTab(tab.key)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        thumbCodeTab === tab.key
                          ? "bg-amber-500/20 text-emerald-300 border border-emerald-500/30"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    let code = thumbUrl;
                    if (thumbCodeTab === "jsx") {
                      code = `<img src="${thumbUrl}" alt="${thumbText || thumbSeed}" width={${thumbWidth}} height={${thumbHeight}} />`;
                    } else if (thumbCodeTab === "html") {
                      code = `<img src="${thumbUrl}" alt="${thumbText || thumbSeed}" width="${thumbWidth}" height="${thumbHeight}" />`;
                    } else if (thumbCodeTab === "markdown") {
                      code = `![Thumbnail for ${thumbText || thumbSeed}](${thumbUrl})`;
                    } else if (thumbCodeTab === "svg") {
                      code = thumbRawSvg;
                    }
                    copyToClipboard(code, "Snippet");
                  }}
                  className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer flex items-center gap-1"
                >
                  <span>📋 Copy Code</span>
                </button>
              </div>

              {/* Code output area */}
              <div className="p-4 rounded-xl bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] font-mono text-xs text-emerald-300/90 overflow-x-auto whitespace-pre">
                {thumbCodeTab === "url" && thumbUrl}
                {thumbCodeTab === "jsx" &&
                  `<img src="${thumbUrl}" alt="${thumbText || thumbSeed}" width={${thumbWidth}} height={${thumbHeight}} />`}
                {thumbCodeTab === "html" &&
                  `<img src="${thumbUrl}" alt="${thumbText || thumbSeed}" width="${thumbWidth}" height="${thumbHeight}" />`}
                {thumbCodeTab === "markdown" &&
                  `![Thumbnail for ${thumbText || thumbSeed}](${thumbUrl})`}
                {thumbCodeTab === "svg" &&
                  (thumbRawSvg || "<!-- Loading vector SVG XML... -->")}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── TAB 3: INSPIRATION GALLERY */}
      {activeTab === "gallery" && (
        <div className="space-y-8">
          {/* Avatar Personas Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  Curated User Personas
                </h3>
                <p className="text-xs text-slate-400">
                  Ready-to-use vector user avatars for UI prototypes and test
                  suites.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400">
                {AVATAR_PRESETS.length} Personas
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {AVATAR_PRESETS.map((preset) => {
                const url = mediaApi.getAvatarUrl(preset, {
                  size: 128,
                  rounded: true,
                });
                return (
                  <div
                    key={preset}
                    className="p-4 rounded-2xl bg-[#12151d] border border-[rgba(255,255,255,0.08)] hover:border-emerald-500/40 transition-all flex flex-col items-center justify-between text-center space-y-3 group"
                  >
                    <img
                      src={url}
                      alt={preset}
                      className="w-16 h-16 rounded-full object-contain group-hover:scale-110 transition-transform shadow-md"
                    />
                    <div className="w-full min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {preset}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        128 × 128
                      </p>
                    </div>
                    <div className="w-full flex items-center gap-1 pt-1 border-t border-[rgba(255,255,255,0.08)]">
                      <button
                        type="button"
                        onClick={() => {
                          handleGenerateAvatar(
                            preset,
                            avatarDraftSize,
                            avatarDraftRounded,
                          );
                          setActiveTab("avatars");
                        }}
                        className="flex-1 py-1 rounded-md bg-[#0c0e14] text-slate-300 hover:text-emerald-300 text-[11px] font-semibold transition-colors cursor-pointer"
                      >
                        Inspect
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(url, preset)}
                        className="p-1 rounded-md bg-[#0c0e14] text-slate-400 hover:text-white text-[11px] transition-colors cursor-pointer"
                        title="Copy Link"
                      >
                        🔗
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Landscape Thumbnail Gallery */}
          <div className="space-y-4 pt-6 border-t border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">
                  Editorial Cover Gallery
                </h3>
                <p className="text-xs text-slate-400">
                  Pre-configured landscape cards for blog publications and media
                  headers.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400">
                {THUMBNAIL_PRESETS.length} Covers
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {THUMBNAIL_PRESETS.map((item) => {
                const url = mediaApi.getThumbnailUrl(item.seed, {
                  width: item.width,
                  height: item.height,
                  text: item.text,
                  description: item.description,
                });
                return (
                  <div
                    key={item.seed}
                    className="p-4 rounded-2xl bg-[#12151d] border border-[rgba(255,255,255,0.08)] hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div className="rounded-xl overflow-hidden border border-[rgba(255,255,255,0.08)]">
                      <img
                        src={url}
                        alt={item.text}
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white line-clamp-1">
                        {item.text}
                      </h4>
                      {item.description && (
                        <p className="text-xs text-slate-400 line-clamp-1">
                          {item.description}
                        </p>
                      )}
                      <p className="text-[11px] text-slate-500 font-mono">
                        {item.width} × {item.height} px · seed: {item.seed}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[rgba(255,255,255,0.08)]">
                      <button
                        type="button"
                        onClick={() => {
                          handleGenerateThumbnail(
                            item.seed,
                            item.text,
                            item.description || "",
                            item.width,
                            item.height,
                          );
                          setActiveTab("thumbnails");
                        }}
                        className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer"
                      >
                        Customize in Studio →
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(url, item.text)}
                        className="px-2.5 py-1 rounded-lg bg-[#0c0e14] text-slate-300 hover:text-white text-xs font-mono transition-colors cursor-pointer"
                      >
                        Copy URL
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────── TAB 4: API SPECIFICATION */}
      {activeTab === "specs" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#12151d] border border-[rgba(255,255,255,0.08)] space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>⚡</span>
              <span>Vector Media REST Endpoints Specification</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              These endpoints generate and serve standard SVG markup dynamically
              directly over HTTP with high-performance edge cache headers.
            </p>

            <div className="space-y-4 pt-2">
              {/* Endpoint 1 */}
              <div className="p-5 rounded-2xl bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold font-mono text-xs border border-emerald-500/30">
                      GET
                    </span>
                    <span className="font-mono text-sm font-bold text-white">
                      /api/v1/avatars/:seed
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Content-Type: image/svg+xml
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Generates deterministic gradient SVG avatar with centered user
                  initials based on the provided string seed.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-[#12151d] border border-[rgba(255,255,255,0.08)]">
                    <span className="text-emerald-400 font-bold">:seed</span>
                    <p className="text-slate-400 text-[11px] font-sans mt-0.5">
                      Required URL parameter
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#12151d] border border-[rgba(255,255,255,0.08)]">
                    <span className="text-sky-400 font-bold">?size=128</span>
                    <p className="text-slate-400 text-[11px] font-sans mt-0.5">
                      Integer pixels (default: 128)
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#12151d] border border-[rgba(255,255,255,0.08)]">
                    <span className="text-purple-400 font-bold">
                      ?rounded=true
                    </span>
                    <p className="text-slate-400 text-[11px] font-sans mt-0.5">
                      Circle vs squircle border
                    </p>
                  </div>
                </div>
              </div>

              {/* Endpoint 2 */}
              <div className="p-5 rounded-2xl bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold font-mono text-xs border border-emerald-500/30">
                      GET
                    </span>
                    <span className="font-mono text-sm font-bold text-white">
                      /api/v1/thumbnails/:seed
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">
                    Content-Type: image/svg+xml
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Generates landscape thumbnail SVG cover cards with mesh
                  gradient background, multiline word-wrapping, and optional
                  subtitle/description typography.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-[#12151d] border border-[rgba(255,255,255,0.08)]">
                    <span className="text-emerald-400 font-bold">:seed</span>
                    <p className="text-slate-400 text-[11px] font-sans mt-0.5">
                      Required URL seed
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#12151d] border border-[rgba(255,255,255,0.08)]">
                    <span className="text-sky-400 font-bold">?width=600</span>
                    <p className="text-slate-400 text-[11px] font-sans mt-0.5">
                      Width in px (default: 600)
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#12151d] border border-[rgba(255,255,255,0.08)]">
                    <span className="text-sky-400 font-bold">?height=400</span>
                    <p className="text-slate-400 text-[11px] font-sans mt-0.5">
                      Height in px (default: 400)
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#12151d] border border-[rgba(255,255,255,0.08)]">
                    <span className="text-purple-400 font-bold">?text=...</span>
                    <p className="text-slate-400 text-[11px] font-sans mt-0.5">
                      Multiline wrapped title
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#12151d] border border-[rgba(255,255,255,0.08)]">
                    <span className="text-emerald-400 font-bold">
                      ?description=...
                    </span>
                    <p className="text-slate-400 text-[11px] font-sans mt-0.5">
                      Optional subtitle description
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Media;
