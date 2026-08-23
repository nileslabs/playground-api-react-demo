import { useState, useEffect, useCallback, useMemo } from "react";
import { todosApi } from "@/api/todos";
import { usersApi } from "@/api/users";
import Pagination from "@/components/Pagination";
import DataTable from "@/components/DataTable";
import Modal from "@/components/Modal";
import ConfirmationModal from "@/components/ConfirmationModal";
import SortDropdown from "@/components/SortDropdown";
import SearchInput from "@/components/SearchInput";
import { TodoCardSkeletonGrid } from "@/components/Skeletons";
import HowItWorksBanner from "@/components/common/HowItWorksBanner";

/* ─────────────────────────────────────────────────────────────── constants & helpers */
const SORT_OPTIONS = [
  { value: "id", label: "Task ID" },
  { value: "title", label: "Title" },
  { value: "completed", label: "Status" },
  { value: "user_id", label: "Owner ID" },
];

const EMPTY_FORM = {
  title: "",
  user_id: 1,
  completed: false,
};

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

function StatusBadge({ completed }) {
  if (completed) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        Completed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-500/10 text-slate-400 border border-slate-700/40">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      Pending
    </span>
  );
}

function AuthorAvatar({ name, size = "md" }) {
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const sz =
    size === "lg"
      ? "w-10 h-10 text-xs"
      : size === "sm"
        ? "w-6 h-6 text-[10px]"
        : "w-7 h-7 text-xs";
  return (
    <div
      className={`${sz} rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center justify-center font-bold shrink-0`}
    >
      {initials}
    </div>
  );
}

function Spinner({ className = "" }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  );
}

