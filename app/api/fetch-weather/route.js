import * as cheerio from 'cheerio';
import { supabase } from '@/lib/supabase';

function toJstDateString(date = new Date()) {
  const jst = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  const y = jst.getFullYear();
  const m = String(jst.getMonth() + 1).padStart(2, '0');
  const d = String(jst.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function GET() {
  return handleFetchWeather();
}

export async function POST() {
  return handleFetchWeather();
}

async function handleFetchWeather() {
  try {
    const sourceUrl = 'https://weathernews.jp/onebox/tenki/tokyo/13116/';
    const areaName = '東京都豊島区';

    const response = await fetch(sourceUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
      cache: 'no-store',
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const rows = [];
    const baseDate = toJstDateString();

    $('tr').each((_, element) => {
      const cols = $(element).find('td');

      if (cols.length < 5) return;

      const target_hour = $(cols[0]).text().trim();

      // 見出し行や時刻形式でない行は除外
      if (target_hour.includes('時刻')) return;
      if (!target_hour.match(/^\d{1,2}時$/)) return;

      const temperature = $(cols[1]).text().trim();
      const wind_speed = $(cols[2]).text().trim();
      const precipitation = $(cols[4]).text().trim(); // 風向(cols[3])は飛ばす

      const target_date = baseDate;

      rows.push({
        area_name: areaName,
        target_date,
        target_hour,
        temperature,
        wind_speed,
        precipitation,
        source_url: sourceUrl,
      });
    });

    if (rows.length === 0) {
      return Response.json(
        {
          success: false,
          error: '天気データを取得できませんでした。HTML構造を確認してください。',
        },
        { status: 500 }
      );
    }

    const { data, error } = await supabase
      .from('weather_records')
      .upsert(rows, {
        onConflict: 'area_name,target_date,target_hour',
        ignoreDuplicates: false,
      })
      .select();

    if (error) {
      return Response.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      count: rows.length,
      data,
    });
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '不明なエラー',
      },
      { status: 500 }
    );
  }
}
