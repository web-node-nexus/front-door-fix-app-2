import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { api } from '../api/client';

function assertInvoiceHtml(html: string): void {
  const sample = html.slice(0, 400).toLowerCase();
  if (
    sample.includes('/login')
    || sample.includes('csrf-token')
    || sample.includes('sign in')
    || html.length < 200
  ) {
    throw new Error('Could not load invoice. Please login again and try after payment is completed.');
  }
}

async function shareFile(uri: string, invoiceNo: string, mimeType: string): Promise<void> {
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType,
      dialogTitle: `Invoice ${invoiceNo}`,
      UTI: mimeType === 'application/pdf' ? 'com.adobe.pdf' : 'public.html',
    });
    return;
  }

  Alert.alert('Invoice ready', `Invoice ${invoiceNo} has been generated.`);
}

async function shareHtmlFallback(html: string, invoiceNo: string): Promise<void> {
  const path = `${FileSystem.cacheDirectory}invoice-${invoiceNo}.html`;
  await FileSystem.writeAsStringAsync(path, html, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  await shareFile(path, invoiceNo, 'text/html');
}

export async function downloadBookingInvoice(bookingId: number): Promise<boolean> {
  try {
    const meta = await api.invoiceUrl(bookingId);
    const html = (meta.html || '').trim();
    if (!html) {
      throw new Error('Invoice content missing from server.');
    }
    assertInvoiceHtml(html);

    try {
      const pdf = await Print.printToFileAsync({
        html,
        base64: false,
      });
      await shareFile(pdf.uri, meta.invoice_no, 'application/pdf');
    } catch {
      // Android WebView PDF can fail on some devices — share HTML instead.
      await shareHtmlFallback(html, meta.invoice_no);
    }

    return true;
  } catch (e) {
    Alert.alert(
      'Invoice download failed',
      e instanceof Error ? e.message : 'Could not download invoice. Try again after payment is completed.',
    );
    return false;
  }
}
