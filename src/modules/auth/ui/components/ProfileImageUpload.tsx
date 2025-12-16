"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, Info, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
  FormDescription,
} from "@/components/ui/form";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB

interface ProfileImageUploadProps {
  form: any;
  name: string; // "file" recommended
  initialImage?: string | null;
  disabled?: boolean;
}

export default function ProfileImageUpload({
  form,
  name,
  initialImage,
  disabled = false,
}: ProfileImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialImage ?? null);

  // Track object URL so we can revoke it (avoid memory leaks)
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    // If initialImage changes (like after refetch), show it
    setPreview(initialImage ?? null);

    // If we had a local blob preview, clean it up
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, [initialImage]);

  const onDrop = (acceptedFiles: File[]) => {
    if (disabled) return;

    const file = acceptedFiles[0];
    if (!file) return;

    if (file.size > MAX_SIZE) {
      form.setError(name, { type: "manual", message: "Max file size is 2 MB" });
      return;
    }

    // Clean up old blob preview if any
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;

    setPreview(url);
    form.clearErrors(name);
    form.setValue(name, file, { shouldValidate: true, shouldDirty: true });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    maxSize: MAX_SIZE,
    disabled,
    onDropRejected: () => {
      if (disabled) return;
      form.setError(name, {
        type: "manual",
        message: "Only images up to 2 MB are allowed",
      });
    },
  });

  const handleClear = () => {
    if (disabled) return;

    setPreview(null);

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    form.setValue(name, undefined, { shouldValidate: true, shouldDirty: true });
    form.clearErrors(name);
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <FormLabel>Profile photo</FormLabel>
              <FormDescription className="flex items-center gap-1">
                <Info className="h-3.5 w-3.5" />
                PNG JPG WEBP • up to 2 MB
              </FormDescription>
            </div>
          </div>

          <FormControl>
            <div className="flex items-center gap-4">
              {/* Avatar preview */}
              <div
                className={`relative h-16 w-16 overflow-hidden rounded-full border bg-muted shrink-0 ${
                  disabled ? "opacity-60" : ""
                }`}
              >
                {preview ? (
                  <Image
                    src={preview}
                    alt="Profile preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                    <Upload className="h-5 w-5" />
                  </div>
                )}

                {preview && !disabled ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    onClick={handleClear}
                    className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-black/60 text-white hover:bg-black/70"
                    title="Remove image"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                ) : null}
              </div>

              {/* Drop area */}
              <div
                {...getRootProps()}
                className={`flex-1 rounded-lg border-2 border-dashed bg-background px-4 py-3 transition ${
                  disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                } ${
                  isDragActive ? "border-primary bg-muted/40" : "hover:bg-muted/20"
                }`}
              >
                <input {...getInputProps()} />
                <div className="text-sm">
                  <p className="font-medium">
                    {disabled ? "Uploading locked while saving" : "Click to upload"}
                  </p>
                  <p className="text-muted-foreground text-xs mt-1">
                    {disabled ? "Please wait…" : "or drag and drop an image here"}
                  </p>
                </div>
              </div>
            </div>
          </FormControl>

          <FormMessage />
        </FormItem>
      )}
    />
  );
}
