"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageTransition } from "@/components/ui/animations";
import { toast } from "sonner";

interface ReportItem {
  id: string;
  pack_id: string;
  reporter_id: string;
  reason: string;
  status: string;
  created_at: string;
}

export default function AdminPage() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      const { data } = await supabase
        .from("reports")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      setReports((data || []) as ReportItem[]);
      setLoading(false);
    };

    fetchReports();
  }, []);

  const handleAction = async (reportId: string, action: "resolved" | "dismissed") => {
    const { error } = await supabase
      .from("reports")
      .update({ status: action as any })
      .eq("id", reportId);

    if (error) {
      toast.error("Failed to update");
      return;
    }

    setReports(reports.filter((r) => r.id !== reportId));
    toast.success(action === "resolved" ? "Report resolved" : "Report dismissed");
  };

  return (
    <PageTransition>
      <div className="max-w-lg mx-auto px-4 pt-6 pb-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        {loading ? (
          <p className="text-zinc-500">Loading...</p>
        ) : reports.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-zinc-500 text-lg">No pending reports</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Pack ID: {report.pack_id?.slice(0, 8)}...</span>
                  <Badge variant="warning">Pending</Badge>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                  {report.reason}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleAction(report.id, "resolved")}
                  >
                    Remove Pack
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleAction(report.id, "dismissed")}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
