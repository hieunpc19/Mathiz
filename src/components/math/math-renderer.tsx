"use client";

import React, { useMemo } from "react";
import katex from "katex";

interface MathRendererProps {
  content: string;
  className?: string;
}

export function MathRenderer({ content, className = "" }: MathRendererProps) {
  // Parse content into parts: text vs inline math ($...$) vs block math ($$...$$)
  const renderedContent = useMemo(() => {
    if (!content) return "";

    const escaped = content
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    // Replace display math $$...$$ first
    let processed = escaped.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), {
          displayMode: true,
          throwOnError: false,
        });
      } catch {
        return `<span class="katex-error font-mono text-red-500">[Math: ${math}]</span>`;
      }
    });

    // Replace inline math $...$
    processed = processed.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
      try {
        return katex.renderToString(math.trim(), {
          displayMode: false,
          throwOnError: false,
        });
      } catch {
        return `<span class="katex-error font-mono text-red-500">[Math: ${math}]</span>`;
      }
    });

    // Replace basic markdown formatting like **bold**, *italic*, \n linebreaks, bullet lists
    processed = processed
      .replace(
        /!\[([^\]]*)\]\((\/api\/exams\/[^)]+)\)/g,
        '<img src="$2" alt="$1" class="my-5 max-h-80 max-w-full rounded-xl object-contain" loading="lazy" />',
      )
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em class="italic text-slate-700">$1</em>')
      .replace(/\n\n/g, '<div class="h-3"></div>')
      .replace(/\n/g, "<br />");

    return processed;
  }, [content]);

  return (
    <div
      className={`prose prose-slate max-w-none text-slate-800 leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedContent }}
    />
  );
}
