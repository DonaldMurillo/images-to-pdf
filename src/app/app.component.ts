import { Component, computed, inject } from '@angular/core';
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
  greetingMessage = "";

  readonly #themeService = inject(ThemeService);
  readonly #pdfService = inject(PdfGeneratorService);
  readonly #fileManagementService = inject(FileManagementService);
  readonly theme = this.#themeService.theme;
  readonly canCreate = computed(() => this.#fileManagementService.idle() && this.#fileManagementService.files().length > 0);
  readonly creatingPdf = this.#pdfService.creatingPdf;

  greet(event: SubmitEvent, name: string): void {
    event.preventDefault();

    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    invoke<string>("greet", { name }).then((text) => {
      this.greetingMessage = text;
    });
  }

  toggleTheme = () => this.#themeService.toggleTheme();

  createPDF() {
    this.#pdfService.generateAndDownloadPdf(this.#fileManagementService.blobs());
  }
}
