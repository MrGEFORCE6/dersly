import { ImageResponse } from 'next/og';

export const alt = 'Dersly | Özel Ders ve Öğrenci Yönetim Platformu';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0F172A',
          backgroundImage: 'radial-gradient(circle at 25px 25px, #1e293b 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1e293b 2%, transparent 0%)',
          backgroundSize: '100px 100px',
          padding: '40px 60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '32px',
              fontWeight: 'bold',
            }}
          >
            🎓
          </div>
          <span
            style={{
              fontSize: '48px',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-1px',
            }}
          >
            Dersly
          </span>
          <span
            style={{
              fontSize: '18px',
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              color: '#818cf8',
              border: '1px solid rgba(99, 102, 241, 0.4)',
              marginLeft: '8px',
            }}
          >
            PRO
          </span>
        </div>

        <div
          style={{
            fontSize: '52px',
            fontWeight: 800,
            color: '#f8fafc',
            textAlign: 'center',
            maxWidth: '1000px',
            lineHeight: 1.2,
            marginBottom: '24px',
            letterSpacing: '-0.5px',
          }}
        >
          Özel Ders ve Öğrenci Yönetiminde Yeni Standart
        </div>

        <div
          style={{
            fontSize: '24px',
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '900px',
            lineHeight: 1.4,
            marginBottom: '40px',
          }}
        >
          Öğretmenler ve öğrenciler için şeffaf ders takibi, ödev yönetimi, akıllı kütüphane ve TYT/AYT net analizi.
        </div>

        <div
          style={{
            display: 'flex',
            gap: '32px',
            fontSize: '18px',
            color: '#cbd5e1',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#10b981' }}>✓</span> Banka Düzeyinde Veri İzolasyonu
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#10b981' }}>✓</span> Anlık ve Güvenli Veri Akışı
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#10b981' }}>✓</span> Güvenilir ve Kesintisiz Altyapı
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
