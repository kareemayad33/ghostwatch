import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { reports, waitlist, type InsertReport, type Report, type InsertWaitlist, type Waitlist } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

const sqlite = new Database("ghostwatch.db");
const db = drizzle(sqlite);

// Create tables if not exists
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    recruiter_name TEXT,
    job_title TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'US',
    ghost_stage TEXT NOT NULL,
    wait_days INTEGER NOT NULL,
    ghost_score INTEGER NOT NULL,
    description TEXT NOT NULL,
    submitter_email TEXT,
    attachments TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at INTEGER
  )
`);

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS waitlist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    plan TEXT NOT NULL DEFAULT 'pro',
    created_at INTEGER
  )
`);

// Seed with realistic sample data if empty
const count = sqlite.prepare("SELECT COUNT(*) as c FROM reports").get() as { c: number };
if (count.c === 0) {
  const now = Math.floor(Date.now() / 1000);
  const dayMs = 86400;
  const samples = [
    { company_name: "Meta", recruiter_name: "Sarah T.", job_title: "Senior Product Manager", city: "Menlo Park", state: "CA", country: "US", ghost_stage: "After final round", wait_days: 28, ghost_score: 5, description: "Completed 6 rounds including a case study presentation. Recruiter went silent after saying 'we'll have a decision by Friday.' Followed up 4 times over 4 weeks. No response ever came.", submitter_email: null, status: "approved", created_at: now - 3 * dayMs },
    { company_name: "Amazon", recruiter_name: null, job_title: "Operations Manager", city: "Seattle", state: "WA", country: "US", ghost_stage: "After phone screen", wait_days: 14, ghost_score: 3, description: "Had a great 45-minute call. Recruiter said they'd send over next steps within 3 business days. Two weeks later, nothing. Emailed twice, no reply.", submitter_email: null, status: "approved", created_at: now - 7 * dayMs },
    { company_name: "Deloitte", recruiter_name: "Marcus R.", job_title: "Management Consultant", city: "Chicago", state: "IL", country: "US", ghost_stage: "After recruiter reached out first", wait_days: 45, ghost_score: 2, description: "Applied through their portal, got an automated confirmation email saying 'we'll be in touch within 2 weeks.' Never heard anything. No rejection either, just silence.", submitter_email: null, status: "approved", created_at: now - 10 * dayMs },
    { company_name: "JPMorgan Chase", recruiter_name: "Jennifer K.", job_title: "Data Analyst", city: "New York", state: "NY", country: "US", ghost_stage: "After technical interview", wait_days: 21, ghost_score: 4, description: "Passed the technical screen with flying colors. Recruiter was very enthusiastic and said 'you're moving to the final round.' Sent the calendar invite then cancelled it. Never rescheduled or responded to my follow-ups.", submitter_email: null, status: "approved", created_at: now - 15 * dayMs },
    { company_name: "Google", recruiter_name: "Priya M.", job_title: "UX Researcher", city: "Mountain View", state: "CA", country: "US", ghost_stage: "After offer discussion", wait_days: 10, ghost_score: 5, description: "Verbally told I was getting an offer. Recruiter said they were 'preparing the paperwork.' After 10 days of silence I found out the role was put on hold, but no one bothered to tell me.", submitter_email: null, status: "approved", created_at: now - 5 * dayMs },
    { company_name: "Staffmark", recruiter_name: "Tony B.", job_title: "Process Analyst", city: "Charlotte", state: "NC", country: "US", ghost_stage: "After phone screen", wait_days: 30, ghost_score: 4, description: "Staffing agency recruiter was super eager, talked for an hour, promised to have a contract ready within a week. Then completely vanished. LinkedIn messages, calls, emails — all ignored.", submitter_email: null, status: "approved", created_at: now - 2 * dayMs },
    { company_name: "UnitedHealth Group", recruiter_name: null, job_title: "Claims Specialist", city: "Minneapolis", state: "MN", country: "US", ghost_stage: "After final round", wait_days: 18, ghost_score: 4, description: "Three-stage interview process. Final was with VP. Strong positive feedback during the interview. Then the recruiter became unreachable. Got a rejection auto-email 3 weeks later with no explanation.", submitter_email: null, status: "approved", created_at: now - 20 * dayMs },
    { company_name: "Tesla", recruiter_name: "Brian L.", job_title: "Lean Manufacturing Engineer", city: "Austin", state: "TX", country: "US", ghost_stage: "After technical interview", wait_days: 60, ghost_score: 5, description: "Four-hour technical deep dive. Recruiter said 'we love your background' and 'expect to hear from us by end of week.' Two months later, still waiting. LinkedIn shows the role as still open.", submitter_email: null, status: "approved", created_at: now - 1 * dayMs },
    { company_name: "Cigna", recruiter_name: "Angela D.", job_title: "Healthcare Billing Analyst", city: "Bloomfield", state: "CT", country: "US", ghost_stage: "After final round", wait_days: 22, ghost_score: 3, description: "Solid interview process. I was told I was the top candidate. Recruiter stopped responding after the final round. Eventually got a form rejection with no feedback.", submitter_email: null, status: "pending", created_at: now - 1 * dayMs },
    { company_name: "Leidos", recruiter_name: null, job_title: "Process Improvement Manager", city: "Reston", state: "VA", country: "US", ghost_stage: "After phone screen", wait_days: 12, ghost_score: 2, description: "Brief initial call, seemed promising. Was told I'd be sent a technical assessment. Nothing arrived. Followed up twice. Recruiter eventually said the role 'changed in scope' — no apology.", submitter_email: null, status: "approved", created_at: now - 25 * dayMs },
  ];
  for (const s of samples) {
    sqlite.prepare(`
      INSERT INTO reports (company_name, recruiter_name, job_title, city, state, country, ghost_stage, wait_days, ghost_score, description, submitter_email, attachments, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(s.company_name, s.recruiter_name, s.job_title, s.city, s.state, s.country, s.ghost_stage, s.wait_days, s.ghost_score, s.description, s.submitter_email, null, s.status, s.created_at);
  }
}

export interface IStorage {
  getApprovedReports(filters: { state?: string; city?: string; company?: string }): Report[];
  getReport(id: number): Report | undefined;
  createReport(data: InsertReport): Report;
  getCompanyStats(): { companyName: string; avgScore: number; reportCount: number; worstStage: string }[];
  getLocationStats(): { state: string; count: number; avgScore: number }[];
  getStats(): { total: number; avgScore: number; avgWaitDays: number; topGhosted: string };
  getAwards(): {
    week: { companyName: string; reportCount: number; avgScore: number } | null;
    month: { companyName: string; reportCount: number; avgScore: number } | null;
    year: { companyName: string; reportCount: number; avgScore: number } | null;
    allTime: { companyName: string; reportCount: number; avgScore: number } | null;
    hallOfShame: { companyName: string; reportCount: number; avgScore: number; worstStage: string; avgWaitDays: number }[];
  };
  getPendingReports(): Report[];
  updateReportStatus(id: number, status: "approved" | "rejected"): Report | undefined;
  // Waitlist
  addToWaitlist(data: InsertWaitlist): { success: boolean; alreadyExists: boolean };
  getWaitlist(): Waitlist[];
}

export const storage: IStorage = {
  getApprovedReports({ state, city, company } = {}) {
    let all = db.select().from(reports).where(eq(reports.status, "approved")).orderBy(desc(reports.createdAt)).all();
    if (state) all = all.filter(r => r.state.toLowerCase() === state.toLowerCase());
    if (city) all = all.filter(r => r.city.toLowerCase().includes(city.toLowerCase()));
    if (company) all = all.filter(r => r.companyName.toLowerCase().includes(company.toLowerCase()));
    return all;
  },

  getReport(id) {
    return db.select().from(reports).where(eq(reports.id, id)).get();
  },

  createReport(data) {
    const now = new Date();
    return db.insert(reports).values({ ...data, createdAt: now }).returning().get();
  },

  getCompanyStats() {
    const all = db.select().from(reports).where(eq(reports.status, "approved")).all();
    const map = new Map<string, { sum: number; count: number; stages: string[] }>();
    for (const r of all) {
      const e = map.get(r.companyName) || { sum: 0, count: 0, stages: [] };
      e.sum += r.ghostScore; e.count++; e.stages.push(r.ghostStage);
      map.set(r.companyName, e);
    }
    return Array.from(map.entries()).map(([companyName, { sum, count, stages }]) => {
      const sc = stages.reduce<Record<string, number>>((a, s) => { a[s] = (a[s] || 0) + 1; return a; }, {});
      const worstStage = Object.entries(sc).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown";
      return { companyName, avgScore: Math.round((sum / count) * 10) / 10, reportCount: count, worstStage };
    }).sort((a, b) => b.avgScore - a.avgScore);
  },

  getLocationStats() {
    const all = db.select().from(reports).where(eq(reports.status, "approved")).all();
    const map = new Map<string, { count: number; sum: number }>();
    for (const r of all) {
      const e = map.get(r.state) || { count: 0, sum: 0 };
      e.count++; e.sum += r.ghostScore;
      map.set(r.state, e);
    }
    return Array.from(map.entries())
      .map(([state, { count, sum }]) => ({ state, count, avgScore: Math.round((sum / count) * 10) / 10 }))
      .sort((a, b) => b.count - a.count);
  },

  getStats() {
    const all = db.select().from(reports).where(eq(reports.status, "approved")).all();
    if (all.length === 0) return { total: 0, avgScore: 0, avgWaitDays: 0, topGhosted: "—" };
    const avgScore = Math.round((all.reduce((s, r) => s + r.ghostScore, 0) / all.length) * 10) / 10;
    const avgWaitDays = Math.round(all.reduce((s, r) => s + r.waitDays, 0) / all.length);
    const companyCounts = all.reduce<Record<string, number>>((acc, r) => { acc[r.companyName] = (acc[r.companyName] || 0) + 1; return acc; }, {});
    const topGhosted = Object.entries(companyCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
    return { total: all.length, avgScore, avgWaitDays, topGhosted };
  },

  getAwards() {
    const all = db.select().from(reports).where(eq(reports.status, "approved")).all();
    const now = Math.floor(Date.now() / 1000);
    const weekAgo  = now - 7   * 86400;
    const monthAgo = now - 30  * 86400;
    const yearAgo  = now - 365 * 86400;

    function topByPeriod(since: number) {
      const subset = all.filter(r => {
        const ts = r.createdAt instanceof Date ? Math.floor(r.createdAt.getTime() / 1000) : (r.createdAt as unknown as number);
        return ts >= since;
      });
      if (!subset.length) return null;
      const map = new Map<string, { sum: number; count: number }>();
      for (const r of subset) {
        const e = map.get(r.companyName) || { sum: 0, count: 0 };
        e.sum += r.ghostScore; e.count++;
        map.set(r.companyName, e);
      }
      const ranked = Array.from(map.entries())
        .map(([companyName, { sum, count }]) => ({ companyName, reportCount: count, avgScore: Math.round((sum / count) * 10) / 10 }))
        .sort((a, b) => b.reportCount - a.reportCount || b.avgScore - a.avgScore);
      return ranked[0] || null;
    }

    const map = new Map<string, { sum: number; count: number; stages: string[]; waitSum: number }>();
    for (const r of all) {
      const e = map.get(r.companyName) || { sum: 0, count: 0, stages: [], waitSum: 0 };
      e.sum += r.ghostScore; e.count++; e.stages.push(r.ghostStage); e.waitSum += r.waitDays;
      map.set(r.companyName, e);
    }
    const hallOfShame = Array.from(map.entries()).map(([companyName, { sum, count, stages, waitSum }]) => {
      const stageCounts = stages.reduce<Record<string, number>>((a, s) => { a[s] = (a[s] || 0) + 1; return a; }, {});
      const worstStage = Object.entries(stageCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Unknown";
      return { companyName, reportCount: count, avgScore: Math.round((sum / count) * 10) / 10, worstStage, avgWaitDays: Math.round(waitSum / count) };
    }).sort((a, b) => b.reportCount - a.reportCount || b.avgScore - a.avgScore).slice(0, 5);

    return { week: topByPeriod(weekAgo), month: topByPeriod(monthAgo), year: topByPeriod(yearAgo), allTime: hallOfShame[0] || null, hallOfShame };
  },

  getPendingReports() {
    return db.select().from(reports).where(eq(reports.status, "pending")).orderBy(desc(reports.createdAt)).all();
  },

  updateReportStatus(id, status) {
    return db.update(reports).set({ status }).where(eq(reports.id, id)).returning().get();
  },

  addToWaitlist(data) {
    try {
      db.insert(waitlist).values({ ...data, createdAt: new Date() }).run();
      return { success: true, alreadyExists: false };
    } catch (e: any) {
      if (e?.message?.includes("UNIQUE")) return { success: true, alreadyExists: true };
      throw e;
    }
  },

  getWaitlist() {
    return db.select().from(waitlist).orderBy(desc(waitlist.createdAt)).all();
  },
};
