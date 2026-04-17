import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding LandChain database...")
  
  // delete order must respect FK constraints:
  // Delete in reverse dependency order:
  await prisma.notification.deleteMany()
  await prisma.acquisitionAppeal.deleteMany()
  await prisma.acquisitionTimeline.deleteMany()
  await prisma.acquisitionRequest.deleteMany()
  await prisma.disputeTimeline.deleteMany()
  await prisma.disputeEvidence.deleteMany()
  await prisma.dispute.deleteMany()
  await prisma.landOffer.deleteMany()
  await prisma.landListing.deleteMany()
  await prisma.mortgageLien.deleteMany()
  await prisma.taxRecord.deleteMany()
  await prisma.landValuation.deleteMany()
  await prisma.landSubdivision.deleteMany()
  await prisma.landHistory.deleteMany()
  await prisma.document.deleteMany()
  await prisma.land.deleteMany()
  await prisma.user.deleteMany()
  console.log("Deleted old records");

  const passwordHash = await bcrypt.hash('Password123', 10)

  // 1 ADMIN
  const admin = await prisma.user.create({
      data: { name: "Super Admin", email: "admin@landchain.gov.in", role: "ADMIN", isKycVerified: true, password: passwordHash }
  });

  // 3 AUTHORITY
  const authData = [
      { name: "Rajesh Kumar", email: "raj.kumar@bmc.gov.in" },
      { name: "Priya Sharma", email: "priya.sharma@dda.gov.in" },
      { name: "Anil Mehta", email: "anil.mehta@mcgm.gov.in" }
  ];
  
  const authorities = await Promise.all(authData.map(a => 
      prisma.user.create({ data: { ...a, role: 'AUTHORITY', isKycVerified: true, password: passwordHash } })
  ));

  // 3 VERIFIER
  const verifierData = [
      { name: "Sneha Patil", email: "sneha.patil@verifier.in" },
      { name: "Vikram Nair", email: "vikram.nair@inspector.in" },
      { name: "Deepa Iyer", email: "deepa.iyer@certified.in" }
  ];

  const verifiers = await Promise.all(verifierData.map(v => 
      prisma.user.create({ data: { ...v, role: 'VERIFIER', isKycVerified: true, password: passwordHash } })
  ));

  // 10 OWNER
  const ownerNames = ["Ramesh Gupta", "Sunita Devi", "Mohammed Irfan", "Kavitha Rajan", "Harish Patel", "Meena Krishnan", "Sanjay Yadav", "Pooja Agarwal", "Rohit Verma", "Lakshmi Subramanian"]
  
  const owners: any[] = [];
  for (let i = 0; i < ownerNames.length; i++) {
      const name = ownerNames[i];
      const email = name.toLowerCase().replace(' ', '.') + '@gmail.com';
      const aadhar = `23456789012${i}`;
      const pan = `ABCDE1234${String.fromCharCode(65+i)}`;
      const aadharHash = crypto.createHash('sha256').update(aadhar + pan).digest('hex');
      const o = await prisma.user.create({
          data: { name, email, role: 'OWNER', isKycVerified: true, password: passwordHash, aadharHash }
      });
      owners.push(o);
  }

  // 10 LANDS
  const cities = [
      { loc: "Navi Mumbai, Maharashtra", coords: "73.00718617648855, 19.105865691390726" },
      { loc: "Dhirubhai Ambani Knowledge City, Navi Mumbai", coords: "73.012715, 19.102389" },
      { loc: "Airoli Mindspace, Navi Mumbai", coords: "73.0021, 19.1599" },
      { loc: "Ghansoli Railway Station, Navi Mumbai", coords: "73.007194, 19.116389" },
      { loc: "Reliance Corporate Park, Navi Mumbai", coords: "73.00522, 19.12431" },
      { loc: "Airoli Bridge, Navi Mumbai", coords: "72.9805, 19.1507" },
      { loc: "Central Park Ghansoli, Navi Mumbai", coords: "73.004444, 19.114722" },
      { loc: "SG Highway Plot 21, Ahmedabad, Gujarat", coords: "72.5714, 23.0225" },
      { loc: "Plot 11, Malviya Nagar, Jaipur, Rajasthan", coords: "75.7873, 26.9124" },
      { loc: "Survey No. 8, Gomti Nagar, Lucknow, UP", coords: "80.9462, 26.8467" },
      { loc: "Plot 22, Ring Road, Surat, Gujarat", coords: "72.8311, 21.1702" },
      { loc: "Sector 14, Pimpri, Pune, Maharashtra", coords: "73.7997, 18.6298" },
      { loc: "Plot 10, Civil Lines, Kanpur, UP", coords: "80.3319, 26.4499" }
  ];
  
  const statuses = ['AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'UNDER_ACQUISITION', 'UNDER_ACQUISITION', 'ACQUIRED', 'ACQUIRED', 'DISPUTED', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE', 'AVAILABLE'] as const;

  const lands: any[] = [];
  for (let i = 0; i < cities.length; i++) {
      const c = cities[i];
      const owner = owners[i % 10];
      const aadharHash = crypto.createHash('sha256').update(`23456789012${i}`).digest('hex');
      const landId = `LAND-${aadharHash.substring(0, 8).toUpperCase()}`;
      
      const [lng, lat] = c.coords.split(', ').map(Number);
      const coords = JSON.stringify([
          [lng - 0.001, lat - 0.001],
          [lng + 0.001, lat - 0.001],
          [lng + 0.001, lat + 0.001],
          [lng - 0.001, lat + 0.001],
          [lng - 0.001, lat - 0.001]
      ]);

      const area = 500 + Math.floor(Math.random() * 4500);

      const land = await prisma.land.create({
          data: {
              landId,
              ownerId: owner.id,
              area,
              location: c.loc,
              coordinates: coords,
              status: statuses[i],
              txHash: statuses[i] === 'ACQUIRED' ? `0x${crypto.randomBytes(32).toString('hex')}` : null,
              docHash: `Qm${crypto.randomBytes(44).toString('hex').substring(0, 44)}`
          }
      });

      await prisma.landHistory.createMany({
          data: [
              { landId: land.id, action: 'REGISTERED', performedBy: owner.id, createdAt: new Date(Date.now() - 365*24*60*60*1000) },
              { landId: land.id, action: 'DOCUMENT_UPLOADED', performedBy: owner.id, createdAt: new Date(Date.now() - 360*24*60*60*1000) },
          ]
      });
      
      if (statuses[i] === 'ACQUIRED') {
          await prisma.landHistory.createMany({
              data: [
                  { landId: land.id, action: 'OWNERSHIP_TRANSFERRED', performedBy: authorities[0].id, createdAt: new Date(Date.now() - 10*24*60*60*1000) }
              ]
          });
      }

      lands.push(land);
  }

  // ACQUISITION REQUESTS
  const acqStatuses = ['PENDING', 'PENDING', 'VERIFIED', 'VERIFIED', 'APPROVED', 'APPROVED', 'APPROVED', 'COMPLETED', 'COMPLETED', 'REJECTED'] as const;
  
  const acquisitions: any[] = [];
  for (let i = 0; i < acqStatuses.length; i++) {
      const status = acqStatuses[i];
      const land = lands[i];
      const authority = authorities[i % 3];
      const verifier = verifiers[i % 3];
      const amount = 500 + Math.floor(Math.random() * 4500);
      
      const req = await prisma.acquisitionRequest.create({
          data: {
              landId: land.id,
              authorityId: authority.id,
              amount,
              status,
              txHash: `0x${crypto.randomBytes(32).toString('hex')}`,
              assignedVerifierId: ['VERIFIED', 'APPROVED', 'COMPLETED', 'REJECTED', 'PENDING'].includes(status) ? verifier.id : null,
              verifierNote: status === 'REJECTED' ? "Documents not clear" : "Documents verified correctly",
          }
      });

      const timelines = [];
      timelines.push({ acquisitionRequestId: req.id, action: 'REQUESTED', createdAt: new Date(Date.now() - 60*24*60*60*1000), txHash: null });
      
      if (['VERIFIED', 'APPROVED', 'COMPLETED', 'REJECTED'].includes(status)) {
          timelines.push({ acquisitionRequestId: req.id, action: status === 'REJECTED' ? 'REJECTED' : 'VERIFIED', createdAt: new Date(Date.now() - 45*24*60*60*1000), txHash: null });
      }
      if (['APPROVED', 'COMPLETED'].includes(status)) {
          timelines.push({ acquisitionRequestId: req.id, action: 'APPROVED', createdAt: new Date(Date.now() - 30*24*60*60*1000), txHash: null });
      }
      if (status === 'COMPLETED') {
          timelines.push({ acquisitionRequestId: req.id, action: 'PAYMENT_LOCKED', createdAt: new Date(Date.now() - 20*24*60*60*1000), txHash: null });
          timelines.push({ acquisitionRequestId: req.id, action: 'TRANSFERRED', createdAt: new Date(Date.now() - 10*24*60*60*1000), txHash: null });
      }

      await prisma.acquisitionTimeline.createMany({ data: timelines });
      acquisitions.push(req);
  }

  // DOCUMENTS
  const docTypes = ['OWNERSHIP_PROOF', 'REGISTRY_PAPER', 'TAX_RECEIPT', 'MAP_DOCUMENT'] as const;
  for (let i = 0; i < 10; i++) {
      const land = lands[i % 6];
      const isOnChainVerified = i < 5;
      await prisma.document.create({
          data: {
              landId: land.id,
              type: docTypes[i % 4],
              ipfsCid: `Qm${crypto.randomBytes(44).toString('hex').substring(0, 44)}`,
              hash: crypto.randomBytes(32).toString('hex'), // 64 hex chars
              fileName: `document_${i}.pdf`,
              isOnChainVerified,
              onChainTxHash: isOnChainVerified ? `0x${crypto.randomBytes(32).toString('hex')}` : null
          }
      })
  }

  // DISPUTES
  const disputeStatuses = ['OPEN', 'OPEN', 'OPEN', 'OPEN', 'UNDER_REVIEW', 'UNDER_REVIEW', 'UNDER_REVIEW', 'RESOLVED', 'RESOLVED', 'DISMISSED'] as const;
  const dispCategories = ['OWNERSHIP_CONFLICT', 'BOUNDARY_DISPUTE', 'FRAUDULENT_REGISTRATION'] as const;
  
  for (let i = 0; i < disputeStatuses.length; i++) {
      const status = disputeStatuses[i];
      const land = lands[i];
      const d = await prisma.dispute.create({
          data: {
              landId: land.id,
              filedById: land.ownerId,
              category: dispCategories[i % 3],
              description: i % 2 === 0 ? "The boundary wall of this parcel encroaches 2 meters into Survey No. 143." : "Previous owner sold this land to two different parties. Fraud suspected.",
              status,
              assignedTo: status === 'UNDER_REVIEW' ? verifiers[0].id : null,
              resolution: status === 'RESOLVED' ? "Measurements corrected by surveyor." : null
          }
      });
      await prisma.disputeTimeline.createMany({
          data: [
              { disputeId: d.id, action: 'FILED', note: 'Dispute filed by owner' },
              ...(status === 'UNDER_REVIEW' ? [{ disputeId: d.id, action: 'UNDER_REVIEW', note: 'Review started' }] : []),
              ...(status === 'RESOLVED' ? [{ disputeId: d.id, action: 'RESOLVED', note: 'Resolved after verification' }] : [])
          ]
      });
  }

  // LAND LISTINGS
  const listingStatuses = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'SOLD', 'SOLD', 'CANCELLED', 'EXPIRED'] as const;
  const eligibleLands = lands.filter(l => ['AVAILABLE', 'ACQUIRED'].includes(l.status));
  
  const listings: any[] = [];
  for (let i = 0; i < listingStatuses.length; i++) {
      const status = listingStatuses[i];
      const land = eligibleLands[i]; 
      const listing = await prisma.landListing.create({
          data: {
              landId: land.id,
              sellerId: land.ownerId,
              askingPrice: 5000 + (1000 * i),
              status,
              description: "Prime agricultural land with water access, 3km from NH-48",
              expiresAt: new Date(Date.now() + 60*24*60*60*1000)
          }
      });
      listings.push(listing);
  }

  // LAND OFFERS
  const activeListings = listings.slice(0, 6);
  const offerStatuses = ['PENDING', 'PENDING', 'PENDING', 'PENDING', 'ACCEPTED', 'ACCEPTED', 'REJECTED', 'REJECTED', 'COMPLETED', 'WITHDRAWN'] as const;
  for (let i = 0; i < offerStatuses.length; i++) {
      const status = offerStatuses[i];
      const listing = activeListings[i % 6];
      const buyer = owners[(i + 5) % 10]; 
      await prisma.landOffer.create({
          data: {
              listingId: listing.id,
              buyerId: buyer.id,
              offerAmount: listing.askingPrice * 0.9,
              message: "Interested in quick settlement. Can close in 2 weeks.",
              status
          }
      });
  }

  // MORTGAGE LIENS
  const mortgageStatuses = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'ACTIVE', 'DISCHARGED', 'DISCHARGED', 'DEFAULTED', 'FORECLOSED'] as const;
  await Promise.all(mortgageStatuses.map((status, i) => {
      const land = lands[i % lands.length];
      if (!land) throw new Error(`Missing land for MortgageLien at index ${i}`);
      return prisma.mortgageLien.create({
          data: {
              landId: land.id,
              lenderId: authorities[0].id,
              borrowerId: land.ownerId,
              principalAmount: 500000 + (i * 200000),
              interestRate: 6.5 + (i * 0.5),
              startDate: new Date(Date.now() - 365*24*60*60*1000),
              endDate: new Date(Date.now() + 10*365*24*60*60*1000),
              status,
              txHash: status === 'DISCHARGED' ? `0x${crypto.randomBytes(32).toString('hex')}` : null
          }
      });
  }));

  // TAX RECORDS
  const taxStatuses = ['PAID', 'PAID', 'PAID', 'PAID', 'PENDING', 'PENDING', 'PENDING', 'OVERDUE', 'OVERDUE', 'WAIVED'] as const;
  for (let i = 0; i < taxStatuses.length; i++) {
      const status = taxStatuses[i];
      const land = lands[i % lands.length];
      if (!land || !land.id) throw new Error(`Missing land or land.id for TaxRecord at index ${i}: ${JSON.stringify(land)}`);
      await prisma.taxRecord.create({
          data: {
              landId: land.id,
              taxYear: 2022 + (i % 3),
              assessedValue: 5000000,
              taxAmount: 5000 + (i * 1000),
              dueDate: status === 'OVERDUE' ? new Date(Date.now() - 30*24*60*60*1000) : new Date(Date.now() + 30*24*60*60*1000),
              status,
              paidAt: status === 'PAID' ? new Date() : undefined,
              receiptNumber: status === 'PAID' ? `REC-2024-${String(i).padStart(5, '0')}` : undefined,
              paidAmount: status === 'PAID' ? 5000 + (i * 1000) : undefined
          }
      });
  }

  // LAND VALUATIONS
  const valMethods = ['MARKET_COMPARABLE', 'GOVERNMENT_ASSESSED', 'INCOME_APPROACH', 'COST_APPROACH'] as const;
  for (let i = 0; i < 10; i++) {
      const land = lands[i % lands.length];
      if (!land || !land.id) throw new Error(`Missing land or land.id for LandValuation at index ${i}: ${JSON.stringify(land)}`);
      await prisma.landValuation.create({
          data: {
              landId: land.id,
              valuedBy: authorities[i % 2].id,
              valuationAmt: 1000000 + (i * 50000),
              method: valMethods[i % 4],
              notes: "Comparable sales in the area suggest market value of INR 85 lakhs"
          }
      });
  }

  // ACQUISITION APPEALS
  const appealStatuses = ['PENDING', 'PENDING', 'UNDER_REVIEW', 'UPHELD', 'REJECTED_FINAL'] as const;
  const rejectedAcq = acquisitions[9]; 
  for (let i = 0; i < appealStatuses.length; i++) {
      const status = appealStatuses[i];
      // Create a unique appeal for each by matching it to a different rejected acquisition if we had one, but we have to enforce @unique on acquisitionId. 
      // The schema says acquisitionId is @unique. We can't create 5 appeals for the same acquisition!
      // I will create appeals for different REJECTED or PENDING acquisitions...
      const targetAcq = acquisitions[4 + i]; // just pick an acquisition to attach an appeal to, regardless of status for demo
      await prisma.acquisitionAppeal.create({
          data: {
              acquisitionId: targetAcq.id,
              appellantId: owners[0].id,
              reason: "The rejection was based on an incorrect document hash comparison. We have re-uploaded the corrected deed abstract.",
              status,
              reviewNote: ['UPHELD', 'REJECTED_FINAL'].includes(status) ? "Reviewed the new document." : null
          }
      });
  }

  // NOTIFICATIONS
  const notifTypes = ['LAND_REGISTERED', 'KYC_VERIFIED', 'ACQUISITION_REQUESTED', 'DISPUTE_FILED', 'TAX_OVERDUE', 'VERIFIER_ASSIGNED', 'OFFER_RECEIVED'];
  for (let i = 0; i < 10; i++) {
      const isRead = i < 7;
      await prisma.notification.create({
          data: {
              userId: owners[i].id,
              title: "System Update",
              message: "Test notification message.",
              type: notifTypes[i % notifTypes.length],
              isRead,
              createdAt: isRead ? new Date(Date.now() - 10*24*60*60*1000) : new Date(Date.now() - 2*24*60*60*1000)
          }
      })
  }
  
  console.log("Seeding complete.")
}

main().catch(console.error).finally(() => prisma.$disconnect())
