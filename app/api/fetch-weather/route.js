import * as cheerio from 'cheerio';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    const sourceUrl = 'https://weathernews.jp/onebox/tenki/tokyo/13116/';

    const response = await fetch(sourceUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      cache: 'no-store',
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const rows = [];

    $('tr').each((_, element) => {
      const cols = $(element).find('td');

      if (cols.length >= 4) {
        const target_hour = $(cols[0]).text().trim();
        if (target_hour.includes('時刻')) return;
        const temperature = $(cols[1]).text().trim();
        const wind_speed = $(cols[2]).text().trim();
        const precipitation = $(cols[3]).text().trim();

        if (target_hour && temperature && wind_speed && precipitation) {
          rows.push({
            area_name: '東京都港区',
            target_hour,
            temperature,
            wind_speed,
            precipitation,
            source_url: sourceUrl,
          });
        }
      }
    });

    if (rows.length === 0) {
      return Response.json(
        { success: false, error: '天気データを取得できませんでした。HTML構造を確認してください。' },
        { status: 500 }
      );
    }

    const { data, error } = await supabase.from('weather_records').insert(rows);

    if (error) {
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, count: rows.length, data });
  } catch (error) {
    return Response.json(
      { success: false, error: error instanceof Error ? error.message : '不明なエラー' },
      { status: 500 }
    );
  }
}