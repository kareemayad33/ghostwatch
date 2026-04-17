import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { X, Mail, CheckCircle2, Clock } from "lucide-react";

interface WaitlistModalProps {
  plan: "pro" | "company";
  onClose: () => void;
}

const PLAN_INFO = {
  pro: {
    title: "Join the Pro Waitlist",
    price: "$7/month",
    desc: "Get early access to Job Seeker Pro — email alerts, recruiter names, and early report access.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  company: {
    title: "Request Early Access",
    price: "$149/month",
    desc: "Be first in line for the Company Reputation Dashboard — monitor your score, respond to reports, earn the Cleared badge.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
};

export default function WaitlistModal({ plan, onClose }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const info = PLAN_INFO[plan];

  const mutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/waitlist", { email, plan }).then(r => r.json()),
    onSuccess: () => setDone(true),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          data-testid="waitlist-close"
        >
          <X className="w-5 h-5" />
        </button>

        {!done ? (
          <>
            <div className={`w-12 h-12 rounded-xl ${info.bg} flex items-center justify-center mb-4`}>
              <Clock className={`w-6 h-6 ${info.color}`} />
            </div>

            <div className="mb-1 flex items-center gap-2">
              <h2 className="font-bold text-foreground text-lg">{info.title}</h2>
            </div>
            <p className="text-xs font-semibold text-primary mb-2">{info.price} — launching soon</p>
            <p className="text-sm text-muted-foreground mb-6">{info.desc}</p>

            <form
              onSubmit={e => { e.preventDefault(); if (email) mutation.mutate(); }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-medium text-foreground mb-1 block">Your email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    data-testid="waitlist-email-input"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending || !email}
                data-testid="waitlist-submit"
              >
                {mutation.isPending ? "Joining..." : "Join the waitlist"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                No spam. We'll only email you when it's ready.
              </p>
            </form>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-7 h-7 text-green-500" />
            </div>
            <h2 className="font-bold text-foreground text-lg mb-2">You're on the list</h2>
            <p className="text-sm text-muted-foreground mb-6">
              We'll email you at <strong className="text-foreground">{email}</strong> as soon as {plan === "pro" ? "Pro" : "the Company Dashboard"} is ready.
            </p>
            <Button onClick={onClose} variant="outline" className="w-full">Done</Button>
          </div>
        )}
      </div>
    </div>
  );
}
