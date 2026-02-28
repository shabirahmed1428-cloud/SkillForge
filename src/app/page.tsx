
import Link from 'next/link';
import { 
  ArrowRight, 
  ShieldCheck, 
  Rocket, 
  Users, 
  HardDrive, 
  Globe,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Navigation */}
      <header className="px-4 lg:px-12 h-20 flex items-center justify-between border-b border-border bg-white sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl">SF</div>
          <span className="font-headline text-2xl font-bold tracking-tight text-foreground">SkillForge</span>
        </Link>
        <nav className="hidden md:flex gap-8">
          <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
          <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
          <Link href="#portfolio" className="text-sm font-medium hover:text-primary transition-colors">Portfolio</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors hidden sm:block">Log in</Link>
          <Button asChild className="shadow-md shadow-primary/20">
            <Link href="/register" className="gap-2">
              Get Started <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 px-4 lg:px-12 overflow-hidden bg-background">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full opacity-30 pointer-events-none">
            <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/20 blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-accent/20 blur-[120px]" />
          </div>
          
          <div className="max-w-4xl mx-auto relative z-10 text-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mx-auto">
                <Sparkles className="w-3 h-3" />
                Empowering the next generation of engineers
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                Scale Your Ideas with <span className="text-primary">Confidence.</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                SkillForge is the ultimate SaaS platform for students and mentors to collaborate, 
                share large project files, and build professional portfolios.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                <Button size="lg" asChild className="h-14 px-10 text-lg shadow-xl shadow-primary/30">
                  <Link href="/register">Start Building Now</Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg bg-white">
                  View Public Projects
                </Button>
              </div>
              <div className="flex items-center gap-6 justify-center pt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-primary" /> Enterprise Security</span>
                <span className="flex items-center gap-2"><HardDrive className="w-4 h-4 text-primary" /> 500MB+ File Support</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-4 lg:px-12 bg-white">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold tracking-tight">Everything you need to launch.</h2>
              <p className="text-lg text-muted-foreground">A unified platform for project hosting, collaboration, and career growth.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard 
                icon={HardDrive} 
                title="Massive File Support" 
                description="Upload project assets, documentation, and high-res media up to 500MB per file with encrypted storage."
              />
              <FeatureCard 
                icon={ShieldCheck} 
                title="Role-Based Security" 
                description="Precise access controls for students, mentors, and admins. Your intellectual property stays yours."
              />
              <FeatureCard 
                icon={Globe} 
                title="Public Portfolios" 
                description="Instantly turn your projects into a professional showcase ready for recruiters and teammates."
              />
              <FeatureCard 
                icon={Sparkles} 
                title="AI Idea Assistant" 
                description="Structure your project descriptions with AI. Turn rough outlines into professional case studies."
              />
              <FeatureCard 
                icon={Users} 
                title="Team Hubs" 
                description="Create shared team spaces to collaborate on complex projects and manage shared assets."
              />
              <FeatureCard 
                icon={Rocket} 
                title="Mentor Reviews" 
                description="Submit your work to industry mentors for structured feedback and project validation."
              />
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 px-4 lg:px-12 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
            <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">Ready to forge your path?</h2>
            <p className="text-xl opacity-90">Join thousands of students building the future on SkillForge.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-14 px-12 text-lg bg-white text-primary hover:bg-white/90 shadow-2xl">
                Get Started for Free
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-12 text-lg border-white text-white hover:bg-white/10">
                Contact Sales
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-4 lg:px-12 border-t border-border bg-white text-sm text-muted-foreground">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          <div className="col-span-2 lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-white font-bold text-xs">SF</div>
              <span className="font-bold text-foreground">SkillForge</span>
            </div>
            <p className="max-w-xs">Building the bridge between academic projects and professional success.</p>
          </div>
          <div className="space-y-4">
            <p className="font-bold text-foreground">Platform</p>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Portfolio</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <p className="font-bold text-foreground">Company</p>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-primary transition-colors">About</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <p className="font-bold text-foreground">Legal</p>
            <ul className="space-y-2">
              <li><Link href="#" className="hover:text-primary transition-colors">Privacy</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Terms</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">Security</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border flex justify-between items-center">
          <p>© 2024 SkillForge Inc. All rights reserved.</p>
          <div className="flex gap-4">
            {/* Social Icons Placeholder */}
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl border border-border bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
