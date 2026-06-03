const { PrismaClient, Prisma } = require('@prisma/client');
const prisma = new PrismaClient();

const pairs = [
  ['BTC/USDT','BTC','USDT','68421.20','2.84','69180.00','66120.40','2410000000'],
  ['ETH/USDT','ETH','USDT','3724.88','1.46','3812.60','3610.20','1180000000'],
  ['LTC/USDT','LTC','USDT','86.42','0.92','88.10','83.80','129000000'],
  ['SOL/USDT','SOL','USDT','184.32','5.19','189.80','171.90','824500000'],
  ['BNB/USDT','BNB','USDT','612.45','0.63','620.00','598.50','390000000'],
  ['XRP/USDT','XRP','USDT','0.6421','-0.72','0.6610','0.6312','312800000'],
  ['DOGE/USDT','DOGE','USDT','0.1648','3.11','0.1712','0.1540','239100000'],
  ['ADA/USDT','ADA','USDT','0.4820','-1.25','0.4960','0.4710','168500000'],
  ['AVAX/USDT','AVAX','USDT','38.76','4.06','40.12','36.80','115300000'],
  ['LINK/USDT','LINK','USDT','17.36','2.41','18.02','16.82','92200000'],
];

function demoHashPassword(password) {
  return `demo:${Buffer.from(password, 'utf8').toString('base64')}`;
}

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@novax.demo' },
    update: {},
    create: {
      uid: '90000001',
      email: 'admin@novax.demo',
      passwordHash: demoHashPassword('Admin123456'),
      country: 'US',
      language: 'en',
      role: 'ADMIN',
      kycStatus: 'APPROVED',
      accountStatus: 'ACTIVE',
      riskLevel: 'LOW',
      termsAcceptedAt: new Date(),
    },
  });

  for (const asset of ['USDT','BTC','ETH','SOL','BNB']) {
    await prisma.assetBalance.upsert({
      where: { userId_asset: { userId: admin.id, asset } },
      update: {},
      create: { userId: admin.id, asset, available: new Prisma.Decimal(asset === 'USDT' ? '100000' : '10'), frozen: new Prisma.Decimal(0) },
    });
  }

  for (let i = 0; i < pairs.length; i++) {
    const [symbol, baseAsset, quoteAsset, latestPrice, change24h, high24h, low24h, volume24h] = pairs[i];
    await prisma.marketPair.upsert({
      where: { symbol },
      update: { latestPrice, change24h, high24h, low24h, volume24h, sortOrder: i, isActive: true },
      create: { symbol, baseAsset, quoteAsset, latestPrice, change24h, high24h, low24h, volume24h, sortOrder: i, isActive: true },
    });
    await prisma.coin.upsert({
      where: { symbol: baseAsset },
      update: { latestPrice, change24h, isActive: true },
      create: { symbol: baseAsset, name: baseAsset, latestPrice, change24h, description: `${baseAsset} demo asset`, isActive: true },
    });
  }

  await prisma.coin.upsert({
    where: { symbol: 'USDT' },
    update: { latestPrice: '1', change24h: '0', isActive: true },
    create: { symbol: 'USDT', name: 'Tether USD', latestPrice: '1', change24h: '0', description: 'Demo quote asset', isActive: true },
  });

  const settings = [
    ['siteName', 'NovaX Pro'],
    ['logoUrl', ''],
    ['customerServiceUrl', '#'],
  ];
  for (const [key, value] of settings) {
    await prisma.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }

  console.log('Seed completed.');
}

main().finally(async () => prisma.$disconnect());
