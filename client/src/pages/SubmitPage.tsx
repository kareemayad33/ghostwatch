import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Ghost, CheckCircle, Info, Paperclip, X, FileText, Image, File } from "lucide-react";
import { useState, useRef } from "react";
import { insertReportSchema } from "@shared/schema";

interface AttachmentFile {
  name: string;
  type: string;
  size: number;
  data: string; // base64
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
const MAX_FILES = 5;
const ALLOWED_TYPES = [
  "image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp",
  "application/pdf",
  "text/plain",
  "message/rfc822", // .eml
  "application/vnd.ms-outlook", // .msg
];

function fileIcon(type: string) {
  if (type.startsWith("image/")) return Image;
  if (type === "application/pdf" || type === "text/plain") return FileText;
  return File;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC"
];

const STAGES = [
  "After recruiter reached out first",
  "After phone screen",
  "After technical interview",
  "After final round",
  "After offer discussion",
];

const formSchema = insertReportSchema.extend({
  ghostScore: z.number().min(1).max(5),
  waitDays: z.number().min(1, "Must be at least 1 day").max(999),
  description: z.string().min(30, "Please provide at least 30 characters of detail"),
});

type FormValues = z.infer<typeof formSchema>;

const SCORE_OPTIONS = [
  { value: 1, label: "1 — Mild", desc: "Slow to respond but eventually did" },
  { value: 2, label: "2 — Notable", desc: "Promised follow-up, never delivered" },
  { value: 3, label: "3 — Rude", desc: "Multiple stages, then silence" },
  { value: 4, label: "4 — Brutal", desc: "After final round, no word at all" },
  { value: 5, label: "5 — Criminal", desc: "After verbal offer, disappeared completely" },
];

export default function SubmitPage() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const [attachments, setAttachments] = useState<AttachmentFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    const remaining = MAX_FILES - attachments.length;
    Array.from(files).slice(0, remaining).forEach(file => {
      if (file.size > MAX_FILE_SIZE) {
        toast({ title: `${file.name} is too large (max 5MB)`, variant: "destructive" });
        return;
      }
      // Accept any file type — be permissive
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        setAttachments(prev => [
          ...prev,
          { name: file.name, type: file.type || "application/octet-stream", size: file.size, data: base64 }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: "",
      recruiterName: "",
      jobTitle: "",
      city: "",
      state: "",
      country: "US",
      ghostStage: "",
      waitDays: 7,
      ghostScore: 3,
      description: "",
      submitterEmail: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: FormValues) =>
      apiRequest("POST", "/api/reports", {
        ...data,
        attachments: attachments.length > 0 ? JSON.stringify(attachments) : null,
      }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setSubmitted(true);
    },
    onError: () => {
      toast({
        title: "Submission failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-500" />
        </div>
        <h1 className="text-xl font-bold text-foreground mb-2">Report Submitted</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Your experience is under review and will appear on the feed once approved. Thank you for helping other job seekers.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Button variant="outline" onClick={() => { setSubmitted(false); form.reset(); }} data-testid="submit-another">
            Submit Another
          </Button>
          <Link href="/">
            <Button data-testid="go-to-feed">View Feed</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-1">Report a Ghosting Experience</h1>
        <p className="text-muted-foreground text-sm">Your report helps other job seekers know what to expect. All submissions are reviewed before publishing.</p>
      </div>

      {/* Privacy notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6">
        <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Anonymous by default.</span> Your email (optional) is never shown publicly. Reports are moderated to remove false/malicious content.
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(v => mutation.mutate(v))} className="space-y-5">
              {/* Company + Recruiter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input data-testid="input-company" placeholder="e.g. Amazon, Deloitte..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="recruiterName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recruiter Name <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                      <FormControl>
                        <Input data-testid="input-recruiter" placeholder="First name or initials" {...field} value={field.value ?? ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Job title */}
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title *</FormLabel>
                    <FormControl>
                      <Input data-testid="input-job-title" placeholder="e.g. Senior Process Analyst" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Location */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City *</FormLabel>
                        <FormControl>
                          <Input data-testid="input-city" placeholder="e.g. Chicago" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-state">
                            <SelectValue placeholder="State" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {US_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Ghost stage + Wait days */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="ghostStage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>When did they ghost you? *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-stage">
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="waitDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Days waited with no response *</FormLabel>
                      <FormControl>
                        <Input
                          data-testid="input-wait-days"
                          type="number"
                          min={1}
                          max={999}
                          placeholder="e.g. 21"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Ghost score */}
              <FormField
                control={form.control}
                name="ghostScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity Score (1–5) *</FormLabel>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                      {SCORE_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          data-testid={`score-btn-${opt.value}`}
                          onClick={() => field.onChange(opt.value)}
                          className={`rounded-lg border p-2.5 text-left transition-all ${
                            field.value === opt.value
                              ? "border-primary bg-primary/10 ring-1 ring-primary"
                              : "border-border hover:border-muted-foreground"
                          }`}
                        >
                          <div className="text-lg mb-1">{"👻".repeat(opt.value)}</div>
                          <div className="text-xs font-semibold text-foreground">{opt.label}</div>
                          <div className="text-xs text-muted-foreground hidden sm:block mt-0.5 leading-snug">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What happened? *</FormLabel>
                    <FormControl>
                      <Textarea
                        data-testid="input-description"
                        placeholder="Describe your experience in detail. What did the recruiter promise? What actually happened? Did you follow up? (min. 30 characters)"
                        rows={4}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0} characters — be specific to help others
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Attachments */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Supporting Documentation <span className="text-muted-foreground font-normal">(optional)</span>
                </label>
                <p className="text-xs text-muted-foreground">
                  Attach emails, screenshots, LinkedIn messages, or any other documentation. Up to 5 files, 5MB each. Only visible to moderators — never shown publicly.
                </p>

                {/* Drop zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); processFiles(e.dataTransfer.files); }}
                  data-testid="attachment-dropzone"
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    dragOver
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground hover:bg-muted/30"
                  } ${attachments.length >= MAX_FILES ? "opacity-50 pointer-events-none" : ""}`}
                >
                  <Paperclip className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm font-medium text-foreground">
                    {dragOver ? "Drop files here" : "Click to attach or drag & drop"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Emails (.eml), PDFs, screenshots, text files — any format accepted
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept="*"
                    onChange={e => processFiles(e.target.files)}
                    data-testid="attachment-input"
                  />
                </div>

                {/* File list */}
                {attachments.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {attachments.map((file, i) => {
                      const Icon = fileIcon(file.type);
                      return (
                        <div
                          key={i}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border"
                          data-testid={`attachment-item-${i}`}
                        >
                          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                            <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => removeAttachment(i)}
                            data-testid={`remove-attachment-${i}`}
                            className="shrink-0 text-muted-foreground hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      );
                    })}
                    <p className="text-xs text-muted-foreground">
                      {attachments.length}/{MAX_FILES} files attached
                    </p>
                  </div>
                )}
              </div>

              {/* Email (optional) */}
              <FormField
                control={form.control}
                name="submitterEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Email <span className="text-muted-foreground font-normal">(optional, never shown publicly)</span></FormLabel>
                    <FormControl>
                      <Input
                        data-testid="input-email"
                        type="email"
                        placeholder="For moderation updates only"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                data-testid="submit-btn"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Ghost className="w-4 h-4 animate-pulse" />
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Ghost className="w-4 h-4" />
                    Submit Report
                  </span>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
