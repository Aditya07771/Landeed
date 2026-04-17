import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { role, isKycVerified } = await req.json();
    
    const updateData: any = {};
    if (role !== undefined) updateData.role = role;
    if (isKycVerified !== undefined) {
      updateData.isKycVerified = isKycVerified;
      if (isKycVerified) {
        updateData.kycVerifiedAt = new Date();
      }
    }
    
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData
    });
    
    return NextResponse.json(updatedUser);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
