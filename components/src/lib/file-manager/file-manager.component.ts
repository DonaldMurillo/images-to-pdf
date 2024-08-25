import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { FileManagementService } from 'services';
import { SkeletonLoaderComponent } from '../skeleton-loader';
import { CdkDragDrop, moveItemInArray, DragDropModule } from '@angular/cdk/drag-drop';

@Pipe({
	standalone: true,
	name: 'fileSize',
})
export class FileSizePipe implements PipeTransform {
	transform(size: number): string {
		if (size < 1024) return size + ' bytes';
		else if (size < 1048576) return (size / 1024).toFixed(1) + ' KB';
		else return (size / 1048576).toFixed(1) + ' MB';
	}
}

@Component({
	selector: 'file-manager',
	standalone: true,
	imports: [CommonModule, FileSizePipe, SkeletonLoaderComponent, DragDropModule],
	templateUrl: './file-manager.component.html',
	styleUrl: './file-manager.component.scss',
})
export class FileManagerComponent {
	fileManagementService = inject(FileManagementService);

	@Input() acceptFileTypes = '*';
	@Input() maxFileNumber = 6;
	@Input() currentFileNumber = 0;

	isDragOver = signal(false);

	onDragOver(event: DragEvent): void {
		event.preventDefault();
		this.isDragOver.set(true);
	}

	onDragLeave(event: DragEvent): void {
		event.preventDefault();
		this.isDragOver.set(false);
	}

	async onDrop(event: DragEvent) {
		event.preventDefault();
		this.isDragOver.set(false);
		if (!event.dataTransfer) return;
		await this.fileManagementService.handleFileInput(event.dataTransfer.files);
	}

	async onFileChange(event: any) {
		await this.fileManagementService.handleFileInput(event.target.files);
	}

	removeFile(fileToRemove: File): void {
		this.fileManagementService.removeFile(fileToRemove);
	}

	getFileIcon(fileName: string): string {
		const extension = fileName.split('.').pop()?.toLowerCase();
		switch (extension) {
			case 'jpg':
			case 'jpeg':
			case 'png':
				return 'assets/images/image-icon.png';
			case 'pdf':
				return 'assets/images/pdf-icon.png';
			default:
				return 'assets/images/file-icon.png';
		}
	}

	onFileListDrop(event: CdkDragDrop<File[]>) {
		const files = this.fileManagementService.files();
		moveItemInArray(files, event.previousIndex, event.currentIndex);
		files.forEach((file, index) => {
			this.fileManagementService.reorderFiles(file.blob, index);
		});
	}
}