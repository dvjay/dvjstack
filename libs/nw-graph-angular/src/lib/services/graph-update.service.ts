import { IEdge } from './../models/nw-data';
import { Injectable } from '@angular/core'; 
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { INode, INwData } from '../models/nw-data';
import { GraphEngineService } from './graph-engine.service';
import { State as GraphState, STORE_GRAPH_SLICE_NAME } from '../store/state';
import * as graphSelectors from '../store/selectors'; 
import { CollapseAllNodes, ExcludeNodeTypes, ExpandAllNodes } from '../store/actions';
import { combineLatest } from 'rxjs';
import { DEFAULT_GRAPH_OPTIONS, GraphAdapter, GraphOptions } from '../models/graph-adapter';
import WebcolaAdapter from '../graph-adapters/webcola/webcola.adapter';


@Injectable()
export class GraphUpdateService {
    selectDirectLinkedFilterByNodeType$: any;
    selectGraphData$: any;
    selectExcludedNodeTypes$: any;
    private adapter: GraphAdapter | undefined;
    public options: GraphOptions = DEFAULT_GRAPH_OPTIONS; 

    constructor(private store$: Store<GraphState>, public graphEngineService: GraphEngineService) {
        this.selectDirectLinkedFilterByNodeType$ = this.store$.select(graphSelectors.selectDirectLinkedFilterByNodeType);
        this.selectGraphData$ = this.store$.select(graphSelectors.selectGraphData);
        this.selectExcludedNodeTypes$ = this.store$.select(graphSelectors.selectExcludedNodeTypes);

        this.adapter = new WebcolaAdapter(this.options); 
    }

    renderGraphFromStore() {
        this.selectDirectLinkedFilterByNodeType$.pipe(take(1)).subscribe((graphData: INwData) => {
            this.renderGraph(graphData);
        });
    }

    renderGraph(graphData: INwData) {
        this.store$.pipe(take(1)).subscribe((val: any) => {
            let graphState = val[STORE_GRAPH_SLICE_NAME] as GraphState;
            let rootNode = graphData.nodes.get(graphState.rootNodeId);
            if (rootNode) {
                this.graphEngineService.updateGraph(
                graphData,
                rootNode,
                graphState.nodeTypes,
                graphState.activeLayout,
                true
                );
            }
        });
    }

    expandAllNodes() {
        this.store$.dispatch(new ExpandAllNodes());
        this.renderGraphFromStore();
    }   
    collapseAllNodes() {
        this.store$.dispatch(new CollapseAllNodes());
        this.renderGraphFromStore();
    }

    filterExcludeNodeTypes(nodeTypes: string[]) {
        this.store$.dispatch(new ExcludeNodeTypes(nodeTypes));
        this.renderGraphFromStore();
    }

    PositionNeighborNodes(centeredNode: INode) {
        const combinedGraphData$ = combineLatest([this.selectGraphData$, this.selectDirectLinkedFilterByNodeType$, this.selectExcludedNodeTypes$]);

        combinedGraphData$.pipe(take(1)).subscribe(([allNodesData, VisibleNodesData, excludedNodeTypes]) => {
            const allNodes = (allNodesData as INwData).nodes;
            const allEdges = (allNodesData as INwData).edges;
            const visibleNodes = (VisibleNodesData as INwData).nodes;
            const centeredNodeXPos = centeredNode.x;
            const centeredNodeYPos = centeredNode.y;
            
            /* Get clicked node hidden all neighbors*/
            const allDirectNeighbourNodes = new Map<string, INode>();
            allDirectNeighbourNodes.set(centeredNode.nodeId, centeredNode);
            /* Delete centered Node ID position */
            delete centeredNode.x; delete centeredNode.fx; delete centeredNode.vx;
            delete centeredNode.y; delete centeredNode.fy; delete centeredNode.vy;    

            [...centeredNode.sourceIds!, ...centeredNode.targetIds!].forEach(id => {
                const n = allNodes.get(id);
                if(id && n) {
                    if(!visibleNodes.has(id)) {
                        delete n.x; delete n.fx; delete n.vx; 
                        delete n.y; delete n.fy; delete n.vy;
                    
                        allDirectNeighbourNodes.set(id, n);
                    }
                }
            })
            const allDirectNeighbourEdges = new Map<string, IEdge>();
            for (const [key, value] of allEdges) {
                if(value.sourceNodeId === centeredNode.nodeId || value.targetNodeId === centeredNode.nodeId) {
                    allDirectNeighbourEdges.set(key, value);
                }
            }
            const allDirectNeighbourData: INwData = {nodes: allDirectNeighbourNodes, edges: allDirectNeighbourEdges};
            // const unFilteredDirectNeighbourData: INwData = {nodes: unFilteredDirectNeighbourNodes, edges: allDirectNeighbourEdges};

            /* generate position for unfiltered  */
            this.adapter!.attachNodesPositionByLayout(allDirectNeighbourData, centeredNode, [], 0);
            if(centeredNodeXPos && centeredNodeYPos) {
                this.MoveNodes(allDirectNeighbourData.nodes, centeredNode, centeredNodeXPos, centeredNodeYPos);
            }
        });
    }

    private MoveNodes(nodes: Map<string | undefined, INode>, centerNode: INode, targetX: number, targetY: number) {
        if(centerNode.x && centerNode.y) {
            const agl = this.getAngle(centerNode.x, centerNode.y, targetX, targetY);
            const distance = this.getDistance(centerNode.x, centerNode.y, targetX, targetY);
            for (const [_, val] of nodes) {
                if(val.x && val.y) {
                    this.updateNewPoint(val, agl, distance);
                }
            }
        }
    }

    private updateNewPoint(nwNode: INode, angle: number, distance: number) {
        if(nwNode && nwNode.x && nwNode.y) {
            nwNode.x = nwNode.fx = Math.round(Math.cos(angle * Math.PI / 180) * distance + nwNode.x);
            nwNode.y = nwNode.fy = Math.round(Math.sin(angle * Math.PI / 180) * distance + nwNode.y);
        }
    }

    private getDistance(x1: number, y1: number, x2: number, y2: number) { 
        var xDiff = x1 - x2; 
        var yDiff = y1 - y2;
    
        return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    }

    private getAngle(x1: number, y1: number, x2: number, y2: number) { 
        return Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    }
}