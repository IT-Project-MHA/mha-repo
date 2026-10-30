/**
 * Shared PDF export for the My Health screens (Pain Profile, Health Tracking chart).
 * - pdfPage: wraps a page body in the common A4 layout (title row, footer, card styles)
 * - sharePdf: renders the html to a PDF, saves it to app storage and opens the share sheet
 */
import { Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';

/**
 * Builds a full A4 html page with the shared styling.
 * - title: heading at the top of the page
 * - footer: small text fixed to the bottom of each page
 * - body: the page's cards (html string)
 * - extraStyle: optional css added after the shared styles
 */
export function pdfPage({title, footer, body, extraStyle = ''}: {
  title: string; footer: string; body: string; extraStyle?: string;
}) {
  const generated = new Date().toLocaleString('en-AU', {timeZone: 'Australia/Sydney'});
  return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      /* A4 page with print margin; extra bottom margin for footer */
      @page {size: A4; margin: 18mm 16mm 10mm;}
      * {box-sizing: border-box;}
      body {
        font-family: -apple-system, Roboto, 'Helvetica Neue', Arial, sans-serif;
        color: #1a1a1a;
        font-size: 16px;
        line-height: 1.4;
        margin: 0;
      }
      h1 {font-size: 28px; margin: 0;}
      .title-row {display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 16px;}
      .generated {font-size: 14px; color: #666; text-align: right;}
      .card {
        border: 1px solid #e0e0e0;
        border-radius: 32px;
        padding: 16px 16px;
        margin-bottom: 26px;
        page-break-inside: avoid;
      }
      .card h2 {font-size: 18px; margin: 0 0 8px;}
      table {width: 100%; border-collapse: collapse;}
      td {padding: 4px 0; vertical-align: top;}
      td.label {width: 45%; color: #1a1a1a;}
      td.value {width: 55%; font-weight: 500;}
      .footer {
        position: fixed;
        left: 0; right: 0; bottom: 0;
        text-align: right;
        font-size: 14px;
        color: #666;
      }
      ${extraStyle}
    </style>
  </head>
  <body>
    <div class="footer">${footer}</div>
    <div class="title-row">
      <h1>${title}</h1>
      <span class="generated">Generated ${generated}</span>
    </div>
    ${body}
  </body>
</html>`;
}

/**
 * Renders html to an A4 PDF and opens the OS share window
 * - fileName: saved in the app's document directory, e.g. 'pain-profile.pdf'
 * - dialogTitle: title of the share sheet (Android)
 */
export async function sharePdf(html: string, fileName: string, dialogTitle: string) {
  try {
    // PDF in binary data
    const {base64} = await Print.printToFileAsync({
      // A4 dimensions
      html, width: 595, height: 842, base64: true,
    });
    if (!base64) {
      Alert.alert('Could not create PDF', 'No PDF data was produced.');
      return;
    }

    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Sharing unavailable', 'Sharing is not available on this device/platform (e.g. web).');
      return;
    }

    // Write the PDF into the app's private storage
    const dest = FileSystem.documentDirectory + fileName;
    await FileSystem.writeAsStringAsync(dest, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // open OS share interface
    await Sharing.shareAsync(dest, {
      mimeType: 'application/pdf',
      dialogTitle,
      UTI: 'com.adobe.pdf',
    });
  } catch (e: any) {
    console.log('failed to export pdf', fileName, e?.message);
    Alert.alert('Could not create PDF', String(e?.message ?? e));
  }
}
