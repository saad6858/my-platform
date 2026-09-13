/* filepath: components/dashboard/blog/BlogEditor.tsx */
"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Image as ImageIcon,
  Code,
  Quote,
  List,
  ListOrdered,
  Minus,
} from "lucide-react";

interface BlogEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
}

export function BlogEditor(: JSX.Element {
  value,
  onChange,
  placeholder = "Write your post in Markdown...",
  className,
  minHeight = 500,
}: BlogEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    setLineCount(value.split("\n").length);
  }, [value]);

  const insertAtCursor = useCallback(
    (syntax: string, placeholder: string = "") => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = value;
      const before = text.substring(0, start);
      const after = text.substring(end);
      const selected = text.substring(start, end) || placeholder;

      let insertion = "";
      switch (syntax) {
        case "bold":
          insertion = `**${selected}**`;
          break;
        case "italic":
          insertion = `*${selected}*`;
          break;
        case "strike":
          insertion = `~~${selected}~~`;
          break;
        case "h2":
          insertion = `\n## ${selected}\n`;
          break;
        case "h3":
          insertion = `\n### ${selected}\n`;
          break;
        case "link":
          insertion = `[${selected}](https://)`;
          break;
        case "image":
          insertion = `\n![${selected}](https://)\n`;
          break;
        case "code":
          insertion = `\n\`\`\`\n${selected}\n\`\`\`\n`;
          break;
        case "inlineCode":
          insertion = `\`${selected}\``;
          break;
        case "quote":
          insertion = `\n> ${selected}\n`;
          break;
        case "ul":
          insertion = `\n- ${selected}\n`;
          break;
        case "ol":
          insertion = `\n1. ${selected}\n`;
          break;
        case "hr":
          insertion = `\n---\n`;
          break;
        default:
          insertion = selected;
      }

      const newValue = before + insertion + after;
      onChange(newValue);

      requestAnimationFrame(() => {
        textarea.focus();
        const newCursor = start + insertion.length;
        textarea.setSelectionRange(newCursor, newCursor);
      });
    },
    [value, onChange]
  );

  const lineNumbers = Array.from(
    { length: Math.max(lineCount, 1) },
    (_, i) => i + 1
  );

  return (
    <div className={`flex flex-col ${className || ""}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 rounded-t-lg border border-b-0 border-white/10 bg-bg-secondary p-2">
        <ToolbarButton
          icon={Bold}
          onClick={() => insertAtCursor("bold")}
          title="Bold"
        />
        <ToolbarButton
          icon={Italic}
          onClick={() => insertAtCursor("italic")}
          title="Italic"
        />
        <ToolbarButton
          icon={Strikethrough}
          onClick={() => insertAtCursor("strike")}
          title="Strikethrough"
        />
        <div className="mx-1 h-4 w-px bg-white/10" />
        <ToolbarButton
          icon={Heading2}
          onClick={() => insertAtCursor("h2")}
          title="Heading 2"
        />
        <ToolbarButton
          icon={Heading3}
          onClick={() => insertAtCursor("h3")}
          title="Heading 3"
        />
        <div className="mx-1 h-4 w-px bg-white/10" />
        <ToolbarButton
          icon={LinkIcon}
          onClick={() => insertAtCursor("link")}
          title="Link"
        />
        <ToolbarButton
          icon={ImageIcon}
          onClick={() => insertAtCursor("image")}
          title="Image"
        />
        <div className="mx-1 h-4 w-px bg-white/10" />
        <ToolbarButton
          icon={Code}
          onClick={() => insertAtCursor("code")}
          title="Code Block"
        />
        <ToolbarButton
          icon={Code}
          onClick={() => insertAtCursor("inlineCode")}
          title="Inline Code"
        />
        <ToolbarButton
          icon={Quote}
          onClick={() => insertAtCursor("quote")}
          title="Quote"
        />
        <div className="mx-1 h-4 w-px bg-white/10" />
        <ToolbarButton
          icon={List}
          onClick={() => insertAtCursor("ul")}
          title="Bullet List"
        />
        <ToolbarButton
          icon={ListOrdered}
          onClick={() => insertAtCursor("ol")}
          title="Numbered List"
        />
        <ToolbarButton
          icon={Minus}
          onClick={() => insertAtCursor("hr")}
          title="Horizontal Rule"
        />
      </div>

      {/* Editor with line numbers */}
      <div className="relative flex overflow-hidden rounded-b-lg border border-white/10">
        <div
          className="select-none overflow-hidden bg-bg-secondary py-4 pl-4 pr-3 text-right font-mono text-sm leading-relaxed text-text-secondary/50"
          style={{ minHeight }}
        >
          {lineNumbers.map((n) => (
            <div key={n} className="h-[1.5em]">
              {n}
            </div>
          ))}
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          className="flex-1 resize-none bg-bg-secondary py-4 pr-4 font-mono text-sm leading-relaxed text-text-primary placeholder-text-secondary focus:outline-none"
          style={{ minHeight }}
        />
      </div>
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  onClick,
  title,
}: {
  icon: React.ElementType;
  onClick: () => void;
  title: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      title={title}
      className="rounded p-1.5 text-text-secondary transition-colors hover:bg-white/10 hover:text-text-primary"
    >
      <Icon className="h-4 w-4" />
    </motion.button>
  );
}
