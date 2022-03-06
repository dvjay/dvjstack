import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { IEdge } from '../../models/nw-data'; 
import { Subscription} from 'rxjs'; 
import { NotificationBrokerService } from '../../services/notification-broker.service'; 
import { NodeRelationService, CurrentMouseOverNodeOrEdge } from '../../services/node-relation.service';
import { EMPTY_STRING } from '../../utils';
import { ConfigParserService } from '../../services/config-parser.service';
import { Store } from '@ngrx/store';
import { State as GraphState, STORE_GRAPH_SLICE_NAME } from '../../store/state';

const DEFAULT_NODE_RADIUS = 20;
const DEFAULT_LINK_OPACITY = 1;
const DEFAULT_LABEL_LENGTH = 40;
const MARGIN = 2;
const SOURCE_MARGIN = 2;
const TARGET_MARGIN = 4.5;

@Component({
    selector: '[link]', 
    templateUrl: './link.component.html', 
    styleUrls: ['./link.component.css']
})
export class LinkComponent implements OnChanges {
    @Input('link') link: IEdge | any; 
    @Input('hideLabel') hideLabel: boolean | null = null;
    @Input('layoutId') layoutId: number | null = null;
    @Input('rootNodeId') rootNodeId: string = EMPTY_STRING;
    @Input('selectedNodeIds') selectedNodeIds: string[] = [];
    @Input('highlightedNodeIds') highlightedNodeIds: string[] = [];
    nodeRadius = DEFAULT_NODE_RADIUS; 
    sourceRadius: number; 
    targetRadius: number; 
    linkOpacity = DEFAULT_LINK_OPACITY; 
    minLabelLength = DEFAULT_LABEL_LENGTH; 
    notificationMoveOverSub: Subscription; 
    notificationMoveOutSub: Subscription; 
    nodeRelationMoveOverSub: Subscription; 
    nodeRelationMoveOutSub: Subscription;
    
    constructor (private store$: Store<GraphState>, 
                    private notificationBrokerService: NotificationBrokerService, 
                    private nodeRelationService: NodeRelationService, 
                    private configParserService: ConfigParserService) {
        this.notificationMoveOverSub = notificationBrokerService.notificationMoveOver$.subscribe(
            () => {
                this.linkOpacity = 0.2;
            });
        this.notificationMoveOutSub = notificationBrokerService.notificationMoveOut$.subscribe(
            () => {
                this.linkOpacity = 1;
            });
        this.nodeRelationMoveOverSub = nodeRelationService.notificationMoveOver$.subscribe(
            (message: CurrentMouseOverNodeOrEdge) => { 
            if(message.node) { 
                if(message.node.nodeId === this.link.sourceNodeId || message.node.nodeId === this.link.targetNodeId) {
                    this.linkOpacity = 1;
                } else {
                    this.linkOpacity = 0.2;
                }
            } else if(message.edge) { 
                if(message.node!.nodeId === this.link.sourceNodeId || message.node!.nodeId === this.link.targetNodeId) {
                    this.linkOpacity = 1;
                } else {
                    this.linkOpacity = 0.2;
                }
            } else {
                this.linkOpacity = 1;
            }
        });
        
        this.nodeRelationMoveOutSub = nodeRelationService.notificationMoveOut$.subscribe(
            (message: CurrentMouseOverNodeOrEdge) => {
                this.linkOpacity = 1;
            });
    }

