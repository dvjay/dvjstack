import { Directive, Input, ElementRef, OnInit, OnChanges, SimpleChanges } from "@angular/core";
import { D3Service } from '../services/d3.service';
import { INode } from '../models/nw-data';
import { GraphEngineService } from '../services/graph-engine.service';

@Directive({
    selector: '[draggableNode]'
})
export class DraggableDirective implements OnInit, OnChanges {
    @Input('draggableNode') draggableNode: INode | undefined;
    @Input('draggableInGraph') draggableInGraph: GraphEngineService | undefined;

    constructor(private d3Service: D3Service, private _element: ElementRef) {
    }

    ngOnInit() {
        this.d3Service.applyDraggableBehaviour(this._element.nativeElement, this.draggableNode, this.draggableInGraph);
    }

    ngOnChanges(changes: SimpleChanges) {
        if(!changes.draggableNode.firstChange && changes.draggableNode) {
            if(changes.draggableNode.previousValue) {
                this.d3Service.removeDraggableBehaviour(this._element.nativeElement);
            }
            if(changes.draggableNode.currentValue) {
                this.d3Service.applyDraggableBehaviour(this._element.nativeElement, changes.draggableNode.currentValue, this.draggableInGraph);
            }
        }
    }
}