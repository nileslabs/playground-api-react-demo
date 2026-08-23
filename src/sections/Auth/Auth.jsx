import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router";
import { useAuth } from "@/context/AuthContext";
import { mediaApi } from "@/api/media";
import HowItWorksBanner from "@/components/common/HowItWorksBanner";

const QUICK_ACCOUNTS = [
  {
    label: "Bret",
    username: "Bret",
    email: "Sincere@april.biz",
    role: "Dev Lead",
  },
  {
    label: "Antonette",
    username: "Antonette",
    email: "Shanna@melissa.tv",
    role: "Editor",
  },
  {
    label: "Samantha",
    username: "Samantha",
    email: "Nathan@yesenia.net",
    role: "Viewer",
  },
  {
    label: "Karianne",
    username: "Karianne",
    email: "Julianne.OConner@kory.org",
    role: "Tester",
  },
];

const Auth = () => {
  const { user, accessToken, isAuthenticated, login, register, logout } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/products";

  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Sign In Form State
  const [loginIdentifier, setLoginIdentifier] = useState("Bret");
  const [loginPassword, setLoginPassword] = useState("password123");

  // Sign Up Form State
  const [regName, setRegName] = useState("Nilesh Developer");
  const [regUsername, setRegUsername] = useState("nilesh_dev");
  const [regEmail, setRegEmail] = useState("nilesh@example.dev");
  const [regCompany, setRegCompany] = useState("Acme Cloud Lab");
  const [regPhone, setRegPhone] = useState("+1-555-0199");
  const [regWebsite, setRegWebsite] = useState("https://nilesh.dev");

  const handleSignIn = async (e) => {
    e?.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      const isEmail = loginIdentifier.includes("@");
      const payload = isEmail
        ? { email: loginIdentifier, password: loginPassword }
        : { username: loginIdentifier, password: loginPassword };

      const res = await login(payload);
      setSuccessMessage(
        `Welcome back, ${res.user?.name || res.user?.username}! Redirecting to Products...`,
      );
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 600);
    } catch (err) {
      setErrorMessage(err.message || "Failed to authenticate.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (e) => {
    e?.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      const payload = {
        name: regName.trim(),
        username: regUsername.trim(),
        email: regEmail.trim(),
        company: regCompany ? { name: regCompany } : undefined,
        phone: regPhone.trim(),
        website: regWebsite.trim(),
      };

      const res = await register(payload);
      setSuccessMessage(
        `Account created for ${res.user?.name}! Redirecting to Products...`,
      );
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 600);
    } catch (err) {
      setErrorMessage(err.message || "Failed to create account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (account) => {
    setLoginIdentifier(account.username);
    setLoginPassword("password123");
    setMode("signin");
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ── Sleek Unified Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              JWT Authentication Hub
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              /auth
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Simulate JWT logins, inspect token payload claims, and test Bearer
            protected routes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-mono flex items-center gap-2.5">
            <span
              className={`w-2 h-2 rounded-full ${isAuthenticated ? "bg-emerald-400 ring-2 ring-emerald-500/30 animate-pulse" : "bg-slate-500"}`}
            />
            <span className="text-slate-300">
              {isAuthenticated
                ? `Authenticated (@${user?.username})`
                : "Unauthenticated"}
            </span>
          </div>
        </div>
      </div>

      {/* ── API Feature Explainer Banner ── */}
      <HowItWorksBanner
        title="Stateless Fake JWT Authentication (/auth/login & /auth/me)"
        subtitle="Simulate complete JWT login loops without creating authentication microservices. Receive valid sign-in claims, test access token expiration, token refresh rotation, and Bearer protected API routes."
        badge="JWT Authentication Simulator"
        endpoint="POST /api/v1/auth/login"
        codeSnippet={`// 1. Authenticate with username/password to receive tokens
const res = await fetch('https://playground.nileslabs.com/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'Bret',
    password: 'password123',
  }),
});
const { access_token, refresh_token, user } = await res.json();

// 2. Access protected endpoint with Bearer token
const profileRes = await fetch('https://playground.nileslabs.com/api/v1/auth/me', {
  headers: { Authorization: \`Bearer \${access_token}\` },
});
const profile = await profileRes.json();`}
        payloadExample={{
          access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          refresh_token: "dGhpcy1pcy1hLXJlZnJlc2gtdG9rZW4...",
          user: {
            id: 1,
            username: "Bret",
            email: "Sincere@april.biz",
          },
        }}
      />

      {/* ── Active Authenticated Session State ── */}
      {isAuthenticated && (
        <div className="p-6 sm:p-8 rounded-2xl bg-linear-to-b from-[#12151d] to-[#0c0e14] border border-emerald-500/30 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center gap-4">
              <img
                src={mediaApi.getAvatarUrl(user?.username || "user", {
                  size: 64,
                  rounded: true,
                })}
                alt={user?.name || "User"}
                className="w-14 h-14 rounded-full border-2 border-emerald-500/40 shadow-lg object-contain"
              />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">
                    {user?.name || "Authenticated User"}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-emerald-500/30">
                    Active Session
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">
                  @{user?.username} · {user?.email}
                </p>
                {user?.company?.name && (
                  <p className="text-[11px] text-emerald-400 font-sans">
                    {user.company.name}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/products"
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/10 cursor-pointer flex items-center gap-2"
              >
                <span>📦 Open Products Catalog</span>
                <span>→</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="px-4 py-2.5 rounded-xl bg-[#0c0e14] hover:bg-rose-500/10 border border-[rgba(255,255,255,0.08)] hover:border-rose-500/30 text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>

          {/* Token Inspector & Claims */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] space-y-2">
              <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Bearer Access Token (15m expiry)</span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  Verified
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#12151d] font-mono text-[11px] text-emerald-300/80 break-all select-all max-h-24 overflow-y-auto">
                {accessToken}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] space-y-2">
              <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
                <span>Decoded Session Metadata</span>
                <span className="text-[10px] text-sky-400 font-mono">
                  User ID #{user?.id}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#12151d] font-mono text-[11px] text-slate-300 space-y-1">
                <div>
                  <span className="text-slate-500">identityId:</span>{" "}
                  <span className="text-white font-bold">
                    {user?._sandbox ? "Sandbox Overlay" : "Global Baseline"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">scope:</span>{" "}
                  <span className="text-emerald-400">
                    admin, custom_resources:rw
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">phone:</span>{" "}
                  <span className="text-slate-300">{user?.phone || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Auth Card (Login & Registration) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Auth Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-[#12151d] border border-[rgba(255,255,255,0.08)] shadow-xl space-y-6">
          {/* Mode Switcher Tabs */}
          <div className="flex p-1 rounded-xl bg-[#0c0e14] border border-[rgba(255,255,255,0.08)]">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === "signin"
                  ? "bg-white/10 text-white shadow-md shadow-emerald-600/10"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In to Sandbox
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === "signup"
                  ? "bg-white/10 text-white shadow-md shadow-emerald-600/10"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Create Sandbox Account
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
              <span>✓</span>
              <span>{successMessage}</span>
            </div>
          )}

          {/* ── Mode 1: Sign In Form ── */}
          {mode === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Username or Email Address{" "}
                  <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  placeholder="e.g. Bret or Sincere@april.biz"
                  className="w-full bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                />
                <p className="text-[11px] text-slate-500">
                  Matches existing user records in the sandbox identity overlay.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Password{" "}
                  <span className="text-slate-500">
                    (Mock auth accepts any string)
                  </span>
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                />
              </div>

              {/* Quick Demo Credentials Strip */}
              <div className="space-y-2 pt-2 border-t border-[rgba(255,255,255,0.08)]">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  1-Click Test Personas:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {QUICK_ACCOUNTS.map((acc) => (
                    <button
                      key={acc.username}
                      type="button"
                      onClick={() => handleQuickLogin(acc)}
                      className={`p-2 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        loginIdentifier === acc.username
                          ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 font-bold"
                          : "bg-[#0c0e14] border-[rgba(255,255,255,0.08)] text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="font-semibold text-white truncate">
                        {acc.label}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {acc.role}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Authorizing Session...</span>
                  </>
                ) : (
                  <>
                    <span>⚡ Sign In & Enter Products Hub</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── Mode 2: Sign Up Form ── */}
          {mode === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Full Name <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. Jane Doe"
                    className="w-full bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Username <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="e.g. janedoe"
                    className="w-full bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Email Address <span className="text-emerald-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="e.g. jane@example.dev"
                    className="w-full bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Company / Organization
                  </label>
                  <input
                    type="text"
                    value={regCompany}
                    onChange={(e) => setRegCompany(e.target.value)}
                    placeholder="e.g. Acme Cloud"
                    className="w-full bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+1-555-0199"
                    className="w-full bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Portfolio Website
                  </label>
                  <input
                    type="url"
                    value={regWebsite}
                    onChange={(e) => setRegWebsite(e.target.value)}
                    placeholder="https://janedoe.dev"
                    className="w-full bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-linear-to-r bg-emerald-600 hover:bg-emerald-500 text-white hover:brightness-110 text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Registering New User...</span>
                  </>
                ) : (
                  <>
                    <span>✨ Register & Auto Sign In</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Right: Architecture & API Specs Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-2xl bg-[#12151d] border border-[rgba(255,255,255,0.08)] space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>🔒</span>
              <span>JWT Authentication Engine</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The Playground API provides industry-standard JWT token simulation
              with full OAuth2/OpenID-style headers:
            </p>

            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold">
                    POST /auth/login
                  </span>
                  <span className="text-emerald-400">200 OK</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Issues dual access_token (15m) + refresh_token (7d) signed
                  with HMAC-SHA256.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-sky-400 font-bold">GET /auth/me</span>
                  <span className="text-slate-400">Bearer Auth</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Extracts claims from Authorization header and returns user
                  profile.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-purple-400 font-bold">
                    POST /auth/register
                  </span>
                  <span className="text-emerald-400">201 Created</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Creates sandbox user record with ID `local-&lt;uuid&gt;` and
                  logs in automatically.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-amber-500/10 border border-emerald-500/20 text-emerald-300 space-y-2">
            <h4 className="text-xs font-bold flex items-center gap-1.5">
              <span>💡</span>
              <span>Protected Custom Resource Flow</span>
            </h4>
            <p className="text-[11px] leading-relaxed text-amber-200/80">
              Once signed in, your session unlocks the{" "}
              <strong>E-Commerce Products Catalog</strong> on the sidebar,
              allowing you to seed, query, create, edit, and delete custom
              products isolated to your sandbox.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
