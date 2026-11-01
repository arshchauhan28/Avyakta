import Link from "next/link";
import { BookOpen, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 rounded-full bg-accent-soft flex items-center justify-center text-primary mb-4">
        <BookOpen className="w-8 h-8 text-accent" />
      </div>
      <h1 className="text-3xl font-bold font-sanskrit text-text-primary mb-2">
        पृष्ठं न लब्धम् · Verse or Page Not Found
      </h1>
      <p className="text-text-secondary max-w-md mb-8 text-sm leading-relaxed">
        The requested shloka, chapter, or sacred page could not be found. Please check the verse reference or return to explore the 18 chapters.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface border border-border text-text-primary hover:bg-black/5 dark:hover:bg-white/5 font-medium text-sm transition-colors"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <Link
          href="/chapters"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white hover:bg-accent-hover font-medium text-sm shadow-sm transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>Explore 18 Chapters</span>
        </Link>
      </div>
    </div>
  );
}
