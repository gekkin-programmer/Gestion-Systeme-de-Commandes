import PDFDocument from 'pdfkit';
import type { Order, OrderItem, Payment, Restaurant } from '@prisma/client';

type FullOrder = Order & {
  items: OrderItem[];
  payment: Payment | null;
  tableSession: {
    table: { number: number; label: string };
  };
};

export function generateReceiptPDF(
  order: FullOrder,
  restaurant: Restaurant,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ size: 'A5', margin: 40 });

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // ─── Header ───────────────────────────────────────────────────────────

    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .text(restaurant.name, { align: 'center' })
      .fontSize(10)
      .font('Helvetica')
      .text(restaurant.address ?? '', { align: 'center' })
      .text(restaurant.city ?? '', { align: 'center' })
      .moveDown();

    doc
      .moveTo(40, doc.y)
      .lineTo(doc.page.width - 40, doc.y)
      .stroke()
      .moveDown(0.5);

    // ─── Order Info ───────────────────────────────────────────────────────

    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(`REÇU DE COMMANDE`)
      .font('Helvetica')
      .fontSize(10)
      .text(`N° : ${order.orderNumber}`)
      .text(`Table : ${order.tableSession.table.label}`)
      .text(`Date : ${new Date(order.createdAt).toLocaleString('fr-FR')}`)
      .moveDown();

    doc
      .moveTo(40, doc.y)
      .lineTo(doc.page.width - 40, doc.y)
      .stroke()
      .moveDown(0.5);

    // ─── Items ────────────────────────────────────────────────────────────

    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Article', 40, doc.y, { continued: true, width: 200 });
    doc.text('Qté', 240, doc.y, { continued: true, width: 50, align: 'center' });
    doc.text('Prix unit.', 290, doc.y, { continued: true, width: 80, align: 'right' });
    doc.text('Total', 370, doc.y, { width: 80, align: 'right' });

    doc.font('Helvetica').moveDown(0.3);

    for (const item of order.items) {
      const subtotal = item.quantity * item.unitPrice;
      doc.text(item.itemNameFr, 40, doc.y, { continued: true, width: 200 });
      doc.text(`${item.quantity}`, 240, doc.y, { continued: true, width: 50, align: 'center' });
      doc.text(`${item.unitPrice.toLocaleString('fr-FR')} XAF`, 290, doc.y, { continued: true, width: 80, align: 'right' });
      doc.text(`${subtotal.toLocaleString('fr-FR')} XAF`, 370, doc.y, { width: 80, align: 'right' });
    }

    doc
      .moveDown(0.5)
      .moveTo(40, doc.y)
      .lineTo(doc.page.width - 40, doc.y)
      .stroke()
      .moveDown(0.5);

    // ─── Totals ───────────────────────────────────────────────────────────

    doc.fontSize(10);
    doc.text('Sous-total :', 40, doc.y, { continued: true, width: 320, align: 'right' });
    doc.text(`${order.subtotal.toLocaleString('fr-FR')} XAF`, 40, doc.y, { align: 'right' });

    if (order.taxAmount > 0) {
      doc.text('TVA (19.25%) :', 40, doc.y, { continued: true, width: 320, align: 'right' });
      doc.text(`${order.taxAmount.toLocaleString('fr-FR')} XAF`, 40, doc.y, { align: 'right' });
    }

    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .text('TOTAL :', 40, doc.y, { continued: true, width: 320, align: 'right' })
      .text(`${order.totalAmount.toLocaleString('fr-FR')} XAF`, 40, doc.y, { align: 'right' });

    // ─── Payment Info ─────────────────────────────────────────────────────

    if (order.payment) {
      doc.moveDown().font('Helvetica').fontSize(10);
      const methodLabels: Record<string, string> = {
        CASH: 'Espèces',
        MTN_MOBILE_MONEY: 'MTN Mobile Money',
        ORANGE_MONEY: 'Orange Money',
      };
      doc.text(`Paiement : ${methodLabels[order.payment.method] ?? order.payment.method}`);
      if (order.payment.transactionRef) {
        doc.text(`Réf : ${order.payment.transactionRef}`);
      }
    }

    // ─── Footer ───────────────────────────────────────────────────────────

    doc.moveDown(2).font('Helvetica').fontSize(9).text('Merci de votre visite !', { align: 'center' });

    doc.end();
  });
}
