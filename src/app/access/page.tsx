"use client";

import { Suspense } from "react";
import AccessClient from "./AccessClient";

export default function AccessPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#050814] p-6 text-white">Loading access...</main>}>
      <AccessClient />
    </Suspense>
  );
}
