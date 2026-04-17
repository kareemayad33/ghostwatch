import { Link } from "wouter";
import { useState } from "react";
import WaitlistModal from "@/components/WaitlistModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, BarChart3, MessageSquare, Shield, TrendingDown, Bell, FileText, CheckCircle2, Star } from "lucide-react";

const FEATURES = [
  {
    icon: BarChart3,
    title: "Live Reputation Dashboard",
    desc: "See your company's ghost score, trend over time, and how you rank against industry peers — updated in real time.",
  },
  {
    icon: MessageSquare,
    title: "Respond to Reports",
    desc: "Post a public response to any report about your company. Your reply appears directly on the report card so candidates see your side.",
  },
  {
    icon: Bell,
    title: "Instant Alerts",
    desc: "Get notified the moment a new report is submitted about your company — before it goes public.",
  },
  {
    icon: TrendingDown,
    title: "Monthly Score Reports",
    desc: "A full PDF report delivered monthly showing score trends, stage breakdown, and actionable insights for your recruiting team.",
  },
  {
    icon: Shield,
    title: "'Cleared' Badge",
    desc: "Show candidates you've improved. When your score improves meaningfully over 90 days, you earn a data-backed Cleared badge on your profile.",
  },
  {
    icon: FileText,
    title: "API Access",
    desc: "Pull your company's GhostWatch data directly into your ATS, HR dashboard, or internal tools via our REST API.",
  },
];

const STEPS = [
  { n: "01", label: "Request a demo", desc: "Fill out the form below. We'll set up a 20-minute walkthrough of the dashboard." },
  { n: "02", label: "Claim your profile", desc: "We verify you work at the company via work email. No fake claims." },
  { n: "03", label: "Get your dashboard", desc: "Full access to your reputation data, response tools, and alerts from day one." },
];

export default function ForCompaniesPage() {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
    {showModal && <WaitlistModal plan="company" onClose={() => setShowModal(false)} />}
    <div>
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-14">
        <Badge className="mb-4 bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/10">
          For Employers
        </Badge>
        <h1 className="text-2xl font-bold text-foreground mb-3">
          Your employer brand is being scored.<br />Do you know your number?
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto text-sm leading-relaxed">
          Thousands of candidates check GhostWatch before applying. Companies on our paid plan can monitor their score, respond to reports, and show candidates they've improved.
        </p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <Button data-testid="companies-demo-cta" className="gap-2" onClick={() => setShowModal(true)}>
            <Building2 className="w-4 h-4" />
            Request a demo
          </Button>
          <Link href="/pricing">
            <Button variant="outline" data-testid="companies-pricing-link">See pricing</Button>
          </Link>
        </div>
      </div>

      {/* Social proof strip */}
      <div className="flex flex-wrap items-center justify-center gap-6 mb-14 text-sm text-muted-foreground">
        {[
          "Monitor your ghost score 24/7",
          "Respond publicly to reports",
          "Earn the Cleared badge",
          "API access included",
        ].map(item => (
          <span key={item} className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            {item}
          </span>
        ))}
      </div>

      {/* Features grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
        {FEATURES.map(({ icon: Icon, title, desc }) => (
          <Card key={title} className="border-border hover-elevate transition-all">
            <CardContent className="p-5">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How it works */}
      <div className="mb-16">
        <h2 className="text-lg font-bold text-foreground text-center mb-8">How it works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {STEPS.map(({ n, label, desc }) => (
            <div key={n} className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-3">
                <span className="text-xs font-bold text-primary">{n}</span>
              </div>
              <h3 className="font-semibold text-foreground text-sm mb-1">{label}</h3>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Demo request form */}
      <div className="max-w-lg mx-auto bg-card border border-border rounded-2xl p-8">
        <h2 className="font-bold text-foreground mb-1 text-center">Request a demo</h2>
        <p className="text-sm text-muted-foreground text-center mb-6">We'll reach out within 1 business day.</p>
        <form
          className="space-y-4"
          onSubmit={e => { e.preventDefault(); setShowModal(true); }}
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">First name</label>
              <input
                required
                data-testid="demo-first-name"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Jane"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground mb-1 block">Last name</label>
              <input
                required
                data-testid="demo-last-name"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="Smith"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Work email</label>
            <input
              required
              type="email"
              data-testid="demo-email"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="jane@company.com"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Company name</label>
            <input
              required
              data-testid="demo-company"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Acme Corp"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-foreground mb-1 block">Role</label>
            <select
              data-testid="demo-role"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="">Select your role</option>
              <option>Head of Recruiting / TA</option>
              <option>HR Director / VP</option>
              <option>Employer Brand Manager</option>
              <option>CHRO / CPO</option>
              <option>Other</option>
            </select>
          </div>
          <Button type="submit" className="w-full" data-testid="demo-submit">
            Request demo
          </Button>
        </form>
      </div>
    </div>
    </div>
    </>
  );
}
