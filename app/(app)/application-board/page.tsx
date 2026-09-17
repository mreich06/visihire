import { requireUser } from '@/lib/auth-guard';
import { getBoardJobs } from '@/lib/jobs';
import Board from '@/components/board/board';

const Page = async () => {
  const user = await requireUser();
  const jobs = await getBoardJobs(user.id);

  return <Board jobs={jobs} />;
};

export default Page;
