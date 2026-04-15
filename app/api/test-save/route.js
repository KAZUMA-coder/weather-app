import { supabase } from '@/lib/supabase';

export async function POST() {
  const { data, error } = await supabase.from('weather_records').insert([
    {
      area_name: '東京都港区',
      target_hour: '15:00',
      temperature: '20',
      wind_speed: '3',
      precipitation: '0',
      source_url: 'https://weathernews.jp/',
    },
  ]);

  if (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }

  return Response.json({ success: true, data });
}