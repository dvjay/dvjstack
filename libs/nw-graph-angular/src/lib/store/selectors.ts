import { INwData } from './../models/nw-data';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
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
export const selectLayouts: MemoizedSelector<object, INwData[]> = createSelector(
    getNetworkGraphState, 
    state => state.layouts
);
export const selectLayoutTransform: MemoizedSelector<object, TransformInfo[]> = createSelector(
    getNetworkGraphState, 
    state => state.layoutTransform
);
export const selectActiveLayoutTransform: MemoizedSelector<object, TransformInfo> = createSelector(
    selectActiveLayout,
    selectLayoutTransform,
    (activeLayout, layoutTransform) => layoutTransform[activeLayout]
);
export const selectExcludedNodeTypes: MemoizedSelector<object, string[]> = createSelector(
    getNetworkGraphState, 
    state => state.excludedNodeTypes
);
export const selectNodeTypes: MemoizedSelector<object, string[]> = createSelector(
    getNetworkGraphState, 
    state => state.nodeTypes
);
    