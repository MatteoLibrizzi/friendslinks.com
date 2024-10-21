"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function RemoveReminder({ params }: any) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const removeReminder = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/addstreakpoint/${params.reminderId}`,
          { method: "GET" }
        );
        if (response.ok) {
        } else {
          throw new Error("Failed to fetch reminder");
        }
      } catch (error) {
        console.error("Error fetching reminder:", error);
        setError(true);
      }
      setLoading(false);
    };

    removeReminder();
  }, [params.reminderId]);

  return (
    <main className="container flex flex-col justify-center items-center mx-auto px-4 py-8">
      {loading && (
        <h1 className="text-3xl font-bold  mb-6">Updating Your Streak...</h1>
      )}
      {!error && !loading && (
        <>
          <h1 className="text-3xl font-bold  mb-6">Successfully Updated ✅</h1>
          <h1 className="text-3xl font-bold  mb-6">Keep it up 🔥</h1>
        </>
      )}
      {error && !loading && (
        <>
          <h1 className="text-3xl font-bold  mb-6">
            Something went wrong while updating your streak ❌
          </h1>
          <a href="mailto:librizzimatteo.ml@gmail.com">
            <Button className="bg-[#FF5E6C] hover:bg-[#FF7A85] text-white">
              Please Contact Us
            </Button>
          </a>
        </>
      )}
    </main>
  );
}
