import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, MapPin, Clock, Ghost, Search, X, TrendingUp, Users, Timer, ChevronRight, PlusCircle, Trophy } from "lucide-react";
import type { Report } from "@shared/schema";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC"
];

const STAGES = [
  "After recruiter reached out first",
  "After phone screen",
  "After technical interview",
  "After final round",
  "After offer discussion",
];

function ghostScoreLabel(score: number) {
  const labels = ["", "Mild", "Notable", "Rude", "Brutal", "Criminal"];
  return labels[score] || "Unknown";
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border score-bg-${score}`}>
      {"👻".repeat(score).slice(0, score * 2)}
      {ghostScoreLabel(score)}
    </span>
  );
}

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="space-y-3">
          <div className="h-5 w-1/3 rounded shimmer" />
          <div className="h-4 w-1/2 rounded shimmer" />
          <div className="h-4 w-full rounded shimmer" />
          <div className="h-4 w-2/3 rounded shimmer" />
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-full shimmer" />
            <div className="h-6 w-24 rounded-full shimmer" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-bold text-foreground">{value}</div>
      </div>
    </div>
  );
}

interface AwardWinner {
  companyName: string;
  reportCount: number;
  avgScore: number;
}

interface Awards {
  week: AwardWinner | null;
  month: AwardWinner | null;
  year: AwardWinner | null;
}

function AwardsStrip() {
  const { data: awards } = useQuery<Awards>({
    queryKey: ["/api/awards"],
    queryFn: () => apiRequest("GET", "/api/awards").then(r => r.json()),
  });

  const tiers = [
    { key: "week" as const, label: "This Week", icon: "📅" },
    { key: "month" as const, label: "This Month", icon: "🗓️" },
    { key: "year" as const, label: "This Year", icon: "🏆" },
  ];

  const hasAny = awards && (awards.week || awards.month || awards.year);
  if (!hasAny) return null;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Ghoster Awards</span>
        </div>
        <Link href="/awards">
          <button className="text-xs text-primary hover:underline flex items-center gap-1">
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {tiers.map(({ key, label, icon }) => {
          const winner = awards?.[key];
          if (!winner) return null;
          return (
            <div
              key={key}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 border border-primary/20"
              data-testid={`award-strip-${key}`}
            >
              <span className="text-xl leading-none">{icon}</span>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-primary/70 font-semibold">{label}</div>
                <div className="font-bold text-sm text-foreground truncate">{winner.companyName}</div>
                <div className="text-[11px] text-muted-foreground">{winner.reportCount} report{winner.reportCount !== 1 ? "s" : ""} · avg {winner.avgScore.toFixed(1)}/5</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function FeedPage() {
  const [stateFilter, setStateFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [scoreFilter, setScoreFilter] = useState("");

  const { data: reports, isLoading } = useQuery<Report[]>({
    queryKey: ["/api/reports", stateFilter, companyFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (stateFilter && stateFilter !== "all") params.set("state", stateFilter);
      if (companyFilter) params.set("company", companyFilter);
      return apiRequest("GET", `/api/reports?${params}`).then(r => r.json());
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
    queryFn: () => apiRequest("GET", "/api/stats").then(r => r.json()),
  });

  const filtered = useMemo(() => {
    if (!reports) return [];
    return reports.filter(r => {
      if (stageFilter && stageFilter !== "all" && r.ghostStage !== stageFilter) return false;
      if (scoreFilter && scoreFilter !== "all" && r.ghostScore !== parseInt(scoreFilter)) return false;
      return true;
    });
  }, [reports, stageFilter, scoreFilter]);

  const hasFilters = (stateFilter && stateFilter !== "all") || companyFilter || (stageFilter && stageFilter !== "all") || (scoreFilter && scoreFilter !== "all");

  const clearFilters = () => {
    setStateFilter("");
    setCompanyFilter("");
    setStageFilter("");
    setScoreFilter("");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Recruiter Ghosting Reports</h1>
            <p className="text-muted-foreground text-sm max-w-2xl">You rewrote your resume, researched the company, nailed the interview, and gave it everything you had. The least they owe you is a response. This is where silence gets called out.</p>
          </div>
          <Link href="/submit">
            <Button data-testid="hero-submit-btn" className="gap-2 shrink-0">
              <PlusCircle className="w-4 h-4" />
              Report Your Experience
            </Button>
          </Link>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <StatCard icon={Ghost} label="Total Reports" value={stats.total} />
            <StatCard icon={TrendingUp} label="Avg Ghost Score" value={`${stats.avgScore}/5`} />
            <StatCard icon={Timer} label="Avg Wait (Days)" value={stats.avgWaitDays} />
            <StatCard icon={Building2} label="Most Reports" value={stats.topGhosted} />
          </div>
        )}
      </div>

      {/* Awards Strip */}
      <AwardsStrip />

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              data-testid="filter-company"
              placeholder="Filter by company..."
              value={companyFilter}
              onChange={e => setCompanyFilter(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={stateFilter} onValueChange={setStateFilter}>
            <SelectTrigger data-testid="filter-state" className="w-[130px]">
              <MapPin className="w-3.5 h-3.5 text-muted-foreground mr-1" />
              <SelectValue placeholder="All states" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All states</SelectItem>
              {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger data-testid="filter-stage" className="w-[170px]">
              <SelectValue placeholder="Any stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any stage</SelectItem>
              {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={scoreFilter} onValueChange={setScoreFilter}>
            <SelectTrigger data-testid="filter-score" className="w-[140px]">
              <SelectValue placeholder="Any severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any severity</SelectItem>
              <SelectItem value="5">👻👻👻👻👻 Criminal</SelectItem>
              <SelectItem value="4">👻👻👻👻 Brutal</SelectItem>
              <SelectItem value="3">👻👻👻 Rude</SelectItem>
              <SelectItem value="2">👻👻 Notable</SelectItem>
              <SelectItem value="1">👻 Mild</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} data-testid="clear-filters" className="gap-1.5">
              <X className="w-3.5 h-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <div className="text-sm text-muted-foreground mb-4">
          {filtered.length} {filtered.length === 1 ? "report" : "reports"}
          {hasFilters ? " matching filters" : " total"}
        </div>
      )}

      {/* Feed */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Ghost className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium text-foreground mb-1">No reports found</p>
            <p className="text-sm">
              {hasFilters ? "Try clearing some filters." : "Be the first to report a ghosting experience."}
            </p>
            {!hasFilters && (
              <Link href="/submit">
                <Button className="mt-4 gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Report Now
                </Button>
              </Link>
            )}
          </div>
        ) : (
          filtered.map(report => <ReportCard key={report.id} report={report} />)
        )}
      </div>
    </div>
  );
}

function timeAgo(ts: any): string {
  const date = ts instanceof Date ? ts : new Date(ts);
  if (isNaN(date.getTime())) return "Recently";
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

function ReportCard({ report }: { report: Report }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="hover-elevate transition-all" data-testid={`report-card-${report.id}`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-bold text-foreground">{report.companyName}</span>
              {report.recruiterName && (
                <span className="text-xs text-muted-foreground">via {report.recruiterName}</span>
              )}
              <ScoreBadge score={report.ghostScore} />
            </div>
            <div className="text-sm text-muted-foreground">{report.jobTitle}</div>
          </div>
          <div className="text-xs text-muted-foreground shrink-0">{timeAgo(report.createdAt)}</div>
        </div>

        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" />
            {report.city}, {report.state}
          </span>
          <span className="flex items-center gap-1">
            <Ghost className="w-3.5 h-3.5" />
            {report.ghostStage}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {report.waitDays} days no response
          </span>
        </div>

        <p className={`text-sm text-foreground/80 leading-relaxed ${!expanded && "line-clamp-2"}`}>
          {report.description}
        </p>

        {report.description.length > 120 && (
          <button
            onClick={() => setExpanded(v => !v)}
            className="text-xs text-primary mt-1 hover:underline focus:outline-none"
            data-testid={`expand-report-${report.id}`}
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        )}

        <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between gap-2">
          <span className="text-xs text-muted-foreground">Looking for work?</span>
          <a
            href={`https://www.indeed.com/jobs?q=${encodeURIComponent(report.jobTitle)}&l=${encodeURIComponent(report.city + ', ' + report.state)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1"
            data-testid={`affiliate-link-${report.id}`}
          >
            Find {report.jobTitle} jobs on Indeed ↗
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
