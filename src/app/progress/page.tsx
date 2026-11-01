import React from "react";
import type { Metadata } from "next";
import { ProgressDashboard } from "@/components/progress/ProgressDashboard";

export const metadata: Metadata = {
  title: "My Reading Progress | Shrimad Bhagavad Gita",
  description: "Track your Bhagavad Gita reading journey, chapter completion, and recent verses.",
};

export default function ProgressPage() {
  return (
    <div className="w-full">
      <ProgressDashboard />
    </div>
  );
}
