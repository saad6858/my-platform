/* filepath: components/TemplateEditor.tsx */
"use client";

import React, { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TemplateEditorProps {
  value: string;
  onChange: (value: string) => void;
  variables: string[];
}

export function TemplateEditor(: JSX.Element { value, onChange, variables }: TemplateEditorProps) : JSX.Element {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertVariable = useCallback(
    (variable: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = value.slice(0, start);
      const after = value.slice(end);
      const insertText = `{{${variable}}}`;
      const newValue = before + insertText + after;

      onChange(newValue);

      setTimeout(() => {
        textarea.focus();
        const newCursor = start + insertText.length;
        textarea.setSelectionRange(newCursor, newCursor);
      }, 0);
    },
    [value, onChange]
  );

  const renderHighlightedText = (text: string) => {
    const parts = text.split(/(\{\{[^}]+\}\})/g);
    return parts.map((part, index) => {
      if (part.match(/^\{\{[^}]+\}\}$/)) {
        return (
          <span
            key={index}
            className="bg-accent-primary/20 text-accent-primary px-1 rounded text-sm font-mono"
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          className="w-full px-3 py-2 bg-bg-secondary border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-accent-quaternary resize-none font-mono leading-relaxed"
        />
        <div className="absolute top-2 left-3 right-3 pointer-events-none opacity-0">
          {renderHighlightedText(value)}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-text-secondary">Insert:</span>
        {variables.map((variable) => (
          <motion.button
            key={variable}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => insertVariable(variable)}
            className="px-2 py-1 bg-accent-primary/10 border border-accent-primary/20 rounded text-xs text-accent-primary font-mono hover:bg-accent-primary/20 transition-colors"
          >
            {`{{${variable}}}`}
          </motion.button>
        ))}
      </div>

      <div className="p-3 bg-bg-primary rounded-lg border border-white/5">
        <p className="text-xs text-text-secondary mb-1">Preview:</p>
        <div className="text-sm text-text-primary whitespace-pre-wrap font-mono leading-relaxed">
          {renderHighlightedText(value)}
        </div>
      </div>
    </div>
  );
}
