import { Injectable } from '@angular/core'; 
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { INode, IEdge, INwData } from '../models/nw-data';
import { GraphEngineService } from './graph-engine.service';
import { State as GraphState } from '../store/state';
import * as graphSelectors from '../store/selectors'; 
import { CollapseAllNodes, ExcludeNodeTypes, ExpandAllNodes } from '../store/actions';
import { combineLatest } from 'rxjs';
import { DEFAULT_GRAPH_OPTIONS, GraphAdapter, GraphOptions } from '../models/graph-adapter';
import WebcolaAdapter from '../graph-adapters/webcola/webcola.adapter';


@Injectable()
export class GraphUpdateService {
    selectRootNodeId$: any;
    selectGraphData$: any;
    selectExcludedNodeTypes$: any;
    selectNodeTypes$: any;
    selectActiveLayout$: any;
    private adapter: GraphAdapter | undefined;
    public options: GraphOptions = DEFAULT_GRAPH_OPTIONS; 

    constructor(private store$: Store<GraphState>, public graphEngineService: GraphEngineService) {
        this.selectRootNodeId$ = this.store$.select(graphSelectors.selectRootNodeId);
        this.selectGraphData$ = this.store$.select(graphSelectors.selectGraphData);
        this.selectExcludedNodeTypes$ = this.store$.select(graphSelectors.selectExcludedNodeTypes);
        this.selectNodeTypes$ = this.store$.select(graphSelectors.selectNodeTypes);
        this.selectActiveLayout$ = this.store$.select(graphSelectors.selectActiveLayout);

        this.adapter = new WebcolaAdapter(this.options); 
    }

    tickGraph() {
        const combinedGraphData$ = combineLatest([this.selectRootNodeId$, 
                                                    this.selectGraphData$, 
                                                    this.selectExcludedNodeTypes$,
                                                    this.selectActiveLayout$]);

        combinedGraphData$.pipe(take(1)).subscribe(([rootNodeId, allNodesData, excludedNodeTypes, activeLayout]) => {
            if(activeLayout === 0) {
                const visibleNodeData = this.getVisibleNodes(rootNodeId as string, allNodesData as INwData, excludedNodeTypes as string[]);
                if(visibleNodeData) {
                    this.graphEngineService.updateGraph(visibleNodeData);
                }
            }
        });
    }

    positionVisibleNodes() {
        const combinedGraphData$ = combineLatest([this.selectRootNodeId$, 
                                                    this.selectGraphData$, 
                                                    this.selectNodeTypes$,
                                                    this.selectExcludedNodeTypes$,
                                                    this.selectActiveLayout$]);

        combinedGraphData$.pipe(take(1)).subscribe(([rootNodeId, allNodesData, nodeTypes, excludedNodeTypes, activeLayout]) => {
            const visibleNodeData = this.getVisibleNodes(rootNodeId as string, allNodesData as INwData, excludedNodeTypes as string[]);
            const visibleNodes = (visibleNodeData as INwData).nodes;
            const visibleEdges = (visibleNodeData as INwData).edges;
            for (const [_, value] of visibleNodes) {
                delete value.x; delete value.y; delete value.fx; delete value.fy; delete value.vx; delete value.vy;
            }
            for (const [_, value] of visibleEdges) {
                value.source = value.sourceNodeId;
                value.target = value.targetNodeId;
            }
            const centeredNode = visibleNodes.get(rootNodeId as string);
            if(visibleNodeData && centeredNode) {
                this.adapter!.attachNodesPositionByLayout(visibleNodeData as INwData, centeredNode, nodeTypes as string[], activeLayout as number, true);
                this.graphEngineService.updateGraph(visibleNodeData);
            }
        });
    }

