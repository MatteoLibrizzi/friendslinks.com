"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { hasCookie, setCookie, getCookie } from "cookies-next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail } from "lucide-react";
import { addDays } from "date-fns";
import AdvancedOptions from "./AdvancedOptions";

const frequenciesToDays: any = {
  "Every 3 days": 3,
  Weekly: 7,
  Monthly: 30,
  Quarterly: 90,
  "Every Semester": 182,
  Yearly: 365,
};

export default function AddReminder() {
  const [notificationMethod, setNotificationMethod] =
    useState<"email">("email");
  const [friendName, setFriendName] = useState<string>("");
  const [selectedFrequency, setSelectedFrequency] = useState<string>("Weekly");
  const [startDate, setStartDate] = useState<Date | undefined>(
    addDays(new Date(), 1)
  );
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [friendNameError, setFriendNameError] = useState("");
  const [frequencyError, setFrequencyError] = useState("");
  const [startDateError, setStartDateError] = useState("");
  const [creationButtonMessage, setCreationButtonMessage] =
    useState("Create Reminder");
  const [creationButtonDisabled, setCreationButtonDisabled] = useState(false);

  useEffect(() => {
    const setEmailCookie = async () => {
      if (!(await hasCookie("email"))) {
        return;
      }
      const emailInCookie = await getCookie("email");
      if (!emailInCookie) {
        return;
      }
      setEmail(emailInCookie.valueOf());
    };

    setEmailCookie();
  }, []);

  const clearForm = () => {
    setFriendName("");
    setEmail("");
    setEmailError("");
    setFriendNameError("");
    setFrequencyError("");
    setStartDateError("");
    setStartDate(addDays(new Date(), 1));
  };

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!re.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const storeEmainInCookie = () => {
    setCookie("email", email, {});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (validateForm()) {
      storeEmainInCookie();
      setCreationButtonDisabled(true);
      setCreationButtonMessage("Creating Reminder...");
      const frequencyInDays = frequenciesToDays[selectedFrequency as any];
      const res = await fetch("/api/addreminder", {
        method: "POST",
        body: JSON.stringify({
          friendName,
          notificationMethod,
          frequencyInDays,
          startDateTimestamp: startDate ? startDate.getTime() : 0,
          contactInfo: notificationMethod === "email" ? email : "",
        }),
      });

      if (res.ok) {
        setCreationButtonMessage("Reminder Created ✅");
        setTimeout(() => {
          setCreationButtonMessage("Create Reminder");
          setCreationButtonDisabled(false);

          clearForm();
        }, 3000);
      } else {
        setCreationButtonMessage("Failed to Create ❌");
      }
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
    }

    return isValid;
  };

  return (
    <main className="container flex flex-col justify-center items-center mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#FF5E6C] mb-2">
        Add New Reminder
      </h1>
      <p className="mx-auto pb-4 max-w-[700px] text-gray-500 text-md text-center  dark:text-gray-400">
        You will receive a periodic email, unsubscribe anytime with just{" "}
        <strong>ONE</strong> click
      </p>

      <div className="space-y-6 max-w-md">
        <div className="space-y-2">
          <Label htmlFor="notification-method">Notification Method</Label>
          <RadioGroup
            id="notification-method"
            value={notificationMethod}
            onValueChange={(selectedNotificationMethod) => {
              const typeSafeNotificationMethod = selectedNotificationMethod as
                | "email";
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
        <AdvancedOptions
          startDate={startDate}
          setStartDate={setStartDate}
          startDateError={startDateError}
        />

        <Button
          onClick={handleSubmit}
          disabled={creationButtonDisabled}
          className="w-full bg-[#FF5E6C] hover:bg-[#FF7A85] text-white"
        >
          {creationButtonMessage}
        </Button>
      </div>
    </main>
  );
}
