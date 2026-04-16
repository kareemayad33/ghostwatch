import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ── Reports (ghosting experiences) ──────────────────────────────────────────
export const reports = sqliteTable("reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  companyName: text("company_name").notNull(),
  recruiterName: text("recruiter_name"), // optional
  jobTitle: text("job_title").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  country: text("country").notNull().default("US"),
  ghostStage: text("ghost_stage").notNull(), // e.g. "After phone screen", "After final round"
  waitDays: integer("wait_days").notNull(), // how many days waited with no response
  ghostScore: integer("ghost_score").notNull(), // 1 (mild) to 5 (brutal) severity
  description: text("description").notNull(),
  submitterEmail: text("submitter_email"), // optional, for contact
  attachments: text("attachments"), // JSON array of { name, type, size, data (base64) }
  status: text("status").notNull().default("pending"), // "pending" | "approved" | "rejected"
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date()),
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  status: true,
  createdAt: true,
});
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;

// ── Company aggregate stats (materialized via queries, not a separate table) ─
// We'll compute these on the fly from approved reports
