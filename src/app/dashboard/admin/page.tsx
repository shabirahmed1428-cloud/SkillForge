
"use client";

import { useEffect, useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  HardDrive, 
  ShieldCheck, 
  FileText, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Database as DbIcon,
  Settings,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
  ShoppingCart,
  DollarSign
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { 
  useCollection, 
  useFirestore, 
  useMemoFirebase, 
  useDatabase,
  updateDocumentNonBlocking 
} from '@/firebase';
import { collection, query, where, limit, doc, serverTimestamp } from 'firebase/firestore';
import { ref, onValue, update } from 'firebase/database';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboardPage() {
  const firestore = useFirestore();
  const database = useDatabase();
  const { toast } = useToast();
  const [rtUsersCount, setRtUsersCount] = useState(0);

  // Stats queries
  const allUsersQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users')) : null, [firestore]);
  const { data: allUsers } = useCollection(allUsersQuery);

  const allProjectsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'projects_public')) : null, [firestore]);
  const { data: allProjects } = useCollection(allProjectsQuery);

  // Transactions query
  const transactionsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'transactions'), limit(10)) : null, [firestore]);
  const { data: transactions, isLoading: transLoading } = useCollection(transactionsQuery);

  // Pending Approvals Query (Subscriptions)
  const pendingApprovalsQuery = useMemoFirebase(() => firestore ? query(collection(firestore, 'users'), where('subscriptionStatus', '==', 'pending_approval')) : null, [firestore]);
  const { data: pendingUsers } = useCollection(pendingApprovalsQuery);

  useEffect(() => {
    if (!database) return;
    const usersRef = ref(database, 'users');
    const unsubscribe = onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) setRtUsersCount(Object.keys(snapshot.val()).length);
    });
    return () => unsubscribe();
  }, [database]);

  const handleApproveSubscription = (userId: string, userName: string) => {
    if (!firestore) return;
    const userRef = doc(firestore, 'users', userId);
    updateDocumentNonBlocking(userRef, {
      subscriptionStatus: 'active',
      subscriptionPlanId: 'pro',
      storageLimitMB: 2048,
      updatedAt: serverTimestamp()
    });
    toast({ title: "Approved", description: `${userName} upgraded to Pro.` });
  };

  const totalCommission = transactions?.reduce((acc, t) => acc + (t.commission || 0), 0) || 0;
  const totalStorageUsedMB = allUsers?.reduce((acc, u) => acc + (u.storageUsedMB || 0), 0) || 0;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Console</h1>
          <p className="text-muted-foreground mt-1">Marketplace oversight and platform security.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="flex items-center gap-1.5 py-1.5 px-3 border-primary/20 bg-primary/5 text-primary">
            <DbIcon className="w-3.5 h-3.5" />
            Live Connected
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rtUsersCount}</div>
            <p className="text-[10px] text-muted-foreground">Live monitored accounts</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">RS {totalCommission.toFixed(2)}</div>
            <p className="text-[10px] text-muted-foreground">10% commission earnings</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allProjects?.length || 0}</div>
            <p className="text-[10px] text-muted-foreground">Public discovery listings</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Storage</CardTitle>
            <HardDrive className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalStorageUsedMB / 1024).toFixed(2)} GB</div>
            <p className="text-[10px] text-muted-foreground">Total asset consumption</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none shadow-md overflow-hidden">
          <CardHeader className="bg-primary/5 border-b">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <div>
                <CardTitle className="text-base font-bold">Marketplace Transactions</CardTitle>
                <CardDescription>Track project sales and verify payments.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project / Buyer</TableHead>
                  <TableHead>Total Paid</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Proof</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions?.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{t.projectTitle}</span>
                        <span className="text-[10px] text-muted-foreground">Buyer: {t.buyerName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-bold text-green-700 text-xs">
                      RS {t.amountPaid?.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-primary">
                      RS {t.commission?.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <code className="text-[9px] bg-muted px-1.5 py-0.5 rounded border">{t.paymentProof}</code>
                    </TableCell>
                  </TableRow>
                ))}
                {(!transactions || transactions.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                      No marketplace sales recorded yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md border-t-4 border-t-orange-500 overflow-hidden h-fit">
          <CardHeader className="bg-orange-50/50">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-500" />
              Pending Upgrades
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {pendingUsers?.map((u) => (
                <div key={u.id} className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-bold">{u.name}</p>
                      <p className="text-[10px] text-muted-foreground">{u.lastPaymentTransactionId}</p>
                    </div>
                    <Badge variant="outline" className="text-[8px] bg-white">Storage Upgrade</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="h-7 text-[10px] flex-1 bg-green-600 hover:bg-green-700"
                      onClick={() => handleApproveSubscription(u.id, u.name)}
                    >
                      Approve
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-[10px] flex-1 text-destructive">Reject</Button>
                  </div>
                </div>
              ))}
              {(!pendingUsers || pendingUsers.length === 0) && (
                <p className="p-8 text-center text-xs text-muted-foreground">No pending upgrades.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
