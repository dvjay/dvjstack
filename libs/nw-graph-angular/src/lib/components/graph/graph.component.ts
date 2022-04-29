import { ChangeNumHop, ExpandNodeContext, LoadExternalDeltaData } from './../../store/actions';
import { EMPTY_STRING } from '../../utils';
import { ChangeDetectionStrategy, 
          ChangeDetectorRef, 
          Component, 
          ElementRef, 
          EventEmitter, 
          Input, OnChanges, 
          AfterViewInit, 
          OnDestroy, 
          OnInit, 
          Output, 
          QueryList, 
          SimpleChanges, 
          ViewChild, 
          ViewChildren, 
          ViewContainerRef } from '@angular/core';
import { Store } from '@ngrx/store';
import { State as GraphState } from '../../store/state';
import { ExpandNode, 
          CollapseNode,
          ToggleLabel, 
          SelectNode,
          UnselectAllNodes, 
          SelectOnlyClickedNode,
          ResetVisibleNodesPositions, 
          LoadExternalData,
          ChangeActiveLayout,
          UpdateNodeLoadingStatus} from '../../store/actions';
import { DataBuilderService } from '../../services/data-builder.service';
import { ConfigParserService } from '../../services/config-parser.service';
import { IEdge, INode, INwData, ServicePayload } from '../../models/nw-data';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { GraphEngineService } from '../../services/graph-engine.service';
import * as graphSelectors from '../../store/selectors'; 
import { Overlay } from '@angular/cdk/overlay';
import { FadeinNotificationService } from '../../services/fadein-notification.service';
import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { LayoutChangeMessage, NotificationBrokerService } from '../../services/notification-broker.service';
import { zoomTransform} from 'd3-zoom';
import { TransformInfo } from '../../models/load-nodes-payload';
import { GraphUpdateService } from '../../services/graph-update.service';
import { Actions } from '@ngrx/effects';

const DEFAULT_MAX_NODES = 150;
// const DEFAULT_NUM_HOPS = 2;
const DEFAULT_WIDGET_HEIGHT = 720;
const DEFAULT_WIDGET_WIDTH = 2000;

type combineTuple = [Observable<string>, Observable<INwData>];

