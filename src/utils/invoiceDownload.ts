import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';
import { api } from '../api/client';

export async function downloadBookingInvoice(bookingId: number): Promise<boolean> {
  try {
    const [meta, html] = await Promise.all([
      api.invoiceUrl(bookingId),
      api.invoiceHtml(bookingId),
    ]);

    const pdf = await Print.printToFileAsync({
      html,
      base64: false,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(pdf.uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Invoice ${meta.invoice_no}`,
        UTI: 'com.adobe.pdf',
      });
    } else {
      Alert.alert('Invoice ready', `Invoice ${meta.invoice_no} has been generated.`);
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
