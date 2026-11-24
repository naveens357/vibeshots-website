/** Small DOM helpers shared by the browser features. */
export const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
export const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];

/** Sets aria-pressed on each toggle button: true where `isOn` says so, false elsewhere. */
export const press = (buttons: Element[], isOn: (b: HTMLElement) => boolean) =>
  buttons.forEach((b) => b.setAttribute('aria-pressed', String(isOn(b as HTMLElement))));