    positionDeltaNodesFromData(deltaCenteredNodeId: string, deltaNodeData: INwData) {
        this.selectGraphData$.pipe(take(1)).subscribe((graphData: INwData) => {
            const deltaCenteredNode = deltaNodeData.nodes.get(deltaCenteredNodeId);
            const allNodesFromStore = graphData.nodes;
            const deltaCenteredNodeFromStore = allNodesFromStore.get(deltaCenteredNodeId);
            if(!(deltaCenteredNode && deltaCenteredNodeFromStore)) {
                return;
            }
            const centeredNodeXPos = deltaCenteredNodeFromStore.x;
            const centeredNodeYPos = deltaCenteredNodeFromStore.y;

            const deltaCenteredSourceIds = Array.isArray(deltaCenteredNode.sourceIds)? deltaCenteredNode.sourceIds : [];
            const deltaCenteredTargetIds = Array.isArray(deltaCenteredNode.targetIds)? deltaCenteredNode.targetIds : [];
            const combinedNeighborIds = new Set([...deltaCenteredSourceIds, ...deltaCenteredTargetIds]);
            const deltaNodes = new Map<string, INode>();
            deltaNodes.set(deltaCenteredNodeId, deltaCenteredNode);

            for (const neighborId of combinedNeighborIds) {
                if(neighborId && !allNodesFromStore.has(neighborId)) {
                    const dnNode = deltaNodeData.nodes.get(neighborId);
                    if(dnNode) {
                        deltaNodes.set(neighborId, dnNode);
                    }
                }
            }
            const deltaLinks = new Map<string, IEdge>();
            for (const [key, value] of deltaNodeData.edges) {
                if(value.sourceNodeId === deltaCenteredNodeId || value.targetNodeId === deltaCenteredNodeId) {
                    if(deltaNodes.has(value.sourceNodeId) || deltaNodes.has(value.targetNodeId)) {
                        deltaLinks.set(key, value);
                    }
                }
            }
            const adjcentDeltaNodeData: INwData = {nodes: deltaNodes, edges: deltaLinks};
            /* generate position for unfiltered  */
            this.adapter!.attachNodesPositionByLayout(adjcentDeltaNodeData, deltaCenteredNode, [], 0, true);
            if(centeredNodeXPos && centeredNodeYPos) {
                this.MoveNodes(adjcentDeltaNodeData.nodes, deltaCenteredNode, centeredNodeXPos, centeredNodeYPos);
            }
        });
    }

    positionAllNodes() {
        const combinedGraphData$ = combineLatest([this.selectRootNodeId$, 
            this.selectGraphData$, 
            this.selectNodeTypes$,
            this.selectExcludedNodeTypes$,
            this.selectActiveLayout$]);

        combinedGraphData$.pipe(take(1)).subscribe(([rootNodeId, allNodesData, nodeTypes, excludedNodeTypes, activeLayout]) => {
            const visibleNodeData = this.getVisibleNodes(rootNodeId as string, allNodesData as INwData, excludedNodeTypes as string[]);
            if(allNodesData) {
                const allNodes = (allNodesData as INwData).nodes;
                const centeredNode = allNodes.get(rootNodeId as string);
                if(allNodes && centeredNode) {
                    this.adapter!.attachNodesPositionByLayout(allNodesData as INwData, centeredNode, nodeTypes as string[], activeLayout as number, true);
                    this.graphEngineService.updateGraph(visibleNodeData);
                }
            }
        });
    }

    positionNeighborNodes(centeredNodeId: string, visibleNodesBeforeExpand: INode[]) {
        const visibleNodeIdsBeforeExpand = visibleNodesBeforeExpand.map(i => i.nodeId);
        const combinedGraphData$ = combineLatest([this.selectRootNodeId$, 
            this.selectGraphData$, 
            this.selectNodeTypes$,
            this.selectExcludedNodeTypes$,
            this.selectActiveLayout$]);

        combinedGraphData$.pipe(take(1)).subscribe(([rootNodeId, allNodesData, nodeTypes, excludedNodeTypes, activeLayout]) => {
            if(activeLayout === 0) {
                const allNodes = (allNodesData as INwData).nodes;
                const allEdges = (allNodesData as INwData).edges;
                const centeredNode = allNodes.get(centeredNodeId);
                if(!centeredNode) {
                    return;
                }
                const centeredNodeXPos = centeredNode.x;
                const centeredNodeYPos = centeredNode.y;
                const visibleNodeData = this.getVisibleNodes(rootNodeId as string, allNodesData as INwData, excludedNodeTypes as string[]);
                
                /* Get clicked node hidden all neighbors*/
                const allDirectNeighbourNodes = new Map<string, INode>();
                allDirectNeighbourNodes.set(centeredNode.nodeId, centeredNode);
                /* Delete centered Node ID position */
                delete centeredNode.x; delete centeredNode.fx; delete centeredNode.vx;
                delete centeredNode.y; delete centeredNode.fy; delete centeredNode.vy;    
    
                [...centeredNode.sourceIds!, ...centeredNode.targetIds!].forEach(id => {
                    const n = allNodes.get(id);
                    if(id && n && visibleNodeIdsBeforeExpand.indexOf(id) < 0) {
                        delete n.x; delete n.fx; delete n.vx; 
                        delete n.y; delete n.fy; delete n.vy;
                        allDirectNeighbourNodes.set(id, n);
                    }
                })
                const allDirectNeighbourEdges = new Map<string, IEdge>();
                for (const [key, value] of allEdges) {
                    if(value.sourceNodeId === centeredNode.nodeId || value.targetNodeId === centeredNode.nodeId) {
                        if(allDirectNeighbourNodes.has(value.sourceNodeId) || allDirectNeighbourNodes.has(value.targetNodeId)) {
                            allDirectNeighbourEdges.set(key, value);
                        }
                    }
                }
                const allDirectNeighbourData: INwData = {nodes: allDirectNeighbourNodes, edges: allDirectNeighbourEdges};
    
                /* generate position for unfiltered  */
                this.adapter!.attachNodesPositionByLayout(allDirectNeighbourData, centeredNode, nodeTypes as string[], activeLayout as number, true);
                if(centeredNodeXPos && centeredNodeYPos) {
                    this.MoveNodes(allDirectNeighbourData.nodes, centeredNode, centeredNodeXPos, centeredNodeYPos);
                }
                this.graphEngineService.updateGraph(visibleNodeData);
            }
        });
    }

