import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Ghost, TrendingUp, MapPin } from "lucide-react";

interface CompanyStat {
  companyName: string;
  avgScore: number;
  reportCount: number;
  worstStage: string;
}

interface LocationStat {
  state: string;
  count: number;
}

function ScoreDots({ score }: { score: number }) {
  const filled = Math.round(score);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-all ${
            i < filled
              ? score >= 4.5 ? "bg-destructive" : score >= 3.5 ? "bg-orange-500" : score >= 2.5 ? "bg-yellow-500" : "bg-green-500"
              : "bg-muted"
          }`}
        />
      ))}
      <span className="text-xs font-medium ml-1 text-muted-foreground">{score.toFixed(1)}</span>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-4">
      <div className="w-6 h-4 rounded shimmer shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-4 w-1/4 rounded shimmer" />
        <div className="h-3 w-1/3 rounded shimmer" />
      </div>
      <div className="h-4 w-24 rounded shimmer" />
      <div className="h-4 w-16 rounded shimmer" />
    </div>
  );
}

export default function CompaniesPage() {
  const { data: companies, isLoading: loadingCompanies } = useQuery<CompanyStat[]>({
    queryKey: ["/api/companies"],
    queryFn: () => apiRequest("GET", "/api/companies").then(r => r.json()),
  });

  const { data: locations, isLoading: loadingLocations } = useQuery<LocationStat[]>({
    queryKey: ["/api/locations"],
    queryFn: () => apiRequest("GET", "/api/locations").then(r => r.json()),
  });

  const maxCount = locations ? Math.max(...locations.map(l => l.count), 1) : 1;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Company Ghosting Index</h1>
        <p className="text-muted-foreground text-sm">Aggregated ratings based on community-verified reports. Higher score = worse ghosting.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company table */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <Building2 className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm">All Companies</h2>
              {companies && (
                <span className="ml-auto text-xs text-muted-foreground">{companies.length} companies ranked</span>
              )}
            </div>

            {loadingCompanies ? (
              <div className="divide-y divide-border">
                {Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)}
              </div>
            ) : !companies?.length ? (
              <div className="py-16 text-center text-muted-foreground">
                <Building2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No company data yet. Submit a report to get started.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {companies.map((company, i) => (
                  <div
                    key={company.companyName}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/40 transition-colors"
                    data-testid={`company-row-${i}`}
                  >
                    {/* Rank */}
                    <span className={`w-6 text-xs font-bold shrink-0 ${
                      i === 0 ? "text-destructive" : i < 3 ? "text-orange-500" : "text-muted-foreground"
                    }`}>
                      #{i + 1}
                    </span>

                    {/* Company info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground truncate">{company.companyName}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        Most common: {company.worstStage}
                      </div>
                    </div>

                    {/* Score dots */}
                    <ScoreDots score={company.avgScore} />

                    {/* Report count */}
                    <div className="shrink-0 text-right">
                      <div className="text-xs font-medium text-foreground">{company.reportCount}</div>
                      <div className="text-xs text-muted-foreground">reports</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Location breakdown */}
        <div>
          <Card>
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <MapPin className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm">By State</h2>
            </div>

            {loadingLocations ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-8 rounded shimmer" />
                ))}
              </div>
            ) : !locations?.length ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                No location data yet.
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {locations.slice(0, 12).map(loc => (
                  <div key={loc.state} className="flex items-center gap-2" data-testid={`location-row-${loc.state}`}>
                    <span className="w-8 text-xs font-mono font-semibold text-muted-foreground shrink-0">{loc.state}</span>
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(loc.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-4 text-right shrink-0">{loc.count}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Ghost severity legend */}
          <Card className="mt-4">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
              <Ghost className="w-4 h-4 text-primary" />
              <h2 className="font-semibold text-sm">Severity Scale</h2>
            </div>
            <div className="p-4 space-y-2">
              {[
                [5, "Criminal", "text-destructive"],
                [4, "Brutal", "text-orange-500"],
                [3, "Rude", "text-yellow-600"],
                [2, "Notable", "text-lime-600"],
                [1, "Mild", "text-green-600"],
              ].map(([score, label, color]) => (
                <div key={score} className="flex items-center gap-3">
                  <span className={`text-xs font-bold w-4 ${color}`}>{score}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className="text-xs">{i < (score as number) ? "👻" : "·"}</span>
                    ))}
                  </div>
                  <span className={`text-xs font-medium ${color}`}>{label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
