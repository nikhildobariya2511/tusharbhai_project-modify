"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, UserRound, Menu, X, ArrowLeft, ChevronRight } from "lucide-react"

import Image from "next/image"
import { useTranslations } from "next-intl"
import LanguageSwitcher from "./LanguageSwitcher"
import { menuData } from "../../lib/menu-data"
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet"
import { cn } from "../../lib/utils"

type MenuItem = (typeof menuData)[number]

// Timing used to avoid flicker when moving pointer between panels
const OPEN_DELAY = 60
const CLOSE_DELAY = 120

// Default chevrons you can replace with your exact icons later
export function ChevronDown({ size = 16, ...props }: any) {
    return (
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
            <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

// Helper to convert menu item ids (kebab-case) to translation keys (camelCase)
const idToKey = (id: string) =>
    id
        .split("-")
        .map((part, i) => (i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
        .join("")

export function Navbar() {
    const t = useTranslations("NavBar")
    const [openTop, setOpenTop] = React.useState<string | null>(null)
    const [openSub, setOpenSub] = React.useState<string | null>(null)
    const [scrolled, setScrolled] = React.useState(false);

    React.useEffect(() => {
        const onScroll = () => {
            // threshold 8px — adjust if you want earlier/later
            setScrolled(window.scrollY > 8);
        };

        // passive for performance
        window.addEventListener("scroll", onScroll, { passive: true });

        // run once to set initial state (if page loaded already scrolled)
        onScroll();

        return () => window.removeEventListener("scroll", onScroll);
    }, []);
    const openTimer = React.useRef<number | null>(null)
    const closeTimer = React.useRef<number | null>(null)
    const pathname = usePathname()

    const clearTimers = () => {
        if (openTimer.current) window.clearTimeout(openTimer.current!)
        if (closeTimer.current) window.clearTimeout(closeTimer.current!)
        openTimer.current = null
        closeTimer.current = null
    }

    const openWithDelay = (id: string) => {
        clearTimers()
        openTimer.current = window.setTimeout(() => setOpenTop(id), OPEN_DELAY)
    }

    const closeAllWithDelay = () => {
        clearTimers()
        closeTimer.current = window.setTimeout(() => {
            setOpenTop(null)
            setOpenSub(null)
        }, CLOSE_DELAY)
    }

    React.useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setOpenTop(null)
                setOpenSub(null)
            }
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [])

    // Mobile drawer state
    const [mobileOpen, setMobileOpen] = React.useState(false)

    return (
        <header
            role="banner"
            className={[
                // "bg-red-500  md:bg-blue-500  lg:bg-green-500   xl:bg-purple-500",
                "fixed inset-x-0 top-0 z-50",
                "h-[50px] md:h-[80px] lg:h-[130px] xl:h-[89px] bg-white py-2",
                "transition-shadow duration-200",
                "border-b-0 lg:border-b lg:border-[#f2f4f7]",
                scrolled
                    ? "lg:shadow-[0_3px_6px_rgba(0,0,0,0.2)]"
                    : "shadow-none",
            ].join(" ")}
        >
            <nav
                className="container mx-auto flex items-center w-full h-full"
                role="navigation"
                onMouseLeave={closeAllWithDelay}
            >
                {/* Mobile single-line row (visible on md and below) */}
                <div className="show-up-to-lg w-full px-3 py-2">
                    {/* Left: Mobile hamburger */}
                    <div className="flex items-center">
                        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                            <SheetTrigger asChild>
                                <button aria-label="Open menu" className="inline-flex items-center justify-center p-1">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                        <path d="M3 12H21M3 6H21M3 18H21" stroke="#344054" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </SheetTrigger>
                            <SheetContent side="right" className="
                             w-full sm:w-[84vw] max-w-[350px] h-[calc(100vh-60px)] overflow-hidden bg-white transition-all duration-300 ease-in-out p-0 mt-14 sm:max-w-xs my-sheet-content
                            border-0 ">
                                <MobileMenu onNavigate={() => setMobileOpen(false)} t={t} />
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Center: Brand */}
                    <div className="flex-1 mx-3 flex items-center justify-end md:justify-center">
                        <Link href="/" className="font-semibold tracking-tight text-pretty" aria-label="Home">
                            <Image
                                alt="Igi"
                                src="/img/cropped-logo_IGI.webp"
                                width={140}
                                height={150}
                                className="max-w-[80px] lg:max-w-[100px] xl:max-w-[140px]"
                            />
                        </Link>
                    </div>

                    {/* Right: Verify Report */}
                    <div className="hidden md:flex items-center">
                        <Link
                            href="https://www.igi.org/verify-your-report/"
                            className="inline-block bg-[#465b5d] text-white px-3 py-2 border border-[#465b5d] rounded-none text-sm font-medium hover:opacity-95 transition"
                        >
                            {t("verifyReport")}
                        </Link>
                    </div>
                </div>
                <div className="hidden lg:flex w-full justify-between items-baseline-last xl:items-center">
                    <div className="xl:flex items-center">
                        <div className="mr-3 hidden lg:flex">
                            <Link href="/" className="font-semibold tracking-tight text-pretty ml" aria-label="Home">
                                <Image
                                    alt="Igi"
                                    src="/img/cropped-logo_IGI.webp"
                                    width={140}
                                    height={150}
                                    className="max-w-[80px] lg:max-w-[100px] xl:max-w-[140px]"
                                />
                            </Link>
                        </div>
                        <div className="">
                            {/* Center: desktop primary menu */}
                            <ul className="hidden lg:flex items-center gap-4" role="menubar">
                                {menuData.map((item) => (
                                    <TopLevelItem
                                        key={item.id}
                                        item={item}
                                        isOpen={openTop === item.id}
                                        onOpen={() => openWithDelay(item.id)}
                                        onClose={closeAllWithDelay}
                                        onKeepOpen={() => {
                                            if (closeTimer.current) {
                                                window.clearTimeout(closeTimer.current)
                                                closeTimer.current = null
                                            }
                                        }}
                                        openSub={openSub}
                                        setOpenSub={setOpenSub}
                                        isActive={pathname === item.href}
                                        t={t}
                                    />
                                ))}
                            </ul>
                        </div>
                    </div>
                    {/* Right: desktop icons */}
                    <div className="hidden lg:flex items-center gap-4">
                        <button aria-label={t("search")} className="text-muted-foreground hover:text-foreground transition-colors">
                            <Search className="size-4" />
                        </button>
                        {/* https://www.igi.org/my-account/ */}
                        <button aria-label={t("account")} className="text-muted-foreground hover:text-foreground transition-colors">
                            <UserRound className="size-4" />
                        </button>
                        <Link
                            href="https://www.igi.org/verify-your-report/"
                            className="inline-block bg-[#465b5d] text-white px-4 py-2 border border-[#465b5d] rounded-none text-sm font-medium hover:opacity-95 transition"
                        >
                            {t("verifyReport")}
                        </Link>
                    </div>
                </div>
            </nav>
        </header >
    )
}

function TopLevelItem({
    item,
    isOpen,
    onOpen,
    onClose,
    onKeepOpen,
    openSub,
    setOpenSub,
    isActive,
    t,

}: {
    item: MenuItem
    isOpen: boolean
    onOpen: () => void
    onClose: () => void
    onKeepOpen: () => void
    openSub: string | null
    setOpenSub: (id: string | null) => void
    isActive: boolean,
    t: (k: string) => string
}) {
    const hasChildren = !!item.children?.length

    if (!hasChildren) {
        const external = item.external
        return (
            <li role="none" className="relative">
                <Link
                    role="menuitem"
                    href={item.href || "#"}
                    target={item.target}
                    rel={external ? "noopener noreferrer" : undefined}
                    className={cn(
                        "flex items-center gap-1 py-2 text-[16px] leading-none ",
                    )}
                >

                    {/* {item.label} */}
                    {t(idToKey(item.id))}
                </Link>
            </li>
        )
    }

    return (
        <li role="none" className="relative group" onMouseEnter={onOpen} onFocus={onOpen} onMouseMove={onKeepOpen}>
            <button
                aria-haspopup="true"
                aria-expanded={isOpen}
                className={cn(
                    "inline-flex items-center gap-1 py-2 text-[16px]  transition-colors outline-none",
                    "text-foreground/90 hover:text-foreground focus-visible:text-foreground",
                )}
            >

                <span className="relative inline-flex items-center">
                    {/* {item.label} */}
                    <span className="flex items-center  leading-none">{t(idToKey(item.id))}</span>


                    {/* fixed-size icon slot so placement never shifts */}
                    <span className="w-4 h-10 flex-none mt-[2px] flex items-center justify-center">
                        <ChevronDown
                            size={14}
                            style={{
                                transform:
                                    isOpen
                                        ? "translate3d(6px,0,0) rotate(-90deg)"
                                        : "translate3d(0,0,0) rotate(0deg)",
                                transformBox: "fill-box",
                                transformOrigin: "50% 50%",
                                willChange: "transform",
                                backfaceVisibility: "hidden",
                                transition: "transform 320ms cubic-bezier(.2,.9,.3,1)",
                                verticalAlign: "middle",
                            }}
                        />
                    </span>
                </span>
            </button>

            {/* First-level dropdown */}
            <div
                role="menu"
                className={cn(
                    "absolute left-0 mt-[-10px] text-[16px] rounded-[4px] border border-black/15 bg-card  outline-none",
                    "origin-top p-0 transition-all duration-200",
                    "min-w-[11rem] w-max",
                    isOpen
                        ? "pointer-events-auto visible translate-y-0 opacity-100"
                        : "pointer-events-none invisible -translate-y-1 opacity-0",
                )}
                onMouseEnter={onKeepOpen}
                onMouseLeave={onClose}
            >
                <ul>
                    {item.children!.map((child) => (
                        <FirstLevelRow key={child.id} item={child} openSub={openSub} setOpenSub={setOpenSub} t={t} />
                    ))}
                </ul>
            </div>
        </li>
    )
}

function FirstLevelRow({
    item,
    openSub,
    setOpenSub,
    t,
}: {
    item: MenuItem
    openSub: string | null
    setOpenSub: (id: string | null) => void
    t: (k: string) => string
}) {
    const hasChildren = !!item.children?.length
    const showRight = openSub === item.id

    return (
        <li
            role="none"
            className="relative"
            onMouseEnter={() => hasChildren && setOpenSub(item.id)}
            onFocus={() => hasChildren && setOpenSub(item.id)}
            onMouseLeave={() => hasChildren && setOpenSub(null)}
        >
            <RowLink item={item} hasChildren={hasChildren} active={showRight} t={t} />

            {/* Second-level panel */}
            {hasChildren && (
                <div
                    role="menu"
                    className={cn(
                        "absolute top-0 text-[16px] left-[calc(100%-8px)] w-[360px] rounded-none border bg-card shadow-md",
                        "transition-all duration-200",
                        showRight
                            ? "pointer-events-auto visible translate-x-0 opacity-100"
                            : "pointer-events-none invisible -translate-x-1 opacity-0",
                    )}
                    onMouseEnter={() => setOpenSub(item.id)}
                >
                    <ul>
                        {item.children!.map((sub) => (
                            <li key={sub.id} role="none">
                                <LeafLink item={sub} t={t} />
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </li>
    )
}

function RowLink({
    item,
    hasChildren,
    active,
    t,
}: {
    item: MenuItem
    hasChildren: boolean
    active: boolean
    t: (k: string) => string
}) {
    const external = item.external
    const Comp: any = item.href ? Link : "button"

    // track direct pointer hover on the row so parent-hover doesn't count
    const [isDirectHover, setIsDirectHover] = React.useState(false)

    const handleClick = (e: React.MouseEvent) => {
        // If this row has its own href but also hasChildren, only allow navigation
        // when the pointer is directly over this row (not when parent hover opened it).
        // This prevents "parent hover" from causing an accidental route.
        if (item.href && hasChildren && !isDirectHover) {
            e.preventDefault()
            e.stopPropagation()
            // keep submenu open by focusing / setting hover state - nothing else needed
            return
        }
        // otherwise allow normal navigation
    }
    const key = idToKey(item.id)

    return (
        <Comp
            {...(item.href
                ? {
                    href: item.href!,
                    target: item.target,
                    rel: external ? "noopener noreferrer" : undefined,
                }
                : { type: "button" })}
            className={[
                active
                    ? "bg-[var(--nb-hover)] text-[var(--nb-foreground)]"
                    : "text-[var(--nb-foreground)]/85 hover:bg-[#E9ECEF]",
                "hover:bg-[#E9ECEF] group/left flex w-full items-center justify-between px-4 py-2  leading-6 text-left text-[16px]",
            ].join(" ")}
            role="menuitem"
            aria-current={active ? "true" : undefined}
            aria-haspopup={hasChildren || undefined}
            aria-expanded={hasChildren ? active : undefined}
            onMouseEnter={() => setIsDirectHover(true)}
            onMouseLeave={() => setIsDirectHover(false)}
            onFocus={() => setIsDirectHover(true)}
            onBlur={() => setIsDirectHover(false)}
            onClick={handleClick}
        >
            {/* <span className="text-foreground/90">{item.label}</span> */}
            <span className="text-foreground/90">{t(key)}</span>

            {hasChildren ? (
                <ChevronDown
                    className="ml-3 transform"
                    size={14}
                    // Control the chevron entirely via transform to avoid jitter.
                    // Use translate3d + rotate so the browser uses the GPU and the animation is smooth.
                    style={{
                        transform:
                            active || isDirectHover ? "translate3d(6px,0,0) rotate(-90deg)" : "translate3d(0,0,0) rotate(0deg)",
                        transformBox: "fill-box",
                        transformOrigin: "50% 50%",
                        willChange: "transform",
                        backfaceVisibility: "hidden",
                        transition: "transform 320ms cubic-bezier(.2,.9,.3,1)",
                    }}
                />
            ) : null}
        </Comp>
    )
}

function LeafLink({ item, t }: { item: MenuItem; t: (k: string) => string }) {
    const external = item.external
    return (
        <Link
            href={item.href || "#"}
            target={item.target}
            rel={external ? "noopener noreferrer" : undefined}
            className={cn("block px-4 py-2.5 text-[16px] text-foreground/90 hover:bg-muted transition-colors")}
            role="menuitem"
        >
            {t(idToKey(item.id))}
        </Link>
    )
}

function MobileMenu({ onNavigate, t }: { onNavigate: () => void; t: (k: string) => string }) {
    // Stack of levels; level 0 is the root menu (menuData)
    const [stack, setStack] = React.useState<{ title?: string; items: MenuItem[] }[]>([
        { title: undefined, items: menuData },
    ])

    const activeIndex = stack.length - 1

    const pushLevel = (title: string | undefined, items: MenuItem[]) => {
        setStack((prev) => [...prev, { title, items }])
    }

    const popLevel = () => {
        setStack((prev) => (prev.length > 1 ? prev.slice(0, prev.length - 1) : prev))
    }

    // reset to root when closed and reopened (handled by parent mounting behavior)

    return (
        <div className="h-full w-full">
            {/* Header area inside drawer with optional back button */}

            {/* Panels container */}
            <div className="relative h-[calc(100%-56px)] overflow-hidden">
                {activeIndex > 0 && <div className="flex items-center gap-2 px-4 py-3 mb-30">
                    {activeIndex > 0 ? (
                        <button
                            aria-label={t("goBack")}
                            onClick={popLevel}
                            className="inline-flex h-8 w-10 rounded-none items-center justify-center  border border-[#232a33] bg-white text-[#232a33] hover:bg-gray-50 hover:border-gray-400 transition-colors duration-200"
                        >
                            <ArrowLeft className="h-10 w-6" strokeWidth={1.5} />
                        </button>

                    ) : (
                        <div className="inline-flex h-8 w-8 items-center justify-center opacity-0 pointer-events-none">
                            <ArrowLeft className="size-4" />
                        </div>
                    )}
                    {/* <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{activeIndex > 0 ? stack[activeIndex].title : "Menu"}</p>
                    </div> */}
                    {/* <SheetClose style={{ display: 'none' }} asChild> */}
                    {/* <button className="inline-flex h-8 w-8 items-center justify-center rounded-md border"> */}
                    {/* <X className="size-4" /> */}
                    {/* </button> */}
                    {/* </SheetClose> */}
                </div>}
                <div
                    className={`absolute flex h-full w-full ${activeIndex > 0 ? 'mt-0' : 'mt-0'}`}
                    style={{
                        // slide the whole stack horizontally
                        transform: `translate3d(${-activeIndex * 100}%, 0, 0)`,
                        transition: "transform 320ms cubic-bezier(.2,.9,.3,1)",
                        willChange: "transform",
                        backfaceVisibility: "hidden",
                    }}
                >
                    {stack.map((level, index) => (
                        <div key={index} className="w-full shrink-0 grow-0 basis-full overflow-y-auto">
                            <ul className="px-4 py-3">
                                {level.items.map((item) => {
                                    const hasChildren = !!item.children?.length
                                    const external = item.external
                                    const handleClick = (e: React.MouseEvent) => {
                                        if (hasChildren) {
                                            e.preventDefault()
                                            pushLevel(item.label, item.children!)
                                            return
                                        }
                                        // leaf: close the drawer after navigate
                                        onNavigate()
                                    }
                                    const Comp: any = item.href ? Link : "button"
                                    return (
                                        <li key={item.id}>
                                            <Comp
                                                {...(item.href
                                                    ? {
                                                        href: item.href!,
                                                        target: item.target,
                                                        rel: external ? "noopener noreferrer" : undefined,
                                                    }
                                                    : { type: "button" })}
                                                onClick={handleClick}
                                                className={cn(
                                                    "flex w-full items-center  py-3 text-base text-foreground/90",
                                                    "border-b last:border-b-0",
                                                )}
                                                role="menuitem"
                                            >
                                                <span className="pr-1">{t(idToKey(item.id))}</span>
                                                {hasChildren ? <ChevronRight className="size-4 text-foreground/70" /> : null}
                                            </Comp>
                                        </li>
                                    )
                                })}
                            </ul>

                            {/* Root-only CTA at bottom to match screenshot (User Login) */}
                            {index === 0 ? (
                                <div className="px-4 pb-6">
                                    <Link
                                        href="https://www.igi.org/my-account/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex w-[109px] items-center justify-center whitespace-nowrap text-[16px] rounded-[2px] border border-[#232a33] px-4 py-1.5 transition-all duration-300 ease-in-out text-[#465b5d]"
                                        onClick={onNavigate}
                                    >
                                        {t("userLogin")}
                                    </Link>
                                </div>
                            ) : null}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Navbar
