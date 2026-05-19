import Stripe from 'https://esm.sh/stripe@14?target=deno&no-check';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const PLANOS_POR_PRICE: Record<string, string> = {
  'price_1TWi5aR4CkMID6QWkobkxPkD': 'starter',
  'price_1TWi9XR4CkMID6QW6Kbs1JbW': 'pro',
  'price_1TWiB1R4CkMID6QWeIeUtuzf': 'enterprise',
};

Deno.serve(async (req) => {
  const body = await req.text();
  const sig  = req.headers.get('stripe-signature') ?? '';

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
    apiVersion: '2024-06-20',
    httpClient: Stripe.createFetchHttpClient(),
  });

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      sig,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!,
    );
  } catch (err) {
    return new Response(`Webhook Error: ${(err as Error).message}`, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  // Pagamento confirmado → ativa o plano
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const perfilId   = session.metadata?.perfil_id;
    const plano      = session.metadata?.plano;
    const subId      = session.subscription as string;

    if (perfilId && plano) {
      await supabase
        .from('barbearia_perfis')
        .update({ plano_saas: plano, stripe_subscription_id: subId })
        .eq('id', perfilId);
    }
  }

  // Assinatura cancelada → remove o plano
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription;
    await supabase
      .from('barbearia_perfis')
      .update({ plano_saas: null, stripe_subscription_id: null })
      .eq('stripe_subscription_id', sub.id);
  }

  // Upgrade/downgrade de plano
  if (event.type === 'customer.subscription.updated') {
    const sub      = event.data.object as Stripe.Subscription;
    const priceId  = sub.items.data[0]?.price.id;
    const novoPlano = PLANOS_POR_PRICE[priceId];
    if (novoPlano) {
      await supabase
        .from('barbearia_perfis')
        .update({ plano_saas: novoPlano })
        .eq('stripe_subscription_id', sub.id);
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
