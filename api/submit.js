import { NextResponse, NextRequest } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  const { email, utm_source, utm_campaign, utm_medium, referring_site, click_id, site } = JSON.parse(request.body);

  if (!email) {
    return NextResponse.json({ error: 'Email is missing' }, { status: 400 });
  }

  const beehiivPayload = {
    email,
    reactivate_existing: false,
    send_welcome_email: true,
    utm_source: utm_source || "test",
    utm_campaign: utm_campaign || "test",
    utm_medium: utm_medium || "test",
    referring_site: referring_site || "www.morningdownload.co",
    custom_fields: []
  };

  const ttGoldPayload = {
    click_id,
    email,
    site
  };

  try {
    const beehiivResponse = await axios.post('https://api.beehiiv.com/v2/publications/pub_3f751c04-b2a3-4d20-919d-d4f9392badd8/subscriptions', beehiivPayload, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${process.env.BEEHIIV_API_KEY}`,
        'Content-Type': 'application/json',
      }
    });

    const ttGoldResponse = await axios.post('https://tt.gold/send_conversion', ttGoldPayload, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (beehiivResponse.status === 200 && ttGoldResponse.status === 200) {
      return NextResponse.json({
        beehiiv: beehiivResponse.data,
        ttGold: { message: 'Conversion sent successfully' }
      });
    } else {
      return NextResponse.json({
        error: 'Failed to send data to one or both APIs',
        beehiiv_status_code: beehiivResponse.status,
        ttGold_status_code: ttGoldResponse.status
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'An error occurred', details: error.message }, { status: 500 });
  }
}