import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'skeleton-loader',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './skeleton-loader.component.html',
	styleUrl: './skeleton-loader.component.scss',
	host: {
		'[style.width]': 'width()',
		'[style.height]': 'height()',
		'[style.borderRadius]': 'borderRadius()',
		'[class.skeleton-loader--circle]': 'shape() === "circle"',
		'[class.skeleton-loader--triangle]': 'shape() === "triangle"',
	}
})
export class SkeletonLoaderComponent {
	width = input('100%');
	height = input();
	borderRadius = input();
	shape = input<'rectangle' | 'circle' | 'triangle'>('rectangle');
}
