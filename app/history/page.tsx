// app/history/page.tsx
import AppShell from '@/components/app/AppShell';
import TransferHistory from '@/components/history/TransferHistory';

export default function TransferHistoryPage() {
  return (
    <AppShell active="Transfer History">
      <TransferHistory />
    </AppShell>
  );
}
