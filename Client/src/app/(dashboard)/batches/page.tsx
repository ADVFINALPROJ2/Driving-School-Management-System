"use client";

import { firstError, updateBatch } from "@/lib/api";

import { useEffect, useState, useRef, startTransition } from "react";
import { Plus, Layers, Search, AlertCircle, RefreshCw, Check, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function authHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("driving_school_token") : null;
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : { "Content-Type": "application/json" };
}

type Batch = {
  id: number;
  name: string;
  status: string;
  created_at: string;
  student_ids?: number[];
};

const STATUS_OPTIONS = ["pending", "submitted", "approved", "rejected"] as const;

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

function StatusBadge({ status, onClick }: { status: string; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-shadow hover:ring-2 hover:ring-ring ${statusStyles[status] || "bg-gray-100 text-gray-800"}`}
    >
      {status}
      <ChevronDown className="h-3 w-3 opacity-60" />
    </button>
  );
}

function StatusDropdown({ status, onSelect, onClose }: { status: string; onSelect: (s: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute z-50 mt-1 w-36 rounded-md border bg-popover p-1 shadow-md">
      {STATUS_OPTIONS.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onSelect(opt)}
          className={`flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${opt === status ? "bg-accent font-medium" : ""}`}
        >
          <span className={`h-2 w-2 rounded-full ${statusStyles[opt]?.split(" ")[0] || "bg-gray-300"}`} />
          {opt.charAt(0).toUpperCase() + opt.slice(1)}
          {opt === status && <Check className="ml-auto h-3.5 w-3.5" />}
        </button>
      ))}
    </div>
  );
}

export default function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [batchName, setBatchName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [selected, setSelected] = useState<Batch | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchBatches = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/batches`, { headers: authHeaders() });
      const json = await res.json();
      if (json.success) {
        const data = json.data?.batches || json.data || [];
        setBatches(Array.isArray(data) ? data : []);
      } else {
        setError(firstError(json.errors) || "Failed to load batches");
      }
    } catch {
      setError("Network error. Please check your connection.");
    }
    setLoading(false);
  };

  useEffect(() => { startTransition(() => fetchBatches()); }, []);

  const handleCreate = async () => {
    if (!batchName) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/batches`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ batch: { name: batchName, status: "pending" } }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create batch");
      setBatchName("");
      toast.success("Batch created");
      fetchBatches();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create batch");
    }
    setSubmitting(false);
  };

  const handleStatusChange = async (batch: Batch, newStatus: string) => {
    setOpenDropdownId(null);
    const res = await updateBatch(batch.id, { status: newStatus });
    if (res.success) {
      setBatches((prev) => prev.map((b) => b.id === batch.id ? { ...b, status: newStatus } : b));
      if (selected?.id === batch.id) setSelected({ ...batch, status: newStatus });
      toast.success(`Status changed to ${newStatus}`);
    } else {
      toast.error(res.error || "Failed to update status");
    }
  };

  const filtered = batches.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: batches.length,
    pending: batches.filter((b) => b.status === "pending").length,
    submitted: batches.filter((b) => b.status === "submitted").length,
    approved: batches.filter((b) => b.status === "approved").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Batches</h1>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <span className="flex-1">{error}</span>
          <Button variant="outline" size="sm" onClick={fetchBatches}>
            <RefreshCw className="mr-1 h-4 w-4" /> Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.total}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pending</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Submitted</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.submitted}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Approved</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.approved}</div></CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search batches..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Input placeholder="New batch name..." value={batchName} onChange={(e) => setBatchName(e.target.value)} className="w-60" />
          <Button onClick={handleCreate} disabled={!batchName || submitting}>
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No batches found.</CardContent></Card>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 text-sm font-medium">Name</th>
                <th className="text-left p-3 text-sm font-medium">Status</th>
                <th className="text-left p-3 text-sm font-medium">Created</th>
                <th className="w-24" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="p-3 text-sm font-medium">{b.name}</td>
                  <td className="p-3 relative">
                    <StatusBadge status={b.status} onClick={() => setOpenDropdownId(openDropdownId === b.id ? null : b.id)} />
                    {openDropdownId === b.id && (
                      <StatusDropdown
                        status={b.status}
                        onSelect={(s) => handleStatusChange(b, s)}
                        onClose={() => setOpenDropdownId(null)}
                      />
                    )}
                  </td>
                  <td className="p-3 text-sm text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => setSelected(selected?.id === b.id ? null : b)}>
                      {selected?.id === b.id ? "Hide" : "Details"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && (
        <Card>
          <CardHeader><CardTitle>{selected.name}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="text-xs text-muted-foreground">ID</span>
                <p className="text-sm font-mono">#{selected.id}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Status</span>
                <p className="mt-1">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[selected.status] || "bg-gray-100"}`}>
                    {selected.status}
                  </span>
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Created</span>
                <p className="text-sm">{new Date(selected.created_at).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
