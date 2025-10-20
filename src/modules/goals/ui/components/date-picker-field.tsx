"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface DatePickerFieldProps {
  field: {
    value?: string;
    onChange: (value: string | undefined) => void;
  };
}

export default function DatePickerField({ field }: DatePickerFieldProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // ✅ Store formatted string (yyyy-MM-dd)
      field.onChange(date.toISOString());
      setOpen(false);
    }
  };

  const parsedDate = field.value ? new Date(field.value) : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            "w-full justify-start text-left font-normal",
            !field.value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {field.value
            ? format(new Date(field.value), "PPP")
            : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={parsedDate}
          onSelect={handleSelect}
          disabled={(date) => date < new Date()}
        />
      </PopoverContent>
    </Popover>
  );
}
