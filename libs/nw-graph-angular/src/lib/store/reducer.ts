import { ActionTypes, ChangeActiveLayout, CollapseNode, ExcludeNodeTypes, ExpandNode, ExpandOnlyRootNode, LoadExternalData, ResetNodesPositions, SelectNode, SelectOnlyClickedNode } from './actions'; 
import { initialState, State } from './state';
import { Action } from '@ngrx/store';
import { nwToString } from '../utils';
import {cloneDeep as lodashCloneDeep, union as lodashUnion } from "lodash";
import { EdgeId, IEdge, INode, INwData, NodeId } from '../models/nw-data';

export function graphReducer(state = initialState, action: Action): State {
    switch(action.type) { 
        case ActionTypes.TOGGLE_LABEL: { 
            return {
                ...state,
                hideLabel: !state.hideLabel 
            };
        }
        case ActionTypes.TOGGLE_RENDER: { 
            return {
                ...state,
                enableRender: !state.enableRender 
            };
        }
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
                        console.log("DV 11");
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
            const colNodeId = payload.nodeId;
            const layouts = state.layouts.map(item => {
                return {...item};
            });
            const data = state.data;

            if(data) {
                for(let i=0; i<layouts.length; i++) {
                    const node = layouts[i].nodes.get(colNodeId);
                    if(node && state.hasLayoutLoaded[i] === true) {
                        console.log("DV 10");
                        node.collapsed = false;
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
            const rootNodeId = nwToString(payload.rootNodeId);
            const payloadData = payload.data;
            const maxNodeCount = payload.maxNodeCount;
            const nodeCount = parseInt(payload.nodeCount.toString());

            const activeLayout = state.activeLayout;
            const layouts = [{ nodes: new Map<NodeId, INode>(), edges: new Map<EdgeId, IEdge>()}, 
                                { nodes: new Map<NodeId, INode>(), edges: new Map<EdgeId, IEdge>()}, 
                                { nodes: new Map<NodeId, INode>(), edges: new Map<EdgeId, IEdge>()}];
            const hasLayoutLoaded = [false, false, false];
            const layoutTransform = [{x: 0, y: 0, k: 1}, {x: 0, y: 0, k: 1}, {x: 0, y: 0, k: 1}];
            hasLayoutLoaded[activeLayout] = true;
            // const stateData = layouts[activeLayout];
            let maxNodeCountExceeded = false;

            if(typeof nodeCount === 'number' && nodeCount > 0) {
                maxNodeCountExceeded = nodeCount > maxNodeCount;
            } else {
                maxNodeCountExceeded = payloadData.nodes.size > maxNodeCount;
            }
            // Check if rootNodeId exist in incoming data
            const cRootNode = payloadData.nodes.get(rootNodeId);
            if(cRootNode) {
                cRootNode.isRootNode = true;
            } else {
                console.info("Root Node is absent.")
                return state;
            }
            // ToDo: Maintain the postioning of nodes if all new nodes current exist
            layouts[0] = payloadData;
            for(let i=1; i<layouts.length; i++) {
                // const clonedNwData = {...payloadData};
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

            return {
                ...initialState, 
                rootNodeId: rootNodeId, 
                data: layouts[activeLayout],
                nodeTypes: payload.nodeTypes,
                layouts: layouts,
                layoutTransform,
                hasLayoutLoaded,
                maxNodesExceeded: maxNodeCountExceeded,
                enableRender: state.autoNetworkExpand? true : payload.enableRender
            };
        }
        case ActionTypes.EXPAND_ONLY_ROOT_NODE: {
            const enableRender = (action as ExpandOnlyRootNode).enableRender;
            const layouts = [...state.layouts];
            const activeLayoutId = state.activeLayout;
            const rootNodeId = nwToString(state.rootNodeId);
            const activeLayout = {...layouts[activeLayoutId]};

            for(let [key, value] of activeLayout.nodes) {
                if(key === rootNodeId) {
                    console.log("DV 8");
                    value.collapsed = false;
                } else {
                    console.log("DV 7");
                    value.collapsed = true;
                }
            }
            layouts[activeLayoutId] = activeLayout;

            return {
                ...state, 
                data: layouts[activeLayoutId], 
                layouts: layouts,
                enableRender: enableRender
            };
        }
        case ActionTypes.EXPAND_NODES_AFTER_LOAD: {
            const enableRender = (action as ExpandOnlyRootNode).enableRender;
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
                        console.log("DV 6");
                        lNode.collapsed = isNodeCollapsed;
                    }
                }
            }

            return {
                ...state,
                layouts: layouts,
                data: layouts[state.activeLayout],
                enableRender: enableRender
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
                            console.log("DV 5");
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
                                console.log("DV 4");
                                node.collapsed = false;
                            } else {
                                console.log("DV 3");
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
                                console.log("DV 2");
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
                        console.log("DV 1");
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
                enableRender: false
            };
        }
        case ActionTypes.SELECT_NODE: {
            const nodeId = (action as SelectNode).payload;
            // const layouts = state.layouts;
            // const activeLayout = state.activeLayout;
            // const node = layouts[activeLayout].nodes.get(nodeId);
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
            // const layouts = state.layouts;
            // const activeLayout = state.activeLayout;
            // const node = layouts[activeLayout].nodes.get(nodeId);
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
                enableRender: payload.enableRender
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
