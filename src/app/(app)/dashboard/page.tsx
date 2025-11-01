'use server';

import { getDashboardPageData } from '@/lib/dashboard-data';
import { DashboardClientPage } from '@/components/dashboard-client-page';

export default async function DashboardPage() {
  const data = await getDashboardPageData();

  return <DashboardClientPage initialData={data} />;
}
