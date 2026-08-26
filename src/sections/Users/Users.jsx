import { useState, useEffect, useCallback, useMemo } from "react";
import { usersApi } from "@/api/users";
import { mediaApi } from "@/api/media";
import Pagination from "@/components/Pagination";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import ConfirmationModal from "@/components/ConfirmationModal";
import SortDropdown from "@/components/SortDropdown";
import SearchInput from "@/components/SearchInput";
import { UserCardSkeletonGrid } from "@/components/Skeletons";
import HowItWorksBanner from "@/components/common/HowItWorksBanner";

/* ─────────────────────────────────────────────────────────────── constants & helpers */
const SORT_OPTIONS = [
  { value: "id", label: "User ID" },
  { value: "name", label: "Full Name" },
  { value: "username", label: "Username" },
  { value: "email", label: "Email Address" },
];

const EMPTY_FORM = {
  name: "",
  username: "",
  email: "",
  phone: "",
  website: "",
  address_street: "",
  address_city: "",
  address_zipcode: "",
  company_name: "",
  company_catchPhrase: "",
};

/** Re-nests flat form state back to the nested shape the API expects. */
const toApiBody = (form) => ({
  name: form.name,
  username: form.username,
  email: form.email,
  phone: form.phone,
  website: form.website,
  address: {
    street: form.address_street,
    city: form.address_city,
    zipcode: form.address_zipcode,
  },
  company: {
    name: form.company_name,
    catchPhrase: form.company_catchPhrase,
  },
});

