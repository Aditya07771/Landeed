import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'AUTHORITY' && session.user.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { subParcels } = await req.json();
    if (!subParcels || !Array.isArray(subParcels)) {
      return NextResponse.json({ error: 'subParcels must be an array' }, { status: 400 });
    }

    const parentLand = await prisma.land.findUnique({ where: { id: params.id }, include: { liens: true } });
    if (!parentLand) return NextResponse.json({ error: 'Parent land not found' }, { status: 404 });
    if (parentLand.status !== 'AVAILABLE') return NextResponse.json({ error: 'Parent land is not available' }, { status: 400 });
    
    const activeLiens = parentLand.liens.filter(l => l.status === 'ACTIVE');
    if (activeLiens.length > 0) return NextResponse.json({ error: 'Parent land has active liens' }, { status: 400 });

    const totalSubArea = subParcels.reduce((sum, sp: any) => sum + parseFloat(sp.area || 0), 0);
    if (totalSubArea > parentLand.area) {
      return NextResponse.json({ error: 'Sum of subparcel areas exceeds parent area' }, { status: 400 });
    }

    const createdChildIds = [];

    // Begin subdivision logic
    for (const sp of subParcels) {
      const newLandId = `LAND-UNVERIFIED-${nanoid()}`;
      const child = await prisma.land.create({
        data: {
          landId: newLandId,
          ownerId: parentLand.ownerId,
          area: parseFloat(sp.area),
          location: sp.location,
          coordinates: sp.coordinates || null,
          status: 'AVAILABLE',
        }
      });
      await prisma.landSubdivision.create({
        data: {
          parentLandId: parentLand.id,
          childLandId: child.id,
          createdBy: session.user.id
        }
      });
      await prisma.landHistory.create({
        data: {
          landId: child.id,
          action: 'CREATED_BY_SUBDIVISION',
          performedBy: session.user.id
        }
      });
      createdChildIds.push(child.id);
    }

    await prisma.land.update({
      where: { id: parentLand.id },
      data: { status: 'ACQUIRED' } // Marks it as conceptually no longer available independently
    });

    await prisma.landHistory.create({
      data: {
        landId: parentLand.id,
        action: 'SUBDIVIDED',
        performedBy: session.user.id
      }
    });

    return NextResponse.json({ success: true, createdChildIds });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
