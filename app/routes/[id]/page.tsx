import AppShell from '@/components/app/AppShell';
import RouteTracker from '@/components/builder/RouteTracker';

export default async function RouteTrackingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AppShell active="Route Tracking">
      <RouteTracker id={id} />
    </AppShell>
  );
}
