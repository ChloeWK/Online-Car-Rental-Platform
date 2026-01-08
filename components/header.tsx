"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { User, LogOut, Calendar, Settings, Search, Bell, Menu, X, Car, Home, Phone, Info, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

export default function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Navigation links
  const navLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Cars", href: "/cars", icon: Car },
    { name: "Special Offers", href: "/special-offers", icon: Tag },
    { name: "About Us", href: "/about", icon: Info },
    { name: "Contact Us", href: "/contact", icon: Phone },
  ]

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-200",
        scrolled ? "bg-white/90 backdrop-blur-md shadow-sm dark:bg-gray-900/90" : "bg-white dark:bg-gray-900",
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-10 h-10 overflow-hidden rounded-full bg-primary/10">
              <Image src="/logo.png" alt="Car Rental Logo" fill priority className="object-contain p-1" />
            </div>
            <div>
              <span className="font-bold text-xl">Car Rental</span>
              <p className="text-xs text-muted-foreground hidden sm:block">Premium vehicles for you</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  pathname === link.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right side: Search, Notifications, User */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="text-muted-foreground" aria-label="Search">
              <Search className="h-5 w-5" />
            </Button>

            {user ? (
              <>
                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                      <Bell className="h-5 w-5" />
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">2</Badge>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="flex items-center justify-between px-4 py-2 border-b">
                      <h3 className="font-medium">Notifications</h3>
                      <Button variant="ghost" size="sm" className="text-xs">
                        Mark all as read
                      </Button>
                    </div>
                    <div className="py-2 px-4 border-b">
                      <div className="flex gap-3 mb-2">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Upcoming Reservation</p>
                          <p className="text-xs text-muted-foreground">
                            Your Toyota Camry is ready for pickup tomorrow
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">10 minutes ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2 px-4">
                      <div className="flex gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Car className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Special Offer</p>
                          <p className="text-xs text-muted-foreground">Get 15% off on weekend rentals this month</p>
                          <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-2 px-4 border-t">
                      <Button variant="ghost" size="sm" className="w-full text-primary">
                        View all notifications
                      </Button>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 ml-2 relative pl-2 pr-4 h-10">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 border-2 border-primary/20">
                          <AvatarImage
                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                            alt={user.name}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col items-start text-left">
                          <span className="text-sm font-medium leading-none">{user.name.split(" ")[0]}</span>
                          <span className="text-xs text-muted-foreground leading-none mt-1">My Account</span>
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex flex-col space-y-1 p-2">
                      <p className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                        Signed in as <span className="font-semibold text-foreground">{user.email}</span>
                      </p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push("/profile")} className="cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/my-reservations")} className="cursor-pointer">
                      <Calendar className="h-4 w-4 mr-2" />
                      My Reservations
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/settings")} className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-500">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2 ml-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-sm">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="text-sm font-medium">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden ml-1" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] sm:w-[350px] p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                      <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                        <div className="relative w-8 h-8 overflow-hidden rounded-full bg-primary/10">
                          <Image src="/logo.png" alt="Car Rental Logo" fill className="object-contain p-1" />
                        </div>
                        <span className="font-bold text-lg">Car Rental</span>
                      </Link>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setMobileMenuOpen(false)}
                        aria-label="Close menu"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto py-4">
                    <nav className="flex flex-col space-y-1 px-2">
                      {navLinks.map((link) => (
                        <Link
                          key={link.name}
                          href={link.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                            pathname === link.href
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                          )}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <link.icon className="h-5 w-5" />
                          {link.name}
                        </Link>
                      ))}
                    </nav>

                    {user ? (
                      <div className="mt-6 px-2">
                        <div className="rounded-lg bg-muted p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="h-10 w-10 border-2 border-primary/20">
                              <AvatarImage
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                                alt={user.name}
                              />
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                router.push("/profile")
                                setMobileMenuOpen(false)
                              }}
                            >
                              Profile
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                router.push("/my-reservations")
                                setMobileMenuOpen(false)
                              }}
                            >
                              Reservations
                            </Button>
                          </div>
                          <Button
                            variant="default"
                            size="sm"
                            className="w-full mt-2"
                            onClick={() => {
                              handleLogout()
                              setMobileMenuOpen(false)
                            }}
                          >
                            Logout
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-6 px-2">
                        <div className="rounded-lg bg-muted p-4">
                          <p className="text-sm mb-3">
                            Sign in to manage your reservations and get personalized offers
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => {
                                router.push("/login")
                                setMobileMenuOpen(false)
                              }}
                            >
                              Login
                            </Button>
                            <Button
                              variant="default"
                              className="w-full"
                              onClick={() => {
                                router.push("/signup")
                                setMobileMenuOpen(false)
                              }}
                            >
                              Sign Up
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">© 2025 Car Rental Service</div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Search className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
