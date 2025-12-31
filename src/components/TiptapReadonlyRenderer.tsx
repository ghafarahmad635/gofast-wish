"use client";

import React, { useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function TiptapReadonlyRenderer({
  html,
  className,
}: {
  html: string;
  className?: string;
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: html && html.trim().length > 0 ? html : "<p></p>",
    editable: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: [
          "tiptap",
          "leading-relaxed text-gray-700",
          className ?? "",
        ].join(" "),
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    const incoming = html && html.trim().length > 0 ? html : "<p></p>";
    const current = editor.getHTML();

    if (current !== incoming) {
      editor.commands.setContent(incoming, { emitUpdate: false });
      editor.setEditable(false);
    }
  }, [editor, html]);

  if (!editor) return null;

  return (
    <div className="p-0">
      <EditorContent
        editor={editor}
        className={[
          "[&_.ProseMirror]:outline-none",
          "[&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:my-3",
          "[&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h2]:my-3",
          "[&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:my-2",
          "[&_.ProseMirror_h4]:text-base [&_.ProseMirror_h4]:font-semibold [&_.ProseMirror_h4]:my-2",
          "[&_.ProseMirror_h5]:text-sm [&_.ProseMirror_h5]:font-semibold [&_.ProseMirror_h5]:my-2",
          "[&_.ProseMirror_h6]:text-sm [&_.ProseMirror_h6]:font-semibold [&_.ProseMirror_h6]:my-2",
          "[&_.ProseMirror_p]:my-2",
          "[&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ul]:my-2",
          "[&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_ol]:my-2",
          "[&_.ProseMirror_a]:text-primary [&_.ProseMirror_a]:underline",
          "[&_.ProseMirror_blockquote]:border-l-4 [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:text-gray-600 [&_.ProseMirror_blockquote]:my-2",
          "[&_.ProseMirror_pre]:bg-gray-50 [&_.ProseMirror_pre]:p-3 [&_.ProseMirror_pre]:rounded-lg [&_.ProseMirror_pre]:overflow-x-auto [&_.ProseMirror_pre]:my-2",
          "[&_.ProseMirror_code]:bg-gray-100 [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:py-0.5 [&_.ProseMirror_code]:rounded",
        ].join(" ")}
      />
    </div>
  );
}
