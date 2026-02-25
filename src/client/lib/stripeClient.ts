export type CheckoutParams = {
  snippetId: string | number
  amount: number
  quantity?: number
  email?: string
  successUrl?: string
  cancelUrl?: string
}

export async function startCheckout(params: CheckoutParams) {
  const res = await fetch('/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      snippetId: params.snippetId,
      amount: params.amount,
      quantity: params.quantity || 1,
      customerEmail: params.email,
      successUrl: params.successUrl,
      cancelUrl: params.cancelUrl,
    }),
  })
  const data = await res.json()
  if (data.url) {
    window.location.href = data.url
    return
  }
  throw new Error(data.error || 'Failed to create checkout session')
}

export type SubscriptionParams = {
  plan: 'monthly' | 'yearly'
  email?: string
  successUrl?: string
  cancelUrl?: string
}

export async function startSubscription(params: SubscriptionParams) {
  const res = await fetch('/create-subscription-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      plan: params.plan,
      customerEmail: params.email,
      successUrl: params.successUrl,
      cancelUrl: params.cancelUrl,
    }),
  })
  const data = await res.json()
  if (data.url) {
    window.location.href = data.url
    return
  }
  throw new Error(data.error || 'Failed to create subscription session')
}

export async function createCustomerPortalSession(params: { customerId?: string; email?: string; returnUrl?: string }) {
  const res = await fetch('/create-portal-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customerId: params.customerId, email: params.email, returnUrl: params.returnUrl }),
  })
  const data = await res.json()
  if (data.url) {
    window.location.href = data.url
    return
  }
  throw new Error(data.error || 'Failed to create portal session')
}
