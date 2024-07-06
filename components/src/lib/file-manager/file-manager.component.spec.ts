import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultiFileUploaderComponent } from './multi-file-uploader.component';

describe('MultiFileUploaderComponent', () => {
	let component: MultiFileUploaderComponent;
	let fixture: ComponentFixture<MultiFileUploaderComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [MultiFileUploaderComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(MultiFileUploaderComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
