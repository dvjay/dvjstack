import { ActionTypes, ChangeActiveLayout, CollapseNode, CollapseNodeContext, ExcludeNodeTypes, ExpandNode, 
        ExpandNodeContext, LoadExternalData, SelectNode, SelectOnlyClickedNode, UpdateNodeLoadingStatus } from './actions'; 
import { getInitialLayoutData, getInitialState, State } from './state';
import { Action } from '@ngrx/store';
import { identifyFullyLoadedNodesByNumHops, nwToString } from '../utils';
import {cloneDeep as lodashCloneDeep, union as lodashUnion } from "lodash";
import { EdgeId, IEdge, INode, INwData, NeighboursStateType, NodeId } from '../models/nw-data';

export function graphReducer(state = getInitialState(), action: Action): State {
    switch(action.type) { 
        case ActionTypes.TOGGLE_LABEL: { 
            return {
                ...state,
                hideLabel: !state.hideLabel 
            };
        }
        case ActionTypes.RESET_GRAPH: {
            const initialState = getInitialState();
            initialState.hideLabel = state.hideLabel;

            return initialState;
        }
        case ActionTypes.CHANGE_NUM_HOP: {
            const initialState = getInitialState();
            initialState.excludedNodeTypes = state.excludedNodeTypes;
            initialState.rootNodeId = state.rootNodeId;
            initialState.hideLabel = state.hideLabel;

            return initialState;
        }
        case ActionTypes.EXCLUDE_NODE_TYPES: { 
            const payload = (action as ExcludeNodeTypes).payload;
            return {
                ...state, 
                excludedNodeTypes: [...payload]
            };
        }
        case ActionTypes.COLLAPSE_NODE : {
            const payload = (action as CollapseNode).payload as CollapseNodeContext;
            const colNodeId = payload.nodeId;
            const layouts = state.layouts.map(item => {
                return {...item};
            });
            for(let i=0; i<layouts.length; i++) {
                const node = layouts[i].nodes.get(colNodeId);
                if(node) {
                    node.collapsed = true;
                }
            }

            return {
                ...state,
                layouts: layouts
            };
        }
        case ActionTypes.EXPAND_NODE: {
            const payload = (action as ExpandNode).payload as ExpandNodeContext;
            const currentVisibleNodes = payload.currentVisibleNodes;
            const colNodeId = payload.rootNodeId;
            const layouts = state.layouts.map(item => {
                return {...item};
            });
            const currentVisibleNodeIds = currentVisibleNodes.map(item => {
                return item.nodeId;
            });
            const data = getGraphDataFromGraphState(state);

            if(data) {
                for(let i=0; i<layouts.length; i++) {
                    const node = layouts[i].nodes.get(colNodeId);
                    if(node) {
                        node.collapsed = false;
                    }
                }
                for (const [key, _] of data.nodes) {
                    if(key) {
                        if(currentVisibleNodeIds.indexOf(key) < 0) {
                            for(let i=0; i<layouts.length; i++) {
                                const node = layouts[i].nodes.get(key);
                                if(node) {
                                    node.collapsed = true;
                                }
                            }
                        }
                    }
                }
            }

            return {
                ...state,
                layouts: layouts
            };
        }
        case ActionTypes.LOAD_EXTERNAL_DELTA_DATA: {
            const payload = (action as LoadExternalData).payload; 
            let rootNodeIdForDelta = nwToString(payload.rootNodeId);
            const payloadData = payload.data;
            const maxNodeCount = payload.maxNodeCount;
            const activeLayout = state.activeLayout;
            let maxNodeCountExceeded = false;
            const isSkewed = payload.isSkewed;

            let layouts = state.layouts;
            let hasLayoutLoaded = state.hasLayoutLoaded;
            let layoutTransform = state.layoutTransform;
            const stateData = getGraphDataFromGraphState(state);

            layouts = layouts.map((lyt) => ({...lyt}));
            const newEdgeIds = new Set<string>();

            for(const [key, value] of payloadData.edges) {
                if(stateData && !stateData.edges.has(key)) {
                    newEdgeIds.add(key);
                    for(let i=0; i<layouts.length; i++) {
                        layouts[i].edges.set(key, lodashCloneDeep(value));
                    }
                }
            }
            for(const [key, value] of payloadData.nodes) {
                if(stateData) {
                    for(let i=0; i<layouts.length; i++) {
                        if(stateData.nodes.has(key)) {
                            const _node = layouts[i].nodes.get(key);
                            if(_node) {
                                if(key === rootNodeIdForDelta) {
                                    _node.neighboursLoaded = true;
                                    _node.neighboursStatus = NeighboursStateType.LOADED;
                                } else {
                                    if(value.neighboursLoaded === true) {
                                        _node.neighboursLoaded = true;
                                        _node.neighboursStatus = NeighboursStateType.LOADED;
                                    }
                                }
                            }
                        }
                        else {
                            const newNode = lodashCloneDeep(value);
                            if(isSkewed === true && !newNode.neighboursLoaded === true) {
                                newNode.neighboursLoaded = true;
                                newNode.neighboursLoading = false;
                                newNode.neighboursStatus = NeighboursStateType.LOADED;
                                newNode.isSkewed = 'true';
                            }
                            newNode.collapsed = true;
                            layouts[i].nodes.set(key, newNode);
                        }
                    }
                }
            }
            for (const edgeId of newEdgeIds) {
                for(let i=0; i<layouts.length; i++) {
                    const edge = layouts[i].edges.get(edgeId);
                    if(edge) {
                        const sourceNode = layouts[i].nodes.get(edge.sourceNodeId); 
                        const targetNode = layouts[i].nodes.get(edge.targetNodeId); 
                        if(sourceNode && targetNode && Array.isArray(sourceNode.targetIds) && Array.isArray(targetNode.sourceIds)) {
                            sourceNode.targetIds.indexOf(edge.targetNodeId) === -1? sourceNode.targetIds.push(edge.targetNodeId) : null;
                            targetNode.sourceIds.indexOf(edge.sourceNodeId) === -1? targetNode.sourceIds.push(edge.sourceNodeId) : null; 
                        }
                    }
                }
            }

            if(layouts && layouts[activeLayout] && layouts[activeLayout].nodes) {
                const cnt = layouts[activeLayout].nodes.size;
                maxNodeCountExceeded = cnt > maxNodeCount;
            }

            return {
                ...state,
                nodeTypes: payload.nodeTypes,
                layouts: layouts,
                layoutTransform,
                hasLayoutLoaded,
                maxNodesExceeded: maxNodeCountExceeded
            };
        }
        case ActionTypes.LOAD_EXTERNAL_DATA: {
            const payload = (action as LoadExternalData).payload; 
            let rootNodeId = nwToString(payload.rootNodeId);
            const payloadData = payload.data;
            const maxNodeCount = payload.maxNodeCount;
            const nodeCount = parseInt(payload.nodeCount.toString());
            const activeLayout = state.activeLayout;
            let maxNodeCountExceeded = false;
            const isSkewed = payload.isSkewed;

            let layouts = state.layouts;
            let hasLayoutLoaded = state.hasLayoutLoaded;
            let layoutTransform = state.layoutTransform;

            const cRootNode = payloadData.nodes.get(rootNodeId);
            if(cRootNode) {
                cRootNode.isRootNode = true;
                cRootNode.collapsed = false;
            } else {
                console.info("Root Node is absent.")
                return state;
            }
            layouts = [getInitialLayoutData(), getInitialLayoutData(), getInitialLayoutData()];
            hasLayoutLoaded = [false, false, false];
            layoutTransform = [{x: 0, y: 0, k: 1}, {x: 0, y: 0, k: 1}, {x: 0, y: 0, k: 1}];
            if(activeLayout === 0) {
                hasLayoutLoaded[activeLayout] = true;
            }

            for(let i=0; i<layouts.length; i++) {
                const clonedNodes = new Map<NodeId, INode>();
                const clonedEdges = new Map<EdgeId, IEdge>();
            
                for (const [key, value] of payloadData.nodes) {
                    const clondedNode = lodashCloneDeep(value);
                    if(isSkewed === true && !clondedNode.neighboursLoaded === true) {
                        clondedNode.neighboursLoaded = true;
                        clondedNode.neighboursLoading = false;
                        clondedNode.neighboursStatus = NeighboursStateType.LOADED;
                        clondedNode.isSkewed = 'true';
                    }
                    clonedNodes.set(key, clondedNode);
                }
            
                for (const [key, value] of payloadData.edges) {
                    clonedEdges.set(key, lodashCloneDeep(value));
                }
                layouts[i] = {nodes: clonedNodes, edges: clonedEdges};
            }

            if(typeof nodeCount === 'number' && nodeCount > 0) {
                maxNodeCountExceeded = nodeCount > maxNodeCount;
            } else {
                maxNodeCountExceeded = payloadData.nodes.size > maxNodeCount;
            }

            return {
                ...state,
                rootNodeId: rootNodeId,
                nodeTypes: payload.nodeTypes,
                layouts: layouts,
                layoutTransform,
                hasLayoutLoaded,
                maxNodesExceeded: maxNodeCountExceeded
            };
        }
        case ActionTypes.EXPAND_ONLY_ROOT_NODE: {
            const layouts = [...state.layouts];
            const activeLayoutId = state.activeLayout;
            const rootNodeId = nwToString(state.rootNodeId);
            const activeLayout = {...layouts[activeLayoutId]};

            for(let [key, value] of activeLayout.nodes) {
                if(key === rootNodeId) {
                    value.collapsed = false;
                } else {
                    value.collapsed = true;
                }
            }
            layouts[activeLayoutId] = activeLayout;

            return {
                ...state,
                layouts: layouts
            };
        }
        case ActionTypes.EXPAND_ALL_NODES: {
            const layouts = state.layouts.map(item => {
                return {...item};
            });
            const data = getGraphDataFromGraphState(state);

            if(state.rootNodeId && data) {
                const loadedNodes = identifyFullyLoadedNodesByNumHops(state.rootNodeId, data, 2);
                for(let key of loadedNodes) {
                    for(let i=0; i<layouts.length; i++) {
                        const node = layouts[i].nodes.get(key);
                        if(node) {
                            node.collapsed = false;
                        }
                    }
                }
            }

            return {
                ...state,
                layouts: layouts
            };
        }
        case ActionTypes.COLLAPSE_ALL_NODES: {
            const layouts = state.layouts.map(item => {
                return {...item};
            });
            const data = getGraphDataFromGraphState(state);

            if(data) {
                for(let [key, _] of data.nodes) {
                    for(let i=0; i<layouts.length; i++) {
                        const node = layouts[i].nodes.get(key);
                        if(node) {
                            if(key === state.rootNodeId) {
                                node.collapsed = false;
                            } else {
                                node.collapsed = true;
                            }
                        }
                    }
                }
            }

            return {
                ...state,
                layouts: layouts
            };
        }
        case ActionTypes.COLLAPSE_LEAF_NODES: {
            const layouts = state.layouts.map(item => {
                return {...item};
            });
            const data = getGraphDataFromGraphState(state);

            if(data) {
                for(let [_, value] of data.nodes) {
                    const combIds = lodashUnion(value.sourceIds, value.targetIds)
                    if(combIds.length === 1 ) {
                        for(let i=0; i<layouts.length; i++) {
                            const node = layouts[i].nodes.get(combIds[0]);
                            if(node) {
                                node.collapsed = true;
                            }
                        }
                    }
                }
            }

            return {
                ...state,
                layouts: layouts
            };
        }
        case ActionTypes.RESET_VISIBLE_NODES_POSITIONS: {
            const rootNodeId = state.rootNodeId;
            const excludedNodeTypes = state.excludedNodeTypes;
            const graphData = getGraphDataFromGraphState(state);
            if(typeof rootNodeId === 'string' && rootNodeId.length > 0 && graphData) {
                const nodes = graphData.nodes;
                const rootNode = nodes.get(rootNodeId);
                if(rootNode && rootNode.nodeType && excludedNodeTypes.indexOf(rootNode.nodeType) > -1) {
                    const index = excludedNodeTypes.indexOf(rootNode.nodeType);
                    excludedNodeTypes.splice(index, 1);
                }
            }
            return {...state, excludedNodeTypes};
        }
        case ActionTypes.SELECT_NODE: {
            const nodeId = (action as SelectNode).payload;
            if (state.selectedNodeIds.length < 2 && nodeId) {
                const nIdx = state.selectedNodeIds.indexOf(nodeId); 
                if(nIdx > -1) {
                    return {
                        ...state,
                        selectedNodeIds: state.selectedNodeIds.slice(0, nIdx).concat(state.selectedNodeIds.slice(nIdx + 1, state.selectedNodeIds.length)),
                        highlightedNodeIds: []
                    };
                } else { 
                    return {
                        ...state,
                        selectedNodeIds: [nodeId, ...state.selectedNodeIds],
                        highlightedNodeIds: []
                    };
                }
            } else {
                return state;
            }
        }
        case ActionTypes.SELECT_ONLY_CLICKED_NODE: {
            const nodeId = (action as SelectOnlyClickedNode).payload;
            if(nodeId) { 
                return {
                    ... state, 
                    selectedNodeIds: [nodeId],
                    highlightedNodeIds: []
                };
            } else {
                return state;
            }
        }
        case ActionTypes.UPDATE_NODE_LOADING_STATUS: {
            const nodeId = (action as UpdateNodeLoadingStatus).payload;
            let layouts = state.layouts;
            let data = getGraphDataFromGraphState(state);

            if(nodeId && data && data.nodes.has(nodeId)) { 
                layouts = lodashCloneDeep(layouts);

                for(let i=0; i<layouts.length; i++) {
                    const _node = layouts[i].nodes.get(nodeId);
                    if(_node) {
                        _node.neighboursLoaded = false;
                        _node.neighboursLoading = true;
                        _node.neighboursStatus = NeighboursStateType.LOADING;
                    }
                }
                return {
                    ... state,
                    layouts: layouts
                };
            } else {
                return state;
            }
        }
        case ActionTypes.CHANGE_ACTIVE_LAYOUT: {
            const payload = (action as ChangeActiveLayout).payload;
            const newActiveLayout = payload.layoutId;
            const prevActiveLayout = payload.prevLayoutId;
            const prevLayoutTransform = payload.prevLayoutTransform;
            const newLayoutTransform = [...state.layoutTransform];
            const newHasLayoutLoaded = [...state.hasLayoutLoaded];
            newLayoutTransform[prevActiveLayout] = prevLayoutTransform;
            if(newActiveLayout === 0) {
                newHasLayoutLoaded[newActiveLayout] = true;
                for(let i=1; i<state.layouts.length; i++) {
                    for(let [_, value] of state.layouts[i].nodes) {
                        delete value.x; 
                        delete value.y; 
                        delete value.vx; 
                        delete value.vy; 
                        delete value.fx; 
                        delete value.fy;
                    }
                }
            }

            return {
                ...state,
                activeLayout: newActiveLayout,
                layoutTransform: newLayoutTransform,
                hasLayoutLoaded: newHasLayoutLoaded
            };
        }
        case ActionTypes.UNSELECT_ALL_NODES: { 
            return {
                ...state, 
                selectedNodeIds: [],
                highlightedNodeIds: []
            };
        }
        default: {
            return state;
        }
    }
}

function getGraphDataFromGraphState(gState: State): INwData | null {
    if(gState && Array.isArray(gState.layouts) && gState.activeLayout) {
        return gState.layouts[gState.activeLayout];
    } else {
        return null;
    }
}
