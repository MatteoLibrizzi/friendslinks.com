import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function Footer() {
  return (
    <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        © 2024 Matteo Librizzi Inc. All rights reserved.
      </p>
      <nav className="flex flex-row items-center sm:ml-auto gap-4 sm:gap-6">
        <Link className="text-xs hover:underline underline-offset-4" href="#">
          Terms of Service
        </Link>
        <Link className="text-xs hover:underline underline-offset-4" href="#">
          Privacy
        </Link>
        <a href="mailto:librizzimatteo.ml@gmail.com">
          <Button className="bg-[#FF5E6C] hover:bg-[#FF7A85] text-white">
            Feedback
          </Button>
        </a>
      </nav>
    </footer>
  );
}
