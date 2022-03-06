import { Directive, ElementRef, Input, OnInit, OnChanges, SimpleChanges } from "@angular/core";
import { TransformInfo } from "../models/load-nodes-payload";
import { D3Service } from '../services/d3.service';

@Directive({
    selector: '[zoomableOf]'
})
export class ZoomableDirective implements OnInit, OnChanges {
    // @Input('zoomableOf') zoomableOf: ElementRef | undefined;
    @Input('zoomableOf') zoomableOf: HTMLElement | undefined;
    @Input('layoutId') layoutId: number | undefined;
    @Input('transformVal') transformVal: TransformInfo = {x: 0, y: 0, k: 1};

    constructor(private _element: ElementRef, private d3Service: D3Service) {

    }

    ngOnInit() {
        if(this.zoomableOf) {
            this.d3Service.applyZoomableBehaviour(this.zoomableOf, this._element.nativeElement, this.transformVal);
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        if(typeof changes.transformVal !== 'undefined' && !changes.transformVal.firstChange) {
            if(this.zoomableOf) {
                this.d3Service.applyZoomableBehaviour(this.zoomableOf, this._element.nativeElement, this.transformVal);
            }
        }
    }
}