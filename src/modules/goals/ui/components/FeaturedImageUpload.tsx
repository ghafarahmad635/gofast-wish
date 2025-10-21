"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDropzone } from "react-dropzone";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";

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
    const url = URL.createObjectURL(file);
    setPreview(url);
    form.setValue(name, file, { shouldValidate: true }); // ✅ trigger validation
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
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
          <FormLabel>Featured Image (optional)</FormLabel>
          <FormControl>
            {preview ? (
              <div className="relative w-full  bg-white aspect-video rounded-md overflow-hidden border">
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
              </div>
            ) : (
              <div
                {...getRootProps()}
                className={`flex items-center justify-center w-full bg-white  aspect-video border-2 border-dashed rounded-md cursor-pointer transition ${
                  isDragActive
                    ? "bg-gray-100 border-blue-400"
                    : "hover:bg-gray-50"
                }`}
              >
                <input {...getInputProps()} />
                <p className="text-sm text-gray-500">
                  {isDragActive ? "Drop image here" : "Click or drag image"}
                </p>
              </div>
            )}
          </FormControl>
          {/* ✅ Show validation error here */}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
