"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Calendar, Clock } from "lucide-react";

export default function ReminderQuery() {
  const [contactMethod, setContactMethod] = useState<"email">("email");
  const [contactInfo, setContactInfo] = useState("");
  const [contactError, setContactError] = useState("");
  const [reminders, setReminders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const validateContact = (value: string) => {
    console.log("Validate");
    if (contactMethod === "email") {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(value)) {
        setContactError("Please enter a valid email address");
        return false;
      }
    }
    setContactError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateContact(contactInfo)) {
      setIsLoading(true);
      try {
        const response = await fetch("/api/getreminders", {
          method: "POST",
          body: JSON.stringify({ contactInfo }),
        });
        if (response.ok) {
          const data = await response.json();
          setReminders(data.reminders);
        } else {
          throw new Error("Failed to fetch reminders");
        }
      } catch (error) {
        console.error("Error fetching reminders:", error);
        setReminders([]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  console.log(reminders);
  // TODO finish this page

  return (
    <main className="container flex flex-col justify-center items-center mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-[#FF5E6C] mb-6">
        Query Your Reminders
      </h1>
      <div className="space-y-6 max-w-md mb-8">
        <div className="space-y-2">
          <Label htmlFor="contact-method">Contact Method</Label>
          <RadioGroup
            id="contact-method"
            value={contactMethod}
            onValueChange={(value) => setContactMethod(value as "email")}
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

        <div className="space-y-2">
          <Label htmlFor="contact-info">
            {contactMethod === "email" ? "Email Address" : ""}
          </Label>
          <Input
            id="contact-info"
            type={contactMethod === "email" ? "email" : "tel"}
            placeholder={contactMethod === "email" ? "Enter your email" : ""}
            value={contactInfo}
            onChange={(e) => {
              setContactInfo(e.target.value);
              validateContact(e.target.value);
            }}
            className={contactError ? "border-red-500" : ""}
          />
          {contactError && (
            <p className="text-red-500 text-sm">{contactError}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-[#FF5E6C] hover:bg-[#FF7A85] text-white"
          disabled={isLoading}
          onClick={(e) => {
            handleSubmit(e);
          }}
        >
          {isLoading ? "Loading..." : "Query Reminders"}
        </Button>
      </div>

      {reminders.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-primary">
            Your Reminders
          </h2>
          {reminders.map((reminder) => (
            <Card key={reminder.id}>
              <CardHeader>
                <CardTitle>{reminder.friendName}</CardTitle>
                <CardDescription>Reminder Details:</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    <span>Every {reminder.frequencyInDays} Days</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>
                      Start Date:{" "}
                      {new Date(reminder.startDateTimestamp).toDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>
                      Next Reminder:{" "}
                      <strong>
                        {new Date(
                          reminder.nextReminderTimestamp
                        ).toDateString()}
                      </strong>
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {reminders.length === 0 && !isLoading && (
        <p className="text-center text-muted-foreground">
          No reminders found for this contact information.
        </p>
      )}
    </main>
  );
}
