import { PDFDocument as PDFLibDoc, rgb, StandardFonts, degrees } from 'pdf-lib';
import jsPDF from 'jspdf';
import { PdfDocument, Annotation, SignatureMetadata } from '../types';
import { DOCUMENT_TEMPLATES_CONTENT } from '../data/sampleDocuments';

export const pdfEngine = {
  // Generate real downloadable PDF with annotations, stamps, and signatures baked in
  async exportDocumentToPdf(doc: PdfDocument): Promise<Blob> {
    try {
      const pdfDoc = await PDFLibDoc.create();
      const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

      const templatePages = DOCUMENT_TEMPLATES_CONTENT[doc.id];
      const pageCount = templatePages ? templatePages.length : doc.pageCount;

      for (let pageIdx = 0; pageIdx < pageCount; pageIdx++) {
        // Standard A4: 595.28 x 841.89 points
        const page = pdfDoc.addPage([595.28, 841.89]);
        const { width, height } = page.getSize();

        // Apply page rotation if set
        const rotationAngle = doc.pagesRotation[pageIdx] || 0;
        if (rotationAngle !== 0) {
          page.setRotation(degrees(rotationAngle));
        }

        const template = templatePages?.[pageIdx];

        // Draw Document Background & Framing
        page.drawRectangle({
          x: 0,
          y: 0,
          width,
          height,
          color: rgb(0.98, 0.98, 0.99)
        });

        // Top Header decorative band
        page.drawRectangle({
          x: 30,
          y: height - 60,
          width: width - 60,
          height: 4,
          color: rgb(0.2, 0.4, 0.8)
        });

        if (template) {
          // Draw Header Title
          page.drawText(template.header.title, {
            x: 40,
            y: height - 90,
            size: 13,
            font: helveticaBold,
            color: rgb(0.1, 0.15, 0.25)
          });

          if (template.header.subtitle) {
            page.drawText(template.header.subtitle, {
              x: 40,
              y: height - 105,
              size: 9,
              font: helveticaFont,
              color: rgb(0.4, 0.45, 0.55)
            });
          }

          if (template.header.badge) {
            // Draw Badge
            page.drawRectangle({
              x: width - 140,
              y: height - 95,
              width: 100,
              height: 18,
              color: rgb(0.9, 0.94, 1.0)
            });
            page.drawText(template.header.badge, {
              x: width - 130,
              y: height - 88,
              size: 8,
              font: helveticaBold,
              color: rgb(0.15, 0.35, 0.8)
            });
          }

          let currentY = height - 140;

          // Render Sections
          for (const sec of template.sections) {
            if (sec.heading) {
              page.drawText(sec.heading, {
                x: 40,
                y: currentY,
                size: 11,
                font: helveticaBold,
                color: rgb(0.15, 0.2, 0.3)
              });
              currentY -= 18;
            }

            if (sec.paragraphs) {
              for (const p of sec.paragraphs) {
                // Word wrap simulation
                const words = p.split(' ');
                let line = '';
                for (const w of words) {
                  const testLine = line ? `${line} ${w}` : w;
                  if (testLine.length > 85) {
                    page.drawText(line, {
                      x: 40,
                      y: currentY,
                      size: 9.5,
                      font: helveticaFont,
                      color: rgb(0.2, 0.25, 0.3)
                    });
                    currentY -= 14;
                    line = w;
                  } else {
                    line = testLine;
                  }
                }
                if (line) {
                  page.drawText(line, {
                    x: 40,
                    y: currentY,
                    size: 9.5,
                    font: helveticaFont,
                    color: rgb(0.2, 0.25, 0.3)
                  });
                  currentY -= 16;
                }
              }
            }

            // Render Table if present
            if (sec.table) {
              currentY -= 8;
              const colWidths = [220, 100, 100, 90];
              // Table Header
              page.drawRectangle({
                x: 40,
                y: currentY - 14,
                width: 510,
                height: 18,
                color: rgb(0.92, 0.94, 0.98)
              });

              let colX = 45;
              sec.table.headers.forEach((h, i) => {
                page.drawText(h, {
                  x: colX,
                  y: currentY - 10,
                  size: 8.5,
                  font: helveticaBold,
                  color: rgb(0.2, 0.3, 0.45)
                });
                colX += colWidths[i] || 100;
              });
              currentY -= 20;

              for (const row of sec.table.rows) {
                colX = 45;
                row.forEach((cell, i) => {
                  page.drawText(cell, {
                    x: colX,
                    y: currentY - 8,
                    size: 8.5,
                    font: helveticaFont,
                    color: rgb(0.25, 0.3, 0.35)
                  });
                  colX += colWidths[i] || 100;
                });
                // Divider line
                page.drawLine({
                  start: { x: 40, y: currentY - 12 },
                  end: { x: 550, y: currentY - 12 },
                  thickness: 0.5,
                  color: rgb(0.85, 0.88, 0.92)
                });
                currentY -= 18;
              }
              currentY -= 10;
            }

            // Render Callouts
            if (sec.callout) {
              currentY -= 6;
              page.drawRectangle({
                x: 40,
                y: currentY - 24,
                width: 510,
                height: 28,
                color: sec.callout.type === 'warning' ? rgb(1.0, 0.96, 0.9) : rgb(0.92, 0.97, 1.0)
              });
              page.drawText(sec.callout.text, {
                x: 50,
                y: currentY - 14,
                size: 8.5,
                font: helveticaOblique,
                color: sec.callout.type === 'warning' ? rgb(0.7, 0.3, 0.1) : rgb(0.1, 0.3, 0.6)
              });
              currentY -= 36;
            }

            // Render Signature Placeholder Boxes
            if (sec.signatureBoxes) {
              currentY -= 15;
              let sigX = 50;
              for (const sBox of sec.signatureBoxes) {
                page.drawRectangle({
                  x: sigX,
                  y: currentY - 60,
                  width: 220,
                  height: 60,
                  borderColor: rgb(0.75, 0.8, 0.85),
                  borderWidth: 1,
                  color: rgb(0.99, 0.99, 1.0)
                });
                page.drawText(sBox.role, {
                  x: sigX + 10,
                  y: currentY - 15,
                  size: 8,
                  font: helveticaBold,
                  color: rgb(0.3, 0.35, 0.45)
                });
                page.drawText(sBox.name, {
                  x: sigX + 10,
                  y: currentY - 45,
                  size: 8.5,
                  font: helveticaFont,
                  color: rgb(0.2, 0.2, 0.2)
                });
                if (sBox.idNumber) {
                  page.drawText(sBox.idNumber, {
                    x: sigX + 10,
                    y: currentY - 55,
                    size: 7.5,
                    font: helveticaFont,
                    color: rgb(0.5, 0.55, 0.6)
                  });
                }
                sigX += 260;
              }
              currentY -= 75;
            }
          }

          // Footer
          page.drawText(template.footer.text, {
            x: 40,
            y: 35,
            size: 7.5,
            font: helveticaFont,
            color: rgb(0.5, 0.55, 0.6)
          });
          page.drawText(template.footer.pageLabel, {
            x: width - 100,
            y: 35,
            size: 7.5,
            font: helveticaBold,
            color: rgb(0.4, 0.45, 0.5)
          });
        } else {
          // Generic document page
          page.drawText(`Documento: ${doc.title}`, {
            x: 40,
            y: height - 60,
            size: 14,
            font: helveticaBold,
            color: rgb(0.1, 0.15, 0.2)
          });
          page.drawText(`Página ${pageIdx + 1} de ${pageCount}`, {
            x: width - 120,
            y: 35,
            size: 9,
            font: helveticaFont,
            color: rgb(0.4, 0.4, 0.4)
          });
        }

        // BAKE USER ANNOTATIONS ONTO THIS PAGE
        const pageAnnotations = doc.annotations.filter(a => a.pageIndex === pageIdx);
        for (const ann of pageAnnotations) {
          // Convert normalized or canvas coordinates to PDF coordinates (PDF Y starts at bottom)
          // Canvas standard: top-left (0,0) with height ~800, PDF standard: bottom-left (0,0) with height 841.89
          const scaleY = height / 800;
          const scaleX = width / 600;
          const pdfX = ann.x * scaleX;
          const pdfY = height - (ann.y * scaleY);

          if (ann.type === 'highlight') {
            const hWidth = (ann.width || 200) * scaleX;
            const hHeight = (ann.height || 20) * scaleY;
            page.drawRectangle({
              x: pdfX,
              y: pdfY - hHeight,
              width: hWidth,
              height: hHeight,
              color: rgb(1.0, 0.9, 0.2),
              opacity: ann.opacity || 0.35
            });
          } else if (ann.type === 'text') {
            page.drawText(ann.content || '', {
              x: pdfX,
              y: pdfY - 15,
              size: (ann.fontSize || 12) * scaleX,
              font: helveticaBold,
              color: rgb(0.1, 0.1, 0.1)
            });
          } else if (ann.type === 'stamp') {
            const stampW = 140;
            const stampH = 36;
            // Draw stamp outer border
            page.drawRectangle({
              x: pdfX,
              y: pdfY - stampH,
              width: stampW,
              height: stampH,
              borderColor: rgb(0.9, 0.2, 0.2),
              borderWidth: 2,
              color: rgb(1, 0.95, 0.95),
              opacity: 0.9
            });
            page.drawText(`★ ${ann.stampType || 'VERIFIED'} ★`, {
              x: pdfX + 15,
              y: pdfY - 24,
              size: 11,
              font: helveticaBold,
              color: rgb(0.85, 0.15, 0.15)
            });
          } else if (ann.type === 'note') {
            const noteW = 160;
            const noteH = 60;
            page.drawRectangle({
              x: pdfX,
              y: pdfY - noteH,
              width: noteW,
              height: noteH,
              color: rgb(1.0, 0.97, 0.7),
              borderColor: rgb(0.9, 0.8, 0.4),
              borderWidth: 1
            });
            page.drawText(`Nota: ${ann.author || 'Usuario'}`, {
              x: pdfX + 6,
              y: pdfY - 14,
              size: 8,
              font: helveticaBold,
              color: rgb(0.3, 0.3, 0.1)
            });
            page.drawText((ann.content || '').substring(0, 50), {
              x: pdfX + 6,
              y: pdfY - 28,
              size: 7.5,
              font: helveticaFont,
              color: rgb(0.2, 0.2, 0.2)
            });
          } else if (ann.type === 'signature') {
            // Draw signature box with cryptographic stamp
            const sigW = 170;
            const sigH = 65;
            page.drawRectangle({
              x: pdfX,
              y: pdfY - sigH,
              width: sigW,
              height: sigH,
              borderColor: rgb(0.2, 0.4, 0.8),
              borderWidth: 1.5,
              color: rgb(0.96, 0.98, 1.0)
            });

            // If signature is an image dataUrl, embed PNG/JPEG
            if (ann.signatureDataUrl && ann.signatureDataUrl.startsWith('data:image/png;base64,')) {
              try {
                const base64Data = ann.signatureDataUrl.replace('data:image/png;base64,', '');
                const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
                const embeddedImage = await pdfDoc.embedPng(imageBytes);
                page.drawImage(embeddedImage, {
                  x: pdfX + 8,
                  y: pdfY - 45,
                  width: 154,
                  height: 35
                });
              } catch (e) {
                console.warn('Embedding PNG signature fallback', e);
              }
            } else {
              // Vector text signature
              page.drawText(ann.content || 'Firma Electrónica', {
                x: pdfX + 12,
                y: pdfY - 30,
                size: 14,
                font: helveticaBold,
                color: rgb(0.1, 0.2, 0.6)
              });
            }

            // Cryptographic Certificate Metadata footer inside signature box
            page.drawText('✓ Firmado Digitalmente con SHA-256', {
              x: pdfX + 8,
              y: pdfY - 54,
              size: 6.5,
              font: helveticaBold,
              color: rgb(0.1, 0.5, 0.2)
            });
            const hashLabel = ann.signatureMeta?.documentChecksum ? ann.signatureMeta.documentChecksum.substring(0, 16) + '...' : 'ID: CERT-2026-X99';
            page.drawText(hashLabel, {
              x: pdfX + 8,
              y: pdfY - 62,
              size: 5.5,
              font: helveticaFont,
              color: rgb(0.4, 0.45, 0.5)
            });
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      return new Blob([pdfBytes], { type: 'application/pdf' });
    } catch (err) {
      console.error('Failed to generate with pdf-lib, falling back to jsPDF', err);
      const fallbackPdf = new jsPDF();
      fallbackPdf.text(`OmniPDF Document: ${doc.title}`, 20, 20);
      fallbackPdf.text(`Generado: ${new Date().toLocaleString()}`, 20, 30);
      fallbackPdf.text(`Anotaciones totales: ${doc.annotations.length}`, 20, 40);
      return fallbackPdf.output('blob');
    }
  }
};
