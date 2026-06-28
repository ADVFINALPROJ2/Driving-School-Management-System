"use client";

import { useEffect, useState } from "react";
import { Plus, Search, AlertCircle, RefreshCw, Pencil, Trash2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { getUsers, createUser, updateUser, deleteUser, type User } from "@/lib/api";

const roleBadge: Record<string, string> = {
  admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  clerk: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  instructor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
  student: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400",
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
    password_confirmation: "",
    full_name: "",
    phone_number: "",
    role: "clerk" as string,
    is_qualified_instructor: false,
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    const res = await getUsers();
    if (res.success && res.data) setUsers(res.data);
    else setError(res.error || "Failed to load users");
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const resetForm = () => {
    setForm({ email: "", password: "", password_confirmation: "", full_name: "", phone_number: "", role: "clerk", is_qualified_instructor: false });
    setEditing(null);
    setShowForm(false);
  };

  const openEdit = (user: User) => {
    setForm({ email: user.email, password: "", password_confirmation: "", full_name: user.full_name, phone_number: user.phone_number || "", role: user.role, is_qualified_instructor: user.is_qualified_instructor });
    setEditing(user);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!form.full_name || !form.email) { toast.error("Name and email are required"); return; }
    setSubmitting(true);
    const payload: Record<string, unknown> = {
      full_name: form.full_name,
      email: form.email,
      phone_number: form.phone_number || null,
      role: form.role,
      is_qualified_instructor: form.is_qualified_instructor,
    };
    if (form.password) {
      payload.password = form.password;
      payload.password_confirmation = form.password_confirmation;
    }
    const res = editing
      ? await updateUser(editing.id, payload)
      : await createUser(payload);
    if (res.success) {
      toast.success(editing ? "User updated" : "User created");
      resetForm();
      fetchUsers();
    } else {
      toast.error(res.error || "Operation failed");
    }
    setSubmitting(false);
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Delete user "${user.full_name}"?`)) return;
    const res = await deleteUser(user.id);
    if (res.success) { toast.success("User deleted"); fetchUsers(); }
    else toast.error(res.error || "Failed to delete user");
  };

  const filtered = users.filter((u) =>
    u.full_name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">Users</h1>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
          <span className="flex-1">{error}</span>
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            <RefreshCw className="mr-1 h-4 w-4" /> Retry
          </Button>
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center text-muted-foreground">
          {search ? "No users match your search." : "No users found."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b bg-muted/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b last:border-0 transition-colors hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground">{u.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${roleBadge[u.role] || "bg-gray-100"}`}>
                      <ShieldCheck className="h-3 w-3" />
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.phone_number || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(u)} title="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(u)} title="Delete" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={resetForm}>
          <div className="w-full max-w-lg rounded-xl bg-card p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-foreground mb-4">{editing ? "Edit User" : "Add User"}</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Full Name *</label>
                <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="John Doe" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email *</label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="user@example.com" type="email" />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Phone</label>
                <Input value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} placeholder="+251..." />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="admin">Admin</option>
                  <option value="clerk">Clerk</option>
                  <option value="instructor">Instructor</option>
                  <option value="student">Student</option>
                </select>
              </div>
              {form.role === "instructor" && (
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="qualified" checked={form.is_qualified_instructor} onChange={(e) => setForm({ ...form, is_qualified_instructor: e.target.checked })} className="h-4 w-4 rounded border-input" />
                  <label htmlFor="qualified" className="text-sm text-foreground">Qualified Instructor</label>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-foreground">
                  {editing ? "New Password (leave blank to keep current)" : "Password *"}
                </label>
                <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" placeholder={editing ? "Leave blank to keep" : "Min 6 characters"} />
              </div>
              {form.password && (
                <div>
                  <label className="text-sm font-medium text-foreground">Confirm Password</label>
                  <Input value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} type="password" placeholder="Re-enter password" />
                </div>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={resetForm}>Cancel</Button>
                <Button onClick={handleSubmit} disabled={submitting}>
                  {submitting ? "Saving..." : editing ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
