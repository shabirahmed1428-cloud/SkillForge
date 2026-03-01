
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  FileText, 
  Download, 
  Calendar, 
  ArrowLeft,
  User,
  AlertTriangle,
  Loader2,
  DollarSign,
  ShoppingCart,
  Send,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useUser, setDocumentNonBlocking } from '@/firebase';
import { doc, getDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function SharedProjectPage() {
  const { key } = useParams();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = userUser();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [paymentId, setPaymentId] = useState('');
  const [showBuyForm, setShowBuyForm] = useState(false);

  useEffect(() => {
    async function validateAndFetchProject() {
      if (!key || typeof key !== 'string' || !firestore) return;
      try {
        setLoading(true);
        // Try direct project ID first
        const publicProjectDoc = await getDoc(doc(firestore, 'projects_public', key));
        if (publicProjectDoc.exists()) {
          setProject(publicProjectDoc.data());
        } else {
          // Then try as a secure share key
          const keyDoc = await getDoc(doc(firestore, 'share_keys', key));
          if (keyDoc.exists()) {
            const { projectPath } = keyDoc.data();
            const sharedProjectDoc = await getDoc(doc(firestore, projectPath));
            if (sharedProjectDoc.exists()) {
              setProject(sharedProjectDoc.data());
            }
          }
        }
      } catch (err) {
        console.error("Error fetching project:", err);
      } finally {
        setLoading(false);
      }
    }
    validateAndFetchProject();
  }, [key, firestore]);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !firestore || !project || !paymentId.trim()) return;

    setSubmitting(true);
    try {
      const transId = doc(collection(firestore, 'transactions')).id;
      const sellerPrice = project.price || 0;
      const commission = sellerPrice * 0.1;
      const totalAmount = sellerPrice + commission;

      const transactionData = {
        id: transId,
        projectId: project.id,
        projectTitle: project.title,
        buyerId: user.uid,
        buyerName: user.displayName || 'Anonymous Buyer',
        sellerId: project.ownerId,
        amountPaid: totalAmount,
        commission: commission,
        paymentProof: paymentId,
        status: 'pending',
        createdAt: serverTimestamp()
      };

      setDocumentNonBlocking(doc(firestore, 'transactions', transId), transactionData, { merge: true });

      toast({
        title: "Purchase Requested",
        description: "Admin will verify your payment and grant access shortly.",
      });
      setShowBuyForm(false);
      setPaymentId('');
    } catch (e: any) {
      toast({ variant: "destructive", title: "Error", description: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center border-destructive/20 shadow-xl">
          <CardHeader>
            <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <CardTitle>Project Not Found</CardTitle>
            <CardDescription>This link is expired or invalid.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => router.push('/')}>Return Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = user && project.ownerId === user.uid;
  const buyerPrice = (project.price || 0) * 1.1;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" className="gap-2 -ml-2 text-muted-foreground" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div className="flex gap-2">
            {project.isForSale && (
              <Badge className="bg-primary text-white font-bold px-4 py-1">
                FOR SALE: RS {buyerPrice.toFixed(2)}
              </Badge>
            )}
            <Badge className="bg-green-100 text-green-700 border-green-200">
              <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Secure Access
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold tracking-tight">{project.title}</h1>
                <Badge variant="outline" className="capitalize">{project.visibility}</Badge>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">{project.description}</p>
            </div>

            {project.isForSale && !isOwner && (
              <Card className="border-primary/20 shadow-xl overflow-hidden">
                <CardHeader className="bg-primary/5 border-b">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Purchase Project Access</CardTitle>
                  </div>
                  <CardDescription>Support the creator and get permanent access to assets.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                  {!showBuyForm ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold">Total Price</p>
                          <p className="text-3xl font-black text-primary">RS {buyerPrice.toFixed(2)}</p>
                        </div>
                        <Button className="h-12 px-8 text-lg shadow-lg shadow-primary/20" onClick={() => setShowBuyForm(true)}>
                          Unlock Now
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                        <Info className="w-3 h-3" /> Includes 10% platform commission for verification and support.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handlePurchase} className="space-y-4 animate-in slide-in-from-right-4">
                      <div className="bg-muted p-4 rounded-lg space-y-2">
                        <p className="text-sm font-bold flex items-center gap-2">
                          <Send className="w-4 h-4" /> Send Payment To:
                        </p>
                        <p className="text-lg font-mono bg-white p-3 rounded border text-center font-bold">
                          {project.sellerAccount || "N/A"}
                        </p>
                        <p className="text-[10px] text-muted-foreground">Please send exactly RS {buyerPrice.toFixed(2)} to the account above.</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Transaction ID (from EasyPaisa/Bank)</Label>
                        <Input 
                          placeholder="Paste your receipt ID here..."
                          required
                          value={paymentId}
                          onChange={(e) => setPaymentId(e.target.value)}
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <Button variant="ghost" className="flex-1" type="button" onClick={() => setShowBuyForm(false)}>Cancel</Button>
                        <Button className="flex-1" type="submit" disabled={submitting}>
                          {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                          Submit Proof
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5" /> Identity
                </CardDescription>
                <CardTitle className="text-sm font-bold truncate">
                  {isOwner ? "Your Project" : `Owner: ${project.ownerId.substring(0, 8)}...`}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="border-none shadow-sm bg-muted/20">
              <CardHeader className="pb-2">
                <CardDescription className="flex items-center gap-2">
                  <Download className="w-3.5 h-3.5" /> Assets
                </CardDescription>
                <CardTitle className="text-sm">
                  {isOwner || !project.isForSale ? (
                    <Button variant="link" className="p-0 h-auto text-primary" asChild>
                      <a href={project.fileURL} target="_blank">Download Files</a>
                    </Button>
                  ) : (
                    "Purchase Required"
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
