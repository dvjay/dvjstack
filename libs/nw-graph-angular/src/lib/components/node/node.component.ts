import { Component, Input, EventEmitter, Output, OnDestroy, SimpleChanges, OnChanges, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core'; 
import { INode, NeighboursStateType, NodeAlertIconDetails } from '../../models/nw-data'; 
import { GraphEngineService } from '../../services/graph-engine.service'; 
import { NotificationBrokerService } from '../../services/notification-broker.service'; 
import { DispatchNodeLoadService } from '../../services/dispatch-node-load.service'; 
import { Subscription, fromEvent, merge } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CurrentMouseOverNodeOrEdge, NodeRelationService } from '../../services/node-relation.service';
import { ConfigParserService } from '../../services/config-parser.service';
const DEFAULT_NODE_RADIUS = 20;
const DEFAULT_NODE_BORDER_WIDTH = 4;

@Component({
        selector: '[node]', 
        templateUrl: './node.component.html', 
        styleUrls: ['./node.component.css']
})
export class NodeComponent implements OnChanges, OnInit, AfterViewInit, OnDestroy {
    @Input('node') node: INode | undefined;
    @Input('graph') graph: GraphEngineService | undefined;
    @Input('hideLabel') hideLabel: boolean | null = null;
    @Input('layoutId') layoutId: number | null = null;
    @Input('nodes') nodes: INode[] | undefined;
    @Input('rootNodeId') rootNodeId: string | null | undefined;
    @Input('selectedNodeIds') selectedNodeIds: string[] = [];
    @Input('highlightedNodeIds') highlightedNodeIds: string[] = [];
    @Output() expandNode = new EventEmitter();
    @Output() selectNode = new EventEmitter(); 
    @Output() selectOnlyClickedNode = new EventEmitter(); 
    // notificationMoveOverSub: Subscription; 
    // notificationMoveOutSub: Subscription; 
    dispatchNodeLoad: Subscription; 
    nodeRelationMouseOverSub: Subscription; 
    nodeRelationMouseOutSub: Subscription; 
    nodeStyle: any = { stroke: 'gray' }; 
    isUnexpandable: boolean = false; 
    blurThisNode: boolean = false;
    nodeBorderWidth: number;
    nodeAlertIconsDetails: NodeAlertIconDetails[] = [];
    @ViewChild('noderef', { static: false }) el: ElementRef;

    constructor (private notificationBrokerService: NotificationBrokerService, 
                private dispatchNodeLoadService: DispatchNodeLoadService, 
                private nodeRelationService: NodeRelationService,
                private configParserService: ConfigParserService) {
        this.nodeBorderWidth = configParserService && configParserService.nwConfig && configParserService.nwConfig.nodeBorderWidth ? 
                                            configParserService.nwConfig.nodeBorderWidth : DEFAULT_NODE_BORDER_WIDTH;
        this.dispatchNodeLoad = dispatchNodeLoadService.dispatchNodeLoad$.subscribe(
            (nodeIds: string[]) => {
                if(Array.isArray(nodeIds) && nodeIds.indexOf(this.node!.nodeId) > -1) {
                    this.nodeStyle = { stroke: '#ff4d4d', strokeDasharray: 2 };
                }
        });
        this.nodeRelationMouseOverSub = nodeRelationService.notificationMoveOver$.subscribe(
            (message: CurrentMouseOverNodeOrEdge) => {
                if(message.node) { 
                    if(message.node === this.node) {
                        this.blurThisNode = false;
                    } else {
                        if((Array.isArray(message.node.sourceIds) && message.node.sourceIds.indexOf(this.node!.nodeId) > -1) || (Array.isArray(message.node.targetIds) && message.node.targetIds.indexOf(this.node!.nodeId) > -1)) {
                            this.blurThisNode = false;
                        } else {
                            this.blurThisNode = true;
                        }
                    }
                } // else if(message.edge) {
                //     if(message.node === this.node) {

                //     } else {

                //     }
                // } else {

                // }
        
            });
        this.nodeRelationMouseOutSub = nodeRelationService.notificationMoveOut$.subscribe(
            (message: CurrentMouseOverNodeOrEdge) => {
                if(message.node) {
                    this.blurThisNode = false;
                } else if(message.edge) {

                } else {

                }
            }
        );
    }
    ngOnInit() {
        if(this.configParserService && 
            this.configParserService.nwConfig && 
            this.configParserService.nwConfig.alert && 
            Array.isArray(this.configParserService.nwConfig.alert.nodeAttributes)) {
            // console.log("this.configParserService.nwConfig", this.configParserService);
            for (const nodeAttribute of this.configParserService.nwConfig.alert.nodeAttributes) {
                if(nodeAttribute.nodeType === this.node.nodeType && this.checkCondition(this.node[nodeAttribute.attribute], nodeAttribute.condition)) {
                    const pos = this.configParserService.nwNodeAlertSlots.get(nodeAttribute.position);
                    if(pos) {
                        this.nodeAlertIconsDetails.push({height: pos.height, 
                                                        width: pos.width, 
                                                        color: nodeAttribute.color, 
                                                        text: nodeAttribute.message, 
                                                        x: this.node.isRootNode? pos.x0 : pos.x,
                                                        y: this.node.isRootNode? pos.y0 : pos.y,
                                                        transform: `translate(-${pos.height/2}, -${pos.width/2})`})
                    }
                }
            }
        }
        // const alerts = this.configParserService.nwConfig.alert
    }
    ngAfterViewInit() {
        this.handleClickAndDoubleClick();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (typeof changes['nodes'] !== "undefined" && typeof changes['nodes'].currentValue !== "undefined") {
            switch(this.node!.neighboursStatus) {
                case NeighboursStateType.NOT_LOADED:
                    this.nodeStyle = { stroke: 'gray' };
                    break; 
                case NeighboursStateType.LOADING: 
                case NeighboursStateType.LOADING_THEN_EXPAND:
                    this.nodeStyle = { stroke: '#ff4d4d', strokeDasharray: 2 };
                    break; 
                case NeighboursStateType.LOADING_FAILED:
                    this.nodeStyle = { stroke: '#eb0000' }; 
                    break; 
                case NeighboursStateType.LOADED: 
                    if(this.node!.collapsed) { 
                        if(this.allNeighboursVisible()) {
                            this.nodeStyle = { stroke: 'black' };
                        } else {
                            this.nodeStyle = { stroke: 'blue' };
                        }
                    } else {
                        this.nodeStyle = { stroke: 'black' };
                    }
                    break; 
                default:
                    this.nodeStyle = { stroke: 'gray' }; 
                    break;
            }
        }
    }
    
