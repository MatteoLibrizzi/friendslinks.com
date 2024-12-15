import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface AdvancedOptionsProps {
  startDate: Date | undefined;
  setStartDate: (date: Date | undefined) => void;
  startDateError: string;
}

export default function AdvancedOptions({
  startDate,
  setStartDate,
  startDateError,
}: AdvancedOptionsProps) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="advanced-options">
        <AccordionTrigger>Advanced Options</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 pt-2">
            <Label htmlFor="start-date">Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="start-date"
                  variant={"outline"}
                  className={`w-full justify-start text-left font-normal ${
                    !startDate && "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {startDateError && (
              <p className="text-red-500 text-sm">{startDateError}</p>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
