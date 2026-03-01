
"use client";

import { useState } from 'react';
import { 
  CreditCard, 
  Check, 
  ArrowLeft, 
  HardDrive, 
  Smartphone,
  Copy,
  CheckCircle2,
  Clock,
  Loader2,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function BillingPage() {
  const router = useRouter();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [showEasyPaisa, setShowEasyPaisa] = useState(false);

  const userDocRef = useMemoFirebase(() => {
    if (!user?.uid || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user?.uid, firestore]);

  const { data: userProfile, isLoading: profileLoading } = useDoc(userDocRef);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "EasyPaisa account number copied to clipboard."
    });
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore || !transactionId.trim()) return;

    setLoading(true);
    try {
      const userRef = doc(firestore, 'users', user.uid);
      updateDocumentNonBlocking(userRef, {
        subscriptionStatus: 'pending_approval',
        lastPaymentTransactionId: transactionId,
        updatedAt: serverTimestamp()
      });

      toast({
        title: "Payment Submitted",
        description: "Your upgrade is waiting for approval."
      });
      setTransactionId('');
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: e.message
      });
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const isPending = userProfile?.subscriptionStatus === 'pending_approval';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <Button variant="ghost" className="gap-2 -ml-2 text-muted-foreground" onClick={() => router.back()}>
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Storage & Billing</h1>
          <p className="text-muted-foreground mt-1">Manage your subscription and upgrade your storage limits.</p>
        </div>
        <Badge variant="outline" className="h-8 px-4 border-primary/20 bg-primary/5 text-primary">
          Current Limit: {userProfile?.storageLimitMB || 500}MB
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Current Plan Card */}
        <Card className="border-none shadow-md overflow-hidden">
          <CardHeader className="bg-muted/30 border-b">
            <CardTitle className="text-lg">Subscription Overview</CardTitle>
            <CardDescription>Your current plan and status.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Plan</p>
                <p className="text-xl font-bold capitalize">{userProfile?.subscriptionPlanId || 'Free'}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <HardDrive className="w-6 h-6" />
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Status</p>
              <div className="flex items-center gap-2">
                {isPending ? (
                  <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-100 py-1 flex gap-2">
                    <Clock className="w-4 h-4" /> Waiting for Approval
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 py-1 flex gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Active
                  </Badge>
                )}
              </div>
            </div>

            {isPending && (
              <div className="bg-muted p-4 rounded-lg space-y-2 border border-border">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <FileText className="w-4 h-4 text-primary" />
                  Submission Receipt
                </div>
                <p className="text-xs text-muted-foreground">
                  Transaction ID: <span className="font-mono">{userProfile?.lastPaymentTransactionId}</span>
                </p>
                <p className="text-[10px] text-muted-foreground italic">
                  Approval typically takes 12-24 hours.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upgrade Card */}
        {!isPending && (
          <Card className="border-primary/20 shadow-xl shadow-primary/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <Badge className="bg-primary text-white">Recommended</Badge>
            </div>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Pro Portfolio</CardTitle>
              <CardDescription>Expand your reach with massive storage.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">$10</span>
                <span className="text-muted-foreground">/ one-time</span>
              </div>
              
              <ul className="space-y-3">
                {[
                  "2GB Storage Limit",
                  "Priority Review Access",
                  "Team Hub Unlimited Projects",
                  "Direct Support Channel"
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center text-green-600">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              {!showEasyPaisa ? (
                <Button className="w-full h-12 text-lg shadow-lg shadow-primary/20" onClick={() => setShowEasyPaisa(true)}>
                  Upgrade Now
                </Button>
              ) : (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold">EasyPaisa Payment</p>
                        <p className="text-[10px] text-muted-foreground">Mobile Wallet Payment</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground uppercase">Account Number</Label>
                      <div className="flex gap-2">
                        <Input 
                          readOnly 
                          value="03454300434" 
                          className="bg-white font-mono text-center text-lg h-12"
                        />
                        <Button variant="outline" size="icon" className="h-12 w-12" onClick={() => copyToClipboard('03454300434')}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <form onSubmit={handlePaymentSubmit} className="space-y-3">
                      <Label className="text-xs text-muted-foreground uppercase">Transaction ID / Reference</Label>
                      <Input 
                        placeholder="Enter the ID from your receipt..."
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        required
                        disabled={loading}
                        className="bg-white"
                      />
                      <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Submit Proof & Request Approval"}
                      </Button>
                    </form>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowEasyPaisa(false)}>
                    Back to plans
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {isPending && (
          <Card className="border-none bg-primary/5 flex flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary animate-pulse">
              <Clock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <CardTitle>Upgrade in Progress</CardTitle>
              <CardDescription>
                We have received your payment proof for transaction <span className="font-mono font-bold text-foreground">{userProfile?.lastPaymentTransactionId}</span>.
              </CardDescription>
            </div>
            <div className="bg-white border p-4 rounded-lg w-full text-left space-y-2">
              <p className="text-xs font-bold text-primary flex items-center gap-2">
                <CheckCircle2 className="w-3 h-3" /> Payment Recorded
              </p>
              <p className="text-[11px] text-muted-foreground">
                Your account will be automatically updated to <strong>2GB storage</strong> once our team verifies the transfer.
              </p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard')}>
              Return to Dashboard
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
