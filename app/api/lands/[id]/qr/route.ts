import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const land = await prisma.land.findFirst({
      where: { OR: [{ id: params.id }, { landId: params.id }] }
    });
    
    if (!land) {
      return new Response('Land not found', { status: 404 });
    }

    const origin = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const url = `${origin}/verify/${land.landId}`;
    
    const QRCode = await import('qrcode');
    const pngBuffer = await QRCode.toBuffer(url, { type: 'png', width: 300 });

    return new Response(pngBuffer as any, {
      headers: { 'Content-Type': 'image/png' },
    });
  } catch (error: any) {
    return new Response(error.message, { status: 500 });
  }
}
