import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, CheckCircle, XCircle, Clock, MapPin, Ghost, Lock, Paperclip, FileText, Image, File, Download } from "lucide-react";
import type { Report } from "@shared/schema";

const ADMIN_KEY = "Mayaiman33";

export default function AdminPage() {
  const { toast } = useToast();
  const [key, setKey] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [authKey, setAuthKey] = useState("");

  const handleAuth = () => {
    if (key === ADMIN_KEY) {
      setAuthKey(key);
      setAuthenticated(true);
    } else {
      toast({ title: "Incorrect key", variant: "destructive" });
    }
  };

  const { data: pending, isLoading } = useQuery<Report[]>({
    queryKey: ["/api/admin/pending"],
    queryFn: () =>
      fetch("/api/admin/pending", {
        headers: { "x-admin-key": authKey },
      }).then(r => r.json()),
    enabled: authenticated,
  });

  const approveMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": authKey },
        body: JSON.stringify({ status: "approved" }),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      toast({ title: "Report approved and published" });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", "x-admin-key": authKey },
        body: JSON.stringify({ status: "rejected" }),
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending"] });
      toast({ title: "Report rejected" });
    },
  });

  if (!authenticated) {
    return (
      <div className="max-w-sm mx-auto px-4 py-20 text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <Lock className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-xl font-bold mb-2">Moderator Access</h1>
        <p className="text-muted-foreground text-sm mb-6">Enter the admin key to manage pending reports.</p>
        <div className="flex gap-2">
          <Input
            data-testid="admin-key-input"
            type="password"
            placeholder="Admin key..."
            value={key}
            onChange={e => setKey(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAuth()}
          />
          <Button data-testid="admin-login-btn" onClick={handleAuth}>
            Enter
          </Button>
        </div>
        
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold">Moderation Queue</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Review submitted reports. Approve to publish, reject to remove.
          </p>
        </div>
        {pending && (
          <Badge variant="secondary" className="gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {pending.length} pending
          </Badge>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5 space-y-2">
                <div className="h-5 w-1/3 rounded shimmer" />
                <div className="h-4 w-1/2 rounded shimmer" />
                <div className="h-4 w-full rounded shimmer" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : !pending?.length ? (
        <div className="text-center py-20 text-muted-foreground">
          <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-30 text-green-500" />
          <p className="font-medium text-foreground mb-1">Queue is clear</p>
          <p className="text-sm">All reports have been reviewed. Check back later.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pending.map(report => (
            <Card key={report.id} data-testid={`pending-card-${report.id}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                  <div>
                    <div className="font-bold text-foreground">{report.companyName}</div>
                    <div className="text-sm text-muted-foreground">{report.jobTitle}</div>
                  </div>
                  <Badge variant="outline" className="shrink-0 gap-1">
                    <Clock className="w-3 h-3" />
                    Pending
                  </Badge>
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
                  <span>Score: {report.ghostScore}/5</span>
                  <span>{report.waitDays} days</span>
                  {report.recruiterName && <span>via {report.recruiterName}</span>}
                </div>

                <p className="text-sm text-foreground/80 leading-relaxed bg-muted/40 rounded-lg p-3 mb-4">
                  {report.description}
                </p>

                {report.submitterEmail && (
                  <p className="text-xs text-muted-foreground mb-4">
                    Submitted by: {report.submitterEmail}
                  </p>
                )}

                {/* Attachments */}
                {report.attachments && (() => {
                  try {
                    const files = JSON.parse(report.attachments) as { name: string; type: string; size: number; data: string }[];
                    if (files.length === 0) return null;
                    return (
                      <div className="mb-4">
                        <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
                          <Paperclip className="w-3.5 h-3.5" />
                          {files.length} attachment{files.length > 1 ? "s" : ""}
                        </div>
                        <div className="space-y-1.5">
                          {files.map((file, i) => {
                            const Icon = file.type.startsWith("image/") ? Image : file.type === "application/pdf" ? FileText : File;
                            const href = `data:${file.type};base64,${file.data}`;
                            const sizeStr = file.size < 1024 ? `${file.size}B` : file.size < 1048576 ? `${(file.size/1024).toFixed(0)}KB` : `${(file.size/1048576).toFixed(1)}MB`;
                            return (
                              <a
                                key={i}
                                href={href}
                                download={file.name}
                                className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/40 border border-border hover:bg-muted transition-colors"
                                data-testid={`admin-attachment-${i}`}
                              >
                                <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center shrink-0">
                                  <Icon className="w-3.5 h-3.5 text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-foreground truncate">{file.name}</p>
                                  <p className="text-xs text-muted-foreground">{sizeStr}</p>
                                </div>
                                <Download className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    );
                  } catch { return null; }
                })()}

                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    onClick={() => approveMutation.mutate(report.id)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    data-testid={`approve-btn-${report.id}`}
                    className="gap-2"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    Approve & Publish
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => rejectMutation.mutate(report.id)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    data-testid={`reject-btn-${report.id}`}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
