import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";
import { Toaster } from "@/components/ui/sonner";
import { formatBDT, type Cattle, type CattleStatus } from "@/lib/cattle-data";
import { cn } from "@/lib/utils";
import {
  Image as ImageIcon,
  LogOut,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  Video,
  X,
  Loader2,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin · Bhumi Bovine" }, { name: "robots", content: "noindex" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [session, setSession] = useState<unknown>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setIsAdmin(false);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  if (!ready)
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  if (!session) return <AuthForm />;
  if (!isAdmin) return <NotAdmin />;
  return <Dashboard />;
}

function AuthForm() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const fn =
      mode === "signin"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/admin` },
          });
    const { error } = await fn;
    if (error) setErr(error.message);
    setBusy(false);
  };

  return (
    <div className="grid min-h-screen place-items-center bg-cream px-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-elegant">
        <Link to="/" className="font-display text-xl">
          Bhumi <span className="text-gold">Bovine</span>
        </Link>
        <h1 className="mt-6 font-display text-3xl">
          Admin {mode === "signin" ? "Sign in" : "Sign up"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "signin"
            ? "Sign in to manage your inventory."
            : "Create the first admin account. After this, only existing admins can add new ones."}
        </p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 outline-none ring-ring focus:ring-2"
          />
          <input
            type="password"
            required
            minLength={8}
            placeholder="Password (min 8)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 outline-none ring-ring focus:ring-2"
          />
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button
            disabled={busy}
            className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground disabled:opacity-60"
          >
            {busy ? "Please wait..." : mode === "signin" ? "Sign in" : "Create account"}
          </button>
        </form>
        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 text-center w-full text-sm text-muted-foreground hover:text-foreground"
        >
          {mode === "signin" ? "First time? Create an account" : "Have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}

function NotAdmin() {
  return (
    <div className="grid min-h-screen place-items-center bg-cream px-4 text-center">
      <div className="max-w-md">
        <h1 className="font-display text-3xl">Access denied</h1>
        <p className="mt-2 text-muted-foreground">
          Your account does not have admin privileges. Ask an existing admin to grant you access.
        </p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-6 rounded-full border border-border px-5 py-2.5 text-sm"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"cattle" | "inquiries" | "settings">("cattle");
  const tabs = ["cattle", "inquiries", "settings"] as const;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <div className="flex items-center gap-6">
            <Link to="/" className="font-display text-lg">
              Bhumi <span className="text-gold">Bovine</span> · Admin
            </Link>
            <nav className="hidden gap-1 md:flex">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`rounded-full px-4 py-1.5 text-sm capitalize ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                >
                  {t}
                </button>
              ))}
            </nav>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              navigate({ to: "/" });
            }}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto border-t border-border px-5 py-3 md:hidden">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-sm capitalize ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
            >
              {t}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        {tab === "cattle" && <ProductManager />}
        {tab === "inquiries" && <InquiriesView />}
        {tab === "settings" && <SettingsView />}
      </main>
      <Toaster richColors closeButton />
    </div>
  );
}

type CattleDraft = {
  code: string;
  name: string;
  breed: string;
  color: string;
  weight_kg: string;
  age_teeth: string;
  height_inches: string;
  price_bdt: string;
  status: CattleStatus;
  feed: string;
  health: string;
};

type ProductSaveInput = {
  draft: CattleDraft;
  imageFile: File | null;
  videoFile: File | null;
};

const cattleStatuses = ["Available", "Reserved", "Sold"] as const;
const MEDIA_BUCKET_NAME = "cattle-media";

