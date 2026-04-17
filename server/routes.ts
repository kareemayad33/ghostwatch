import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertReportSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(httpServer: Server, app: Express) {

  // ── Public feed ─────────────────────────────────────────────────────────
  app.get("/api/reports", (req, res) => {
    const { state, city, company } = req.query as Record<string, string>;
    try {
      const data = storage.getApprovedReports({ state, city, company });
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  app.get("/api/reports/:id", (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });
    const report = storage.getReport(id);
    if (!report) return res.status(404).json({ error: "Not found" });
    res.json(report);
  });

  app.post("/api/reports", (req, res) => {
    try {
      const validated = insertReportSchema.parse(req.body);
      const report = storage.createReport(validated);
      res.status(201).json(report);
    } catch (e) {
      if (e instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: e.errors });
      }
      res.status(500).json({ error: "Failed to create report" });
    }
  });

  // ── Aggregates ───────────────────────────────────────────────────────────
  app.get("/api/stats", (_req, res) => {
    try {
      res.json(storage.getStats());
    } catch {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.get("/api/companies", (_req, res) => {
    try {
      res.json(storage.getCompanyStats());
    } catch {
      res.status(500).json({ error: "Failed to fetch company stats" });
    }
  });

  app.get("/api/locations", (_req, res) => {
    try {
      res.json(storage.getLocationStats());
    } catch {
      res.status(500).json({ error: "Failed to fetch location stats" });
    }
  });

  // ── Awards ────────────────────────────────────────────────────────────────
  app.get("/api/awards", (_req, res) => {
    try {
      res.json(storage.getAwards());
    } catch {
      res.status(500).json({ error: "Failed to fetch awards" });
    }
  });

  // ── Moderation ───────────────────────────────────────────────────────────
  app.get("/api/admin/pending", (req, res) => {
    const adminKey = req.headers["x-admin-key"];
    if (adminKey !== "Mayaiman33") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.json(storage.getPendingReports());
  });

  app.patch("/api/admin/reports/:id", (req, res) => {
    const adminKey = req.headers["x-admin-key"];
    if (adminKey !== "Mayaiman33") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const id = parseInt(req.params.id);
    const { status } = req.body as { status: "approved" | "rejected" };
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const updated = storage.updateReportStatus(id, status);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
  });


  // ── Waitlist ─────────────────────────────────────────────────────────────
  app.post("/api/waitlist", (req, res) => {
    const schema = z.object({ email: z.string().email(), plan: z.enum(["pro", "company"]).default("pro") });
    try {
      const { email, plan } = schema.parse(req.body);
      const result = storage.addToWaitlist({ email, plan });
      res.json(result);
    } catch (e) {
      if (e instanceof z.ZodError) return res.status(400).json({ error: "Invalid email" });
      res.status(500).json({ error: "Failed to join waitlist" });
    }
  });

  app.get("/api/admin/waitlist", (req, res) => {
    const adminKey = req.headers["x-admin-key"];
    if (adminKey !== "Mayaiman33") return res.status(401).json({ error: "Unauthorized" });
    res.json(storage.getWaitlist());
  });

  return httpServer;
}
