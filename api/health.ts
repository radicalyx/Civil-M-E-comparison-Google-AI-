import { handleGetHealth } from '../src/server/apiHandlers.ts';

export default async function handler(req: any, res: any) {
  const result = await handleGetHealth();

  Object.entries(result.headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  return res.status(result.statusCode).json(result.body);
}
