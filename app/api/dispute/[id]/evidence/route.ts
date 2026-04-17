import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const dispute = await prisma.dispute.findUnique({ where: { id: params.id } });
    if (!dispute) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    const isAllowed = dispute.filedById === session.user.id || 
                      dispute.assignedTo === session.user.id || 
                      session.user.role === 'AUTHORITY' ||
                      session.user.role === 'ADMIN';
                      
    if (!isAllowed) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const formData = await req.formData();
    // Assuming Pinata upload happens on client and client sends ipfsCid, fileName, hash
    const ipfsCid = formData.get('ipfsCid') as string;
    const fileName = formData.get('fileName') as string;
    const hash = formData.get('hash') as string;
    
    if (!ipfsCid || !fileName || !hash) {
      return NextResponse.json({ error: 'Missing evidence data' }, { status: 400 });
    }

    const evidence = await prisma.disputeEvidence.create({
      data: {
        disputeId: params.id,
        uploadedBy: session.user.id,
        ipfsCid,
        fileName,
        hash
      }
    });

    await prisma.disputeTimeline.create({
      data: {
        disputeId: params.id,
        action: 'EVIDENCE_SUBMITTED',
        note: fileName
      }
    });
    
    return NextResponse.json(evidence);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
