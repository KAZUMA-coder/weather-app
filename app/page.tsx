'use client';

import { useEffect, useState } from 'react';

type WeatherRecord = {
  id: number;
  target_hour: string;
  temperature: string;
  wind_speed: string;
  precipitation: string;
  fetched_at: string;
};

type RecordsApiResponse = {
  success: boolean;
  data?: WeatherRecord[];
  error?: string;
};

type FetchWeatherApiResponse = {
  success: boolean;
  count?: number;
  error?: string;
};

export default function Home() {
  const [message, setMessage] = useState<string>('');
  const [records, setRecords] = useState<WeatherRecord[]>([]);

  const fetchRecords = async () => {
    const res = await fetch('/api/records');
    const result: RecordsApiResponse = await res.json();

    if (result.success && result.data) {
      setRecords(result.data);
    } else if (!result.success && result.error) {
      setMessage('エラー: ' + result.error);
    }
  };

  const handleFetchWeather = async () => {
    setMessage('Weathernews から取得して保存中...');

    const res = await fetch('/api/fetch-weather', {
      method: 'POST',
    });

    const result: FetchWeatherApiResponse = await res.json();

    if (result.success) {
      setMessage(`${result.count ?? 0}件のデータを保存しました`);
      fetchRecords();
    } else {
      setMessage('エラー: ' + (result.error ?? '不明なエラー'));
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const latest23Records = records.slice(0, 23);
  const latest100Records = records.slice(0, 100);

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <h1 style={styles.title}>天気データ保存サイト</h1>
        <p style={styles.subtitle}>
          東京都豊島区の1時間ごとの気温・風速・降水量を取得し、
          データベースに保存して一覧表示するサイトです。
        </p>
      </section>

      <section style={styles.card}>
        <div style={styles.infoRow}>
          <div>
            <p style={styles.label}>対象地域</p>
            <p style={styles.value}>東京都豊島区</p>
          </div>

          <button onClick={handleFetchWeather} style={styles.button}>
            最新データ取得
          </button>
        </div>

        <div style={styles.messageBox}>
          <span
            style={{
              ...styles.message,
              color: message.startsWith('エラー') ? '#dc2626' : '#111827',
            }}
          >
            {message || 'ここに取得結果が表示されます'}
          </span>
        </div>
      </section>

      <section style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>最新23件</h2>
          <p style={styles.tableCount}>表示件数: {latest23Records.length} / 23件</p>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>時刻</th>
                <th style={styles.th}>気温 (℃)</th>
                <th style={styles.th}>風速 (m/s)</th>
                <th style={styles.th}>降水量 (mm/h)</th>
                <th style={styles.th}>取得日時</th>
              </tr>
            </thead>
            <tbody>
              {latest23Records.length > 0 ? (
                latest23Records.map((record) => (
                  <tr key={record.id}>
                    <td style={styles.td}>{record.target_hour}</td>
                    <td style={styles.td}>{record.temperature}</td>
                    <td style={styles.td}>{record.wind_speed}</td>
                    <td style={styles.td}>{record.precipitation}</td>
                    <td style={styles.td}>
                      {new Date(record.fetched_at).toLocaleString('ja-JP')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td style={styles.emptyTd} colSpan={5}>
                    まだデータがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>保存済みデータ一覧</h2>
          <p style={styles.tableCount}>表示件数: {latest100Records.length} / 最大100件</p>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>時刻</th>
                <th style={styles.th}>気温 (℃)</th>
                <th style={styles.th}>風速 (m/s)</th>
                <th style={styles.th}>降水量 (mm/h)</th>
                <th style={styles.th}>取得日時</th>
              </tr>
            </thead>
            <tbody>
              {latest100Records.length > 0 ? (
                latest100Records.map((record) => (
                  <tr key={record.id}>
                    <td style={styles.td}>{record.target_hour}</td>
                    <td style={styles.td}>{record.temperature}</td>
                    <td style={styles.td}>{record.wind_speed}</td>
                    <td style={styles.td}>{record.precipitation}</td>
                    <td style={styles.td}>
                      {new Date(record.fetched_at).toLocaleString('ja-JP')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td style={styles.emptyTd} colSpan={5}>
                    まだデータがありません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    padding: '40px 20px 60px',
    fontFamily:
      'Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
    color: '#111827',
  },
  hero: {
    maxWidth: '1100px',
    margin: '0 auto 24px',
    textAlign: 'center',
  },
  title: {
    margin: '0 0 16px 0',
    fontSize: '46px',
    fontWeight: 800,
    lineHeight: 1.2,
  },
  subtitle: {
    margin: '0 auto',
    fontSize: '18px',
    color: '#4b5563',
    lineHeight: 1.7,
    maxWidth: '760px',
  },
  card: {
    maxWidth: '1100px',
    margin: '0 auto 24px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  label: {
    margin: '0 0 6px 0',
    fontSize: '14px',
    color: '#6b7280',
  },
  value: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 700,
  },
  button: {
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '14px 22px',
    fontSize: '16px',
    fontWeight: 700,
    cursor: 'pointer',
  },
  messageBox: {
    marginTop: '18px',
    padding: '14px 16px',
    backgroundColor: '#f9fafb',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
  },
  message: {
    fontSize: '15px',
    fontWeight: 600,
  },
  tableCard: {
    maxWidth: '1100px',
    margin: '0 auto 24px',
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 8px 24px rgba(15, 23, 42, 0.08)',
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
  tableTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 700,
  },
  tableCount: {
    margin: 0,
    fontSize: '14px',
    color: '#6b7280',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    minWidth: '760px',
  },
  th: {
    textAlign: 'left',
    padding: '14px',
    backgroundColor: '#eff6ff',
    borderBottom: '2px solid #dbeafe',
    fontSize: '15px',
  },
  td: {
    padding: '14px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '15px',
  },
  emptyTd: {
    padding: '24px',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '15px',
  },
};