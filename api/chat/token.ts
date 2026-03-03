import { StreamChat } from 'stream-chat';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'User ID is required' });

  const STREAM_API_KEY = process.env.VITE_STREAM_API_KEY;
  const STREAM_API_SECRET = process.env.STREAM_API_SECRET;

  if (!STREAM_API_KEY || !STREAM_API_SECRET) {
    return res.status(500).json({ error: 'Stream Chat API keys not configured on server' });
  }

  try {
    const serverClient = StreamChat.getInstance(STREAM_API_KEY, STREAM_API_SECRET);
    const token = serverClient.createToken(userId);
    res.status(200).json({ token, apiKey: STREAM_API_KEY });
  } catch (error) {
    console.error('Error generating Stream token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
}
