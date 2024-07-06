import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { FileManagementService } from 'services';
import { SkeletonLoaderComponent } from '../skeleton-loader';

@Pipe({
	standalone: true,
	name: 'fileSize',
})
export class FileSizePipe implements PipeTransform {

	transform(size: number, ...args: unknown[]): string {
		if (size < 1024) return size + ' bytes';
		else if (size < 1048576) return (size / 1024).toFixed(1) + ' KB';
		else return (size / 1048576).toFixed(1) + ' MB';
	}

}



@Component({
	selector: 'file-manager',
	standalone: true,
	imports: [CommonModule, FileSizePipe, SkeletonLoaderComponent],
	templateUrl: './file-manager.component.html',
	styleUrl: './file-manager.component.scss',
	providers: [FileManagementService],
})
export class FileManagerComponent {

	dragIndex: number | null = null;
	fileManagementService = inject(FileManagementService);

	@Input() acceptFileTypes = '*';
	@Input() maxFileNumber = 6;
	@Input() currentFileNumber = 0;

	isDragOver = signal(false);

	onDragOver(event: DragEvent): void {
		event.stopPropagation();
		event.preventDefault();
		this.isDragOver.set(true);
	}

	onDragLeave(event: DragEvent): void {
		event.stopPropagation();
		event.preventDefault();
		this.isDragOver.set(false);
	}

	listOnDragLeave(event: DragEvent) {
		// console.log($event);
	}
	listOnDragOver(event: DragEvent) {
		event.preventDefault();
		event.stopPropagation();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
	}
	listOnDrop(event: DragEvent, dropIndex: number) {
		event.preventDefault();
		event.stopPropagation();
		const dragIndex = this.dragIndex;

		if (dragIndex !== null && dragIndex !== dropIndex) {
			const files = this.fileManagementService.files();
			const [reorderedItem] = files.splice(dragIndex, 1);
			files.splice(dropIndex, 0, reorderedItem);

			// Update the service with the new order
			files.forEach((file, index) => {
				this.fileManagementService.reorderFiles(file.blob, index);
			});
		}

		this.dragIndex = null;
	}

	listOnDragStart(event: DragEvent, index: number) {
		this.dragIndex = index;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/plain', index.toString());
		}
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
				return 'assets/images/image-icon.png'; // Path to your image icon
			case 'pdf':
				return 'assets/images/pdf-icon.png'; // Path to your PDF icon
			// Add more cases as needed
			default:
				return 'assets/images/file-icon.png'; // Generic file icon
		}
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

}
