import { INwData, ILayout } from './../models/nw-data';
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import { State as GraphState, STORE_GRAPH_SLICE_NAME} from './state';
import { GraphLog } from '../models/graph-log';
import { TransformInfo } from '../models/load-nodes-payload';

export const getNetworkGraphState: MemoizedSelector<object, GraphState> = createFeatureSelector<GraphState>(STORE_GRAPH_SLICE_NAME);

export const selectGraphData: MemoizedSelector<object, INwData | null> = createSelector(
    getNetworkGraphState, 
    state => {
        if(Array.isArray(state.layouts) && state.layouts[state.activeLayout]) {
            return state.layouts[state.activeLayout].data;
        } else {
            return null;
        }
    }
);
export const selectGraphLayout: MemoizedSelector<object, ILayout | null> = createSelector(
    getNetworkGraphState, 
    state => {
        if(Array.isArray(state.layouts) && state.layouts[state.activeLayout]) {
            return state.layouts[state.activeLayout];
        } else {
            return null;
        }
    }
);
export const selectIsHideLabel: MemoizedSelector<object, boolean> = createSelector(
    getNetworkGraphState, 
    state => state.hideLabel
);
export const selectRootNodeId: MemoizedSelector<object, string | undefined> = createSelector(
    getNetworkGraphState, 
    state => state.rootNodeId
);
export const selectRootNodeType: MemoizedSelector<object, string | undefined> = createSelector(
    getNetworkGraphState, 
    state => state.rootNodeType
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
export const selectLayouts: MemoizedSelector<object, ILayout[]> = createSelector(
    getNetworkGraphState, 
    state => state.layouts
);
export const selectActiveLayoutTransform: MemoizedSelector<object, TransformInfo | null> = createSelector(
    getNetworkGraphState, 
    state => {
        if(Array.isArray(state.layouts) && state.layouts[state.activeLayout]) {
            return state.layouts[state.activeLayout].transform;
        } else {
            return null;
        }
    }
);
export const selectExcludedNodeTypes: MemoizedSelector<object, string[]> = createSelector(
    getNetworkGraphState, 
    state => state.excludedNodeTypes
);
export const selectNodeTypes: MemoizedSelector<object, string[]> = createSelector(
    getNetworkGraphState, 
    state => state.nodeTypes
);
    