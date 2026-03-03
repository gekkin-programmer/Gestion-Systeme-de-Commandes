import QRCode from 'qrcode';

export async function generateQRCodeDataUrl(url: string): Promise<string> {
  return QRCode.toDataURL(url, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 400,
    color: { dark: '#1a1a1a', light: '#ffffff' },
  });
}

export async function generateQRCodeBuffer(url: string): Promise<Buffer> {
  return QRCode.toBuffer(url, {
    type: 'png',
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 400,
  });
}

export function buildMenuUrl(
  baseUrl: string,
  locale: string,
  restaurantSlug: string,
  tableToken: string,
): string {
  return `${baseUrl}/${locale}/menu/${restaurantSlug}/${tableToken}`;
}
