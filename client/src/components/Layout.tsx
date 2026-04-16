import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { Sun, Moon, Ghost, Trophy, Building2, PlusCircle, ShieldCheck, Menu, X, BarChart3, DollarSign } from "lucide-react";
import { useState } from "react";

const nav = [
  { href: "/", label: "Feed", icon: Ghost },
  { href: "/companies", label: "Companies", icon: Building2 },
  { href: "/awards", label: "Awards", icon: Trophy },
  { href: "/trends", label: "Trends", icon: BarChart3 },
  { href: "/pricing", label: "Pricing", icon: DollarSign },
  { href: "/submit", label: "Report", icon: PlusCircle },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { theme, toggle } = useTheme();
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <svg
              aria-label="GhostWatch logo"
              viewBox="0 0 32 32"
              width="28"
              height="28"
              fill="none"
              className="text-primary"
            >
              {/* Ghost body */}
              <path
                d="M6 14C6 8.477 10.477 4 16 4s10 4.477 10 10v12l-2.5-2.5L21 26l-2.5-2.5L16 26l-2.5-2.5L11 26l-2.5-2.5L6 26V14z"
                fill="currentColor"
                fillOpacity="0.15"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              {/* Eyes */}
              <circle cx="12.5" cy="15" r="1.8" fill="currentColor" />
              <circle cx="19.5" cy="15" r="1.8" fill="currentColor" />
              {/* Silence slash */}
              <line x1="10" y1="21" x2="22" y2="21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="3 2" />
            </svg>
            <span className="font-bold text-base tracking-tight text-foreground">
              Ghost<span className="text-primary">Watch</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden sm:flex items-center gap-1">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href}>
                <Button
                  variant={location === href ? "secondary" : "ghost"}
                  size="sm"
                  data-testid={`nav-${label.toLowerCase()}`}
                  className="gap-1.5"
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* CTA */}
            <Link href="/submit" className="hidden sm:block">
              <Button size="sm" data-testid="nav-cta" className="gap-1.5">
                <PlusCircle className="w-3.5 h-3.5" />
                Report Ghosting
              </Button>
            </Link>

            {/* Theme toggle */}
            <Button
              size="icon"
              variant="ghost"
              onClick={toggle}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              data-testid="theme-toggle"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>

            {/* Mobile menu */}
            <Button
              size="icon"
              variant="ghost"
              className="sm:hidden"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {menuOpen && (
          <div className="sm:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-1">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}>
                <Button
                  variant={location === href ? "secondary" : "ghost"}
                  className="w-full justify-start gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8 text-sm">
            <div>
              <div className="font-semibold text-foreground mb-3">GhostWatch</div>
              <div className="space-y-2">
                <Link href="/" className="block text-muted-foreground hover:text-foreground transition-colors">Feed</Link>
                <Link href="/companies" className="block text-muted-foreground hover:text-foreground transition-colors">Companies</Link>
                <Link href="/awards" className="block text-muted-foreground hover:text-foreground transition-colors">Awards</Link>
                <Link href="/trends" className="block text-muted-foreground hover:text-foreground transition-colors">Trends</Link>
              </div>
            </div>
            <div>
              <div className="font-semibold text-foreground mb-3">For Job Seekers</div>
              <div className="space-y-2">
                <Link href="/submit" className="block text-muted-foreground hover:text-foreground transition-colors">Submit a Report</Link>
                <Link href="/pricing" className="block text-muted-foreground hover:text-foreground transition-colors">Pro Upgrade — $7/mo</Link>
                <a href="https://www.linkedin.com/jobs/" target="_blank" rel="noopener noreferrer" className="block text-muted-foreground hover:text-foreground transition-colors">Find Jobs on LinkedIn ↗</a>
                <a href="https://www.indeed.com/" target="_blank" rel="noopener noreferrer" className="block text-muted-foreground hover:text-foreground transition-colors">Find Jobs on Indeed ↗</a>
              </div>
            </div>
            <div>
              <div className="font-semibold text-foreground mb-3">For Companies</div>
              <div className="space-y-2">
                <Link href="/for-companies" className="block text-muted-foreground hover:text-foreground transition-colors">Reputation Dashboard</Link>
                <Link href="/for-companies" className="block text-muted-foreground hover:text-foreground transition-colors">Request a Demo</Link>
                <Link href="/pricing" className="block text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              </div>
            </div>
            <div>
              <div className="font-semibold text-foreground mb-3">Data & Trust</div>
              <div className="space-y-2">
                <Link href="/trends" className="block text-muted-foreground hover:text-foreground transition-colors">Industry Reports</Link>
                <Link href="/admin" className="block text-muted-foreground hover:text-foreground transition-colors">Moderation</Link>
                <span className="block text-muted-foreground text-xs">All reports are community-submitted and reviewed before going public.</span>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Ghost className="w-3.5 h-3.5 text-primary" />
              <span>© 2026 GhostWatch — holding recruiters accountable</span>
            </div>
            <span>Job board links may be affiliate partnerships.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
