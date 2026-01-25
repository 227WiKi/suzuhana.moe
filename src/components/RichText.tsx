"use client";

import React from "react";

interface RichTextProps {
  text: string;
  className?: string;
  preventPropagation?: boolean; 
}

export default function RichText({ text, className, preventPropagation = false }: RichTextProps) {
  if (!text) return null;

  const parts = text.split(/(@[a-zA-Z0-9_]+|#[^\s!@#$%^&*(),.?":{}|<>]+)/g);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.match(/^@[a-zA-Z0-9_]+$/)) {
          const username = part.slice(1);
          return (
            <a
              key={i}
              href={`https://x.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#008CD2] hover:underline"
              onClick={(e) => preventPropagation && e.stopPropagation()}
            >
              {part}
            </a>
          );
        }

        if (part.match(/^#[^\s!@#$%^&*(),.?":{}|<>]+$/)) {
          const hashtag = part.slice(1);
          return (
            <a
              key={i}
              href={`https://x.com/hashtag/${hashtag}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#008CD2] hover:underline"
              onClick={(e) => preventPropagation && e.stopPropagation()}
            >
              {part}
            </a>
          );
        }

        return part;
      })}
    </span>
  );
}