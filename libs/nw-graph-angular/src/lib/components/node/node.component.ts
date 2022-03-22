import { Component, Input, EventEmitter, Output, OnDestroy, SimpleChanges, OnChanges, ElementRef, ViewChild, AfterViewInit, OnInit } from '@angular/core'; 
import { INode, NeighboursStateType, NodeAlertIconDetails, NodeOutliningColors } from '../../models/nw-data'; 
import { GraphEngineService } from '../../services/graph-engine.service'; 
import { NotificationBrokerService } from '../../services/notification-broker.service';
import { Subscription, fromEvent, merge } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CurrentMouseOverNodeOrEdge, NodeRelationService } from '../../services/node-relation.service';
import { ConfigParserService } from '../../services/config-parser.service';
import { Store } from '@ngrx/store';
import { State as GraphState, STORE_GRAPH_SLICE_NAME } from '../../store/state';
import { GraphUpdateService } from '../../services/graph-update.service';
import { ExpandNodeContext } from '../../store/actions';
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
    @Output() fetchNeighborNodes = new EventEmitter();
    @Output() selectNode = new EventEmitter(); 
    @Output() selectOnlyClickedNode = new EventEmitter();
    nodeRelationMouseOverSub: Subscription; 
    nodeRelationMouseOutSub: Subscription;
    clickSubscription: Subscription | undefined;
    nodeStyle: any = { stroke: 'gray' }; 
    isUnexpandable: boolean = false; 
    blurThisNode: boolean = false;
    nodeBorderWidth: number;
    nodeAlertIconsDetails: NodeAlertIconDetails[] = [];
    @ViewChild('noderef', { static: false }) el: ElementRef;
    selectedNodeStyle = {  cursor: 'pointer', fill: NodeOutliningColors.NODE_SELECTED };

    constructor (private notificationBrokerService: NotificationBrokerService,
                private nodeRelationService: NodeRelationService,
                private configParserService: ConfigParserService,
                private graphUpdateService: GraphUpdateService,
                private store$: Store<GraphState>) {
        this.nodeBorderWidth = configParserService && configParserService.nwConfig && configParserService.nwConfig.nodeBorderWidth ? 
                                            configParserService.nwConfig.nodeBorderWidth : DEFAULT_NODE_BORDER_WIDTH;
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
                }        
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
                for (const nodeAttribute of this.configParserService.nwConfig.alert.nodeAttributes) {
                    if(this.node && nodeAttribute.nodeType === this.node.nodeType && this.checkCondition(this.node[nodeAttribute.attribute], nodeAttribute.condition)) {
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
    }
    ngAfterViewInit() {
        this.handleClickAndDoubleClick();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (typeof changes['nodes'] !== "undefined" && typeof changes['nodes'].currentValue !== "undefined") {
            switch(this.node!.neighboursStatus) {
                case NeighboursStateType.NOT_LOADED:
                    if(this.node!.collapsed) { 
                        this.nodeStyle = { stroke: NodeOutliningColors.NODE_COLLAPSED_AND_NEIGHBOURS_NOT_LOADED };// Gray
                    } else {
                        this.nodeStyle = { stroke: NodeOutliningColors.NODE_EXPANDED_AND_NEIGHBOURS_NOT_LOADED };// Light blue
                    }
                    this.handleNeighborsLoad();
                    break; 
                case NeighboursStateType.LOADING:
                    if(this.node!.collapsed) {
                        // this.setCollapsedNodeLoadingStyle();
                        this.setExpandedNodeLoadingStyle();
                    } else {
                        this.setExpandedNodeLoadingStyle();
                    }
                    break;
                case NeighboursStateType.LOADING_FAILED:
                    this.nodeStyle = { stroke: NodeOutliningColors.NODE_LOADING_FAILED }; 
                    break; 
                case NeighboursStateType.LOADED: 
                    if(this.node!.collapsed) { 
                        if(this.allNeighboursVisible()) {
                            this.nodeStyle = { stroke: NodeOutliningColors.NODE_EXPANDED_AND_NEIGHBOURS_LOADED };
                        } else {
                            this.nodeStyle = { stroke: NodeOutliningColors.NODE_COLLAPSED_AND_NEIGHBOURS_LOADED };
                        }
                    } else {
                        this.nodeStyle = { stroke: NodeOutliningColors.NODE_EXPANDED_AND_NEIGHBOURS_LOADED };
                    }
                    break; 
                default:
                    this.nodeStyle = { stroke: NodeOutliningColors.NODE_EXPANDED_AND_NEIGHBOURS_NOT_LOADED };
                    break;
            }
        }
    }
    
    ngOnDestroy() {
        if(this.nodeRelationMouseOverSub) {
            this.nodeRelationMouseOverSub.unsubscribe();
        }
        if(this.nodeRelationMouseOutSub) {
            this.nodeRelationMouseOutSub.unsubscribe();
        }
        if(this.clickSubscription) {
            this.clickSubscription.unsubscribe();
        }
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
        return this.node && this.node.isRootNode ? rootNodeRadius : nodeRadius;
    }


    handleClickAndDoubleClick() {
        const el = this.el.nativeElement;
        const clickEvent = fromEvent<MouseEvent>(el, 'click');
        const dblClickEvent = fromEvent<MouseEvent>(el, 'dblclick');
        const eventsMerged = merge(clickEvent, dblClickEvent).pipe(debounceTime(300));
        this.clickSubscription = eventsMerged.subscribe(
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
                    if(this.layoutId === 0) {
                        if(this.node && this.node.collapsed && this.node.nodeId) {
                            this.expandNode.emit({rootNodeId: this.node.nodeId, currentVisibleNodes: this.nodes} as ExpandNodeContext);
                        }
                        if(this.node!.neighboursStatus === NeighboursStateType.NOT_LOADED || this.node!.neighboursStatus === NeighboursStateType.LOADING_FAILED) {
                            this.handleNeighborsLoad();
                        }
                    }
                }
            }
        );
    }

    handleNeighborsLoad() {
        this.setExpandedNodeLoadingStyle();
        this.fetchNeighborNodes.emit(this.node);
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

    setExpandedNodeLoadingStyle() {
        this.nodeStyle = { stroke: NodeOutliningColors.NODE_SELECTED, strokeDasharray: 2 };
    }

    setCollapsedNodeLoadingStyle() {
        this.nodeStyle = { stroke: NodeOutliningColors.NODE_COLLAPSED_AND_NEIGHBOURS_NOT_LOADED, strokeDasharray: 2 };
    }

    generateNeighborsPosition() {
        const graphEngine = new GraphEngineService();

    }
}
