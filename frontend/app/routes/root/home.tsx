import React from 'react';
import type { Route } from '../../+types/root';
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { ArrowRight, Layout, Zap, Shield, Users, BarChart3, Link2, Mail, Phone, MapPin } from "lucide-react";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "TaskHub | Minimal Project Management" },
        { name: "description", content: "Manage your projects with elegance." },
    ];
}

const Homepage = () => {
    return (
        <div className="min-h-screen bg-canvas text-body flex flex-col font-sans selection:bg-white/10">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-hairline bg-canvas/80 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-6 w-full h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="size-7 rounded-full bg-canvas-soft border border-hairline flex items-center justify-center">
                            <Layout className="size-3.5 text-ink" />
                        </div>
                        <span className="text-base font-normal tracking-tight text-ink">TaskHub</span>
                    </div>
                    <nav className="flex items-center gap-3">
                        <Link to="/sign-in">
                            <Button variant="ghost" className="rounded-full text-xs font-mono text-mute hover:text-ink hover:bg-canvas-soft h-8 px-4">
                                Log in
                            </Button>
                        </Link>
                        <Link to="/sign-up">
                            <Button className="rounded-full text-xs font-mono bg-white text-black hover:bg-[#dadbdf] h-8 px-4">
                                Sign up
                            </Button>
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
                <div className="max-w-3xl space-y-6 mt-16 md:mt-24 mb-16">
                    <div className="inline-flex items-center rounded-full border border-hairline bg-canvas-soft px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-mute">
                        <span className="flex size-1.5 rounded-full bg-accent-sunset mr-2"></span>
                        Now in public beta
                    </div>

                    <h1 className="text-4xl sm:text-6xl md:text-7xl font-normal tracking-tighter text-ink leading-[1.08]">
                        Manage your projects with <br className="hidden md:block" />
                        <span className="text-mute">clarity.</span>
                    </h1>

                    <p className="text-base sm:text-lg text-mute font-light max-w-xl mx-auto leading-relaxed">
                        TaskHub brings focus to modern teams. Minimal, responsive, and engineered for pure workflow velocity.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                        <Link to="/sign-up">
                            <Button size="lg" className="rounded-full h-10 px-6 text-xs font-mono uppercase tracking-wider bg-white text-black hover:bg-[#dadbdf]">
                                Get Started <ArrowRight className="ml-2 size-3.5" />
                            </Button>
                        </Link>
                        <Link to="/dashboard">
                            <Button size="lg" variant="outline" className="rounded-full h-10 px-6 text-xs font-mono uppercase tracking-wider border-hairline hover:border-canvas-mid bg-canvas hover:bg-canvas-soft text-body hover:text-ink">
                                View Demo
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto w-full mt-16 mb-24 text-left px-4">
                    <div className="col-span-1 md:col-span-3 text-center mb-6">
                        <p className="caption-mono text-mute mb-1">Architecture</p>
                        <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-ink">Engineered for focus</h2>
                    </div>

                    <div className="p-5 rounded-[8px] bg-canvas-card border border-hairline hover:border-canvas-mid transition-colors">
                        <div className="size-8 rounded-full bg-canvas-soft border border-hairline flex items-center justify-center mb-3 text-accent-breeze">
                            <Zap className="size-4" />
                        </div>
                        <h3 className="text-sm font-normal text-ink mb-1.5">Instant Execution</h3>
                        <p className="text-xs text-mute font-light leading-relaxed">Built on high-performance infrastructure ensuring state updates and task loads happen instantaneously.</p>
                    </div>

                    <div className="p-5 rounded-[8px] bg-canvas-card border border-hairline hover:border-canvas-mid transition-colors">
                        <div className="size-8 rounded-full bg-canvas-soft border border-hairline flex items-center justify-center mb-3 text-ink">
                            <Layout className="size-4" />
                        </div>
                        <h3 className="text-sm font-normal text-ink mb-1.5">Dark Canvas UI</h3>
                        <p className="text-xs text-mute font-light leading-relaxed">No clutter, no visual noise. A unified dark palette designed to reduce cognitive load and preserve flow state.</p>
                    </div>

                    <div className="p-5 rounded-[8px] bg-canvas-card border border-hairline hover:border-canvas-mid transition-colors">
                        <div className="size-8 rounded-full bg-canvas-soft border border-hairline flex items-center justify-center mb-3 text-accent-sunset">
                            <Shield className="size-4" />
                        </div>
                        <h3 className="text-sm font-normal text-ink mb-1.5">Secure by Default</h3>
                        <p className="text-xs text-mute font-light leading-relaxed">Robust session handling, rate limits, and layered validation guarantee your workspace data stays protected.</p>
                    </div>

                    <div className="p-5 rounded-[8px] bg-canvas-card border border-hairline hover:border-canvas-mid transition-colors">
                        <div className="size-8 rounded-full bg-canvas-soft border border-hairline flex items-center justify-center mb-3 text-accent-twilight">
                            <Users className="size-4" />
                        </div>
                        <h3 className="text-sm font-normal text-ink mb-1.5">Team Collaboration</h3>
                        <p className="text-xs text-mute font-light leading-relaxed">Seamless roles, member invitations, watchers, and live activity streams that keep everyone aligned.</p>
                    </div>

                    <div className="p-5 rounded-[8px] bg-canvas-card border border-hairline hover:border-canvas-mid transition-colors">
                        <div className="size-8 rounded-full bg-canvas-soft border border-hairline flex items-center justify-center mb-3 text-accent-breeze">
                            <BarChart3 className="size-4" />
                        </div>
                        <h3 className="text-sm font-normal text-ink mb-1.5">Status Analytics</h3>
                        <p className="text-xs text-mute font-light leading-relaxed">Precision charts tracking task completion velocity, priority distribution, and milestone delivery.</p>
                    </div>

                    <div className="p-5 rounded-[8px] bg-canvas-card border border-hairline hover:border-canvas-mid transition-colors">
                        <div className="size-8 rounded-full bg-canvas-soft border border-hairline flex items-center justify-center mb-3 text-ink">
                            <Link2 className="size-4" />
                        </div>
                        <h3 className="text-sm font-normal text-ink mb-1.5">Single Source of Truth</h3>
                        <p className="text-xs text-mute font-light leading-relaxed">Organize projects, subtasks, discussions, and attachments without context-switching between tools.</p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-hairline bg-canvas pt-12 pb-8">
                <div className="max-w-6xl mx-auto px-6 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
                        {/* Brand */}
                        <div className="col-span-1 md:col-span-2 space-y-3">
                            <div className="flex items-center gap-2.5">
                                <div className="size-7 rounded-full bg-canvas-soft border border-hairline flex items-center justify-center">
                                    <Layout className="size-3.5 text-ink" />
                                </div>
                                <span className="text-base font-normal tracking-tight text-ink">TaskHub</span>
                            </div>
                            <p className="text-xs text-mute font-light max-w-sm">
                                Minimal project management engineered for modern product teams.
                            </p>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="caption-mono text-ink mb-3">Product</h4>
                            <ul className="space-y-2 caption-mono text-mute text-xs">
                                <li><Link to="/sign-in" className="hover:text-ink transition-colors">Features</Link></li>
                                <li><Link to="/sign-in" className="hover:text-ink transition-colors">Pricing</Link></li>
                                <li><Link to="/sign-in" className="hover:text-ink transition-colors">Changelog</Link></li>
                            </ul>
                        </div>

                        {/* Resources */}
                        <div>
                            <h4 className="caption-mono text-ink mb-3">Resources</h4>
                            <ul className="space-y-2 caption-mono text-mute text-xs">
                                <li><Link to="/sign-in" className="hover:text-ink transition-colors">Documentation</Link></li>
                                <li><Link to="/sign-in" className="hover:text-ink transition-colors">API Reference</Link></li>
                                <li><Link to="/sign-in" className="hover:text-ink transition-colors">Support</Link></li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="caption-mono text-ink mb-3">Legal</h4>
                            <ul className="space-y-2 caption-mono text-mute text-xs">
                                <li><Link to="#" className="hover:text-ink transition-colors">Privacy</Link></li>
                                <li><Link to="#" className="hover:text-ink transition-colors">Terms</Link></li>
                                <li><Link to="#" className="hover:text-ink transition-colors">Security</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-hairline flex flex-col md:flex-row items-center justify-between gap-3">
                        <p className="caption-mono text-mute text-xs">
                            © {new Date().getFullYear()} TaskHub Inc. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Homepage;