@Component({
  selector: 'network-graph', 
  changeDetection: ChangeDetectionStrategy.OnPush, 
  templateUrl: 'graph.component.html', 
  styleUrls: ['graph.component.css']
})
export class GraphComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input('rootNodeId') rootNodeId = EMPTY_STRING;
  @Input('dataLoading') dataLoading = false;
  @Input('config') config = {};
  @Input('data') data = {};
  @Input('nodeCount') nodeCount = 0;
  @Output('numHopChanged') numHopChanged = new EventEmitter();
  @Output('dataUpdated') dataUpdated = new EventEmitter();
  @Output('nodeDoubleClicked') nodeDoubleClicked = new EventEmitter();
  displayEdgeDirection = false;
  nodes: INode[] = [];
  links: IEdge[] = [];
  // numHops = DEFAULT_NUM_HOPS;
  maxNodes = DEFAULT_MAX_NODES;
  containerHeight = window.innerHeight;
  options = { width: DEFAULT_WIDGET_WIDTH, height: DEFAULT_WIDGET_HEIGHT };
  SVG_MARGIN = 20;
  @ViewChild('graphcontainer', { static: false }) graphContainer: ElementRef;
  @ViewChild('zoomablecontainer', { static: false }) zoomableContainer: ElementRef;

  /* Observables - Begin */
  hideLabel$: Observable<boolean> | undefined;
  autoNetworkExplore$: Observable<boolean> | undefined;
  // autoNetworkExpand$: Observable<boolean> | undefined;
  rootEntityDataLoading$: Observable<boolean> | undefined;
  transformVal: TransformInfo | undefined;
  layoutId = 0;
  // layoutId$: Observable<number | undefined> | undefined;
  selectedNodeIds$: any;
  highlightedNodeIds$: Observable<string[]> | undefined;
  selectMaxNodesExceeded$: any;
  selectMaxNodesExceededSubscription: Subscription | undefined;
  selectActiveLayout$: any;
  selectGraphData$: Observable<INwData | null> | any;
  selectRootNodeId$: Observable<string | undefined> | any;
  selectLayoutTransform$: any;
  selectExcludeNodeTypes$: Observable<string[]> | any;
  selectActiveLayoutSubscription: Subscription | undefined;
  changeLayoutSubscription: Subscription | undefined;
  displayedNodesChangeSubscription: Subscription | undefined;
  numHopsChangeSubscription: Subscription | undefined;
  /* Observables - End */

  scrollEventHandler: any;

  /* context menu properties - Begin */
  isContextMenuOpen = false; 
  latestFocusedNodeRef: CdkOverlayOrigin | undefined; 
  latestFocusedNode: INode | undefined;
  @ViewChildren("noderef") nodeRefs: QueryList<CdkOverlayOrigin> | undefined;
  contextMenuOptions = [
    { id: 0, label: 'Collapse'}, // {id: 1, label: 'Open in new tab'} 
  ];
  /* context menu properties - End */

  constructor(private ref: ChangeDetectorRef, 
              private store$: Store<GraphState>,
              private dataBuilderService: DataBuilderService, 
              private configParserService: ConfigParserService,
              public graphEngineService: GraphEngineService,
              public overlay: Overlay, 
              public viewContainerRef: ViewContainerRef, 
              public fadeinNotificationService: FadeinNotificationService,
              public notificationBrokerService: NotificationBrokerService,
              public graphUpdateService: GraphUpdateService,
              private _actions$: Actions) {
                this.hideLabel$ = this.store$.select(graphSelectors.selectIsHideLabel);
                this.selectedNodeIds$ = this.store$.select(graphSelectors.selectSelectedNodeIds);
                this.highlightedNodeIds$ = this.store$.select(graphSelectors.selectHighlightedNodeIds);
                this.selectMaxNodesExceeded$ = this.store$.select(graphSelectors.selectMaxNodesExceeded);
                this.selectActiveLayout$ = this.store$.select(graphSelectors.selectActiveLayout);
                this.selectGraphData$ = this.store$.select(graphSelectors.selectGraphData);
                this.selectRootNodeId$ = this.store$.select(graphSelectors.selectRootNodeId);
                this.selectLayoutTransform$ = this.store$.select(graphSelectors.selectActiveLayoutTransform);
                this.selectExcludeNodeTypes$ = this.store$.select(graphSelectors.selectExcludedNodeTypes);
              }

  ngOnInit() {
    this.scrollEventHandler = this.scroll.bind(this);

    this.numHopsChangeSubscription = this.configParserService.notificationNumHops$.subscribe((num: number) => {
      this.OnChangeNumHops(num);
    });
    this.changeLayoutSubscription = this.notificationBrokerService.notificationLayoutChange$.subscribe(
      (message: LayoutChangeMessage) => {
        const zmT = zoomTransform(this.zoomableContainer.nativeElement);
        this.store$.dispatch(new ChangeActiveLayout({ layoutId: message.currentLayout,
                                                      prevLayoutId: message.previousLayout,
                                                      prevLayoutTransform: {x: zmT.x, y: zmT.y, k: zmT.k}
                                                    }));
      });
    this.displayedNodesChangeSubscription = this.notificationBrokerService.notificationDisplayedNodesChange$.subscribe(
      () => {
        combineLatest([this.selectRootNodeId$, this.selectGraphData$, this.selectExcludeNodeTypes$]).pipe(take(1)).subscribe(([rootNodeId, graphData, excludeNodeTypes]) => {
          let visibleNodes = this.graphUpdateService.getVisibleNodes(rootNodeId as string, graphData as INwData, excludeNodeTypes as string[]);
          this.dataUpdated.emit(visibleNodes);
        });
      });
    
    this.graphEngineService.ticker.subscribe((d: any) => {
      this.nodes = d.nodes; 
      this.links = d.links; 
      this.ref.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    const { rootNodeId, config, data } = changes;
    if(!rootNodeId && !config && !data) {
      return;
    }
    if(config) {
      this.configParserService.parseConfig(this.config); 
      this.maxNodes = this.configParserService.nwConfig.maxNodeCount;
      this.displayEdgeDirection = this.configParserService.nwConfig.displayEdgeDirection;
      this.configParserService.notifyUpdated();
    }
    if(!rootNodeId && !this.rootNodeId) {
      return;
    }

    if(data) {
      this.dataBuilderService.getNetworkData(this.data);
      if(this.dataBuilderService.nwData.nodes.size < 1) {
        console.log("Received external data with 0 nodes");
        return;
      }
      combineLatest([this.selectRootNodeId$, this.selectActiveLayout$]).pipe(take(1)).subscribe(([rootNodeIdFromStore, activeLayout]) => {
        this.graphUpdateService.positionDeltaNodesFromData(this.rootNodeId, this.dataBuilderService.nwData, activeLayout as number);
        if(rootNodeIdFromStore) { //Subset of graph
          if(this.rootNodeId !== (rootNodeIdFromStore as string)) {
            this.store$.dispatch(new LoadExternalDeltaData({
              rootNodeId: this.rootNodeId,
              data: this.dataBuilderService.nwData, 
              nodeTypes: Array.from(this.configParserService.nwNodeTypes.keys()),
              maxNodeCount: this.maxNodes,
              nodeCount: this.nodeCount,
              isSkewed: this.dataBuilderService.isSkewed
            }));
          } else {
            this.store$.dispatch(new LoadExternalData({
              rootNodeId: this.rootNodeId,
              data: this.dataBuilderService.nwData, 
              nodeTypes: Array.from(this.configParserService.nwNodeTypes.keys()),
              maxNodeCount: this.maxNodes,
              nodeCount: this.nodeCount,
              isSkewed: this.dataBuilderService.isSkewed
            }));
          }
        } else { // for root graph
          this.store$.dispatch(new LoadExternalData({
            rootNodeId: this.rootNodeId,
            data: this.dataBuilderService.nwData, 
            nodeTypes: Array.from(this.configParserService.nwNodeTypes.keys()),
            maxNodeCount: this.maxNodes,
            nodeCount: this.nodeCount,
            isSkewed: this.dataBuilderService.isSkewed
          }));
        }
      });
    }
  }

  ngAfterViewInit() {
    this.graphContainer.nativeElement.addEventListener('scroll', this.scrollEventHandler, true); 
    this.graphContainer.nativeElement.addEventListener('wheel', this.scrollEventHandler, true);
    this.options.width = DEFAULT_WIDGET_WIDTH;
    // this.graphUpdateService.positionVisibleNodes();
    this.selectMaxNodesExceededSubscription = this.selectMaxNodesExceeded$.subscribe(
        (maxNodesExceed: any) => { 
          if(maxNodesExceed === true) {
            this.fadeinNotificationService.add();
          }
        });
    this.selectActiveLayoutSubscription = this.selectActiveLayout$.subscribe(
        (layoutId: number) => { 
          this.selectLayoutTransform$.pipe(take(1)).subscribe((layoutTransform: any) => {
            this.transformVal = layoutTransform;
            this.layoutId = layoutId;
          });
        });
  }

  ngOnDestroy() {
    this.graphEngineService.ticker.unsubscribe();
    if(this.selectMaxNodesExceededSubscription) {
      this.selectMaxNodesExceededSubscription.unsubscribe();
    }
    if(this.selectActiveLayoutSubscription) {
      this.selectActiveLayoutSubscription.unsubscribe();
    }
    if(this.changeLayoutSubscription) {
      this.changeLayoutSubscription.unsubscribe();
    }
    if(this.displayedNodesChangeSubscription) {
      this.displayedNodesChangeSubscription.unsubscribe();
    }
    if(this.numHopsChangeSubscription) {
      this.numHopsChangeSubscription.unsubscribe();
    }
    window.removeEventListener('scroll', this.scrollEventHandler, true);
    window.removeEventListener('wheel', this.scrollEventHandler, true);
  }

  viewportClick() { 
    this.selectedNodeIds$.pipe(take(1)).subscribe((selectedNodeIds: any) => {
      if(Array.isArray(selectedNodeIds) && selectedNodeIds.length > 0) {
        this.store$.dispatch(new UnselectAllNodes());
      }
    });
  }

  scroll() {
    this.isContextMenuOpen = false;
    if(this.ref) {
      this.ref.markForCheck();
    }
  }
  
  contextMenuClick(optionId: number, node: INode) {
    switch(optionId) { 
      case 0:
        this.store$.dispatch(new CollapseNode({
          nodeId: node.nodeId, 
          currentVisibleNodes: this.nodes, 
          currentVisibleEdges: this.links
        }));
        break; 
      case 1:
        // Context menu Item 
        break;
      default:
        break;
    }
  }

  trackItem(index: number, item: INode) {
    return item.nodeId;
  }

  resetNodePositions() {
    this.store$.dispatch(new ResetVisibleNodesPositions());
  }
    
  selectNode(nodeId: string) {
    this.store$.dispatch(new SelectNode(nodeId));
  }
  
  selectOnlyClickedNode(nodeId: string) {
    this.store$.dispatch(new SelectOnlyClickedNode(nodeId));
  }
  
  expandNode(nodeContext: ExpandNodeContext) { 
    this.store$.dispatch(new ExpandNode({
      rootNodeId: nodeContext.rootNodeId, 
      currentVisibleNodes: nodeContext.currentVisibleNodes
    }));
  }

  fetchNeighborNodes(node: INode) { 
    const servicePayload = {} as ServicePayload;
    servicePayload.rootNodeId = node.nodeId;
    servicePayload.rootNodeType = node.nodeType;
    servicePayload.numHops = this.configParserService.nwConfig.numHops;
    this.nodeDoubleClicked.emit(servicePayload);
    this.store$.dispatch(new UpdateNodeLoadingStatus(node.nodeId));
  }
  
  onOpenContextMenu(event: MouseEvent, currentNode: INode, nodeIdx: number) {
    if(this.layoutId === 0) {
      this.isContextMenuOpen = true; 
      this.latestFocusedNode = currentNode; 
      this.latestFocusedNodeRef = this.nodeRefs!.toArray()[nodeIdx];
    }
  }
  
  toggleLabel() {
    this.store$.dispatch(new ToggleLabel());
  }
  
  OnChangeNumHops(numHops: any) {
    this.nodes = [];
    this.links = []; 
    this.ref.markForCheck();
    combineLatest([this.selectRootNodeId$, this.selectGraphData$] as combineTuple).pipe(take(1)).subscribe(([rootNodeIdFromStore, graphData]) => {
      this.store$.dispatch(new ChangeNumHop());
      if(rootNodeIdFromStore && graphData && graphData.nodes) {
        const rootNode = (graphData as INwData).nodes.get(rootNodeIdFromStore);
        if(rootNode) {
          const servicePayload = {} as ServicePayload;
          servicePayload.rootNodeId = rootNode.nodeId;
          servicePayload.rootNodeType = rootNode.nodeType;
          servicePayload.numHops = numHops;
          this.numHopChanged.emit(servicePayload);
        }
      }
    });
  }
}
