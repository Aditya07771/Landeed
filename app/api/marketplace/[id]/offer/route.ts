import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const listing = await prisma.landListing.findUnique({ where: { id: params.id } });
    if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const offers = await prisma.landOffer.findMany({
      where: { listingId: params.id }
    });
    
    // Hide details for non-sellers
    if (listing.sellerId !== session.user.id && session.user.role !== 'ADMIN') {
        const filteredOffers = offers.map(o => o.buyerId === session.user.id ? o : { ...o, buyerId: 'hidden', message: null });
        return NextResponse.json(filteredOffers);
    }
    
    return NextResponse.json(offers);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'OWNER') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const listing = await prisma.landListing.findUnique({ where: { id: params.id } });
    if (!listing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (listing.sellerId === session.user.id) return NextResponse.json({ error: 'Cannot offer on own listing' }, { status: 400 });
    
    const { offerAmount, message } = await req.json();
    
    const offer = await prisma.landOffer.create({
      data: {
        listingId: params.id,
        buyerId: session.user.id,
        offerAmount: parseFloat(offerAmount),
        message
      }
    });

    await prisma.notification.create({
      data: { userId: listing.sellerId, type: 'NEW_OFFER', title: 'New Offer Received', message: `You have received an offer for your listing.` }
    });

    return NextResponse.json(offer);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