    ngOnDestroy() {
        // this.notificationMoveOverSub.unsubscribe(); 
        // this.notificationMoveOutSub.unsubscribe(); 
        // this.nodeRelationMouseOverSub.unsubscribe(); 
        // this.nodeRelationMouseOutSub.unsubscribe();
    }

    get nodeOpacity() {
        if(this.blurThisNode) {
            return 0.2;
        }
        return 1;
    }

    get nodRadius() {
        let nodeRadius = DEFAULT_NODE_RADIUS;
        let rootNodeRadius = DEFAULT_NODE_RADIUS;
        if(this.node && this.node.r0) {
            rootNodeRadius = this.node.r0;
        }
        if(this.node && this.node.r) {
            nodeRadius = this.node.r;
        }
        return this.node && this.node.nodeId === this.rootNodeId ? rootNodeRadius : nodeRadius;
    }


    handleClickAndDoubleClick() {
        const el = this.el.nativeElement;
        const clickEvent = fromEvent<MouseEvent>(el, 'click');
        const dblClickEvent = fromEvent<MouseEvent>(el, 'dblclick');
        const eventsMerged = merge(clickEvent, dblClickEvent).pipe(debounceTime(300));
        eventsMerged.subscribe(
            (event) => {
                if(event.type === 'click') {
                    if(this.selectNode) { 
                        if(event.ctrlKey) {
                            this.selectNode.emit(this.node!.nodeId);
                        } else {
                            this.selectOnlyClickedNode.emit(this.node!.nodeId);
                        }
                    }
                }
                if(event.type === 'dblclick') {
                    switch (this.node!.neighboursStatus) {
                        case NeighboursStateType.NOT_LOADED: 
                        case NeighboursStateType.LOADING_FAILED:
                            this.nodeStyle = { stroke: '#ff4d4d', strokeDasharray: 2 };
                            break; 
                        case NeighboursStateType.LOADED: 
                            if(this.node!.collapsed) {
                                this.nodeStyle = { stroke: '#ff4d4d', strokeDasharray: 2 }; 
                                this.expandNode.emit(this.node);
                            }
                            break;
                        default:
                            break;
                    }
                }
            }
        );
    }

    handleMouseOver() {
        this.nodeRelationService.notificationMouseOver({ node: this.node });
    }
    
    handleMouseOut() {
        this.nodeRelationService.notificationMouseOut({ node: this.node });
    }

    allNeighboursVisible(): boolean {
        const visibleNodeIds = this.nodes!.map(x => x.nodeId);
        const sIds = Array.isArray(this.node!.sourceIds)? this.node!.sourceIds : [];
        const tIds = Array.isArray(this.node!.targetIds)? this.node!.targetIds : [];

        return [...sIds, ...tIds].every((n: any) => visibleNodeIds.indexOf(n) !== -1)
    }
    
    checkCondition(val: any, conditionStr: string){
        return Function('"use strict";let value="' + val +'";return ' + conditionStr)();
    }
}
