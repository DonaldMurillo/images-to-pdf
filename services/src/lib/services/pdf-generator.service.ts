import { computed, Injectable, signal } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root',
})
export class PdfGeneratorService {
  private readonly MAX_IMAGE_SIZE = 2000; // Maximum width or height in pixels

  readonly #creating = signal(false);
  readonly creatingPdf = computed(() => this.#creating());

  async createPdfFromImages(imageBlobs: Blob[]): Promise<Blob> {
    const pdf = new jsPDF();

    for (let i = 0; i < imageBlobs.length; i++) {
      const blob = imageBlobs[i];

      if (i > 0) {
        pdf.addPage();
      }

      const imgData = await this.processImage(blob);

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const scale = Math.min(pageWidth / imgData.width, pageHeight / imgData.height);
      const scaledWidth = imgData.width * scale;
      const scaledHeight = imgData.height * scale;

      const x = (pageWidth - scaledWidth) / 2;
      const y = (pageHeight - scaledHeight) / 2;

      pdf.addImage(imgData.dataUrl, imgData.format, x, y, scaledWidth, scaledHeight);
    }

    return pdf.output('blob');
  }

  private async processImage(blob: Blob): Promise<{ dataUrl: string; width: number; height: number; format: string }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const { width, height } = this.calculateAspectRatioFit(img.width, img.height, this.MAX_IMAGE_SIZE, this.MAX_IMAGE_SIZE);

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        let format: string;
        let mimeType: string;

        switch (blob.type) {
          case 'image/png':
            format = 'PNG';
            mimeType = 'image/png';
            break;
          case 'image/webp':
            format = 'WEBP';
            mimeType = 'image/webp';
            break;
          default:
            format = 'JPEG';
            mimeType = 'image/jpeg';
        }

        resolve({
          dataUrl: canvas.toDataURL(mimeType, 0.85),
          width,
          height,
          format
        });
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  }

  private calculateAspectRatioFit(srcWidth: number, srcHeight: number, maxWidth: number, maxHeight: number) {
    const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);
    return { width: srcWidth * ratio, height: srcHeight * ratio };
  }

  async generateAndDownloadPdf(imageBlobs: Blob[], fileName = 'images.pdf'): Promise<void> {
    this.#creating.set(true);
    try {
      const pdfBlob = await this.createPdfFromImages(imageBlobs);
      this.downloadPdf(pdfBlob, fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    } finally {
      this.#creating.set(false);
    }
  }

  private downloadPdf(pdfBlob: Blob, fileName: string): void {
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
