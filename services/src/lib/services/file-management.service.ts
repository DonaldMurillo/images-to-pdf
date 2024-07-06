import { DOCUMENT } from '@angular/common';
import { Injectable, Signal, computed, effect, inject, signal } from '@angular/core';

interface FileManagementState {
	files: {
		blob: File;
		previewUrl?: string;
		jobId?: string;
	}[];
	filesLoading: number[];
	idle: boolean;
}

@Injectable({
	providedIn: 'root'
})
export class FileManagementService {
	readonly #state = signal<FileManagementState>({
		files: [],
		filesLoading: [],
		idle: true
	});

	readonly #document = inject(DOCUMENT);

	files: Signal<FileManagementState['files']> = computed(() => this.#state().files);
	filesLoading: Signal<number[]> = computed(() => this.#state().filesLoading);
	idle: Signal<boolean> = computed(() => this.#state().idle);
	blobs: Signal<File[]> = computed(() => this.#state().files.map(f => f.blob));

	constructor() {
		// Example of using effect for side effects
		effect(() => {
			console.log('Files changed:', this.files());
		});
	}

	private getScaleFactor(fileSize: number): number {
		if (fileSize <= 1024 * 1024) return 1; // 1MB or less
		if (fileSize <= 4 * 1024 * 1024) return 0.75; // 4MB or less
		return 0.5; // Greater than 2MB
	}

	async handleFileInput(files: FileList, forceImageToWebp = false): Promise<void> {
		this.#state.update(state => ({
			...state,
			idle: false,
			filesLoading: Array.from({ length: files.length }, (_, i) => i)
		}));

		for (const file of Array.from(files)) {
			if (file.type.startsWith('image/') && (forceImageToWebp || file.size > 5 * 1024 * 1024)) {
				const compressedFile = await this.compressImage(file);
				const previewUrl = URL.createObjectURL(compressedFile);
				this.#state.update(state => ({
					...state,
					files: [...state.files, { blob: compressedFile, previewUrl }],
					filesLoading: state.filesLoading.slice(1)
				}));
			} else {
				const previewUrl = URL.createObjectURL(file);
				this.#state.update(state => ({
					...state,
					files: [...state.files, { blob: file, previewUrl }],
					filesLoading: state.filesLoading.slice(1)
				}));
			}
		}

		this.#state.update(state => ({ ...state, idle: true }));
	}

	private compressImage(file: File): Promise<File> {
		return new Promise((resolve, reject) => {
			if (!this.#document.defaultView) {
				reject('Please perform this in the browser');
				return;
			}

			const reader = new FileReader();
			reader.onload = (event: any) => {
				const img = new Image();
				img.src = event.target.result;
				img.onload = () => {
					const canvas = this.#document.createElement('canvas');
					const scaleFactor = this.getScaleFactor(file.size);
					canvas.width = img.width;
					canvas.height = img.height;
					const ctx = canvas.getContext('2d');
					ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
					ctx?.canvas.toBlob(
						(blob) => {
							if (!blob) return;
							const fileName = file.name.substring(0, file.name.lastIndexOf('.')) + '.webp';
							const newFile = new File([blob], fileName, {
								type: 'image/webp',
								lastModified: Date.now()
							});
							resolve(newFile);
						},
						'image/webp',
						scaleFactor
					);
				};
			};
			reader.onerror = error => reject(error);
			reader.readAsDataURL(file);
		});
	}

	removeFile(fileToRemove: File): void {
		this.#state.update(state => ({
			...state,
			files: state.files.filter(file => file.blob !== fileToRemove)
		}));
	}

	setIdle(idle: boolean): void {
		this.#state.update(state => ({ ...state, idle }));
	}
}