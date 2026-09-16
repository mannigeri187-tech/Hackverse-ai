import { runHackathonIngestion } from './api/_shared/ingestionService.js';
(async () => {
  console.log('Running ingestion...');
  const res = await runHackathonIngestion();
  console.log(res);
  process.exit(0);
})();
