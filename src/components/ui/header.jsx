import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import {
  Bell,
  HeartHandshake,
  HomeIcon,
  MapPin,
  MenuIcon,
  UserPlus,
} from "lucide-react";

export default function Header() {
  return (
    <div className="container mx-auto px-4 md:px-6 lg:px-8">
      <header className="flex h-20 w-full shrink-0 items-center justify-between px-4 md:px-6">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetTrigger asChild>
              <Link href="/" prefetch={false}>
                <HeartHandshake className="h-6 w-6 text-[#FF5E6C]" />
                <span className="sr-only">FriendsRemind.me</span>
              </Link>
            </SheetTrigger>
            <div className="grid gap-2 py-6">
              <SheetTrigger asChild>
                <Link
                  href="/"
                  className="flex w-full items-center  justify-between py-2 text-lg font-semibold text-[#FF5E6C]"
                  prefetch={false}
                >
                  Home&nbsp;&nbsp;
                  <HomeIcon className="ml-1 h-6 w-6" />
                </Link>
              </SheetTrigger>
              <SheetTrigger asChild>
                <Link
                  href="/reminders"
                  className="flex w-full items-center justify-between py-2 text-lg font-semibold text-[#FF5E6C]"
                  prefetch={false}
                >
                  My Reminders&nbsp;&nbsp;
                  <MapPin className="ml-1 h-6 w-6" />
                </Link>
              </SheetTrigger>
              <SheetTrigger asChild>
                <Link
                  href="/addreminder"
                  className="flex w-full items-center  justify-between py-2 text-lg font-semibold text-[#FF5E6C]"
                  prefetch={false}
                >
                  Add Reminder&nbsp;&nbsp;
                  <UserPlus className="ml-1 h-6 w-6" />
                </Link>
              </SheetTrigger>
            </div>
          </SheetContent>
        </Sheet>
        <Link href="/" className="mr-6 hidden lg:flex" prefetch={false}>
          <HeartHandshake className="h-6 w-6 text-[#FF5E6C]" />
          <span className="sr-only">FriendsRemind.me</span>
        </Link>
        <NavigationMenu className="hidden lg:flex pl-10">
          <NavigationMenuList>
            <NavigationMenuLink
              asChild
              className="text-[#FF5E6C] hover:text-white  hover:bg-[#FF5E6C] "
            >
              <Link
                href="/"
                className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors  focus:bg-[#FF5E6C] focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-[#FF5E6C]/50 data-[state=open]:bg-[#FF5E6C]/50 dark:bg-gray-950 dark:hover:bg-[#FF5E6C] dark:hover:text-white dark:focus:bg-[#FF5E6C] dark:focus:text-white dark:data-[active]:bg-[#FF5E6C]/50 dark:data-[state=open]:bg-[#FF5E6C]/50"
                prefetch={false}
              >
                Home <HomeIcon className="ml-1 h-4 w-4 " />
              </Link>
            </NavigationMenuLink>
            <NavigationMenuLink
              asChild
              className="text-[#FF5E6C] hover:text-white  hover:bg-[#FF5E6C] "
            >
              <Link
                href="/reminders"
                className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-[#FF5E6C] hover:text-white focus:bg-[#FF5E6C] focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-[#FF5E6C]/50 data-[state=open]:bg-[#FF5E6C]/50 dark:bg-gray-950 dark:hover:bg-[#FF5E6C] dark:hover:text-white dark:focus:bg-[#FF5E6C] dark:focus:text-white dark:data-[active]:bg-[#FF5E6C]/50 dark:data-[state=open]:bg-[#FF5E6C]/50"
                prefetch={false}
              >
                My Reminders <MapPin className="ml-1 h-4 w-4" />
              </Link>
            </NavigationMenuLink>
            <NavigationMenuLink
              asChild
              className="text-[#FF5E6C] hover:text-white  hover:bg-[#FF5E6C] "
            >
              <Link
                href="/addreminder"
                className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium transition-colors hover:bg-[#FF5E6C] hover:text-white focus:bg-[#FF5E6C] focus:text-white focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-[#FF5E6C]/50 data-[state=open]:bg-[#FF5E6C]/50 dark:bg-gray-950 dark:hover:bg-[#FF5E6C] dark:hover:text-white dark:focus:bg-[#FF5E6C] dark:focus:text-white dark:data-[active]:bg-[#FF5E6C]/50 dark:data-[state=open]:bg-[#FF5E6C]/50"
                prefetch={false}
              >
                Add Reminder <UserPlus className="ml-1 h-4 w-4" />
              </Link>
            </NavigationMenuLink>
          </NavigationMenuList>
        </NavigationMenu>
      </header>
    </div>
  );
}
