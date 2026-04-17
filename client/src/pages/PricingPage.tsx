import { Link } from "wouter";
import { useState } from "react";
import WaitlistModal from "@/components/WaitlistModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Building2, BarChart3, Bell, Star, Shield, Download, Users, Eye } from "lucide-react";

const JOB_SEEKER_FEATURES = [
  "Unlimited report browsing",
  "Email alerts when a watched company gets a new report",
  "See recruiter names on all reports",
  "Early access to reports before public (24hr ahead)",
  "Export personal company watchlist as PDF",
  "Priority support",
];

const COMPANY_FEATURES = [
  "Company reputation dashboard — live score & trends",
  "See all reports about your company",
  "Respond publicly to reports (appears on your profile)",
  "Monthly ghosting score trend reports",
  "\"Cleared\" badge when score improves (data-backed)",
  "Dedicated account manager",
  "API access to your company's data",
  "Remove outdated reports (with evidence)",
];

const FREE_FEATURES = [
  "Browse all community reports",
  "Submit ghosting experiences",
  "Filter by location, company, stage",
  "View company rankings & awards",
];

export default function PricingPage() {
  const [modal, setModal] = useState<"pro" | "company" | null>(null);
  return (
    <>
    {modal && <WaitlistModal plan={modal} onClose={() => setModal(null)} />}
    <div>
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">
          Pricing
        </Badge>
        <h1 className="text-2xl font-bold text-foreground mb-3">
          Transparency has a plan for everyone
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm">
          GhostWatch is free for job seekers. Upgrade for alerts and deeper access. Companies pay to monitor and protect their employer brand.
        </p>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {/* Free */}
        <Card className="border-border relative">
          <CardHeader className="pb-4 pt-6 px-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                <Users className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="font-semibold text-foreground">Community</span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold text-foreground">$0</span>
              <span className="text-muted-foreground text-sm mb-1">/month</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Always free. No credit card.</p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <Link href="/submit">
              <Button variant="outline" className="w-full mb-5" data-testid="pricing-free-cta">
                Get started free
              </Button>
            </Link>
            <ul className="space-y-2.5">
              {FREE_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Job Seeker Pro */}
        <Card className="border-primary/40 relative shadow-lg shadow-primary/5">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-primary text-primary-foreground px-3 py-0.5 text-xs font-semibold">
              Most popular
            </Badge>
          </div>
          <CardHeader className="pb-4 pt-6 px-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold text-foreground">Job Seeker Pro</span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold text-foreground">$7</span>
              <span className="text-muted-foreground text-sm mb-1">/month</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">For active job seekers who want an edge.</p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <Button className="w-full mb-5" data-testid="pricing-pro-cta" onClick={() => setModal("pro")}>
              Join waitlist — coming soon
            </Button>
            <ul className="space-y-2.5">
              {JOB_SEEKER_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Company */}
        <Card className="border-border relative">
          <CardHeader className="pb-4 pt-6 px-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-amber-500" />
              </div>
              <span className="font-semibold text-foreground">Company</span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-bold text-foreground">$149</span>
              <span className="text-muted-foreground text-sm mb-1">/month</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">For HR teams and employer brand managers.</p>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            <Link href="/for-companies">
              <Button variant="outline" className="w-full mb-5 border-amber-500/30 hover:bg-amber-500/5 hover:text-amber-600" data-testid="pricing-company-cta" onClick={() => setModal("company")}>
                Join waitlist — coming soon
              </Button>
            </Link>
            <ul className="space-y-2.5">
              {COMPANY_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Verified Report section */}
      <div className="rounded-2xl border border-border bg-card p-8 mb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-bold text-foreground">Verified Report Badge</h2>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">$3 one-time</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Already submitted a report with email or documentation attached? Pay a one-time $3 fee and your report gets a blue <strong className="text-foreground">Verified</strong> badge — making it more trustworthy and more visible in search results. Your docs stay private; only the badge is shown.
            </p>
          </div>
          <Button size="sm" variant="outline" className="shrink-0" data-testid="pricing-verify-cta">
            Verify a report
          </Button>
        </div>
      </div>

      {/* Data / Trends */}
      <div className="rounded-2xl border border-border bg-card p-8 mb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <BarChart3 className="w-7 h-7 text-primary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="font-bold text-foreground">Industry Trend Reports</h2>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">$29/report</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Deep-dive quarterly reports on recruiter ghosting trends by industry, company size, and geography. Used by journalists, HR analysts, and recruiting firms. Data anonymized and aggregated.
            </p>
          </div>
          <Link href="/trends">
            <Button size="sm" variant="outline" className="shrink-0" data-testid="pricing-trends-cta">
              View sample report
            </Button>
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="font-bold text-foreground text-center mb-6">Common questions</h2>
        <div className="space-y-5">
          {[
            {
              q: "Is GhostWatch really free for job seekers?",
              a: "Yes. Browsing, submitting, filtering, and viewing all public reports is 100% free. Pro unlocks alerts and deeper data.",
            },
            {
              q: "Can companies remove reports about them?",
              a: "Only with a valid Company plan and documented evidence that a report is inaccurate. We take data integrity seriously.",
            },
            {
              q: "Who can see my email when I submit a report?",
              a: "Only admins during moderation. It's never shown publicly. We never sell it.",
            },
            {
              q: "What is the 'Cleared' badge?",
              a: "When a company on a paid plan demonstrates consistent improvement (score improvement over 90 days with at least 5 new reports), we award a data-backed Cleared badge on their profile.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="border-b border-border pb-5 last:border-0 last:pb-0">
              <p className="font-medium text-foreground text-sm mb-1">{q}</p>
              <p className="text-sm text-muted-foreground">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
    </div>
    </>
  );
}