function ProductManager() {
  const [list, setList] = useState<Cattle[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refresh = async () => {
    const { data, error } = await supabase.from("cattle").select("*").order("sort_order");
    if (error) {
      toast.error("Inventory could not load", { description: error.message });
      setList([]);
    } else {
      setList((data as Cattle[]) ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const addNew = async () => {
    setAdding(true);
    const code = `BB-${Math.floor(2000 + Math.random() * 8000)}`;
    const { data, error } = await supabase
      .from("cattle")
      .insert({
        code,
        name: "New Cattle",
        breed: "Sahiwal",
        sort_order: list.length + 1,
      })
      .select("*")
      .single();

    setAdding(false);
    if (error) {
      toast.error("Could not add product", { description: error.message });
      return;
    }

    setList((current) => [...current, data as Cattle].sort((a, b) => a.sort_order - b.sort_order));
    toast.success("Product added", { description: `${code} is ready to edit.` });
  };

  const saveProduct = async (cattle: Cattle, input: ProductSaveInput) => {
    const validationError = validateDraft(input.draft);
    if (validationError) {
      toast.error("Check required fields", { description: validationError });
      throw new Error(validationError);
    }

    setSavingId(cattle.id);
    try {
      const patch = draftToUpdate(input.draft);
      if (input.imageFile) {
        patch.image_url = await uploadMedia(cattle.id, input.imageFile, "image");
      }
      if (input.videoFile) {
        patch.video_url = await uploadMedia(cattle.id, input.videoFile, "video");
      }

      const { data, error } = await supabase
        .from("cattle")
        .update(patch)
        .eq("id", cattle.id)
        .select("*")
        .single();

      if (error) throw error;

      const saved = data as Cattle;
      setList((current) => current.map((item) => (item.id === saved.id ? saved : item)));
      toast.success("Product updated", { description: `${saved.code} changes are live.` });
      return saved;
    } catch (error) {
      toast.error("Could not save product", { description: getErrorMessage(error) });
      throw error;
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (cattle: Cattle) => {
    if (!window.confirm(`Delete ${cattle.code}?`)) return;
    setDeletingId(cattle.id);
    const { error } = await supabase.from("cattle").delete().eq("id", cattle.id);
    setDeletingId(null);

    if (error) {
      toast.error("Could not delete product", { description: error.message });
      return;
    }

    setList((current) => current.filter((item) => item.id !== cattle.id));
    toast.success("Product deleted", { description: `${cattle.code} was removed.` });
  };

  if (loading) return <Loader2 className="mx-auto mt-20 h-6 w-6 animate-spin" />;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-display text-3xl">Inventory</h2>
          <p className="text-sm text-muted-foreground">
            {list.length} cattle. Edit details, choose media, then save once.
          </p>
        </div>
        <button
          onClick={addNew}
          disabled={adding}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground disabled:opacity-60"
        >
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add cattle
        </button>
      </div>

      <div className="space-y-4">
        {list.map((cattle) => (
          <ProductEditor
            key={cattle.id}
            cattle={cattle}
            busy={savingId === cattle.id}
            deleting={deletingId === cattle.id}
            onDelete={() => remove(cattle)}
            onSave={(input) => saveProduct(cattle, input)}
          />
        ))}
        {list.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
            No cattle yet. Add the first product to start the catalog.
          </div>
        )}
      </div>
    </div>
  );
}

function ProductEditor({
  cattle,
  busy,
  deleting,
  onDelete,
  onSave,
}: {
  cattle: Cattle;
  busy: boolean;
  deleting: boolean;
  onDelete: () => void;
  onSave: (input: ProductSaveInput) => Promise<Cattle>;
}) {
  const baseline = useMemo(() => toDraft(cattle), [cattle]);
  const [draft, setDraft] = useState<CattleDraft>(baseline);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const imagePreviewUrl = useObjectUrl(imageFile);
  const imageSrc = imagePreviewUrl ?? cattle.image_url;
  const hasChanges = hasDraftChanges(draft, baseline) || !!imageFile || !!videoFile;
  const displayPrice = parseWholeNumber(draft.price_bdt);

  useEffect(() => {
    setDraft(baseline);
    setImageFile(null);
    setVideoFile(null);
  }, [baseline]);

  const updateDraft = (key: keyof CattleDraft, value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const reset = () => {
    setDraft(baseline);
    setImageFile(null);
    setVideoFile(null);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!hasChanges || busy) return;
    try {
      const saved = await onSave({ draft, imageFile, videoFile });
      setDraft(toDraft(saved));
      setImageFile(null);
      setVideoFile(null);
    } catch {
      // The save handler owns toast feedback; keep the draft intact for quick retry.
    }
  };

  return (
    <form
      onSubmit={submit}
      className="grid gap-5 rounded-xl border border-border bg-card p-4 shadow-card lg:grid-cols-[220px_1fr] lg:p-5"
    >
      <div className="space-y-3">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={draft.name || cattle.code}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground">
              <div className="text-center">
                <ImageIcon className="mx-auto h-8 w-8" />
                <span className="mt-2 block text-xs">No photo</span>
              </div>
            </div>
          )}
          {imageFile && (
            <div className="absolute inset-x-0 bottom-0 bg-foreground/75 px-3 py-2 text-xs text-background">
              New photo selected
            </div>
          )}
        </div>

        <MediaPicker
          id={`photo-${cattle.id}`}
          accept="image/*"
          icon={<Upload className="h-4 w-4" />}
          label={imageFile ? "Change photo" : "Replace photo"}
          file={imageFile}
          onPick={(file) => {
            if (!file.type.startsWith("image/")) {
              toast.error("Choose an image file");
              return;
            }
            setImageFile(file);
          }}
          onClear={() => setImageFile(null)}
        />

        <MediaPicker
          id={`video-${cattle.id}`}
          accept="video/*"
          icon={<Video className="h-4 w-4" />}
          label={videoFile ? "Change video" : cattle.video_url ? "Replace video" : "Add video"}
          file={videoFile}
          onPick={(file) => {
            if (!file.type.startsWith("video/")) {
              toast.error("Choose a video file");
              return;
            }
            setVideoFile(file);
          }}
          onClear={() => setVideoFile(null)}
        />
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Product</p>
            <h3 className="mt-1 font-display text-2xl">{draft.name || "Unnamed cattle"}</h3>
            <p className="text-sm text-muted-foreground">
              {draft.code || "No code"} · {formatBDT(displayPrice)}
            </p>
          </div>
          <label className="block min-w-36">
            <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Status
            </span>
            <select
              value={draft.status}
              onChange={(event) => updateDraft("status", event.target.value as CattleStatus)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring focus:ring-2"
            >
              {cattleStatuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DraftField
            label="Code"
            value={draft.code}
            required
            onChange={(value) => updateDraft("code", value)}
          />
          <DraftField
            label="Name"
            value={draft.name}
            required
            onChange={(value) => updateDraft("name", value)}
          />
          <DraftField
            label="Breed"
            value={draft.breed}
            required
            onChange={(value) => updateDraft("breed", value)}
          />
          <DraftField
            label="Color"
            value={draft.color}
            onChange={(value) => updateDraft("color", value)}
          />
          <DraftField
            label="Weight (kg)"
            type="number"
            value={draft.weight_kg}
            onChange={(value) => updateDraft("weight_kg", value)}
          />
          <DraftField
            label="Age (teeth)"
            type="number"
            value={draft.age_teeth}
            onChange={(value) => updateDraft("age_teeth", value)}
          />
          <DraftField
            label="Height (in)"
            type="number"
            value={draft.height_inches}
            onChange={(value) => updateDraft("height_inches", value)}
          />
          <DraftField
            label="Price (BDT)"
            type="number"
            value={draft.price_bdt}
            onChange={(value) => updateDraft("price_bdt", value)}
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <DraftField
            label="Feed"
            value={draft.feed}
            multiline
            onChange={(value) => updateDraft("feed", value)}
          />
          <DraftField
            label="Health"
            value={draft.health}
            multiline
            onChange={(value) => updateDraft("health", value)}
          />
        </div>

        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p
            className={cn(
              "text-sm",
              hasChanges ? "text-muted-foreground" : "text-muted-foreground/70",
            )}
          >
            {hasChanges ? "Unsaved changes ready to publish." : "Everything is saved."}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={reset}
              disabled={!hasChanges || busy}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
            <button
              type="button"
              onClick={onDelete}
              disabled={deleting || busy}
              className="inline-flex items-center gap-2 rounded-full border border-destructive/30 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </button>
            <button
              type="submit"
              disabled={!hasChanges || busy}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save product
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}

function MediaPicker({
  id,
  accept,
  icon,
  label,
  file,
  onPick,
  onClear,
}: {
  id: string;
  accept: string;
  icon: React.ReactNode;
  label: string;
  file: File | null;
  onPick: (file: File) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-border px-3 py-2 text-sm hover:bg-muted"
      >
        {icon}
        {label}
      </label>
      <input
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          if (file) onPick(file);
          event.currentTarget.value = "";
        }}
      />
      {file && (
        <div className="flex items-center justify-between gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          <span className="truncate">
            {file.name} · {formatFileSize(file.size)}
          </span>
          <button
            type="button"
            onClick={onClear}
            className="text-foreground"
            aria-label="Clear file"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}

function DraftField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  multiline?: boolean;
}) {
  const fieldClass =
    "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring focus:ring-2";

  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          className={cn(fieldClass, "min-h-24 resize-y")}
        />
      ) : (
        <input
          type={type}
          min={type === "number" ? 0 : undefined}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={fieldClass}
        />
      )}
    </label>
  );
}

function useObjectUrl(file: File | null) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return url;
}