    getVisibleNodes(rootNodeId: string, graphData: INwData, excludeNodeTypes: string[]) {
        const directLinked = this.selectDirectLinkedNodesAndEdges(rootNodeId, graphData);
        return this.selectDirectLinkedFilterByNodeType(directLinked, excludeNodeTypes);
    }

    selectDirectLinkedNodesAndEdges(rootNodeId: string, graphData: INwData) {
        const nodes = graphData ? graphData.nodes: new Map<string, INode>(); 
        const edges = graphData ? graphData.edges: new Map<string, IEdge>(); 
        const filteredNodes = new Map<string, INode>(); 
        const filteredLinks = new Map<string, IEdge>();
        
        if(rootNodeId) {
            const rootNode = nodes.get(rootNodeId); 
            if(rootNode && rootNode.collapsed) {
                filteredNodes.set(rootNodeId, rootNode);
            } else {
                const queue = [rootNodeId]; 
                let current: string; 
                let currentNode: INode; 
                let neighborIds: string[];
                
                while (queue.length != 0) {
                    current = queue.shift()!; 
                    if(current && nodes.has(current)) {
                        currentNode = nodes.get(current)!; 
                        filteredNodes.set(current, currentNode); 
                        neighborIds = [...(currentNode.sourceIds as string[]), ...(currentNode.targetIds as string[])];
                        for (var j = 0; j < neighborIds.length; j++) {
                            const neighNode = nodes.get(neighborIds[j]); 
                            if (neighNode && neighNode.collapsed) {
                                filteredNodes.set(neighborIds[j], nodes.get(neighborIds[j])!);
                            } else { 
                                if (!filteredNodes.has(neighborIds[j])) {
                                    queue.push(neighborIds[j]);
                                }
                            }
                        }
                    }
                }
            }
            for(let [key, value] of edges) { 
                if(filteredNodes.has(value.sourceNodeId) && filteredNodes.has(value.targetNodeId)) {
                    filteredLinks.set(key, value);
                }
            }
        }    
        /**Node Type Filter */ 
        return { nodes: filteredNodes, edges: filteredLinks};
    }

    selectDirectLinkedFilterByNodeType(directLinked: INwData, excludeNodeTypes: string[]) {
        const nodes = directLinked.nodes; 
        const edges = directLinked.edges; 
        const filteredNodes = new Map<string, INode>(); 
        const filteredLinks = new Map<string, IEdge>();

        for(let [key, value] of nodes) { 
            if (key && excludeNodeTypes.indexOf(value.nodeType) === -1) {
                filteredNodes.set(key, value);
            }
        }
        for(let [key, value] of edges) {
            if(filteredNodes.has(value.sourceNodeId) && filteredNodes.has(value.targetNodeId)) {
                filteredLinks.set(key, value);
            }
        }
        /**Node Type Filter */ 
        return { nodes: filteredNodes, edges: filteredLinks};
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