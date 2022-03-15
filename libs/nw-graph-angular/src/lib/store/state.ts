import { INode, IEdge, NodeId, EdgeId, INwData } from "../models/nw-data"; 
import { GraphLog } from "../models/graph-log";
import { TransformInfo } from "../models/load-nodes-payload";
// State for graph 
export const STORE_GRAPH_SLICE_NAME = "nwGraph";
export interface State {
    data: INwData | null;// Send to render the graph if rootNodeId is not null. 
    nodeTypes: string[];
    // autoNetworkExpand: boolean; 
    rootNodeId: string | undefined;
    selectedNodeIds: string[];
    highlightedNodeIds: string[];
    excludedNodeTypes: string[]; 
    hideLabel: boolean;
    logs: GraphLog[]; 
    maxNodesExceeded: boolean;
    activeLayout: number;
    layouts: INwData[];
    layoutTransform: TransformInfo[];
    hasLayoutLoaded: boolean[],
    // enableRender: boolean;
}

export const initialState: State = {
    data: null,
    nodeTypes: [],
    // autoNetworkExpand: true, 
    selectedNodeIds: [],
    highlightedNodeIds: [],
    rootNodeId: undefined, 
    excludedNodeTypes: [], 
    hideLabel: true,
    logs: [], 
    maxNodesExceeded: false,
    activeLayout: 0,
    layouts: [{ nodes: new Map<NodeId, INode>(), edges: new Map<EdgeId, IEdge>()}, 
                { nodes: new Map<NodeId, INode>(), edges: new Map<EdgeId, IEdge>()}, 
                    { nodes: new Map<NodeId, INode>(), edges: new Map<EdgeId, IEdge>()}],
    layoutTransform: [{x: 0, y: 0, k: 1}, {x: 0, y: 0, k: 1}, {x: 0, y: 0, k: 1}],
    hasLayoutLoaded: [false, false, false],
    // enableRender: true
};
