import Stripe from 'https://esm.sh/stripe@14?target=deno&no-check';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const PRICE_IDS: Record<string, string> = {
  starter:    'price_1TWi5aR4CkMID6QWkobkxPkD',
  pro:        'price_1TWi9XR4CkMID6QW6Kbs1JbW',
  enterprise: 'price_1TWiB1R4CkMID6QWeleIUtuzf',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Não autorizado');

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2024-06-20',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) throw new Error('Usuário não autenticado');

    const { data: perfil } = await supabase
      .from('barbearia_perfis')
      .select('id, nome, email, stripe_customer_id')
      .eq('auth_user_id', user.id)
      .single();

    if (!perfil) throw new Error('Perfil não encontrado');

    const { plano } = await req.json();
    const priceId = PRICE_IDS[plano];
    if (!priceId) throw new Error('Plano inválido');

    // Cria ou reutiliza o customer no Stripe
    let customerId: string = perfil.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: perfil.email || user.email,
        name: perfil.nome,
        metadata: { supabase_user_id: user.id, perfil_id: String(perfil.id) },
      });
      customerId = customer.id;
      await supabase
        .from('barbearia_perfis')
        .update({ stripe_customer_id: customerId })
        .eq('id', perfil.id);
    }

    const origin = req.headers.get('origin') || 'https://barberflow.vercel.app';

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}?checkout=sucesso`,
      cancel_url:  `${origin}?checkout=cancelado`,
      locale: 'pt-BR',
      metadata: { perfil_id: String(perfil.id), plano },
      subscription_data: {
        metadata: { perfil_id: String(perfil.id), plano },
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
