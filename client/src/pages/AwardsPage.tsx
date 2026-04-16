import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Ghost, Calendar, Clock, Star, AlertTriangle, Flame } from "lucide-react";

interface AwardWinner {
  companyName: string;
  reportCount: number;
  avgScore: number;
}

interface HallEntry extends AwardWinner {
  worstStage: string;
  avgWaitDays: number;
}

interface Awards {
  week: AwardWinner | null;
  month: AwardWinner | null;
  year: AwardWinner | null;
  allTime: AwardWinner | null;
  hallOfShame: HallEntry[];
}

const MEDALS = ["🥇", "🥈", "🥉", "4️⃣", "5️⃣"];

const AWARD_TIERS = [
  {
    key: "year" as const,
    label: "Ghoster of the Year",
    period: new Date().getFullYear().toString(),
    icon: Trophy,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    iconBg: "bg-yellow-500/15",
    trophy: "🏆",
    desc: "Most reported company this calendar year",
  },
  {
    key: "month" as const,
    label: "Ghoster of the Month",
    period: new Date().toLocaleString("default", { month: "long", year: "numeric" }),
    icon: Calendar,
    color: "text-orange-500",
    bg: "bg-orange-500/10 border-orange-500/20",
    iconBg: "bg-orange-500/15",
    trophy: "📅",
    desc: "Most reported company this month",
  },
  {
    key: "week" as const,
    label: "Ghoster of the Week",
    period: "This Week",
    icon: Flame,
    color: "text-red-500",
    bg: "bg-red-500/10 border-red-500/20",
    iconBg: "bg-red-500/15",
    trophy: "🔥",
    desc: "Most reported company in the last 7 days",
  },
];

function ScorePips({ score }: { score: number }) {
  const filled = Math.round(score);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${
            i < filled
              ? score >= 4.5 ? "bg-destructive" : score >= 3.5 ? "bg-orange-500" : "bg-yellow-500"
              : "bg-muted"
          }`}
        />
      ))}
      <span className="text-xs font-semibold ml-1 text-muted-foreground">{score.toFixed(1)}</span>
    </div>
  );
}

function AwardCard({ tier, winner }: { tier: typeof AWARD_TIERS[0]; winner: AwardWinner | null }) {
  const Icon = tier.icon;

  return (
    <Card className={`border ${tier.bg}`}>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl ${tier.iconBg} flex items-center justify-center shrink-0 text-2xl`}>
            {tier.trophy}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-xs font-semibold uppercase tracking-widest mb-1 ${tier.color}`}>
              {tier.period}
            </div>
            <h3 className="font-bold text-base text-foreground mb-0.5">{tier.label}</h3>
            <p className="text-xs text-muted-foreground mb-3">{tier.desc}</p>

            {winner ? (
              <div className="space-y-2">
                <div className="text-xl font-bold text-foreground">{winner.companyName}</div>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Ghost className="w-3.5 h-3.5" />
                    {winner.reportCount} {winner.reportCount === 1 ? "report" : "reports"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5" />
                    Avg severity {winner.avgScore}/5
                  </span>
                </div>
                <ScorePips score={winner.avgScore} />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic">
                No reports yet this period — check back soon.
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonAward() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl shimmer shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-20 rounded shimmer" />
            <div className="h-5 w-40 rounded shimmer" />
            <div className="h-4 w-32 rounded shimmer" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AwardsPage() {
  const { data: awards, isLoading } = useQuery<Awards>({
    queryKey: ["/api/awards"],
    queryFn: () => apiRequest("GET", "/api/awards").then(r => r.json()),
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Trophy className="w-6 h-6 text-yellow-500" />
          <h1 className="text-2xl font-bold text-foreground">The Ghost Awards</h1>
          <Trophy className="w-6 h-6 text-yellow-500" />
        </div>
        <p className="text-muted-foreground text-sm">
          Recognizing the companies that perfected the art of disappearing. Updated in real time as reports come in.
        </p>
      </div>

      {/* Award tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <SkeletonAward key={i} />)
          : AWARD_TIERS.map(tier => (
              <AwardCard key={tier.key} tier={tier} winner={awards?.[tier.key] ?? null} />
            ))}
      </div>

      {/* Hall of Shame */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <h2 className="text-lg font-bold text-foreground">All-Time Hall of Shame</h2>
          <Badge variant="destructive" className="ml-auto text-xs">Top 5</Badge>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded shimmer shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-4 w-1/4 rounded shimmer" />
                      <div className="h-3 w-1/3 rounded shimmer" />
                    </div>
                    <div className="h-4 w-20 rounded shimmer" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !awards?.hallOfShame.length ? (
          <div className="text-center py-16 text-muted-foreground">
            <Ghost className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-medium text-foreground mb-1">No hall of shame yet</p>
            <p className="text-sm">Submit reports to start ranking the worst offenders.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {awards.hallOfShame.map((entry, i) => (
              <Card
                key={entry.companyName}
                className={`hover-elevate transition-all ${i === 0 ? "border-destructive/30 bg-destructive/5" : ""}`}
                data-testid={`hall-entry-${i}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Rank */}
                    <div className="text-2xl shrink-0 w-8 text-center">{MEDALS[i]}</div>

                    {/* Company info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-bold text-foreground">{entry.companyName}</span>
                        {i === 0 && (
                          <Badge variant="destructive" className="text-xs gap-1">
                            <Trophy className="w-3 h-3" />
                            All-Time Worst
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Most common stage: {entry.worstStage}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 items-center shrink-0">
                      <div className="text-center">
                        <div className="text-sm font-bold text-foreground">{entry.reportCount}</div>
                        <div className="text-xs text-muted-foreground">reports</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-bold text-foreground">{entry.avgScore}/5</div>
                        <div className="text-xs text-muted-foreground">avg severity</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-sm font-bold text-foreground">
                          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                          {entry.avgWaitDays}d
                        </div>
                        <div className="text-xs text-muted-foreground">avg wait</div>
                      </div>
                      <ScorePips score={entry.avgScore} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Fine print */}
        <p className="text-xs text-muted-foreground text-center mt-6">
          Rankings are based on volume of approved reports and average severity score. Updated in real time.
        </p>
      </div>
    </div>
  );
}