function SandboxBadge({ value }) {
  if (!value) return null;
  const map = {
    created: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    updated: "bg-white/10 text-white border-white/20",
  };
  return (
    <span
      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${map[value] ?? "bg-slate-500/15 text-slate-300 border-slate-500/30"}`}
    >
      {value.toUpperCase()}
    </span>
  );
}

function Avatar({ name, size = "md" }) {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const palette = [
    "from-amber-500 to-amber-700 text-white",
    "from-sky-500 to-blue-700 text-white",
    "from-emerald-500 to-teal-700 text-white",
    "from-indigo-500 to-violet-700 text-white",
    "from-rose-500 to-pink-700 text-white",
    "from-teal-500 to-emerald-700 text-white",
  ];
  const colour = palette[(name || "").charCodeAt(0) % palette.length];
  const sz = size === "lg" ? "w-14 h-14 text-base" : size === "sm" ? "w-7 h-7 text-[11px]" : "w-9 h-9 text-xs";
  return (
    <div
      className={`${sz} rounded-xl bg-linear-to-br ${colour} flex items-center justify-center font-bold shrink-0 shadow-xs ring-1 ring-white/10`}
    >
      {initials}
    </div>
  );
}

function Spinner({ className = "" }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  );
}

/* ───────────────────────────────────────────── UserForm (Create / Edit) */
function UserForm({
  initial = EMPTY_FORM,
  onSubmit,
  loading,
  submitLabel = "Save Changes",
}) {
  const [form, setForm] = useState(initial);
  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const SECTIONS = [
    {
      title: "Identity & Credentials",
      fields: [
        { key: "name", label: "Full Name", placeholder: "e.g. Eleanor Vance", required: true },
        { key: "username", label: "Username", placeholder: "e.g. evance", required: true },
        { key: "email", label: "Corporate Email", placeholder: "eleanor@company.io", required: true, type: "email" },
        { key: "phone", label: "Direct Phone", placeholder: "+1 (555) 019-2834", required: false },
        { key: "website", label: "Work Portal / Website", placeholder: "https://portfolio.dev", required: false },
      ],
    },
    {
      title: "Company Affiliation",
      fields: [
        { key: "company_name", label: "Organization Name", placeholder: "Apex Capital Partners", required: false },
        { key: "company_catchPhrase", label: "Focus / Mission", placeholder: "Decentralized liquidity protocols", required: false },
      ],
    },
    {
      title: "Location / Headquarters",
      fields: [
        { key: "address_street", label: "Street Address", placeholder: "742 Evergreen Terrace", required: false },
        { key: "address_city", label: "City", placeholder: "San Francisco", required: false },
        { key: "address_zipcode", label: "Zip / Postal Code", placeholder: "94107", required: false },
      ],
    },
  ];

  const inputCls =
    "w-full bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-amber-500/30 transition-all";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(toApiBody(form));
      }}
      className="space-y-6"
    >
      {SECTIONS.map(({ title, fields }) => (
        <div key={title} className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 border-b border-[rgba(255,255,255,0.08)] pb-1.5 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            {title}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {fields.map(({ key, label, placeholder, required, type = "text" }) => (
              <div key={key} className={`space-y-1 ${key === "name" || key === "company_catchPhrase" ? "sm:col-span-2" : ""}`}>
                <label className="text-xs font-semibold text-slate-300">
                  {label}
                  {required && <span className="text-emerald-400 ml-1">*</span>}
                </label>
                <input
                  id={`user-form-${key}`}
                  type={type}
                  value={form[key] || ""}
                  onChange={set(key)}
                  required={required}
                  placeholder={placeholder}
                  className={inputCls}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="pt-3 border-t border-[rgba(255,255,255,0.08)]">
        <button
          id="user-form-submit"
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-bold transition-all shadow-md shadow-emerald-600/10 cursor-pointer"
        >
          {loading && <Spinner className="w-4 h-4 text-white" />}
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

/* ───────────────────────────────────────────── Slide-Over Inspector Drawer */
function UserInspectorDrawer({ user, onClose, onEdit, onDelete }) {
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'company' | 'json'
  const [copied, setCopied] = useState(false);

  if (!user) return null;

  const avatarSrc = user.avatar && user.avatar.startsWith('http')
    ? user.avatar
    : mediaApi.getAvatarUrl(user.username || user.name || user.id, { size: 128 });

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(user, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-xl bg-[#12151d] border-l border-[rgba(255,255,255,0.08)] h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header Strip */}
        <div className="p-6 border-b border-[rgba(255,255,255,0.08)] bg-[#0c0e14] shrink-0">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3.5">
              <img
                src={avatarSrc}
                alt={user.name}
                className="w-14 h-14 rounded-2xl object-cover shrink-0 ring-2 ring-emerald-500/40"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-white tracking-tight truncate">
                  {user.name}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400 font-mono">@{user.username}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#12151d] text-slate-300 border border-[rgba(255,255,255,0.08)]">
                    #USR-{String(user.id).padStart(4, "0")}
                  </span>
                  {user._sandbox && <SandboxBadge value={user._sandbox} />}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-t border-[rgba(255,255,255,0.08)] pt-3">
            {[
              { key: "overview", label: "Profile Info" },
              { key: "company", label: "Company & Address" },
              { key: "json", label: "Live REST Payload" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  activeTab === tab.key
                    ? "bg-white/10 text-white font-bold shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-[rgba(255,255,255,0.08)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Drawer Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Communication Channels</span>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between py-1.5 border-b border-[rgba(255,255,255,0.08)]">
                    <span className="text-slate-400">Email Address</span>
                    <a href={`mailto:${user.email}`} className="text-emerald-400 hover:underline font-mono text-xs">
                      {user.email}
                    </a>
                  </div>
                  <div className="flex items-center justify-between py-1.5 border-b border-[rgba(255,255,255,0.08)]">
                    <span className="text-slate-400">Direct Phone</span>
                    <span className="text-slate-200 font-mono text-xs">{user.phone || "Not specified"}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5">
                    <span className="text-slate-400">Website / URL</span>
                    {user.website ? (
                      <a
                        href={user.website.startsWith("http") ? user.website : `https://${user.website}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sky-400 hover:underline text-xs"
                      >
                        {user.website}
                      </a>
                    ) : (
                      <span className="text-slate-500 text-xs">N/A</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Sandbox Isolation Context</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Record ID <span className="font-mono text-emerald-300">{user.id}</span> is maintained within your browser session token overlay.
                </p>
              </div>
            </div>
          )}

          {activeTab === "company" && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] space-y-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Corporate Affiliation</span>
                <div className="text-base font-bold text-white">
                  {user.company?.name || "Independent Professional"}
                </div>
                {user.company?.catchPhrase && (
                  <p className="text-xs text-emerald-300/90 italic bg-amber-500/5 p-3 rounded-xl border border-emerald-500/20">
                    "{user.company.catchPhrase}"
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Location Coordinates</span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#12151d] border border-[rgba(255,255,255,0.08)]">
                    <span className="text-slate-500 block mb-1">Street</span>
                    <span className="font-semibold text-slate-200">{user.address?.street || "N/A"}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#12151d] border border-[rgba(255,255,255,0.08)]">
                    <span className="text-slate-500 block mb-1">City</span>
                    <span className="font-semibold text-slate-200">{user.address?.city || "N/A"}</span>
                  </div>
                  <div className="col-span-2 p-3 rounded-xl bg-[#12151d] border border-[rgba(255,255,255,0.08)]">
                    <span className="text-slate-500 block mb-1">Postal Zipcode</span>
                    <span className="font-mono text-slate-200">{user.address?.zipcode || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "json" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Live JSON Payload</span>
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="px-2.5 py-1 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[#1a202c] text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {copied ? "✓ Copied" : "Copy Payload"}
                </button>
              </div>
              <div className="p-4 rounded-2xl bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] font-mono text-xs text-amber-200/90 overflow-x-auto leading-relaxed max-h-96">
                <pre>{JSON.stringify(user, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-[rgba(255,255,255,0.08)] bg-[#0c0e14] flex gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(user)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            Edit Record
          </button>
          <button
            type="button"
            onClick={() => onDelete(user)}
            className="py-2.5 px-4 rounded-xl bg-[rgba(255,255,255,0.08)] hover:bg-rose-900/40 border border-[rgba(255,255,255,0.08)] hover:border-rose-700/50 text-slate-300 hover:text-rose-300 font-semibold text-sm transition-colors cursor-pointer flex items-center gap-1.5"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────── Toast */
function Toast({ toasts }) {
  return (
    <div className="fixed bottom-6 right-6 z-60 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto px-4 py-3 rounded-xl border text-sm font-semibold shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-right-4 ${
            t.type === "error"
              ? "bg-rose-950/90 border-rose-700 text-rose-200"
              : t.type === "warn"
                ? "bg-amber-950/90 border-amber-600 text-amber-200"
                : "bg-emerald-950/90 border-emerald-600 text-emerald-200"
          }`}
        >
          {t.type === "error" ? "✕" : t.type === "warn" ? "⚠" : "✓"} {t.msg}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────── Main Users component */
const Users = () => {
  // ── State ───────────────────────────────
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'cards'
  const [filterMode, setFilterMode] = useState("all"); // 'all' | 'mutated' | 'seeded'
  const [settledKey, setSettledKey] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const queryKey = `${page}||${search}||${sortField}||${sortOrder}||${refreshKey}`;
  const loading = queryKey !== settledKey;

  const [modal, setModal] = useState(null); // null | { type: 'create'|'edit'|'delete', user? }
  const [inspectingUser, setInspectingUser] = useState(null);
  const [mutating, setMutating] = useState(false);

  // ── Toast helper ────────────────────────
  const toast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // ── Fetch list ───────────────────────────
  useEffect(() => {
    let cancelled = false;
    usersApi
      .list({ page, limit: 10, q: search, _sort: sortField, _order: sortOrder })
      .then((res) => {
        if (cancelled) return;
        setUsers(res.data ?? []);
        setPagination(res.pagination ?? {});
        setSettledKey(queryKey);
      })
      .catch((err) => {
        if (cancelled) return;
        toast(err.message || "Failed to load records", "error");
        setSettledKey(queryKey);
      });
    return () => {
      cancelled = true;
    };
  }, [queryKey, toast, page, search, sortField, sortOrder, refreshKey]);

  // ── CRUD handlers ───────────────────────
  const handleCreate = async (form) => {
    setMutating(true);
    try {
      await usersApi.create(form);
      toast("Profile registered in sandbox!");
      setModal(null);
      setPage(1);
      refresh();
    } catch (err) {
      toast(err.message || "Registration failed", "error");
    } finally {
      setMutating(false);
    }
  };

  const handleEdit = async (form) => {
    setMutating(true);
    try {
      await usersApi.patch(modal.user.id, form);
      toast("Profile updated in sandbox!");
      setModal(null);
      if (inspectingUser?.id === modal.user.id) {
        setInspectingUser((prev) => ({ ...prev, ...form }));
      }
      refresh();
    } catch (err) {
      toast(err.message || "Update failed", "error");
    } finally {
      setMutating(false);
    }
  };

  const handleDelete = async () => {
    setMutating(true);
    try {
      await usersApi.remove(modal.user.id);
      toast("Profile deleted from sandbox session.", "warn");
      setModal(null);
      if (inspectingUser?.id === modal.user.id) {
        setInspectingUser(null);
      }
      refresh();
    } catch (err) {
      toast(err.message || "Delete failed", "error");
    } finally {
      setMutating(false);
    }
  };

  const handleOpenDrawer = async (user) => {
    setInspectingUser(user);
    try {
      const full = await usersApi.getById(user.id);
      setInspectingUser(full);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSearch = useCallback((term) => {
    setSearch((prev) => {
      if (prev === term) return prev;
      setPage(1);
      return term;
    });
  }, []);

  const handleSortChange = (field, order) => {
    setPage(1);
    setSortField(field);
    setSortOrder(order);
  };

  // ── Client-side Filtered items ───────────
  const displayedUsers = useMemo(() => {
    if (filterMode === "mutated") return users.filter((u) => u._sandbox);
    if (filterMode === "seeded") return users.filter((u) => !u._sandbox);
    return users;
  }, [users, filterMode]);

  const mutatedCount = useMemo(() => users.filter((u) => u._sandbox).length, [users]);

  return (
    <div className="space-y-6">
      {/* ── Sleek Unified Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Team & User Directory
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              /users
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Search 25+ user profiles with deterministic vector SVG avatars and relational lookups.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setModal({ type: "create" })}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
          >
            <span>+</span>
            <span>New User</span>
          </button>
        </div>
      </div>

      {/* ── API Feature Explainer Banner ── */}
      <HowItWorksBanner
        title="Team Directory & Dynamic SVG Avatars (/users & /avatars/:seed)"
        subtitle="Demonstrates full-text fuzzy search across user profiles, relational data querying, and deterministic vector SVG avatar generation with zero external asset dependencies."
        badge="Search & Avatar Engine"
        endpoint="GET /api/v1/users?q=Bret"
        codeSnippet={`// 1. Search users by query or sort by name
const res = await fetch('https://playground.nileslabs.com/api/v1/users?q=Bret&_sort=name&_order=asc', {
  credentials: 'include',
});
const { data } = await res.json();

// 2. Render deterministic vector SVG avatar for any username
const avatarUrl = 'https://playground.nileslabs.com/api/v1/avatars/' + encodeURIComponent(user.username);
// <img src={avatarUrl} alt={user.name} />`}
        payloadExample={{
          name: "Leanne Graham",
          username: "Bret",
          email: "Sincere@april.biz",
          phone: "1-770-736-8031",
          company: { name: "Romaguera-Crona" }
        }}
      />

      {/* ── Toolbar: Search, Filters, View Switcher & Action ── */}
      <div className="p-4 rounded-2xl bg-[#12151d] border border-[rgba(255,255,255,0.08)] shadow-md space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <SearchInput
              id="users-search"
              className="flex-1"
              placeholder="Search by name, handle, or email…"
              value={search}
              onSearch={handleSearch}
            />
            <SortDropdown
              options={SORT_OPTIONS}
              value={sortField}
              order={sortOrder}
              onSortChange={handleSortChange}
            />
          </div>

          {/* Right Controls: View Switcher & Create Button */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* View Switcher Segmented Control */}
            <div className="flex items-center p-1 rounded-xl bg-[#0c0e14] border border-[rgba(255,255,255,0.08)]">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "table"
                    ? "bg-white/10 text-white font-bold shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Data Table View"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "cards"
                    ? "bg-white/10 text-white font-bold shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Card Grid View"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>

            {/* Create User Button */}
            <button
              id="btn-create-user"
              onClick={() => setModal({ type: "create" })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all shadow-md shadow-emerald-600/10 shrink-0 cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              <span>New Profile</span>
            </button>
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-[rgba(255,255,255,0.08)] text-xs">
          <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider mr-1">Filter:</span>
          {[
            { key: "all", label: `All Profiles (${pagination.total ?? 0})` },
            { key: "mutated", label: `Sandbox Overlays (${mutatedCount})` },
            { key: "seeded", label: `Base Seeds` },
          ].map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => setFilterMode(chip.key)}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer font-medium ${
                filterMode === chip.key
                  ? "bg-amber-500/15 text-emerald-300 border border-emerald-500/30 font-semibold"
                  : "text-slate-400 hover:text-white bg-[#0c0e14] border border-[rgba(255,255,255,0.08)]"
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Data Presentation: Table vs Card Grid ── */}
      {viewMode === "table" ? (
        <DataTable
          loading={loading}
          skeletonRows={pagination.limit ?? 10}
          data={displayedUsers}
          empty="No profile records matching the query."
          columns={[
            {
              key: "user",
              header: "Identity & Handle",
              width: "2.2fr",
              render: (user) => (
                <button
                  id={`view-user-${user.id}`}
                  onClick={() => handleOpenDrawer(user)}
                  className="flex items-center gap-3 min-w-0 text-left hover:opacity-90 transition-opacity w-full cursor-pointer group"
                  title="Inspect Profile"
                >
                  <img
                    src={user.avatar && user.avatar.startsWith('http') ? user.avatar : mediaApi.getAvatarUrl(user.username || user.id, { size: 64 })}
                    alt={user.name}
                    className="w-9 h-9 rounded-xl object-cover shrink-0 ring-1 ring-emerald-500/30"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate leading-snug group-hover:text-emerald-400 transition-colors">
                      {user.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">
                      @{user.username} · #{String(user.id).padStart(4, "0")}
                    </p>
                  </div>
                  {user._sandbox && <SandboxBadge value={user._sandbox} />}
                </button>
              ),
            },
            {
              key: "company",
              header: "Company",
              width: "1.8fr",
              render: (user) => (
                <div className="min-w-0">
                  <span className="text-sm text-slate-200 font-medium truncate block">
                    {user.company?.name || "Independent"}
                  </span>
                  <span className="text-[11px] text-slate-400 truncate block">
                    {user.address?.city || "Remote"}
                  </span>
                </div>
              ),
            },
            {
              key: "email",
              header: "Contact Email",
              width: "2fr",
              render: (user) => (
                <span className="text-sm text-slate-300 font-mono truncate block">
                  {user.email}
                </span>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              width: "auto",
              align: "right",
              render: (user) => (
                <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    id={`inspect-user-${user.id}`}
                    title="Inspect Profile Sheet"
                    onClick={() => handleOpenDrawer(user)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    id={`edit-user-${user.id}`}
                    title="Edit Record"
                    onClick={() => setModal({ type: "edit", user })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    id={`delete-user-${user.id}`}
                    title="Delete Record"
                    onClick={() => setModal({ type: "delete", user })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ),
            },
          ]}
        />
      ) : loading ? (
        <UserCardSkeletonGrid count={pagination.limit ?? 10} />
      ) : displayedUsers.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#12151d] border border-[rgba(255,255,255,0.08)] text-center text-slate-400 text-sm">
          No profile records matching the query.
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedUsers.map((user) => (
            <div
              key={user.id}
              className="p-5 rounded-2xl bg-[#12151d] border border-[rgba(255,255,255,0.08)] hover:border-emerald-500/50 hover:bg-[#131d33] transition-all shadow-md flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                {/* Card Top Strip */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={user.avatar && user.avatar.startsWith('http') ? user.avatar : mediaApi.getAvatarUrl(user.username || user.id, { size: 96 })}
                      alt={user.name}
                      className="w-11 h-11 rounded-xl object-cover shrink-0 ring-1 ring-emerald-500/30"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-base truncate group-hover:text-emerald-400 transition-colors">
                        {user.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">@{user.username}</p>
                    </div>
                  </div>
                  {user._sandbox && <SandboxBadge value={user._sandbox} />}
                </div>

                {/* Company & Location Badges */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300 truncate">
                    <span className="text-emerald-400 font-bold">🏢</span>
                    <span className="font-semibold truncate">{user.company?.name || "Independent"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 font-mono truncate">
                    <span>✉</span>
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 truncate">
                    <span>📍</span>
                    <span className="truncate">{user.address?.city || "Remote Location"}</span>
                  </div>
                </div>
              </div>

              {/* Card Bottom Actions */}
              <div className="pt-3 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleOpenDrawer(user)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-emerald-300 hover:bg-amber-500/20 font-semibold transition-colors cursor-pointer"
                >
                  Inspect Sheet →
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setModal({ type: "edit", user })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-[rgba(255,255,255,0.08)] transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => setModal({ type: "delete", user })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[rgba(255,255,255,0.08)] transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination Controls ── */}
      <Pagination
        currentPage={page}
        totalCount={pagination.total ?? 0}
        pageSize={pagination.limit ?? 10}
        onPageChange={setPage}
        prevLabel="Previous"
        nextLabel="Next"
      />

      {/* ── Slide-Over Inspector Drawer ── */}
      {inspectingUser && (
        <UserInspectorDrawer
          user={inspectingUser}
          onClose={() => setInspectingUser(null)}
          onEdit={(u) => {
            setInspectingUser(null);
            setModal({ type: "edit", user: u });
          }}
          onDelete={(u) => {
            setInspectingUser(null);
            setModal({ type: "delete", user: u });
          }}
        />
      )}

      {/* ── Create / Edit Modals ── */}
      {modal?.type === "create" && (
        <Modal title="Register New Corporate Profile" onClose={() => setModal(null)} size="lg">
          <UserForm onSubmit={handleCreate} loading={mutating} submitLabel="Register in Sandbox" />
        </Modal>
      )}

      {modal?.type === "edit" && (
        <Modal title={`Edit Profile — ${modal.user.name}`} onClose={() => setModal(null)} size="lg">
          <UserForm
            initial={{
              name: modal.user.name || "",
              username: modal.user.username || "",
              email: modal.user.email || "",
              phone: modal.user.phone || "",
              website: modal.user.website || "",
              address_street: modal.user.address?.street || "",
              address_city: modal.user.address?.city || "",
              address_zipcode: modal.user.address?.zipcode || "",
              company_name: modal.user.company?.name || "",
              company_catchPhrase: modal.user.company?.catchPhrase || "",
            }}
            onSubmit={handleEdit}
            loading={mutating}
            submitLabel="Commit Sandbox Changes"
          />
        </Modal>
      )}

      {/* ── Delete Confirmation Dialog ── */}
      {modal?.type === "delete" && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setModal(null)}
          title="Remove Profile from Sandbox"
          onAccept={handleDelete}
          isLoading={mutating}
          acceptLabel="Delete from Session"
          cancelLabel="Cancel"
          variant="danger"
          description="This mutation will isolate the removal of this profile within your current browser sandbox session. Global records remain intact for other workspace users."
        >
          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-rose-950/30 border border-rose-700/40">
            <Avatar name={modal.user.name} />
            <div>
              <p className="font-bold text-white text-sm">{modal.user.name}</p>
              <p className="text-xs text-slate-400 font-mono">{modal.user.email}</p>
            </div>
          </div>
        </ConfirmationModal>
      )}

      {/* ── Toast Notifications ── */}
      <Toast toasts={toasts} />
    </div>
  );
};

export default Users;
