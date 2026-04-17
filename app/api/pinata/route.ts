import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { uploadToPinata } from '@/lib/pinata';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.PINATA_JWT) {
      return NextResponse.json(
        { error: 'IPFS upload is not configured (missing PINATA_JWT)' },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'Missing or empty file' }, { status: 400 });
    }

    const pinataData = await uploadToPinata(file);
    return NextResponse.json(pinataData);
  } catch (error) {
    console.error('Pinata upload error:', error);
    const message = error instanceof Error ? error.message : 'Upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
