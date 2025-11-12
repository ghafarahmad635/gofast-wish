"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, Info } from "lucide-react";
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
const RATIO_HINT = "Recommended 16:9 (e.g., 1600×900)";

interface FeaturedImageUploadProps {
  form: any;
  name: string; // "file"
  initialImage?: string | null;
}

export default function FeaturedImageUpload({
  form,
  name,
  initialImage,
}: FeaturedImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialImage ?? null);

  useEffect(() => {
    setPreview(initialImage ?? null);
  }, [initialImage]);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Guard size (extra safety in addition to maxSize)
    if (file.size > MAX_SIZE) {
      form.setError(name, { type: "manual", message: "Max file size is 2 MB" });
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
    form.clearErrors(name);
    form.setValue(name, file, { shouldValidate: true });
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    maxSize: MAX_SIZE,
    onDropRejected: () => {
      form.setError(name, { type: "manual", message: "Only images up to 2 MB are allowed" });
    },
  });

  const handleClear = () => {
    setPreview(null);
    form.setValue(name, undefined, { shouldValidate: true });
    form.setValue("featuredImageId", undefined);
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem className="flex flex-col gap-2">
          <div className="flex flex-col  gap-2">
            <FormLabel>Featured Image (optional)</FormLabel>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
              <Info className="h-3 w-3" />
              Up to 2 MB • {RATIO_HINT}
            </span>
          </div>

          <FormDescription>
            For best results use a wide image. If possible keep close to 16:9 so it fills the preview nicely.
          </FormDescription>

          <FormControl>
            {preview ? (
              <div className="relative w-full bg-white aspect-video rounded-md overflow-hidden border">
                <Image src={preview} alt="Preview" fill className="object-cover" />
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  onClick={handleClear}
                  className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/60 text-white hover:bg-black/70"
                  title="Remove image"
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Bottom-right hint badge */}
                <div className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/50 px-2 py-0.5 text-[11px] text-white">
                  Max 2 MB • 16:9
                </div>
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`flex items-center justify-center w-full bg-white aspect-video border-2 border-dashed rounded-md cursor-pointer transition ${
                  isDragActive ? "bg-gray-100 border-blue-400" : "hover:bg-gray-50"
                }`}
              >
                <input {...getInputProps()} />
                <div className="text-center">
                  <p className="text-sm text-gray-600">Click or drag an image here</p>
                  <p className="text-xs text-gray-400 mt-1">PNG JPG WEBP • Up to 2 MB • {RATIO_HINT}</p>
                </div>
              </div>
            )}
          </FormControl>

          {/* Validation error */}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
