"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Eye, 
  Lock, 
  DollarSign,
  BadgePercent
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export default function NewProjectPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isForSale, setIsForSale] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    visibility: 'public',
    price: '',
    sellerAccount: ''
  });

  const sellerPrice = parseFloat(formData.price) || 0;
  const commission = sellerPrice * 0.1;
  const buyerPrice = sellerPrice + commission;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore) return;
    setLoading(true);

    try {
      const projectId = doc(collection(firestore, 'projects_public')).id;
      const projectRef = doc(firestore, 'projects_public', projectId);

      const projectData = {
        id: projectId,
        title: formData.title,
        description: formData.description,
        ownerId: user.uid,
        visibility: formData.visibility,
        status: 'published',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        price: isForSale ? sellerPrice : 0,
        sellerAccount: isForSale ? formData.sellerAccount : '',
        isForSale: isForSale,
        likesCount: 0,
        viewsCount: 0,
      };

      setDocumentNonBlocking(projectRef, projectData, { merge: true });

      toast({
        title: "Project Published",
        description: isForSale ? `Your project is listed for sale at RS ${buyerPrice.toFixed(2)}.` : "Your project is now live.",
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create project."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <Button variant="ghost" className="gap-2 -ml-2 text-muted-foreground" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">New Project</h1>
        <p className="text-muted-foreground">Detail your work and set marketplace options.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Modern Architecture Portfolio" 
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Tell us about your project..." 
                  className="min-h-[150px]"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className={isForSale ? "border-primary/50 shadow-lg" : "opacity-70 transition-opacity"}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Marketplace Listing
                </CardTitle>
                <CardDescription>Sell access to this project to other users.</CardDescription>
              </div>
              <Switch checked={isForSale} onCheckedChange={setIsForSale} />
            </CardHeader>
            {isForSale && (
              <CardContent className="space-y-6 animate-in slide-in-from-top-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Your Price (RS)</Label>
                    <Input 
                      type="number" 
                      placeholder="1000"
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      required={isForSale}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Account (EasyPaisa/Bank)</Label>
                    <Input 
                      placeholder="Enter account details for buyers..."
                      value={formData.sellerAccount}
                      onChange={e => setFormData({...formData, sellerAccount: e.target.value})}
                      required={isForSale}
                    />
                  </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Your Listing Price:</span>
                    <span className="font-semibold">RS {sellerPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      Platform Commission (10%): <BadgePercent className="w-3 h-3" />
                    </span>
                    <span className="text-destructive font-semibold">+ RS {commission.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-primary/20 pt-2 flex justify-between font-bold text-primary">
                    <span>Buyer Will See:</span>
                    <span>RS {buyerPrice.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visibility</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                defaultValue="public" 
                className="grid gap-3"
                onValueChange={v => setFormData({...formData, visibility: v})}
              >
                {[
                  { id: 'public', label: 'Public', icon: Eye, desc: 'Marketplace discovery' },
                  { id: 'private', label: 'Private', icon: Lock, desc: 'Hidden from feed' }
                ].map((item) => (
                  <div key={item.id}>
                    <RadioGroupItem value={item.id} id={item.id} className="peer sr-only" />
                    <Label
                      htmlFor={item.id}
                      className="flex items-center gap-3 rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent peer-data-[state=checked]:border-primary cursor-pointer transition-colors"
                    >
                      <item.icon className="w-4 h-4 text-muted-foreground" />
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="text-[10px] text-muted-foreground leading-none">{item.desc}</p>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full h-12 shadow-lg shadow-primary/20" disabled={loading}>
            {loading ? 'Creating...' : 'Publish to Portfolio'}
          </Button>
        </div>
      </form>
    </div>
  );
}
