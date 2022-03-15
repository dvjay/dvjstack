import { INwData } from './../models/nw-data';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store'; 
import { INode, IEdge } from '../models/nw-data'; 
import { State as GraphState, STORE_GRAPH_SLICE_NAME} from './state';
import { GraphLog } from '../models/graph-log';
import { TransformInfo } from '../models/load-nodes-payload';

export const getNetworkGraphState: MemoizedSelector<object, GraphState> = createFeatureSelector<GraphState>(STORE_GRAPH_SLICE_NAME);

export const selectGraphData: MemoizedSelector<object, INwData | null> = createSelector(
    getNetworkGraphState, 
    state => state.data
);
export const selectIsHideLabel: MemoizedSelector<object, boolean> = createSelector(
    getNetworkGraphState, 
    state => state.hideLabel
);
// export const selectAutoNetworkExpand: MemoizedSelector<object, boolean> = createSelector(
//     getNetworkGraphState, state => state.autoNetworkExpand
// );
export const selectRootNodeId: MemoizedSelector<object, string | undefined> = createSelector(
    getNetworkGraphState, 
    state => state.rootNodeId
);
export const selectLogs: MemoizedSelector<object, GraphLog[]> = createSelector(
    getNetworkGraphState, 
    state => state.logs
);
export const selectMaxNodesExceeded: MemoizedSelector<object, boolean> = createSelector(
    getNetworkGraphState, 
    state => state.maxNodesExceeded
);
export const selectSelectedNodeIds: MemoizedSelector<object, string[]> = createSelector(
    getNetworkGraphState, 
    state => state.selectedNodeIds
);
export const selectHighlightedNodeIds: MemoizedSelector<object, string[]> = createSelector(
    getNetworkGraphState, 
    state => state.highlightedNodeIds
);
export const selectActiveLayout: MemoizedSelector<object, number> = createSelector(
    getNetworkGraphState, 
    state => state.activeLayout
);
export const selectLayoutTransform: MemoizedSelector<object, TransformInfo[]> = createSelector(
    getNetworkGraphState, 
    state => state.layoutTransform
);
export const selectActiveLayoutTransform: MemoizedSelector<object, TransformInfo> = createSelector(
    selectActiveLayout,
    selectLayoutTransform,
    (activeLayout, layoutTransform) => {
        return layoutTransform[activeLayout];
    }
);
export const selectExcludedNodeTypes: MemoizedSelector<object, string[]> = createSelector(
    getNetworkGraphState, 
    state => state.excludedNodeTypes
);
export const selectDirectLinked: MemoizedSelector<object, any> = createSelector(
    selectRootNodeId, 
    selectGraphData, 
    (rootNodeId, graphData) => {
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
);

export const selectDirectLinkedFilterByNodeType: MemoizedSelector<object, any> = createSelector(
    selectDirectLinked, 
    selectExcludedNodeTypes, 
    (directLinked, excludeNodeTypes) => {
        const nodes = directLinked.nodes; 
        const edges = directLinked.edges; 
        const filteredNodes = new Map<string, INode>(); 
        const filteredLinks = new Map<string, IEdge>();

        for(let [key, value] of nodes) { 
            if (excludeNodeTypes.indexOf(value.nodeType) === -1) {
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
);
    