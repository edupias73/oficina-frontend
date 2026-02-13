import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appFocusNext]', // <--- O nome que vamos usar no HTML
  standalone: true,
})
export class FocusNextDirective {
  @HostListener('keydown.enter', ['$event'])
  onEnter(event: any) {
    // 1. Pega quem disparou o evento (o input atual)
    const target = event.target as HTMLElement;

    // 2. Só funciona se for INPUT ou SELECT
    if (target.tagName === 'INPUT' || target.tagName === 'SELECT') {
      event.preventDefault(); // Impede de enviar o formulário (comportamento padrão)

      // 3. Procura todos os inputs do formulário
      const form = target.closest('form');
      if (form) {
        const elements = Array.from(form.querySelectorAll('input, select, button'));
        const index = elements.indexOf(target);

        // 4. Se tiver um próximo, foca nele. Se não, ignora.
        if (index > -1 && index < elements.length - 1) {
          (elements[index + 1] as HTMLElement).focus();
        }
      }
    }
  }
}
