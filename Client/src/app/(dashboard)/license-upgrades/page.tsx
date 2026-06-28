"use client";

import { useEffect, useState, startTransition } from "react";
import { ArrowUpCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getLicenseUpgrades, approveLicenseUpgrade, type LicenseUpgrade } from "@/lib/api";

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-emerald-100 text-emerald-800",
  rejected: "bg-red-100 text-red-800",
};

export default function LicenseUpgradesPage() {
  const [upgrades, setUpgrades] = useState<LicenseUpgrade[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUpgrades = async () => {
    setLoading(true);
    const res = await getLicenseUpgrades();
    if (res.success && res.data) {
      const data = typeof res.data === "object" && "data" in res.data ? (res.data as any).data : res.data;
      setUpgrades(Array.isArray(data) ? data : []);
    }
    setLoading(false);
  };

  useEffect(() => { startTransition(() => fetchUpgrades()); }, []);

  const handleApprove = async (id: number) => {
    await approveLicenseUpgrade(id);
    fetchUpgrades();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">License Upgrades</h1>
      </div>

      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}</div>
      ) : upgrades.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No license upgrade requests found.</CardContent></Card>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full">
            <thead><tr className="border-b bg-muted/50">
              <th className="text-left p-3 text-sm font-medium">ID</th>
              <th className="text-left p-3 text-sm font-medium">Student ID</th>
              <th className="text-left p-3 text-sm font-medium">Current Tier</th>
              <th className="text-left p-3 text-sm font-medium">Requested Tier</th>
              <th className="text-left p-3 text-sm font-medium">Status</th>
              <th className="text-right p-3 text-sm font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {upgrades.map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="p-3 text-sm font-mono">#{u.id}</td>
                  <td className="p-3 text-sm">{u.student_id}</td>
                  <td className="p-3 text-sm capitalize">{u.current_tier}</td>
                  <td className="p-3 text-sm capitalize">{u.requested_tier}</td>
                  <td className="p-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${statusStyles[u.status] || "bg-gray-100"}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {u.status === "pending" && (
                      <Button size="sm" variant="outline" onClick={() => handleApprove(u.id)}>
                        <ArrowUpCircle className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
