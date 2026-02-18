"use client";

import React from "react";

interface RichTextProps {
  text: string;
  className?: string;
  preventPropagation?: boolean;
  platform?: 'twitter' | 'instagram'; 
}

export default function RichText({ 
  text, 
  className, 
  preventPropagation = false, 
  platform = 'twitter' 
}: RichTextProps) {
  if (!text) return null;

  const parts = text.split(/(@[a-zA-Z0-9_.]+|#[^\s!@#$%^&*(),.?":{}|<>]+)/g);

  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.match(/^@[a-zA-Z0-9_.]+$/)) {
          let username = part;
          let suffix = "";
          
          if (part.endsWith('.')) {
             username = part.slice(0, -1);
             suffix = ".";
          }
          
          const nameContent = username.slice(1); 

          const href = platform === 'instagram'
            ? `https://www.instagram.com/${nameContent}/`
            : `https://x.com/${nameContent}`;

          return (
            <React.Fragment key={i}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#008CD2] hover:underline"
                onClick={(e) => preventPropagation && e.stopPropagation()}
              >
                {username}
              </a>
              {suffix}
            </React.Fragment>
          );
        }

        if (part.match(/^#[^\s!@#$%^&*(),.?":{}|<>]+$/)) {
          const hashtag = part.slice(1); // 去掉 #
          
          const href = platform === 'instagram'
            ? `https://www.instagram.com/explore/tags/${hashtag}/`
            : `https://x.com/hashtag/${hashtag}`;

          return (
            <a
              key={i}
              href={href}
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