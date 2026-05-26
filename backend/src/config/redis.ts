import Redis from 'ioredis';

let redisClient: Redis | null = null;
let redisAvailable = false;

export async function connectRedis(): Promise<Redis | null> {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  const isTLS = url.startsWith('rediss://');

  try {
    const client = new Redis(url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      connectTimeout: 10000,
      retryStrategy: () => null, // don't retry on initial connect
      ...(isTLS && {
        tls: {
          rejectUnauthorized: false, // Redis Cloud uses self-signed certs
        },
      }),
    });

    // Attach error handler BEFORE connecting to prevent unhandled event
    client.on('error', () => {});

    await Promise.race([
      client.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), 5000)),
    ]);

    // Replace silent handler with a proper warn handler after successful connect
    client.removeAllListeners('error');
    client.on('error', (err) => console.warn('⚠️  Redis error:', err.message));

    redisClient = client;
    redisAvailable = true;
    console.log('✅ Redis connected');
    return client;
  } catch (err) {
    console.warn('⚠️  Redis unavailable — running without cache/queue (jobs will run synchronously)');
    redisAvailable = false;
    return null;
  }
}

export function getRedis(): Redis {
  if (!redisClient || !redisAvailable) {
    throw new Error('REDIS_UNAVAILABLE');
  }
  return redisClient;
}

export function isRedisAvailable(): boolean {
  return redisAvailable;
}
