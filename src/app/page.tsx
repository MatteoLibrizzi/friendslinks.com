import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Gauge, MailIcon, MapPinHouse } from "lucide-react";

export default function Main() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center">
      <section className="flex justify-center w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Find Your Dream Home Without the Risk
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                We Verify Homes, So You Don&lsquo;t Fall for Scams
              </p>
            </div>
            <div className="space-x-4">
              <Link href={"/searchByLocation"}>
                <Button>Get Started</Button>
              </Link>
              <a href="#keyFeatures">
                <Button variant="outline">Learn More</Button>
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
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8">
            Key Features
          </h2>
          <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <h3 className="text-xl font-bold">Verified Property Existence</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Our experts confirm that the house you&lsquo;re interested in is
                real, preventing costly scams.{" "}
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
              <MapPinHouse className="h-8 w-8 text-green-500" />
              <h3 className="text-xl font-bold">Local On-the-Ground Checks</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                We personally visit the property to validate its condition and
                location.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border-gray-800 p-4 rounded-lg">
              <Gauge className="h-8 w-8 text-green-500" />
              <h3 className="text-xl font-bold">Fast, Reliable Reports</h3>
              <p className="text-gray-500 dark:text-gray-400 text-center">
                Receive detailed verification reports quickly to move forward
                with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="flex justify-center w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Get Your Home Verified Today{" "}
              </h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Reply time &lt; 24 hours
              </p>
            </div>
            <div className="w-full max-w-sm space-y-2">
              <a href="mailto:librizzimatteo.ml@gmail.com">
                <Button className="mt-4 w-full gap-2">
                  Contact us <MailIcon className="mr-2 h-4 w-4" />
                </Button>
              </a>

              {/* <p className="text-xs text-gray-500 dark:text-gray-400">
                By signing up, you agree to our{" "}
                <Link className="underline underline-offset-2" href="#">
                  Terms & Conditions
                </Link>
              </p> */}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
