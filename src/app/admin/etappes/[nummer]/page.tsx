import { notFound } from 'next/navigation';
import { db } from '@/db';
import { stages } from '@/db/schema';
import { eq } from 'drizzle-orm';
import StageEditor from './StageEditor';

export const revalidate = 0;

interface Props {
  params: Promise<{ nummer: string }>;
}

export default async function AdminEtappeEditPage({ params }: Props) {
  const { nummer } = await params;
  const num = parseInt(nummer, 10);
  if (isNaN(num)) notFound();

  const [stage] = await db.select().from(stages).where(eq(stages.stageNumber, num));
  if (!stage) notFound();

  return <StageEditor stage={stage} />;
}
