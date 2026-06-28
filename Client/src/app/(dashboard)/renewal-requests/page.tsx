"use client";

import { useEffect, useState, startTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getRenewalRequests, type RenewalRequest } from "@/lib/api";

const statusStyles: Record<string, string> = {
  draft: "bg-gray-100 text-gray-800",
  submitted: "bg-blue-100 text-blue-800",
  completed: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

export default function RenewalRequestsPage() {
  const [requests, setRequests] = useState<RenewalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    startTransition(async () => {
      const res = await getRenewalRequests();
      if (res.success && res.data) {
        const data = typeof res.data === "object" && "data" in res.data ? (res.data as any).data : res.data;
        setRequests(Array.isArray(data) ? data : []);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Renewal Requests</h1>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}</div>
      ) : requests.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No renewal requests found.</CardContent></Card>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead><tr className="border-b bg-muted/50">
              <th className="text-left p-3 text-sm font-medium">ID</th>
              <th className="text-left p-3 text-sm font-medium">Student ID</th>
              <th className="text-left p-3 text-sm font-medium">Status</th>
              <th className="text-left p-3 text-sm font-medium">Created</th>
            </tr></thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="p-3 text-sm font-mono">#{r.id}</td>
                  <td className="p-3 text-sm">{r.student_id}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusStyles[r.status] || "bg-gray-100"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 text-sm">{new Date(r.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
