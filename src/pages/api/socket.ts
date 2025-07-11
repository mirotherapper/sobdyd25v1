import { NextApiRequest, NextApiResponse } from 'next';
import { initializeSocketServer } from '../../lib/socket/server';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Initialize Socket.IO server
    const io = initializeSocketServer(req, res as any);

    res.status(200).json({
      message: 'Socket.IO server initialized',
      connected: io.engine.clientsCount,
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
