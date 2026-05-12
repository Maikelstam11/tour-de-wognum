import AdminPanel from './AdminPanel';
import { db } from '@/db';
import { participants, stages, stageResults, riders, settings, riderValues } from '@/db/schema';
import { sql, eq } from 'drizzle-orm';

export const revalidate = 0;

async function getAdminData() {
  try {
    const [participantCount, stageList, riderList, openSetting, valueSetting] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(participants),
      db.select().from(stages).orderBy(stages.stageNumber),
      db.select({ id: riders.id, name: riders.name, isActive: riders.isActive }).from(riders).orderBy(riders.name),
      db.select().from(settings).where(eq(settings.key, 'registration_open')),
      db.select({ count: sql<number>`count(*)` }).from(riderValues),
    ]);
    return {
      participantCount: Number(participantCount[0]?.count ?? 0),
      stages: stageList,
      riders: riderList,
      registrationOpen: openSetting[0]?.value !== 'false',
      valuesCalculated: Number(valueSetting[0]?.count ?? 0) > 0,
    };
  } catch {
    return { participantCount: 0, stages: [], riders: [], registrationOpen: true, valuesCalculated: false };
  }
}

export default async function AdminPage() {
  const data = await getAdminData();
  return <AdminPanel {...data} />;
}