    ngOnChanges(changes: SimpleChanges) {
        if (typeof changes.selectedNodeIds === "undefined" && typeof changes.highlightedNodeIds === "undefined") {
            return;
        }
        const nodeRadius = this.configParserService.nwConfig.nodeRadius;
        const rootNodeRadius = this.configParserService.nwConfig.rootNodeRadius;
        const nodeBorderWidth = this.configParserService.nwConfig.nodeBorderWidth;
        const displayEdgeDirection = this.configParserService.nwConfig.displayEdgeDirection;
        let additionalSourceMargin = 0;
        let additionalTargetMargin = 0;

        // Source Node
        if(this.selectedNodeIds.indexOf(this.link.sourceNodeId) !== -1) {
            additionalSourceMargin = additionalSourceMargin + nodeBorderWidth;
        }
        if(this.highlightedNodeIds.indexOf(this.link.sourceNodeId) !== -1) {
            additionalSourceMargin = additionalSourceMargin + nodeBorderWidth;
        }
        // Target Node
        if(this.selectedNodeIds.indexOf(this.link.targetNodeId) !== -1) {
            additionalTargetMargin = additionalTargetMargin + nodeBorderWidth;
        }
        if(this.highlightedNodeIds.indexOf(this.link.targetNodeId) !== -1) {
            additionalTargetMargin = additionalTargetMargin + nodeBorderWidth;
        }
        if(displayEdgeDirection) {
            this.sourceRadius = this.nodeRadius + additionalSourceMargin + SOURCE_MARGIN;
            this.targetRadius = this.nodeRadius + additionalTargetMargin + TARGET_MARGIN;
            if(nodeRadius) {
                this.sourceRadius = this.nodeRadius + additionalSourceMargin + SOURCE_MARGIN;
                this.targetRadius = this.nodeRadius + additionalTargetMargin + TARGET_MARGIN;
            }
            if(this.link.sourceNodeId === this.rootNodeId) {
                this.sourceRadius = rootNodeRadius + additionalSourceMargin + SOURCE_MARGIN;
            }
            if(this.link.targetNodeId === this.rootNodeId) {
                this.targetRadius = rootNodeRadius + additionalTargetMargin + TARGET_MARGIN;
            }
        } else {
            this.sourceRadius = this.nodeRadius + additionalSourceMargin + MARGIN;
            this.targetRadius = this.nodeRadius + additionalTargetMargin + MARGIN;
            if(nodeRadius) {
                this.sourceRadius = this.nodeRadius + additionalSourceMargin + MARGIN;
                this.targetRadius = this.nodeRadius + additionalTargetMargin + MARGIN;
            }
            if(this.link.sourceNodeId === this.rootNodeId) {
                this.sourceRadius = rootNodeRadius + additionalSourceMargin + MARGIN;
            }
            if(this.link.targetNodeId === this.rootNodeId) {
                this.targetRadius = rootNodeRadius + additionalTargetMargin + MARGIN;
            }
        }
    }

    ngOnDestroy() {
        this.notificationMoveOverSub.unsubscribe(); 
        this.notificationMoveOutSub.unsubscribe();
    }
    
    get sourcePoint(): {x: number, y: number} {
        const link = this.link as any; 
        return this.getPtBetween2PtsfromDistance({x: link.source.x, y: link.source.y}, {x: link.target.x, y: link.target.y}, this.sourceRadius);
    }
    
    get targetPoint(): {x: number, y: number} {
        const link = this.link as any; 
        return this.getPtBetween2PtsfromDistance({x: link.target.x, y: link.target.y}, {x: link.source.x, y: link.source.y}, this.targetRadius);
    }

    get centerPoint(): {x: number, y: number} {
        const link = this.link as any; 
        return this.getPtBetween2Pts({x: link.target.x, y: link.target.y}, {x: link.source.x, y: link.source.y});
    }
    
    get labelRotation(): string {
        const link = this.link as any; 
        const rotation = this.getAngle({x: link.source.x, y: link.source.y}, {x: link.target.x, y: link.target.y}); 
        if(link.target.x > link.source.x) {
            return `rotate(${rotation} ${this.centerPoint.x},${this.centerPoint.y})`;
        } else {
            return `rotate(${rotation + 180} ${this.centerPoint.x},${this.centerPoint.y})`;
        }
    }
    
    getPtBetween2PtsfromDistance(p1: {x: number, y: number}, p2: {x: number, y: number}, distance: number): {x: number, y: number} {
        const distance_ratio = distance / this.getDistanceBetwnPoints (p1, p2); 
        const x = p1.x + distance_ratio * (p2.x - p1.x); 
        const y = p1.y + distance_ratio * (p2.y - p1.y); 
        return {x, y};
    }

    getPtBetween2Pts(p1: {x: number, y: number}, p2: {x: number, y: number}): {x: number, y: number} {
        const x = p1.x + 0.5 * (p2.x - p1.x); 
        const y = p1.y + 0.5 * (p2.y - p1.y); 
        return {x, y};
    }
    
    getDistanceBetwnPoints(p1 : {x: number, y: number}, p2: {x: number, y: number}) {
        const dx = p2.x - p1.x; 
        const dy = p2.y - p1.y; 
        const square = (distance: any) => distance * distance;
        return Math.sqrt(square(dx) + square(dy));
    }
    
    getAngle(p1: {x: number, y: number}, p2: {x: number, y: number}) { 
        let dy = p2.y - p1.y; 
        let dx = p2.x - p1.x; 
        let theta = Math.atan2(dy, dx); 
        theta *= 180 / Math.PI; 
        return theta;
    }              
}