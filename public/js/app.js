(() => {
  const dyJwt = document.querySelector('meta[property="dyapi:jwt"]').content;
  const dyUserId = document.querySelector('meta[property="dyapi:userid"]').content;
  const dySessionId = document.querySelector('meta[property="dyapi:sessionid"]').content;

  function callDY(path, body) {
    body.user = { id: dyUserId };
    body.sessionId = dySessionId;

    return fetch(`https://direct-collect.dy-api.com/v2${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${dyJwt}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-cache',
      body: JSON.stringify(body),
    });
  }

  async function dyVariationClick(event) {
    const container = event.target.closest('[data-dyapi-decision-id]');
    const variation = event.target.closest('[data-dyapi-variation-id]');
    variation.removeEventListener('click', dyVariationClick); // only count clicks once per pageview
    await callDY('/collect/user/engagement', {
      engagements: [
        {
          type: 'CLICK',
          decisionId: container.attributes['data-dyapi-decision-id'].value,
          variationId: [
            parseInt(variation.attributes['data-dyapi-variation-id'].value, 10),
          ],
        },
      ],
    });
  }

  async function dySlotClick(event) {
    const slot = event.target.closest('[data-dyapi-slot-id]');
    slot.removeEventListener('click', dySlotClick); // only count clicks once per pageview
    await callDY('/collect/user/engagement', {
      engagements: [
        {
          type: 'SLOT_CLICK',
          slotId: slot.attributes['data-dyapi-slot-id'].value,
        },
      ],
    });
  }

  async function addToCart(event) {
    const slot = event.target.closest('[data-sku]');
    event.target.classList.add('added-to-cart');
    await callDY('/collect/user/event', {
      events: [
        {
          name: 'Add to Cart',
          properties: {
            dyType: 'add-to-cart-v1',
            value: parseFloat(slot.attributes['data-price'].value),
            productId: slot.attributes['data-sku'].value,
          },
        },
      ],
    });
  }

  document
    .querySelectorAll('[data-dyapi-decision-id][data-dyapi-variation-id], [data-dyapi-decision-id] [data-dyapi-variation-id]')
    .forEach(slot => slot.addEventListener('click', dyVariationClick));

  document
    .querySelectorAll('[data-dyapi-decision-id][data-dyapi-slot-id], [data-dyapi-decision-id] [data-dyapi-slot-id]')
    .forEach(slot => slot.addEventListener('click', dySlotClick));

  document
    .querySelectorAll('[data-dyapi-decision-id] [data-dyapi-slot-id] .btn-app')
    .forEach(slot => slot.addEventListener('click', addToCart));
})();
