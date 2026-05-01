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
        <div className="min-h-screen bg-background flex flex-col font-sans selection:bg-primary/20">
            {/* Navbar */}
            <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="max-w-6xl mx-auto px-6 md:px-8 w-full h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                            <Layout className="size-4 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-semibold tracking-tight">TaskHub</span>
                    </div>
                    <nav className="flex items-center gap-4">
                        <Link to="/sign-in">
                            <Button variant="ghost" className="text-sm font-medium">
                                Log in
                            </Button>
                        </Link>
                        <Link to="/sign-up">
                            <Button className="text-sm font-medium shadow-sm">
                                Sign up
                            </Button>
                        </Link>
                    </nav>
                </div>
            </header>

            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
                {/* Background Decor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none -z-10" />

                <div className="max-w-3xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 mt-20 md:mt-0">
                    <div className="inline-flex items-center rounded-full mt-5 border border-border/50 bg-background/50 px-3 py-1 text-sm font-medium backdrop-blur-sm">
                        <span className="flex size-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                        Now in public beta
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground leading-[1.1]">
                        Manage your projects with <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">elegance.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
                        TaskHub brings clarity to your workflow. Clean, minimal, and designed to help you focus on what actually matters.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link to="/sign-up">
                            <Button size="lg" className="h-12 px-8 text-base shadow-lg hover:shadow-xl transition-all">
                                Get Started <ArrowRight className="ml-2 size-4" />
                            </Button>
                        </Link>
                        <Link to="/dashboard">
                            <Button size="lg" variant="outline" className="h-12 px-8 text-base bg-background/50 backdrop-blur-sm">
                                View Demo
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto w-full mt-32 mb-20 text-left px-4">
                    <div className="col-span-1 md:col-span-3 text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Everything you need to succeed</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Powerful features to help your team organize, track, and manage all your work in one place.</p>
                    </div>

                    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all">
                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                            <Zap className="size-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">Built on modern architecture ensuring your tasks load instantly and updates happen in real-time without refreshing.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all">
                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                            <Layout className="size-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Clean Interface</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">Say goodbye to clutter. Our minimal design puts your content front and center where it belongs, reducing cognitive load.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all">
                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                            <Shield className="size-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Secure & Private</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">Your data is yours. We employ enterprise-grade security and encryption to ensure your projects remain strictly confidential.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all">
                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                            <Users className="size-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Team Collaboration</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">Work together seamlessly. Assign tasks, leave comments, and track progress together with your team members in real-time.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all">
                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                            <BarChart3 className="size-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">Gain deep insights into your team's productivity. Visualize bottlenecks, track milestones, and optimize your workflows effortlessly.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all">
                        <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                            <Link2 className="size-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Seamless Integrations</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">Connect with your favorite tools. TaskHub integrates perfectly with Slack, GitHub, Google Drive, and many more platforms.</p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-border/40 bg-card pt-16 pb-8">
                <div className="max-w-6xl mx-auto px-6 md:px-8 w-full">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12 mb-12">
                        {/* Brand & Contact */}
                        <div className="col-span-1 md:col-span-2 space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="size-8 rounded-lg bg-primary flex items-center justify-center">
                                    <Layout className="size-4 text-primary-foreground" />
                                </div>
                                <span className="text-xl font-semibold tracking-tight">TaskHub</span>
                            </div>
                            <p className="text-sm text-muted-foreground mb-4">
                                Elegantly simple project management for modern teams.
                            </p>
                            <div className="space-y-2 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                    <MapPin className="size-4" />
                                    <span>Manduwalla, Dehradun, Uttarakhand (248007)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone className="size-4" />
                                    <span>+91 9389787775</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Mail className="size-4" />
                                    <span>banquet01@gmail.com</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link to="#" className="hover:text-primary transition-colors">Features</Link></li>
                                <li><Link to="#" className="hover:text-primary transition-colors">Pricing</Link></li>
                                <li><Link to="#" className="hover:text-primary transition-colors">Integrations</Link></li>
                                <li><Link to="#" className="hover:text-primary transition-colors">Changelog</Link></li>
                                <li><Link to="#" className="hover:text-primary transition-colors">Roadmap</Link></li>
                            </ul>
                        </div>

                        {/* Resources */}
                        <div>
                            <h4 className="font-semibold mb-4">Resources</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link to="#" className="hover:text-primary transition-colors">Help Center</Link></li>
                                <li><Link to="#" className="hover:text-primary transition-colors">Blog</Link></li>
                                <li><Link to="#" className="hover:text-primary transition-colors">Community</Link></li>
                                <li><Link to="#" className="hover:text-primary transition-colors">Developers & API</Link></li>
                                <li><Link to="#" className="hover:text-primary transition-colors">Site Map</Link></li>
                            </ul>
                        </div>

                        {/* Legal */}
                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li><Link to="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                                <li><Link to="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                                <li><Link to="#" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
                                <li><Link to="#" className="hover:text-primary transition-colors">Security</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-muted-foreground">
                            © {new Date().getFullYear()} TaskHub Inc. All rights reserved.
                        </p>
                        <div className="flex items-center gap-4 text-muted-foreground">
                            <Link to="#" className="hover:text-primary transition-colors" aria-label="Twitter">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5 2.8 9 2.8 9s1.5.8 3 .5c-2.3-2-2-5.5-2-5.5s1.5 1 3 1c-2.5-1.5-2-5-2-5s3 4 8 4c-.3-4 5-5.5 7-2 1.5-.5 2.5-1 2.5-1z" /></svg>
                            </Link>
                            <Link to="#" className="hover:text-primary transition-colors" aria-label="Facebook">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                            </Link>
                            <Link to="#" className="hover:text-primary transition-colors" aria-label="Instagram">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>
                            </Link>
                            <Link to="#" className="hover:text-primary transition-colors" aria-label="LinkedIn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Homepage;