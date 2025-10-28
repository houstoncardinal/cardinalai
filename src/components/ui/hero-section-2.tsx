import React from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AnimatedGroup } from '@/components/ui/animated-group'
import { cn } from '@/lib/utils'
import { useScroll } from 'motion/react'
import cardinalDemo from '@/assets/cardinalai-demo.png'

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export function HeroSection() {
    return (
        <>
            <HeroHeader />
            <main className="overflow-hidden">
                <section>
                    <div className="relative pt-24">
                        <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,hsl(var(--background))_75%)]"></div>
                        <div className="mx-auto max-w-5xl px-6">
                            <div className="sm:mx-auto lg:mr-auto">
                                <AnimatedGroup
                                    variants={{
                                        container: {
                                            visible: {
                                                transition: {
                                                    staggerChildren: 0.05,
                                                    delayChildren: 0.75,
                                                },
                                            },
                                        },
                                        ...transitionVariants,
                                    }}
                                >
                                    <h1
                                        className="mt-8 max-w-2xl text-balance text-5xl font-medium md:text-6xl lg:mt-16">
                                        Where Code Meets <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">Consciousness</span>
                                    </h1>
                                    <p
                                        className="mt-8 max-w-2xl text-pretty text-lg text-muted-foreground">
                                        A development environment so aware, it feels alive. Cardinal.AI combines four AI agents working in perfect harmony to transform your coding experience into an intelligent, intuitive workflow.
                                    </p>
                                    <div className="mt-12 flex items-center gap-2">
                                        <div
                                            key={1}
                                            className="bg-foreground/10 rounded-[14px] border p-0.5">
                                            <Button
                                                asChild
                                                size="lg"
                                                className="rounded-xl px-5 text-base bg-gradient-to-r from-primary to-accent hover:opacity-90">
                                                <Link to="/ide">
                                                    <span className="text-nowrap">Launch PathwayAI</span>
                                                </Link>
                                            </Button>
                                        </div>
                                        <Button
                                            key={2}
                                            asChild
                                            size="lg"
                                            variant="ghost"
                                            className="h-[42px] rounded-xl px-5 text-base">
                                            <Link to="/community">
                                                <span className="text-nowrap">Explore Community</span>
                                            </Link>
                                        </Button>
                                    </div>
                                </AnimatedGroup>
                            </div>
                        </div>
                        <AnimatedGroup
                            variants={{
                                container: {
                                    visible: {
                                        transition: {
                                            staggerChildren: 0.05,
                                            delayChildren: 0.75,
                                        },
                                    },
                                },
                                ...transitionVariants,
                            }}>
                            <div className="relative -mr-56 mt-8 overflow-hidden px-2 sm:mr-0 sm:mt-12 md:mt-20">
                                <div
                                    aria-hidden
                                    className="bg-gradient-to-b to-background absolute inset-0 z-10 from-transparent from-35%"
                                />
                                <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl border bg-background p-4 shadow-lg shadow-primary/20 ring-1 ring-background">
                                    <img
                                        className="aspect-video relative rounded-2xl w-full object-cover"
                                        src={cardinalDemo}
                                        alt="Cardinal.AI IDE Interface showing AI assistant, code editor, and terminal"
                                        width="2700"
                                        height="1440"
                                    />
                                </div>
                            </div>
                        </AnimatedGroup>
                    </div>
                </section>
                <section className="bg-background pb-16 pt-16 md:pb-32">
                    <div className="m-auto max-w-5xl px-6">
                        <div className="text-center mb-12">
                            <p className="text-sm text-muted-foreground uppercase tracking-wider">Powered by cutting-edge AI</p>
                        </div>
                        <div className="mx-auto grid max-w-3xl grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 items-center opacity-60">
                            <div className="flex flex-col items-center gap-2">
                                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">GPT-5</div>
                                <div className="text-xs text-muted-foreground">OpenAI</div>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Gemini 2.5</div>
                                <div className="text-xs text-muted-foreground">Google</div>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Claude</div>
                                <div className="text-xs text-muted-foreground">Anthropic</div>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Local LLMs</div>
                                <div className="text-xs text-muted-foreground">Self-hosted</div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    )
}

const menuItems = [
    { name: 'Features', href: '#features' },
    { name: 'AI Agents', href: '#agents' },
    { name: 'Community', href: '/community' },
    { name: 'IDE', href: '/ide' },
]

export const HeroHeader = () => {
    const [menuState, setMenuState] = React.useState(false)
    const [scrolled, setScrolled] = React.useState(false)

    const { scrollYProgress } = useScroll()

    React.useEffect(() => {
        const unsubscribe = scrollYProgress.on('change', (latest) => {
            setScrolled(latest > 0.05)
        })
        return () => unsubscribe()
    }, [scrollYProgress])

    return (
        <header>
            <nav
                data-state={menuState && 'active'}
                className={cn('group fixed z-20 w-full border-b transition-colors duration-150', scrolled && 'bg-background/50 backdrop-blur-3xl')}>
                <div className="mx-auto max-w-5xl px-6 transition-all duration-300">
                    <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                        <div className="flex w-full items-center justify-between gap-12 lg:w-auto">
                            <Link
                                to="/"
                                aria-label="home"
                                className="flex items-center space-x-2">
                                <Logo />
                            </Link>

                            <button
                                onClick={() => setMenuState(!menuState)}
                                aria-label={menuState == true ? 'Close Menu' : 'Open Menu'}
                                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden">
                                <Menu className="group-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>

                            <div className="hidden lg:block">
                                <ul className="flex gap-8 text-sm">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            {item.href.startsWith('#') ? (
                                                <a
                                                    href={item.href}
                                                    className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                    <span>{item.name}</span>
                                                </a>
                                            ) : (
                                                <Link
                                                    to={item.href}
                                                    className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                    <span>{item.name}</span>
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
                            <div className="lg:hidden">
                                <ul className="space-y-6 text-base">
                                    {menuItems.map((item, index) => (
                                        <li key={index}>
                                            {item.href.startsWith('#') ? (
                                                <a
                                                    href={item.href}
                                                    className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                    <span>{item.name}</span>
                                                </a>
                                            ) : (
                                                <Link
                                                    to={item.href}
                                                    className="text-muted-foreground hover:text-accent-foreground block duration-150">
                                                    <span>{item.name}</span>
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                                <Button
                                    asChild
                                    variant="outline"
                                    size="sm">
                                    <Link to="/auth">
                                        <span>Login</span>
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="sm">
                                    <Link to="/ide">
                                        <span>Get Started</span>
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    )
}

const Logo = ({ className }: { className?: string }) => {
    return (
        <div className={cn('flex items-center gap-2', className)}>
            <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-glow to-accent blur-sm opacity-50" />
                <div className="relative bg-gradient-to-br from-primary to-accent p-2 rounded-lg">
                    <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-white">
                        <path
                            d="M12 2L2 7L12 12L22 7L12 2Z"
                            fill="currentColor"
                            fillOpacity="0.9"
                        />
                        <path
                            d="M2 17L12 22L22 17"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M2 12L12 17L22 12"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                Cardinal.AI
            </span>
        </div>
    )
}
