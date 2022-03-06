import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { INode } from '../models/nw-data';
import { D3Service } from '../services/d3.service';

@Directive({
    selector: '[tooltip]'
})
export class TooltipDirective implements OnInit {
    @Input('tooltip') tooltipNode: INode | undefined;
    @Input('nodesDescription') nodesDescription: any[] = [];

    constructor(private d3Service: D3Service, private _element: ElementRef) {
        
    }

    ngOnInit() {
        this.d3Service.createTooltip(this._element.nativeElement, this.tooltipNode!);
    }
}