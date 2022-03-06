import { Directive } from "@angular/core";
import { Highlightable } from "@angular/cdk/a11y";

@Directive({
    selector: '[role="option"]',
    host: {
        '[class.active-option]': 'isActive'
    }
})
export class NodeMenuOptionDirective implements Highlightable {
    isActive = false;

    setActiveStyles(): void {
        this.isActive = true;
    }

    setInactiveStyles(): void {
        this.isActive = false;
    }

}