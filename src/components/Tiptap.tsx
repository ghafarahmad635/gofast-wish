"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Minus,
  RemoveFormatting,
} from "lucide-react";
import { Control, FieldValues, Path } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

// --- Types ---
type TiptapFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  className?: string;
};

// --- Toolbar Component ---
const EditorToolbar = ({ editor }: { editor: Editor }) => {
  if (!editor) return null;

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const toggleClass = "h-8 w-8 p-0 shrink-0";
  const Separator = () => <div className="h-5 w-px bg-border mx-1 shrink-0" />;

  return (
    <div className="flex w-full flex-wrap items-center gap-1 border-b bg-muted/40 p-1 sticky top-0 z-20">
      
      {/* 1. BASIC FORMATTING */}
      <Toggle
        size="sm"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        className={toggleClass}
        aria-label="Bold"
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        className={toggleClass}
        aria-label="Italic"
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("underline")}
        onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
        className={toggleClass}
        aria-label="Underline"
      >
        <UnderlineIcon className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("strike")}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        className={toggleClass}
        aria-label="Strike"
      >
        <Strikethrough className="h-4 w-4" />
      </Toggle>
      
      {/* Clear Formatting */}
      <Toggle
        size="sm"
        onPressedChange={() => editor.chain().focus().unsetAllMarks().run()}
        className={toggleClass}
        aria-label="Clear Format"
      >
        <RemoveFormatting className="h-4 w-4" />
      </Toggle>

      <Separator />

      {/* 2. ALIGNMENT (New Feature) */}
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'left' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
        className={toggleClass}
        aria-label="Align Left"
      >
        <AlignLeft className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'center' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
        className={toggleClass}
        aria-label="Align Center"
      >
        <AlignCenter className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'right' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
        className={toggleClass}
        aria-label="Align Right"
      >
        <AlignRight className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive({ textAlign: 'justify' })}
        onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()}
        className={toggleClass}
        aria-label="Justify"
      >
        <AlignJustify className="h-4 w-4" />
      </Toggle>

      <Separator />

      {/* 3. HEADINGS */}
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 1 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={toggleClass}
        aria-label="H1"
      >
        <Heading1 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 2 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={toggleClass}
        aria-label="H2"
      >
        <Heading2 className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("heading", { level: 3 })}
        onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={toggleClass}
        aria-label="H3"
      >
        <Heading3 className="h-4 w-4" />
      </Toggle>

      <Separator />

      {/* 4. LISTS */}
      <Toggle
        size="sm"
        pressed={editor.isActive("bulletList")}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        className={toggleClass}
        aria-label="Bullet List"
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("orderedList")}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        className={toggleClass}
        aria-label="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>

      <Separator />

      {/* 5. INSERT / EXTRAS */}
      <Toggle
        size="sm"
        pressed={editor.isActive("link")}
        onPressedChange={setLink}
        className={toggleClass}
        aria-label="Link"
      >
        <LinkIcon className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("blockquote")}
        onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        className={toggleClass}
        aria-label="Quote"
      >
        <Quote className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        onPressedChange={() => editor.chain().focus().setHorizontalRule().run()}
        className={toggleClass}
        aria-label="Horizontal Rule"
      >
        <Minus className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("codeBlock")}
        onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
        className={toggleClass}
        aria-label="Code Block"
      >
        <Code className="h-4 w-4" />
      </Toggle>

      <Separator />

      {/* 6. HISTORY */}
      <div className="ml-auto flex items-center gap-1">
        <Toggle
          size="sm"
          onPressedChange={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className={toggleClass}
          aria-label="Undo"
        >
          <Undo className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          onPressedChange={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className={toggleClass}
          aria-label="Redo"
        >
          <Redo className="h-4 w-4" />
        </Toggle>
      </div>
    </div>
  );
};

// --- Main Editor Component ---
function TiptapEditor({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (html: string) => void;
  className?: string;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm max-w-none px-3 py-2 outline-none dark:prose-invert",
          "min-h-[150px]"
        ),
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (!editor) return;
    const currentContent = editor.getHTML();
    if (currentContent !== value) {
      editor.commands.setContent(value || "");
    }
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div
      className={cn(
        "flex flex-col rounded-md border border-input bg-background shadow-sm focus-within:ring-1 focus-within:ring-ring overflow-hidden",
        className
      )}
    >
      <EditorToolbar editor={editor} />
      <div className="max-h-96 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

// --- Form Wrapper ---
export default function TiptapField<T extends FieldValues>({
  control,
  name,
  label = "Content",
  className,
}: TiptapFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <TiptapEditor
              value={field.value ?? ""}
              onChange={field.onChange}
              className="w-full"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}