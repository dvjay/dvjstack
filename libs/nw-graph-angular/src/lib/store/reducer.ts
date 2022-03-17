import { ActionTypes, ChangeActiveLayout, CollapseNode, ExcludeNodeTypes, ExpandNode, ExpandOnlyRootNode, LoadExternalData, ResetNodesPositions, ResetVisibleNodesPositions, SelectNode, SelectOnlyClickedNode, UpdateNodeLoadingStatus } from './actions'; 
import { initialState, State } from './state';
import { Action } from '@ngrx/store';
import { nwToString } from '../utils';
import {cloneDeep as lodashCloneDeep, union as lodashUnion } from "lodash";
import { EdgeId, IEdge, INode, INwData, NeighboursStateType, NodeId } from '../models/nw-data';

export function graphReducer(state = initialState, action: Action): State {
    switch(action.type) { 
        case ActionTypes.TOGGLE_LABEL: { 
            return {
                ...state,
                hideLabel: !state.hideLabel 
            };
        }
        // case ActionTypes.TOGGLE_RENDER: { 
        //     return {
        //         ...state,
        //         enableRender: !state.enableRender 
        //     };
        // }
        case ActionTypes.RESET_GRAPH: { 
            return {
                ...initialState
            };
        }
        case ActionTypes.EXCLUDE_NODE_TYPES: { 
            const payload = (action as ExcludeNodeTypes).payload;
            return {
                ...state, 
                excludedNodeTypes: [...payload]
            };
        }
        case ActionTypes.COLLAPSE_NODE : {
            const payload = (action as CollapseNode).payload;
            const colNodeId = payload.nodeId;
            const layouts = state.layouts.map(item => {
                return {...item};
            });
            const data = state.data;

            if(data) {
                for(let i=0; i<layouts.length; i++) {
                    const node = layouts[i].nodes.get(colNodeId);
                    if(node && state.hasLayoutLoaded[i] === true) {
                        node.collapsed = true;
                    }
                }
            }

            return {
                ...state,
                layouts: layouts,
                data: layouts[state.activeLayout]
            };
        }
        case ActionTypes.EXPAND_NODE: {
            const payload = (action as CollapseNode).payload;
            const currentVisibleNodes = payload.currentVisibleNodes;
            const colNodeId = payload.nodeId;
            const data = state.data;
            const layouts = state.layouts.map(item => {
                return {...item};
            });
            const currentVisibleNodeIds = currentVisibleNodes.map(item => {
                return item.nodeId;
            });
            

            if(data) {
                for(let i=0; i<layouts.length; i++) {
                    const node = layouts[i].nodes.get(colNodeId);
                    if(node) {
                        node.collapsed = false;
                    }
                }
                for (const [key, value] of data.nodes) {
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
                layouts: layouts,
                data: layouts[state.activeLayout]
            };
        }
        case ActionTypes.LOAD_EXTERNAL_DATA: {
            const payload = (action as LoadExternalData).payload; 
            let rootNodeId = nwToString(payload.rootNodeId);
            const payloadData = payload.data;
            const maxNodeCount = payload.maxNodeCount;
            const nodeCount = parseInt(payload.nodeCount.toString());
            const originalRootNodeId = state.rootNodeId;
            const activeLayout = state.activeLayout;
            const graphData = state.data;
            let maxNodeCountExceeded = false;

            let layouts = state.layouts;
            let hasLayoutLoaded = state.hasLayoutLoaded;
            let layoutTransform = state.layoutTransform;
            const stateData = state.data;

            /*
            if(typeof nodeCount === 'number' && nodeCount > 0) {
                maxNodeCountExceeded = nodeCount > maxNodeCount;
            } else {
                maxNodeCountExceeded = payloadData.nodes.size > maxNodeCount;
            }
            */

            if(originalRootNodeId && rootNodeId !== originalRootNodeId) {
                layouts = [...layouts];
                const newEdgeIds = new Set<string>();

                for (const [key, value] of payloadData.edges) {
                    if(stateData && !stateData.edges.has(key)) {
                        newEdgeIds.add(key);
                        for(let i=0; i<layouts.length; i++) {
                            layouts[i].edges.set(key, lodashCloneDeep(value));
                        }
                    }
                }
                for (const [key, value] of payloadData.nodes) {
                    if(stateData) {
                        for(let i=0; i<layouts.length; i++) {
                            if(stateData.nodes.has(key)) {
                                const _node = layouts[i].nodes.get(key);
                                if(_node && key === rootNodeId) {
                                    _node.neighboursLoaded = true;
                                    _node.neighboursStatus = NeighboursStateType.LOADED;
                                }
                            }
                            else {
                                const newNode = lodashCloneDeep(value);
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
                rootNodeId = originalRootNodeId;
            } else {
                // Check if rootNodeId exist in incoming data
                const cRootNode = payloadData.nodes.get(rootNodeId);
                if(cRootNode) {
                    cRootNode.isRootNode = true;
                } else {
                    console.info("Root Node is absent.")
                    return state;
                }
                layouts = [{ nodes: new Map<NodeId, INode>(), edges: new Map<EdgeId, IEdge>()}, 
                                    { nodes: new Map<NodeId, INode>(), edges: new Map<EdgeId, IEdge>()}, 
                                    { nodes: new Map<NodeId, INode>(), edges: new Map<EdgeId, IEdge>()}];
                hasLayoutLoaded = [false, false, false];
                layoutTransform = [{x: 0, y: 0, k: 1}, {x: 0, y: 0, k: 1}, {x: 0, y: 0, k: 1}];
                hasLayoutLoaded[activeLayout] = true;

                for(let i=0; i<layouts.length; i++) {
                    const clonedNodes = new Map<NodeId, INode>();
                    const clonedEdges = new Map<EdgeId, IEdge>();
                
                    for (const [key, value] of payloadData.nodes) {
                        clonedNodes.set(key,  lodashCloneDeep(value));
                    }
                
                    for (const [key, value] of payloadData.edges) {
                        clonedEdges.set(key, lodashCloneDeep(value));
                    }
                    layouts[i] = {nodes: clonedNodes, edges: clonedEdges};
                }
            }

            return {
                ...initialState, 
                rootNodeId: rootNodeId, 
                data: layouts[activeLayout],
                nodeTypes: payload.nodeTypes,
                layouts: layouts,
                layoutTransform,
                hasLayoutLoaded,
                maxNodesExceeded: maxNodeCountExceeded,
                selectedNodeIds: state.selectedNodeIds,
                excludedNodeTypes: state.excludedNodeTypes
                // enableRender: true//state.autoNetworkExpand? true : payload.enableRender
            };
        }
        case ActionTypes.EXPAND_ONLY_ROOT_NODE: {
            // const enableRender = (action as ExpandOnlyRootNode).enableRender;
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
                data: layouts[activeLayoutId], 
                layouts: layouts,
                // enableRender: enableRender
            };
        }
        case ActionTypes.EXPAND_NODES_AFTER_LOAD: {
            // const enableRender = (action as ExpandOnlyRootNode).enableRender;
            const layouts = state.layouts.map(item => {
                return {...item};
            });
            const data = state.data;

            if(data) {
                for(let [key, _] of data.nodes) {
                    let isNodeCollapsed = false;
                    for(let i=0; i<layouts.length; i++) {
                        const node = layouts[i].nodes.get(key);
                        if(i !== state.activeLayout && state.hasLayoutLoaded[i] === true && node && node.collapsed === true) {
                            isNodeCollapsed = true;
                            break;
                        }
                    }
                    const lNode = layouts[state.activeLayout].nodes.get(key);
                    if(lNode) {
                        lNode.collapsed = isNodeCollapsed;
                    }
                }
            }

            return {
                ...state,
                layouts: layouts,
                data: layouts[state.activeLayout],
                // enableRender: enableRender
            };
        }
        case ActionTypes.EXPAND_ALL_NODES: {
            const layouts = state.layouts.map(item => {
                return {...item};
            });
            const data = state.data;

            if(data) {
                for(let [key, _] of data.nodes) {
                    for(let i=0; i<layouts.length; i++) {
                        const node = layouts[i].nodes.get(key);
                        if(node && state.hasLayoutLoaded[i] === true) {
                            node.collapsed = false;
                        }
                    }
                }
            }

            return {
                ...state,
                layouts: layouts,
                data: layouts[state.activeLayout]
            };
        }
        case ActionTypes.COLLAPSE_ALL_NODES: {
            const layouts = state.layouts.map(item => {
                return {...item};
            });
            const data = state.data;

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
                layouts: layouts,
                data: layouts[state.activeLayout]
            };
        }
        case ActionTypes.COLLAPSE_LEAF_NODES: {
            const layouts = state.layouts.map(item => {
                return {...item};
            });
            const data = state.data;

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
                layouts: layouts,
                data: layouts[state.activeLayout]
            };
        }
        case ActionTypes.RESET_NODES_POSITIONS: {
            const layoutId = (action as ResetNodesPositions).layoutId;
            const layouts = state.layouts.map((layout: INwData, lId: number) => {
                if(lId === layoutId) {
                    const newLayout = {...layout};
                    for(let [_, value] of newLayout.nodes) {
                        delete value.x; 
                        delete value.y; 
                        delete value.vx; 
                        delete value.vy; 
                        delete value.fx; 
                        delete value.fy;
                        value.collapsed = false;
                    }
                    return newLayout;
                }
                return {...layout};
            });

            return {
                ...state,
                activeLayout: layoutId,
                data: layouts[layoutId],
                // enableRender: false
            };
        }
        case ActionTypes.RESET_VISIBLE_NODES_POSITIONS: {
            const payload = (action as ResetVisibleNodesPositions).resetVisibleNodesPayload;
            const layouts = state.layouts.map((layout: INwData, lId: number) => {
                if(lId === payload.layoutId) {
                    const newLayout = {...layout};
                    for(let [key, value] of newLayout.nodes) {
                        if(key && payload.currentVisibleNodeIds.indexOf(key) > -1) {
                            delete value.x; 
                            delete value.y; 
                            delete value.vx; 
                            delete value.vy; 
                            delete value.fx; 
                            delete value.fy;
                        }
                    }
                    return newLayout;
                }
                return {...layout};
            });

            return {
                ...state,
                activeLayout: payload.layoutId,
                data: layouts[payload.layoutId],
                // enableRender: false
            };
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

            if(nodeId && state.data && state.data.nodes.has(nodeId)) { 
                layouts = [{ nodes: new Map<NodeId, INode>(layouts[0].nodes), edges: new Map<EdgeId, IEdge>(layouts[0].edges)}, 
                            { nodes: new Map<NodeId, INode>(layouts[1].nodes), edges: new Map<EdgeId, IEdge>(layouts[1].edges)}, 
                            { nodes: new Map<NodeId, INode>(layouts[2].nodes), edges: new Map<EdgeId, IEdge>(layouts[2].edges)}];

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
                    data: layouts[state.activeLayout],
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
            newHasLayoutLoaded[newActiveLayout] = true;

            return {
                ...state,
                activeLayout: newActiveLayout,
                layoutTransform: newLayoutTransform,
                hasLayoutLoaded: newHasLayoutLoaded,
                data: state.layouts[newActiveLayout],
                // enableRender: payload.enableRender
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