function toDraft(cattle: Cattle): CattleDraft {
  return {
    code: cattle.code ?? "",
    name: cattle.name ?? "",
    breed: cattle.breed ?? "",
    color: cattle.color ?? "",
    weight_kg: String(cattle.weight_kg ?? 0),
    age_teeth: String(cattle.age_teeth ?? 0),
    height_inches: String(cattle.height_inches ?? 0),
    price_bdt: String(cattle.price_bdt ?? 0),
    status: cattle.status,
    feed: cattle.feed ?? "",
    health: cattle.health ?? "",
  };
}

function hasDraftChanges(draft: CattleDraft, baseline: CattleDraft) {
  return (Object.keys(draft) as (keyof CattleDraft)[]).some((key) => draft[key] !== baseline[key]);
}

function validateDraft(draft: CattleDraft) {
  if (!draft.code.trim()) return "Code is required.";
  if (!draft.name.trim()) return "Name is required.";
  if (!draft.breed.trim()) return "Breed is required.";
  return "";
}

function draftToUpdate(draft: CattleDraft): TablesUpdate<"cattle"> {
  return {
    code: draft.code.trim(),
    name: draft.name.trim(),
    breed: draft.breed.trim(),
    color: draft.color.trim(),
    weight_kg: parseWholeNumber(draft.weight_kg),
    age_teeth: parseWholeNumber(draft.age_teeth),
    height_inches: parseWholeNumber(draft.height_inches),
    price_bdt: parseWholeNumber(draft.price_bdt),
    status: draft.status,
    feed: draft.feed.trim(),
    health: draft.health.trim(),
  };
}

