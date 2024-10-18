"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Mail, MessageSquare } from "lucide-react";
import { format } from "date-fns";

const frequenciesToDays: any = {
  Daily: 1,
  "Every 3 days": 3,
  Weekly: 7,
  Monthly: 30,
  Quarterly: 90,
};

export default function AddReminder() {
  const [notificationMethod, setNotificationMethod] = useState<
    "email" | "whatsapp"
  >("email");
  const [friendName, setFriendName] = useState<string>("");
  const [selectedFrequency, setSelectedFrequency] = useState<string>("Weekly");
  const [startDate, setStartDate] = useState<Date>();
  const [email, setEmail] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [emailError, setEmailError] = useState("");
  const [whatsappError, setWhatsappError] = useState("");
  const [friendNameError, setFriendNameError] = useState("");
  const [frequencyError, setFrequencyError] = useState("");
  const [startDateError, setStartDateError] = useState("");

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!re.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const validateWhatsapp = (number: string) => {
    const re = /^\+[1-9]\d{1,14}$/;
    if (!re.test(number)) {
      setWhatsappError("Enter a valid phone number");
      return false;
    }
    setWhatsappError("");
    return true;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    if (validateForm()) {
      const frequencyInDays = frequenciesToDays[selectedFrequency as any];
      await fetch("/api/addreminder", {
        method: "POST",
        body: JSON.stringify({
          friendName,
          notificationMethod,
          frequencyInDays,
          startDateTimestamp: startDate ? startDate.getTime() : 0,
          contactInfo: notificationMethod === "email" ? email : whatsappNumber,
        }),
      });
    }
  };

  const validateForm = () => {
    let isValid = true;

    if (!friendName.trim()) {
      setFriendNameError("Friend's name is required");
      isValid = false;
    } else {
      setFriendNameError("");
    }

    if (!selectedFrequency) {
      setFrequencyError("Please select a reminder frequency");
      isValid = false;
    } else {
      setFrequencyError("");
    }

    if (!startDate) {
      setStartDateError("Please select a start date");
      isValid = false;
    } else {
      setStartDateError("");
    }

    if (notificationMethod === "email") {
      isValid = validateEmail(email) && isValid;
    } else if (notificationMethod === "whatsapp") {
      isValid = validateWhatsapp(whatsappNumber) && isValid;
    }

    return isValid;
  };

  return (
    <main className="container flex flex-col justify-center items-center mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#FF5E6C] mb-6">
        Add New Reminder
      </h1>
      <div className="space-y-6 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="notification-method">Notification Method</Label>
          <RadioGroup
            id="notification-method"
            value={notificationMethod}
            onValueChange={(selectedNotificationMethod) => {
              const typeSafeNotificationMethod = selectedNotificationMethod as
                | "email"
                | "whatsapp";
              setNotificationMethod(typeSafeNotificationMethod);
            }}
            className="flex space-x-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="email" id="email" />
              <Label htmlFor="email" className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                Email
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="whatsapp" id="whatsapp" />
              <Label htmlFor="whatsapp" className="flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                WhatsApp
              </Label>
            </div>
          </RadioGroup>
        </div>
        {notificationMethod === "email" && (
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                validateEmail(e.target.value);
              }}
              required={notificationMethod === "email"}
              className={emailError ? "border-red-500" : ""}
            />
            {emailError && <p className="text-red-500 text-sm">{emailError}</p>}
          </div>
        )}
        {notificationMethod === "whatsapp" && (
          <div className="space-y-2">
            <Label htmlFor="whatsapp">
              WhatsApp Number (e.g., +1234567890)
            </Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="Enter your WhatsApp number"
              value={whatsappNumber}
              onChange={(e) => {
                setWhatsappNumber(e.target.value);
                validateWhatsapp(e.target.value);
              }}
              required={notificationMethod === "whatsapp"}
              className={whatsappError ? "border-red-500" : ""}
            />
            {whatsappError && (
              <p className="text-red-500 text-sm overflow-hidden">
                {whatsappError}
              </p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="friend-name">Loved One&#39;s Name</Label>
          <Input
            id="friend-name"
            placeholder="Their name"
            value={friendName}
            onChange={(e) => setFriendName(e.target.value)}
          />
          {friendNameError && (
            <p className="text-red-500 text-sm">{friendNameError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="frequency">Reminder Frequency</Label>
          <Select
            value={selectedFrequency}
            onValueChange={setSelectedFrequency}
          >
            <SelectTrigger id="frequency">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(frequenciesToDays).map((frequency) => (
                <SelectItem key={frequency} value={frequency}>
                  {frequency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {frequencyError && (
            <p className="text-red-500 text-sm">{frequencyError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="start-date">Start Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
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

        <Button
          onClick={handleSubmit}
          className="w-full bg-[#FF5E6C] hover:bg-[#FF7A85] text-white"
        >
          Create Reminder
        </Button>
      </div>
    </main>
  );
}
