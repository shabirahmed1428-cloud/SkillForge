
import Link from 'next/link';
import { 
  ArrowRight, 
  ShieldCheck, 
  Rocket, 
  Users, 
  HardDrive, 
  Globe,
  Sparkles,
  Key
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
          <Link href="#how-it-works" className="text-sm font-medium hover:text-primary transition-colors">How it Works</Link>
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
                The Ultimate Portfolio Hub
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
                Upload. Share. <br /><span className="text-primary">Build Your Portfolio.</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Upload large files (up to 500MB), showcase your best projects, and share them securely with mentors using unique access keys.
              </p>
              <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
                <Button size="lg" asChild className="h-14 px-10 text-lg shadow-xl shadow-primary/30">
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" className="h-14 px-10 text-lg bg-white" asChild>
                  <a href="#access-key-section">Enter Access Key</a>
                </Button>
              </div>
              <div className="flex items-center gap-6 justify-center pt-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2"><HardDrive className="w-4 h-4 text-primary" /> 500MB+ File Support</span>
                <span className="flex items-center gap-2"><Key className="w-4 h-4 text-primary" /> Secure Key Sharing</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 px-4 lg:px-12 bg-white">
          <div className="max-w-7xl mx-auto space-y-16">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <h2 className="text-4xl font-bold tracking-tight">Everything you need to showcase your talent.</h2>
              <p className="text-lg text-muted-foreground">SkillForge bridges the gap between raw files and professional presentations.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard 
                icon={HardDrive} 
                title="500MB Uploads" 
                description="Upload massive project assets, documentation, and videos with ease."
              />
              <FeatureCard 
                icon={Globe} 
                title="Build Portfolios" 
                description="Turn your uploads into structured portfolio projects that recruiters love."
              />
              <FeatureCard 
                icon={Users} 
                title="Choose Your Role" 
                description="Join as a Student to build, or a Mentor to review and provide guidance."
              />
              <FeatureCard 
                icon={ShieldCheck} 
                title="Secure Access Keys" 
                description="Generate 20-character secure keys to share private projects safely."
              />
            </div>
          </div>
        </section>

        {/* Access Key Section */}
        <section id="access-key-section" className="py-24 px-4 lg:px-12 bg-slate-50 border-y border-border">
          <div className="max-w-xl mx-auto text-center space-y-6">
            <Key className="w-12 h-12 text-primary mx-auto" />
            <h2 className="text-3xl font-bold">Have a Share Key?</h2>
            <p className="text-muted-foreground">Enter the 20-character secure key provided to you to view a private project.</p>
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter 20-character key..." 
                className="flex-1 h-12 px-4 rounded-md border border-input bg-background focus:ring-2 focus:ring-primary outline-none"
              />
              <Button size="lg" className="h-12 px-8">Access Project</Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-4 lg:px-12 border-t border-border bg-white text-sm text-muted-foreground">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-white font-bold text-xs">SF</div>
            <span className="font-bold text-foreground">SkillForge</span>
            <p className="ml-4">© 2024 SkillForge Inc. All rights reserved.</p>
          </div>
          <div className="flex gap-8">
            <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/login" className="hover:text-primary transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="p-6 rounded-2xl border border-border bg-white hover:shadow-lg transition-all">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="font-bold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
