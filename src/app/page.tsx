import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Bell, MapPin, Shield, Skull, Smartphone } from "lucide-react";

export default function Main() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center">
      <section className="flex justify-center w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Don&#39;t forget to text your loved ones
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Get reminders to reach out to your friends
              </p>
            </div>
            <div className="space-x-4">
              <Link href="/addreminder">
                <Button className="bg-[#FF5E6C] hover:bg-[#FF7A85] text-white">
                  Get Started
                </Button>
              </Link>
              <a href="#keyFeatures">
                <Button
                  variant="outline"
                  className="border-[#FF5E6C] text-[#FF5E6C] hover:bg-[#FF5E6C] hover:text-white"
                >
                  Learn More
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
      <section
        id="keyFeatures"
        className="w-full flex justify-center py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800"
      >
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 text-[#FF5E6C]">
            Key Features
          </h2>
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
              <Bell className="h-8 w-8 text-[#FF5E6C]" />
              <h3 className="text-xl font-bold">Customized Reminders</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Choose how often you want to get in touch.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
              <MapPin className="h-8 w-8 text-[#FF5E6C]" />
              <h3 className="text-xl font-bold">Far but Connected</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Don&#39;t forget about your far away friends.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
              <Skull className="h-8 w-8 text-[#FF5E6C]" />
              <h3 className="text-xl font-bold">Delete Toxic Social Media</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Get all the benefits without the downsides.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="flex justify-center w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-[#FF5E6C]">
                Start Staying Connected Today
              </h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Set up your first reminder in under 1 minute
              </p>
            </div>
            <div className="w-full max-w-sm space-y-2">
              <Link href="/addreminder">
                <Button className="mt-4 w-full gap-2 bg-[#FF5E6C] hover:bg-[#FF7A85] text-white">
                  Start now <Smartphone className="mr-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
