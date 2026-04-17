import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string, offerId: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'OWNER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const listing = await prisma.landListing.findUnique({ where: { id: params.id } });
    if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (listing.sellerId !== session.user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { action } = await req.json(); // ACCEPT or REJECT
    
    if (action === 'ACCEPT') {
      const offer = await prisma.landOffer.update({
        where: { id: params.offerId },
        data: { status: 'ACCEPTED' }
      });
      await prisma.landOffer.updateMany({
        where: { listingId: params.id, id: { not: params.offerId }, status: 'PENDING' },
        data: { status: 'REJECTED' }
      });
      await prisma.notification.create({
        data: { userId: offer.buyerId, type: 'OFFER_ACCEPTED', title: 'Offer Accepted', message: `Your offer was accepted, please complete the on-chain transfer.` }
      });
      return NextResponse.json(offer);
    } else if (action === 'REJECT') {
      const offer = await prisma.landOffer.update({
        where: { id: params.offerId },
        data: { status: 'REJECTED' }
      });
      await prisma.notification.create({
        data: { userId: offer.buyerId, type: 'OFFER_REJECTED', title: 'Offer Rejected', message: `Your offer was rejected.` }
      });
      return NextResponse.json(offer);
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
