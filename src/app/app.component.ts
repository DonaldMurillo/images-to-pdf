import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { invoke } from "@tauri-apps/api/tauri";
import { FileManagementService, PdfGeneratorService, ThemeService } from 'services';
import { FileManagerComponent } from 'components';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FileManagerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  readonly #themeService = inject(ThemeService);
  readonly #pdfService = inject(PdfGeneratorService);
  readonly #fileManagementService = inject(FileManagementService);
  readonly theme = this.#themeService.theme;
  readonly canCreate = computed(() => this.#fileManagementService.idle() && this.#fileManagementService.files().length > 0);
  readonly creatingPdf = this.#pdfService.creatingPdf;
  readonly isWeb = signal<boolean | undefined>(undefined)

  constructor() {

    invoke<string>("greet", { name: 'angular' }).then((text) => {
      this.isWeb.set(false)
    }).catch(() => {
      this.isWeb.set(true)
    });
  }

  toggleTheme = () => this.#themeService.toggleTheme();

  createPDF() {
    this.#pdfService.generateAndDownloadPdf(this.#fileManagementService.blobs());
  }
}
