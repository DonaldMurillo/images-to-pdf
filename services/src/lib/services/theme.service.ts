import { DOCUMENT } from '@angular/common';
import { computed, effect, inject, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {

	readonly #document = inject(DOCUMENT);
	readonly #localStorage = this.#document.defaultView?.localStorage;
	readonly #theme = signal(
		this.#localStorage?.getItem('theme') ??
		(this.#document.defaultView?.matchMedia && this.#document.defaultView?.matchMedia('(prefers-color-scheme: dark)').matches
			? 'dark'
			: this.#document.defaultView?.matchMedia && this.#document.defaultView?.matchMedia('(prefers-color-scheme: light)').matches
				? 'light'
				: '')
	);

	readonly theme = computed(() => this.#theme());
	constructor() {
		effect(() => {
			if (this.#theme() === 'dark') {
				this.#document.body.classList.add('dark');
				this.#localStorage?.setItem('theme', 'dark');
				this.#document.body.classList.remove('light');
			} else if (this.#theme() === 'light') {
				this.#document.body.classList.add('light');
				this.#localStorage?.setItem('theme', 'light');
				this.#document.body.classList.remove('dark');
			} else {
				this.#document.body.classList.remove('light');
				this.#document.body.classList.remove('dark');
				this.#localStorage?.removeItem('theme');
			}
		});
	}

	toggleTheme() {
		this.#theme.update((theme) => theme === 'dark' ? 'light' : 'dark');
	}
}