/* ───────────────────────────────────────────── TodoForm (Create / Edit) */
function TodoForm({
  initial = EMPTY_FORM,
  users = [],
  onSubmit,
  loading,
  submitLabel = "Save Changes",
}) {
  const [form, setForm] = useState({
    title: initial.title || "",
    user_id: initial.user_id ? Number(initial.user_id) : 1,
    completed: Boolean(initial.completed),
  });

  const set = (key) => (e) =>
    setForm((f) => ({
      ...f,
      [key]:
        key === "user_id"
          ? Number(e.target.value)
          : key === "completed"
            ? e.target.checked
            : e.target.value,
    }));

  const inputCls =
    "w-full bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-amber-500/30 transition-all";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-6"
    >
      <div className="space-y-4">
        {/* Task Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>
              Task Description / Title <span className="text-emerald-400">*</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {form.title.length} chars
            </span>
          </label>
          <input
            id="todo-form-title"
            type="text"
            value={form.title}
            onChange={set("title")}
            required
            placeholder="e.g. Implement idempotency keys on payment mutation webhooks"
            className={inputCls}
          />
        </div>

        {/* Assigned Owner */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-300">
            Assigned Owner <span className="text-emerald-400">*</span>
          </label>
          <select
            id="todo-form-user"
            value={form.user_id}
            onChange={set("user_id")}
            className={`${inputCls} cursor-pointer`}
          >
            {users.length > 0 ? (
              users.map((u) => (
                <option
                  key={u.id}
                  value={u.id}
                  className="bg-[#12151d] text-white"
                >
                  #{u.id} — {u.name} (@{u.username})
                </option>
              ))
            ) : (
              <option value={1} className="bg-[#12151d] text-white">
                User #1 (Default Assignee)
              </option>
            )}
          </select>
        </div>

        {/* Completion Toggle */}
        <div className="p-4 rounded-xl bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] flex items-center justify-between">
          <div>
            <label
              htmlFor="todo-form-completed"
              className="text-xs font-bold text-white block cursor-pointer"
            >
              Execution Status
            </label>
            <span className="text-[11px] text-slate-400">
              Mark this assignment item as completed in the sandbox
            </span>
          </div>
          <input
            id="todo-form-completed"
            type="checkbox"
            checked={form.completed}
            onChange={set("completed")}
            className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
          />
        </div>
      </div>

      <div className="pt-3 border-t border-[rgba(255,255,255,0.08)]">
        <button
          id="todo-form-submit"
          type="submit"
          disabled={loading || !form.title.trim()}
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
function TodoInspectorDrawer({
  todo,
  author,
  onClose,
  onEdit,
  onDelete,
  onToggle,
}) {
  const [copied, setCopied] = useState(false);

  if (!todo) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(todo, null, 2));
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
            <div className="flex items-start gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shrink-0 border ${
                  todo.completed
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-amber-500/10 text-emerald-400 border-emerald-500/30"
                }`}
              >
                {todo.completed ? "✓" : "⏳"}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[#12151d] text-slate-300 border border-[rgba(255,255,255,0.08)]">
                    #TSK-{String(todo.id).padStart(4, "0")}
                  </span>
                  <StatusBadge completed={todo.completed} />
                  {todo._sandbox && <SandboxBadge value={todo._sandbox} />}
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
                  {todo.title}
                </h2>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-[rgba(255,255,255,0.08)] transition-colors cursor-pointer shrink-0"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Quick Toggle Banner */}
          <div className="p-3 rounded-xl bg-[#12151d] border border-[rgba(255,255,255,0.08)] flex items-center justify-between">
            <span className="text-xs text-slate-300 font-medium">
              Quick Status Action:
            </span>
            <button
              type="button"
              onClick={() => onToggle(todo)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                todo.completed
                  ? "bg-amber-500/10 hover:bg-amber-500/20 text-emerald-300 border border-emerald-500/30"
                  : "bg-emerald-500 hover:bg-emerald-400 text-white shadow-xs"
              }`}
            >
              {todo.completed ? "Mark as Pending" : "Mark as Completed ✓"}
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Task Info Dossier */}
          <div className="p-5 rounded-2xl bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Task Scope
            </span>
            <p className="text-sm font-semibold text-white leading-relaxed">
              {todo.title}
            </p>
          </div>

          {/* Assignee Box */}
          {author && (
            <div className="p-4 rounded-2xl bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Assigned Contributor
              </span>
              <div className="flex items-center gap-3">
                <AuthorAvatar name={author.name} size="md" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white">{author.name}</p>
                  <p className="text-xs text-slate-400 font-mono">
                    @{author.username} • {author.email}
                  </p>
                </div>
              </div>
              {author.company?.name && (
                <div className="text-xs text-slate-400 pt-1 border-t border-[rgba(255,255,255,0.08)] flex items-center gap-1.5">
                  <span className="text-emerald-400">🏢</span>
                  <span>{author.company.name}</span>
                </div>
              )}
            </div>
          )}

          {/* Sandbox Context */}
          <div className="p-4 rounded-2xl bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Isolation Context
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">
              Task ID{" "}
              <span className="font-mono text-emerald-300">{todo.id}</span> is
              isolated to your current browser session sandbox.
            </p>
          </div>

          {/* JSON Payload */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Live REST Payload
              </span>
              <button
                type="button"
                onClick={handleCopyJson}
                className="px-2.5 py-1 rounded-lg bg-[rgba(255,255,255,0.08)] hover:bg-[#1a202c] text-xs font-mono text-slate-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                {copied ? "✓ Copied" : "Copy Payload"}
              </button>
            </div>
            <div className="p-4 rounded-2xl bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] font-mono text-xs text-amber-200/90 overflow-x-auto leading-relaxed max-h-60">
              <pre>{JSON.stringify(todo, null, 2)}</pre>
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-[rgba(255,255,255,0.08)] bg-[#0c0e14] flex gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(todo)}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            Edit Task
          </button>
          <button
            type="button"
            onClick={() => onDelete(todo)}
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

/* ─────────────────────────────────────────────── Main Todos component */
const Todos = () => {
  // ── State ───────────────────────────────
  const [todos, setTodos] = useState([]);
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // '' | 'true' | 'false'
  const [authorFilter, setAuthorFilter] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'cards'
  const [filterMode, setFilterMode] = useState("all"); // 'all' | 'mutated' | 'seeded'
  const [settledKey, setSettledKey] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const queryKey = `${page}||${search}||${statusFilter}||${authorFilter}||${sortField}||${sortOrder}||${refreshKey}`;
  const loading = queryKey !== settledKey;

  const [modal, setModal] = useState(null); // null | { type: 'create'|'edit'|'delete', todo? }
  const [inspectingTodo, setInspectingTodo] = useState(null);
  const [mutating, setMutating] = useState(false);

  // ── Toast helper ────────────────────────
  const toast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, msg, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  // ── Fetch users for author mapping ─────
  useEffect(() => {
    usersApi
      .list({ limit: 100 })
      .then((res) => setUsers(res.data ?? []))
      .catch(() => setUsers([]));
  }, []);

  const userMap = useMemo(() => {
    const map = new Map();
    users.forEach((u) => map.set(Number(u.id), u));
    return map;
  }, [users]);

  // ── Fetch todos list ─────────────────────
  useEffect(() => {
    let cancelled = false;
    todosApi
      .list({
        page,
        limit: 10,
        q: search,
        completed: statusFilter,
        user_id: authorFilter,
        _sort: sortField,
        _order: sortOrder,
      })
      .then((res) => {
        if (cancelled) return;
        setTodos(res.data ?? []);
        setPagination(res.pagination ?? {});
        setSettledKey(queryKey);
      })
      .catch((err) => {
        if (cancelled) return;
        toast(err.message || "Failed to load tasks", "error");
        setSettledKey(queryKey);
      });
    return () => {
      cancelled = true;
    };
  }, [
    queryKey,
    toast,
    page,
    search,
    statusFilter,
    authorFilter,
    sortField,
    sortOrder,
    refreshKey,
  ]);

  // ── Search handler ───────────────────────
  const handleSearch = useCallback((term) => {
    setSearch((prev) => {
      if (prev === term) return prev;
      setPage(1);
      return term;
    });
  }, []);

  // ── CRUD handlers ───────────────────────
  const handleCreate = async (form) => {
    setMutating(true);
    try {
      await todosApi.create(form);
      toast("Task created in sandbox!");
      setModal(null);
      setPage(1);
      refresh();
    } catch (err) {
      toast(err.message || "Task creation failed", "error");
    } finally {
      setMutating(false);
    }
  };

  const handleEdit = async (form) => {
    setMutating(true);
    try {
      await todosApi.patch(modal.todo.id, form);
      toast("Task updated in sandbox!");
      setModal(null);
      if (inspectingTodo?.id === modal.todo.id) {
        setInspectingTodo((prev) => ({ ...prev, ...form }));
      }
      refresh();
    } catch (err) {
      toast(err.message || "Update failed", "error");
    } finally {
      setMutating(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      await todosApi.toggle(item.id, item.completed);
      toast(
        item.completed
          ? "Task marked as pending."
          : "Task marked as completed! ✓",
        item.completed ? "warn" : "success",
      );
      if (inspectingTodo?.id === item.id) {
        setInspectingTodo((prev) => ({ ...prev, completed: !item.completed }));
      }
      refresh();
    } catch (err) {
      toast(err.message || "Toggle failed", "error");
    }
  };

  const handleDelete = async () => {
    setMutating(true);
    try {
      await todosApi.remove(modal.todo.id);
      toast("Task deleted from sandbox session.", "warn");
      setModal(null);
      if (inspectingTodo?.id === modal.todo.id) {
        setInspectingTodo(null);
      }
      refresh();
    } catch (err) {
      toast(err.message || "Delete failed", "error");
    } finally {
      setMutating(false);
    }
  };

  const handleOpenDrawer = async (todo) => {
    setInspectingTodo(todo);
    try {
      const full = await todosApi.getById(todo.id);
      setInspectingTodo(full);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSortChange = (field, order) => {
    setPage(1);
    setSortField(field);
    setSortOrder(order);
  };

  // ── Client-side Filtered items ───────────
  const displayedTodos = useMemo(() => {
    if (filterMode === "mutated") return todos.filter((t) => t._sandbox);
    if (filterMode === "seeded") return todos.filter((t) => !t._sandbox);
    return todos;
  }, [todos, filterMode]);

  const mutatedCount = useMemo(
    () => todos.filter((t) => t._sandbox).length,
    [todos],
  );

  return (
    <div className="space-y-6">
      {/* ── Sleek Unified Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Task Board & Engine
            </h1>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              /todos
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Checklist manager with stateful PATCH completion toggles and owner filters.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setModal({ type: "create" })}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer flex items-center gap-1.5"
          >
            <span>+</span>
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* ── API Feature Explainer Banner ── */}
      <HowItWorksBanner
        title="Task Engine & Live Status Mutations (/todos)"
        subtitle="Clicking the checkbox on any task immediately fires a PATCH request to Playground API. The task status toggles and persists in your private session sandbox overlay."
        badge="Stateful Mutations"
        endpoint="PATCH /api/v1/todos/:id"
        codeSnippet={`// 1. Fetch filtered tasks (e.g. pending vs completed)
const res = await fetch('https://playground.nileslabs.com/api/v1/todos?completed=false&_sort=id&_order=desc', {
  credentials: 'include',
});
const { data } = await res.json();

// 2. Toggle task completion status in your sandbox
await fetch('https://playground.nileslabs.com/api/v1/todos/1', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ completed: true }),
});`}
        payloadExample={{
          title: "delectus aut autem",
          completed: true,
          user_id: 1
        }}
      />

      {/* ── Toolbar: Search, Filters, View Switcher & Action ── */}
      <div className="p-4 rounded-2xl bg-[#12151d] border border-[rgba(255,255,255,0.08)] shadow-md space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search + Status Filter + Author Filter + Sort */}
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <SearchInput
              id="todos-search"
              className="flex-1"
              placeholder="Search tasks by title…"
              value={search}
              onSearch={handleSearch}
            />

            {/* Status filter dropdown */}
            <select
              id="todos-status-filter"
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value);
              }}
              className="bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer min-w-32.5"
            >
              <option value="">All Statuses</option>
              <option value="false">⏳ Pending</option>
              <option value="true">✓ Completed</option>
            </select>

            {/* Assignee filter dropdown */}
            <select
              id="todos-author-filter"
              value={authorFilter}
              onChange={(e) => {
                setPage(1);
                setAuthorFilter(e.target.value);
              }}
              className="bg-[#0c0e14] border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer min-w-35"
            >
              <option value="">All Assignees</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>

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
            <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "table"
                    ? "bg-white/10 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Data Table View"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("cards")}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "cards"
                    ? "bg-white/10 text-white font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Card Grid View"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>

            {/* Create Task Button */}
            <button
              id="btn-create-todo"
              onClick={() => setModal({ type: "create" })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 shrink-0 cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>New Task</span>
            </button>
          </div>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-2 pt-2 border-t border-white/10 text-xs">
          <span className="text-slate-500 font-semibold uppercase text-[10px] tracking-wider mr-1">
            Filter:
          </span>
          {[
            { key: "all", label: `All Tasks (${pagination.total ?? 0})` },
            { key: "mutated", label: `Sandbox Overlays (${mutatedCount})` },
            { key: "seeded", label: `Base Seeds` },
          ].map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => setFilterMode(chip.key)}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer font-medium ${
                filterMode === chip.key
                  ? "bg-white/10 text-white border border-white/20 font-semibold"
                  : "text-slate-400 hover:text-white bg-transparent border border-white/5"
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
          data={displayedTodos}
          empty="No task assignment records matching the query."
          columns={[
            {
              key: "status",
              header: "Status & Task",
              width: "3fr",
              render: (todo) => (
                <div className="flex items-center gap-3 min-w-0">
                  {/* Inline Checkbox */}
                  <input
                    type="checkbox"
                    checked={Boolean(todo.completed)}
                    onChange={() => handleToggle(todo)}
                    title={
                      todo.completed ? "Mark as pending" : "Mark as completed"
                    }
                    className="w-4 h-4 accent-emerald-500 rounded cursor-pointer shrink-0"
                  />
                  <button
                    id={`view-todo-${todo.id}`}
                    onClick={() => handleOpenDrawer(todo)}
                    className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-90 transition-opacity w-full cursor-pointer group"
                    title="Inspect Task Sheet"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-semibold truncate leading-snug group-hover:text-emerald-400 transition-colors ${
                            todo.completed
                              ? "line-through text-slate-500"
                              : "text-white"
                          }`}
                        >
                          {todo.title}
                        </p>
                        {todo._sandbox && (
                          <SandboxBadge value={todo._sandbox} />
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        #TSK-{String(todo.id).padStart(4, "0")}
                      </p>
                    </div>
                  </button>
                </div>
              ),
            },
            {
              key: "state",
              header: "Execution State",
              width: "1.5fr",
              render: (todo) => <StatusBadge completed={todo.completed} />,
            },
            {
              key: "author",
              header: "Assignee",
              width: "1.8fr",
              render: (todo) => {
                const author = userMap.get(Number(todo.user_id));
                return (
                  <div className="flex items-center gap-2.5 min-w-0">
                    <AuthorAvatar
                      name={author?.name || `User ${todo.user_id}`}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <span className="text-sm text-slate-200 font-medium truncate block">
                        {author?.name || `Assignee #${todo.user_id}`}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono truncate block">
                        {author?.username
                          ? `@${author.username}`
                          : `ID: ${todo.user_id}`}
                      </span>
                    </div>
                  </div>
                );
              },
            },
            {
              key: "actions",
              header: "Actions",
              width: "auto",
              align: "right",
              render: (todo) => (
                <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    id={`inspect-todo-${todo.id}`}
                    title="Inspect Task Sheet"
                    onClick={() => handleOpenDrawer(todo)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                  <button
                    id={`edit-todo-${todo.id}`}
                    title="Edit Task"
                    onClick={() => setModal({ type: "edit", todo })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    id={`delete-todo-${todo.id}`}
                    title="Delete Task"
                    onClick={() => setModal({ type: "delete", todo })}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ),
            },
          ]}
        />
      ) : loading ? (
        <TodoCardSkeletonGrid count={pagination.limit ?? 10} />
      ) : displayedTodos.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#12151d] border border-[rgba(255,255,255,0.08)] text-center text-slate-400 text-sm">
          No task assignment records matching the query.
        </div>
      ) : (
        /* Card Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedTodos.map((todo) => {
            const author = userMap.get(Number(todo.user_id));
            return (
              <div
                key={todo.id}
                className={`p-5 rounded-2xl bg-[#12151d] border transition-all shadow-md flex flex-col justify-between space-y-4 group ${
                  todo.completed
                    ? "border-emerald-500/30 hover:border-emerald-500/60 bg-[#0d1c28]"
                    : "border-[rgba(255,255,255,0.08)] hover:border-emerald-500/50 hover:bg-[#131d33]"
                }`}
              >
                <div className="space-y-3">
                  {/* Card Top Strip */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={Boolean(todo.completed)}
                        onChange={() => handleToggle(todo)}
                        className="w-4 h-4 accent-emerald-500 rounded cursor-pointer shrink-0"
                      />
                      <AuthorAvatar
                        name={author?.name || `User ${todo.user_id}`}
                        size="sm"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                          {author?.name || `Assignee #${todo.user_id}`}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          #TSK-{String(todo.id).padStart(4, "0")}
                        </p>
                      </div>
                    </div>
                    {todo._sandbox && <SandboxBadge value={todo._sandbox} />}
                  </div>

                  {/* Title & Status */}
                  <div className="space-y-2">
                    <h3
                      className={`font-bold text-sm leading-snug ${
                        todo.completed
                          ? "line-through text-slate-400"
                          : "text-white group-hover:text-emerald-400"
                      }`}
                    >
                      {todo.title}
                    </h3>
                    <div>
                      <StatusBadge completed={todo.completed} />
                    </div>
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="pt-3 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => handleOpenDrawer(todo)}
                    className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-emerald-300 hover:bg-amber-500/20 font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Inspect</span>
                    <span>→</span>
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setModal({ type: "edit", todo })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-[rgba(255,255,255,0.08)] transition-colors cursor-pointer"
                      title="Edit"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setModal({ type: "delete", todo })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[rgba(255,255,255,0.08)] transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
      {inspectingTodo && (
        <TodoInspectorDrawer
          todo={inspectingTodo}
          author={userMap.get(Number(inspectingTodo.user_id))}
          onClose={() => setInspectingTodo(null)}
          onEdit={(t) => {
            setInspectingTodo(null);
            setModal({ type: "edit", todo: t });
          }}
          onDelete={(t) => {
            setInspectingTodo(null);
            setModal({ type: "delete", todo: t });
          }}
          onToggle={handleToggle}
        />
      )}

      {/* ── Create / Edit Modals ── */}
      {modal?.type === "create" && (
        <Modal
          title="Create New Task Assignment"
          onClose={() => setModal(null)}
          size="lg"
        >
          <TodoForm
            users={users}
            onSubmit={handleCreate}
            loading={mutating}
            submitLabel="Register in Sandbox"
          />
        </Modal>
      )}

      {modal?.type === "edit" && (
        <Modal
          title={`Edit Task — #${modal.todo.id}`}
          onClose={() => setModal(null)}
          size="lg"
        >
          <TodoForm
            initial={{
              title: modal.todo.title || "",
              user_id: modal.todo.user_id || 1,
              completed: Boolean(modal.todo.completed),
            }}
            users={users}
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
          title="Remove Task from Sandbox"
          onAccept={handleDelete}
          isLoading={mutating}
          acceptLabel="Delete from Session"
          cancelLabel="Cancel"
          variant="danger"
          description="This mutation will isolate the removal of this task assignment within your current browser sandbox session. Global seed records remain intact for other workspace users."
        >
          <div className="flex items-center gap-3.5 p-4 rounded-xl bg-rose-950/30 border border-rose-700/40">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center font-bold text-base shrink-0">
              ⏳
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white text-sm line-clamp-1">
                {modal.todo.title}
              </p>
              <p className="text-xs text-slate-400 font-mono">
                #TSK-{String(modal.todo.id).padStart(4, "0")} • Owner #
                {modal.todo.user_id}
              </p>
            </div>
          </div>
        </ConfirmationModal>
      )}

      {/* ── Toast Notifications ── */}
      <Toast toasts={toasts} />
    </div>
  );
};

export default Todos;
