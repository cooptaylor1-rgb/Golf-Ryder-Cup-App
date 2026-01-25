/**
 * Push Notification Subscription API
 *
 * Stores push notification subscriptions for server-side notifications.
 * Uses Supabase for persistent storage in production.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { applyRateLimit } from '@/lib/utils/apiMiddleware';

interface PushSubscriptionData {
  endpoint: string;
  expirationTime?: number | null;
  keys: {
    p256dh: string;
    auth: string;
  };
}

interface SubscriptionRequest {
  subscription: PushSubscriptionData;
  userId?: string;
  tripId?: string;
}

// Rate limit config (10 requests per minute)
const RATE_LIMIT_CONFIG = {
  windowMs: 60 * 1000,
  maxRequests: 10,
};

// Supabase client for push subscriptions
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// In-memory fallback for local development when Supabase is not configured
const localSubscriptions = new Map<string, {
  subscription: PushSubscriptionData;
  userId?: string;
  tripId?: string;
  createdAt: string;
}>();

/**
 * Store subscription in Supabase (or fallback to memory)
 */
async function storeSubscription(
  endpoint: string,
  subscription: PushSubscriptionData,
  userId?: string,
  tripId?: string
): Promise<{ success: boolean; error?: string }> {
  if (supabaseUrl && supabaseServiceKey) {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        endpoint,
        p256dh_key: subscription.keys.p256dh,
        auth_key: subscription.keys.auth,
        expiration_time: subscription.expirationTime,
        user_id: userId || null,
        trip_id: tripId || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'endpoint',
      });

    if (error) {
      console.error('Supabase push subscription error:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  }

  // Local fallback
  localSubscriptions.set(endpoint, {
    subscription,
    userId,
    tripId,
    createdAt: new Date().toISOString(),
  });
  return { success: true };
}

/**
 * Remove subscription from Supabase (or fallback to memory)
 */
async function removeSubscription(endpoint: string): Promise<boolean> {
  if (supabaseUrl && supabaseServiceKey) {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint);

    return !error;
  }

  return localSubscriptions.delete(endpoint);
}

/**
 * POST /api/push/subscribe
 * Register a new push subscription
 */
export async function POST(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = applyRateLimit(request, RATE_LIMIT_CONFIG);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body: SubscriptionRequest = await request.json();

    if (!body.subscription || !body.subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription data' },
        { status: 400 }
      );
    }

    if (!body.subscription.keys?.p256dh || !body.subscription.keys?.auth) {
      return NextResponse.json(
        { error: 'Invalid subscription keys' },
        { status: 400 }
      );
    }

    const result = await storeSubscription(
      body.subscription.endpoint,
      body.subscription,
      body.userId,
      body.tripId
    );

    if (!result.success) {
      return NextResponse.json(
        { error: 'Failed to store subscription', details: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription registered successfully',
      storage: supabaseUrl ? 'cloud' : 'local',
    });
  } catch (error) {
    console.error('Push subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to register subscription' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/push/subscribe
 * Unregister a push subscription
 */
export async function DELETE(request: NextRequest) {
  // Apply rate limiting
  const rateLimitResponse = applyRateLimit(request, RATE_LIMIT_CONFIG);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body: { endpoint: string } = await request.json();

    if (!body.endpoint) {
      return NextResponse.json(
        { error: 'Endpoint required' },
        { status: 400 }
      );
    }

    const deleted = await removeSubscription(body.endpoint);

    return NextResponse.json({
      success: deleted,
      message: deleted ? 'Subscription removed' : 'Subscription not found',
    });
  } catch (error) {
    console.error('Push unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unregister subscription' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/push/subscribe
 * Get subscription count (for monitoring)
 */
export async function GET() {
  let count = 0;

  if (supabaseUrl && supabaseServiceKey) {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { count: dbCount } = await supabase
      .from('push_subscriptions')
      .select('*', { count: 'exact', head: true });
    count = dbCount || 0;
  } else {
    count = localSubscriptions.size;
  }

  return NextResponse.json({
    count,
    storage: supabaseUrl ? 'cloud' : 'local',
    message: 'Push notification service active',
  });
}
