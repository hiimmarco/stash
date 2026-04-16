"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";

function SaveSharedInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"saving" | "saved" | "error">("saving");

  useEffect(() => {
    const url =
      searchParams.get("url") ||
      searchParams.get("text") ||
      "";

    if (!url) {
      setStatus("error");
      return;
    }

    async function save() {
      try {
        // Fetch metadata first
        const metaRes = await fetch("/api/links/metadata", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        });
        const meta = metaRes.ok
          ? await metaRes.json()
          : { title: "", description: "", thumbnail_url: "" };

        // Save the link
        const res = await fetch("/api/links", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url,
            title: meta.title || url,
            description: meta.description || null,
            thumbnail_url: meta.thumbnail_url || null,
          }),
        });

        if (res.ok) {
          setStatus("saved");
          setTimeout(() => router.push("/"), 1500);
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    }

    save();
  }, [searchParams, router]);

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        {status === "saving" && (
          <>
            <p className="text-4xl mb-3">&#128278;</p>
            <p className="text-sm font-medium">Saving...</p>
          </>
        )}
        {status === "saved" && (
          <div className="bg-foreground/90 text-card rounded-2xl px-8 py-6">
            <p className="text-3xl mb-2">&#10003;</p>
            <p className="text-sm font-medium">Saved to Stash</p>
          </div>
        )}
        {status === "error" && (
          <>
            <p className="text-4xl mb-3">&#9888;&#65039;</p>
            <p className="text-sm font-medium">Could not save</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 px-4 py-2 rounded-xl bg-foreground text-card text-sm font-medium"
            >
              Go to Stash
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function SaveSharedPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-muted">Loading...</p>
        </div>
      }
    >
      <SaveSharedInner />
    </Suspense>
  );
}
