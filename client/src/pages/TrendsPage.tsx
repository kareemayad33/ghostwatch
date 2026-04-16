import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Download, TrendingUp, Building2, MapPin, Ghost, Lock } from "lucide-react";
import type { Report } from "@shared/schema";

function StatBlock({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="text-center p-5 bg-card border border-border rounded-xl">
      <div className="text-2xl font-bold text-foreground mb-0.5">{value}</div>
      <div className="text-xs font-medium text-foreground mb-0.5">{label}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

export default function TrendsPage() {
  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: () => apiRequest("GET", "/api/stats").then(r => r.json()),
  });

  const { data: companies } = useQuery({
    queryKey: ["/api/companies"],
    queryFn: () => apiRequest("GET", "/api/companies").then(r => r.json()),
  });

  const { data: locations } = useQuery({
    queryKey: ["/api/locations"],
    queryFn: () => apiRequest("GET", "/api/locations").then(r => r.json()),
  });

  const { data: reports } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
    queryFn: () => apiRequest("GET", "/api/reports").then(r => r.json()),
  });

  // Stage breakdown
  const stageBreakdown = reports
    ? Object.entries(
        reports.reduce((acc: Record<string, number>, r) => {
          acc[r.ghostStage] = (acc[r.ghostStage] || 0) + 1;
          return acc;
        }, {})
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    : [];

  const topReportCount = stageBreakdown[0]?.[1] || 1;

  // Score breakdown
  const scoreBreakdown = reports
    ? [5, 4, 3, 2, 1].map(score => ({
        score,
        count: reports.filter(r => r.ghostScore === score).length,
        label: ["", "Mild", "Notable", "Rude", "Brutal", "Criminal"][score],
      }))
    : [];

  const topScoreCount = Math.max(...scoreBreakdown.map(s => s.count), 1);

  const scoreColors: Record<number, string> = {
    5: "bg-red-500",
    4: "bg-orange-500",
    3: "bg-yellow-500",
    2: "bg-blue-400",
    1: "bg-green-500",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
              Data & Trends
            </Badge>
            <h1 className="text-2xl font-bold text-foreground mb-1">Ghosting Trend Report</h1>
            <p className="text-sm text-muted-foreground">
              Aggregated, anonymized data from all community-submitted reports. Updated in real time.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2 opacity-60 cursor-not-allowed" data-testid="trends-download-btn" disabled>
              <Lock className="w-3.5 h-3.5" />
              Full PDF Report — $29
            </Button>
          </div>
        </div>
      </div>

      {/* Top-level stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatBlock label="Total Reports" value={stats.total} sub="Community verified" />
          <StatBlock label="Avg Ghost Score" value={`${stats.avgScore}/5`} sub="1 = mild, 5 = criminal" />
          <StatBlock label="Avg Wait" value={`${stats.avgWaitDays}d`} sub="Before ghosting" />
          <StatBlock label="Top Ghoster" value={stats.topGhosted} sub="By report volume" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Stage breakdown */}
        <Card>
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center gap-2">
              <Ghost className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm text-foreground">Ghosting by Stage</span>
            </div>
            <p className="text-xs text-muted-foreground">Where in the process do candidates get ghosted most?</p>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {stageBreakdown.length === 0 ? (
              <p className="text-xs text-muted-foreground">No data yet.</p>
            ) : (
              <div className="space-y-3">
                {stageBreakdown.map(([stage, count]) => (
                  <div key={stage}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-foreground truncate max-w-[200px]">{stage}</span>
                      <span className="text-muted-foreground font-medium shrink-0 ml-2">{count}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${(count / topReportCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Score breakdown */}
        <Card>
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm text-foreground">Severity Distribution</span>
            </div>
            <p className="text-xs text-muted-foreground">How bad is the ghosting, across all reports?</p>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <div className="space-y-3">
              {scoreBreakdown.map(({ score, count, label }) => (
                <div key={score}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-foreground">{"👻".repeat(score)} {label}</span>
                    <span className="text-muted-foreground font-medium">{count}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${scoreColors[score]}`}
                      style={{ width: `${(count / topScoreCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top companies */}
        <Card>
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm text-foreground">Top Offenders by Volume</span>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {!companies?.length ? (
              <p className="text-xs text-muted-foreground">No data yet.</p>
            ) : (
              <div className="space-y-2">
                {companies.slice(0, 6).map((c: any, i: number) => (
                  <div key={c.companyName} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                      <span className="text-foreground font-medium">{c.companyName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{c.reportCount} reports</span>
                      <span className="text-primary font-semibold">{Number(c.avgScore).toFixed(1)}/5</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top locations */}
        <Card>
          <CardHeader className="pb-3 pt-5 px-5">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm text-foreground">Ghosting by State</span>
            </div>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {!locations?.length ? (
              <p className="text-xs text-muted-foreground">No data yet.</p>
            ) : (
              <div className="space-y-2">
                {locations.slice(0, 6).map((l: any, i: number) => (
                  <div key={l.state} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground w-4">{i + 1}.</span>
                      <span className="text-foreground font-medium">{l.state}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{l.count} reports</span>
                      <span className="text-primary font-semibold">{Number(l.avgScore).toFixed(1)}/5</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upsell banner */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 flex flex-col sm:flex-row items-center gap-5">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Download className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <h3 className="font-bold text-foreground mb-0.5">Want the full quarterly report?</h3>
          <p className="text-sm text-muted-foreground">
            Industry breakdowns, YoY trends, company size analysis, and more — in a shareable PDF. Used by HR analysts and recruiting firms.
          </p>
        </div>
        <Button className="shrink-0 gap-2" data-testid="trends-buy-report">
          <Download className="w-4 h-4" />
          Buy full report — $29
        </Button>
      </div>
    </div>
  );
}