function parseWholeNumber(value: string) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, Math.round(number)) : 0;
}

async function uploadMedia(cattleId: string, file: File, type: "image" | "video") {
  const path = `cattle/${cattleId}/${type}-${Date.now()}-${safeFileName(file.name)}`;
  const { error } = await supabase.storage.from(MEDIA_BUCKET_NAME).upload(path, file, {
    contentType: file.type || undefined,
    upsert: true,
  });

  if (error) {
    if (isMissingStorageBucketError(error)) {
      throw new Error(
        `Supabase Storage bucket "${MEDIA_BUCKET_NAME}" is missing. Apply the storage migration or create a public "${MEDIA_BUCKET_NAME}" bucket before uploading media.`,
      );
    }
    throw error;
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET_NAME).getPublicUrl(path);
  return data.publicUrl;
}

function isMissingStorageBucketError(error: unknown) {
  const message = getErrorMessage(error).toLowerCase();
  return message.includes("bucket") && message.includes("not found");
}

function safeFileName(fileName: string) {
  const safe = fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
  return safe || "upload";
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Please try again.";
}

function CattleManager() {
  const [list, setList] = useState<Cattle[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = () =>
    supabase
      .from("cattle")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        setList((data as Cattle[]) ?? []);
        setLoading(false);
      });
  useEffect(() => {
    refresh();
  }, []);

  const updateField = async (id: string, patch: Partial<Cattle>) => {
    await supabase.from("cattle").update(patch).eq("id", id);
    refresh();
  };

  const addNew = async () => {
    const code = `BB-${Math.floor(2000 + Math.random() * 8000)}`;
    await supabase.from("cattle").insert({
      code,
      name: "New Cattle",
      breed: "Sahiwal",
      sort_order: list.length + 1,
    });
    refresh();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this cattle entry?")) return;
    await supabase.from("cattle").delete().eq("id", id);
    refresh();
  };

  const uploadImage = async (id: string, file: File) => {
    const path = `cattle/${id}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("cattle-media")
      .upload(path, file, { upsert: true });
    if (error) {
      alert(error.message);
      return;
    }
    const { data } = supabase.storage.from("cattle-media").getPublicUrl(path);
    await updateField(id, { image_url: data.publicUrl });
  };

  const uploadVideo = async (id: string, file: File) => {
    const path = `cattle/${id}/video-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage
      .from("cattle-media")
      .upload(path, file, { upsert: true });
    if (error) {
      alert(error.message);
      return;
    }
    const { data } = supabase.storage.from("cattle-media").getPublicUrl(path);
    await updateField(id, { video_url: data.publicUrl });
  };

  if (loading) return <Loader2 className="mx-auto mt-20 h-6 w-6 animate-spin" />;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl">Inventory</h2>
          <p className="text-sm text-muted-foreground">
            {list.length} cattle · changes are live immediately.
          </p>
        </div>
        <button
          onClick={addNew}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Add cattle
        </button>
      </div>

      <div className="space-y-4">
        {list.map((c) => (
          <div
            key={c.id}
            className="grid gap-4 rounded-2xl border border-border bg-card p-5 shadow-card md:grid-cols-[140px_1fr_auto]"
          >
            <div>
              <div className="aspect-square overflow-hidden rounded-xl bg-muted">
                {c.image_url && (
                  <img src={c.image_url} alt={c.name} className="h-full w-full object-cover" />
                )}
              </div>
              <label className="mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-muted">
                <Upload className="h-3 w-3" /> Photo
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => e.target.files?.[0] && uploadImage(c.id, e.target.files[0])}
                />
              </label>
              <label className="mt-1.5 inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-muted">
                <Upload className="h-3 w-3" /> Video
                <input
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={(e) => e.target.files?.[0] && uploadVideo(c.id, e.target.files[0])}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Inp label="Code" value={c.code} onSave={(v) => updateField(c.id, { code: v })} />
              <Inp label="Name" value={c.name} onSave={(v) => updateField(c.id, { name: v })} />
              <Inp label="Breed" value={c.breed} onSave={(v) => updateField(c.id, { breed: v })} />
              <Inp label="Color" value={c.color} onSave={(v) => updateField(c.id, { color: v })} />
              <Inp
                label="Weight (kg)"
                type="number"
                value={String(c.weight_kg)}
                onSave={(v) => updateField(c.id, { weight_kg: +v })}
              />
              <Inp
                label="Age (teeth)"
                type="number"
                value={String(c.age_teeth)}
                onSave={(v) => updateField(c.id, { age_teeth: +v })}
              />
              <Inp
                label="Height (in)"
                type="number"
                value={String(c.height_inches)}
                onSave={(v) => updateField(c.id, { height_inches: +v })}
              />
              <Inp
                label="Price (BDT)"
                type="number"
                value={String(c.price_bdt)}
                onSave={(v) => updateField(c.id, { price_bdt: +v })}
              />
              <div>
                <label className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Status
                </label>
                <select
                  value={c.status}
                  onChange={(e) =>
                    updateField(c.id, {
                      status: e.target.value as CattleStatus,
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                >
                  {(["Available", "Reserved", "Sold"] as const).map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
              <Inp
                label="Feed"
                value={c.feed}
                onSave={(v) => updateField(c.id, { feed: v })}
                className="col-span-2"
              />
              <Inp
                label="Health"
                value={c.health}
                onSave={(v) => updateField(c.id, { health: v })}
                className="col-span-2 sm:col-span-3"
              />
            </div>

            <div className="flex flex-col items-end justify-between">
              <p className="font-display text-lg text-primary">{formatBDT(c.price_bdt)}</p>
              <button onClick={() => remove(c.id)} className="text-destructive hover:opacity-80">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Inp({
  label,
  value,
  onSave,
  type = "text",
  className = "",
}: {
  label: string;
  value: string;
  onSave: (v: string) => void;
  type?: string;
  className?: string;
}) {
  const [v, setV] = useState(value);
  useEffect(() => setV(value), [value]);
  return (
    <label className={`block ${className}`}>
      <span className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type={type}
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={() => v !== value && onSave(v)}
        className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none ring-ring focus:ring-2"
      />
    </label>
  );
}

function InquiriesView() {
  const [list, setList] = useState<Tables<"inquiries">[]>([]);
  useEffect(() => {
    supabase
      .from("inquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setList(data ?? []));
  }, []);
  return (
    <div>
      <h2 className="font-display text-3xl">Inquiries</h2>
      <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              {["Date", "Name", "Phone", "Location", "Budget", "Notes"].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((i) => (
              <tr key={i.id} className="border-t border-border">
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(i.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3">{i.name}</td>
                <td className="px-4 py-3">
                  <a href={`tel:${i.phone}`} className="text-primary hover:underline">
                    {i.phone}
                  </a>
                </td>
                <td className="px-4 py-3">{i.location}</td>
                <td className="px-4 py-3">{i.budget}</td>
                <td className="px-4 py-3 text-muted-foreground">{i.notes}</td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No inquiries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsView() {
  const [whatsapp, setWhatsapp] = useState("");
  const [pixel, setPixel] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    supabase
      .from("site_settings")
      .select("*")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setWhatsapp(data.whatsapp_number ?? "");
          setPixel(data.meta_pixel_id ?? "");
        }
      });
  }, []);

  const save = async () => {
    await supabase
      .from("site_settings")
      .update({ whatsapp_number: whatsapp, meta_pixel_id: pixel || null })
      .eq("id", 1);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-xl">
      <h2 className="font-display text-3xl">Settings</h2>
      <div className="mt-6 space-y-4 rounded-2xl border border-border bg-card p-6">
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            WhatsApp number (with country code, no +)
          </span>
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="8801700000000"
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none ring-ring focus:ring-2"
          />
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            Meta Pixel ID
          </span>
          <input
            value={pixel}
            onChange={(e) => setPixel(e.target.value)}
            placeholder="1234567890"
            className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 outline-none ring-ring focus:ring-2"
          />
          <span className="mt-1 block text-xs text-muted-foreground">
            Get this from Meta Events Manager. Saved here, the pixel auto-loads on the public site
            and tracks PageView + Lead events.
          </span>
        </label>
        <button
          onClick={save}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground"
        >
          <Save className="h-4 w-4" /> {saved ? "Saved" : "Save settings"}
        </button>
      </div>
    </div>
  );
}
