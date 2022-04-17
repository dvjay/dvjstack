import { INode, IEdge, NodeId, EdgeId, INwData, ILayout } from "../models/nw-data"; 
import { GraphLog } from "../models/graph-log";
import { TransformInfo } from "../models/load-nodes-payload";
import {cloneDeep as lodashCloneDeep } from "lodash";
// State for graph 
export const STORE_GRAPH_SLICE_NAME = "nwGraph";
export interface State {
    data: INwData | null;
    nodeTypes: string[];
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
    layouts2?: ILayout[]
}

export const initialLayoutData: INwData = { 
                                            nodes: new Map<NodeId, INode>(), 
                                            edges: new Map<EdgeId, IEdge>()
                                        };
export function getInitialLayoutData(): INwData {
    return lodashCloneDeep(initialLayoutData);
}
export const initialLayoutTransform: TransformInfo = {x: 0, y: 0, k: 1};
export function getInitialLayoutTransform(): TransformInfo {
    return lodashCloneDeep(initialLayoutTransform);
}

export function getInitialState(): State {
    // Circualr layout
    const circularLayoutData = getInitialLayoutData();
    const circularLayoutTransform = getInitialLayoutTransform();
    const circularLayout: ILayout = { 
        id: 0,
        name: "circular",
        displayName: "Circular",
        data: circularLayoutData,
        transform: circularLayoutTransform,
        hasLoaded: false,
        isPositioningCrucial: false
    };
    // Forced layout
    const forcedLayoutData = getInitialLayoutData();
    const forcedLayoutTransform = getInitialLayoutTransform();
    const forcedLayout: ILayout = { 
        id: 1,
        name: "forced",
        displayName: "Forced",
        data: forcedLayoutData,
        transform: forcedLayoutTransform,
        hasLoaded: false,
        isPositioningCrucial: false
    };
    // hierarchical layout
    const hierarchicalLayoutData = getInitialLayoutData();
    const hierarchicalLayoutTransform = getInitialLayoutTransform();
    const hierarchicalLayout: ILayout = { 
        id: 2,
        name: "hierarchical",
        displayName: "Hierarchical",
        data: hierarchicalLayoutData,
        transform: hierarchicalLayoutTransform,
        hasLoaded: false,
        isPositioningCrucial: true
    };
       // hierarchical layout
    const gridLayoutData = getInitialLayoutData();
    const gridLayoutTransform = getInitialLayoutTransform();
    const gridLayout: ILayout = { 
        id: 3,
        name: "grid",
        displayName: "Grid",
        data: gridLayoutData,
        transform: gridLayoutTransform,
        hasLoaded: false,
        isPositioningCrucial: true
    };

    return {
        data: null,
        nodeTypes: [],
        selectedNodeIds: [],
        highlightedNodeIds: [],
        rootNodeId: undefined, 
        excludedNodeTypes: [], 
        hideLabel: true,
        logs: [], 
        maxNodesExceeded: false,
        activeLayout: 0,
        // To be deleted - Begin
        layouts: [{ nodes: new Map<NodeId, INode>(), edges: new Map<EdgeId, IEdge>()}, 
            { nodes: new Map<NodeId, INode>(), edges: new Map<EdgeId, IEdge>()}, 
                { nodes: new Map<NodeId, INode>(), edges: new Map<EdgeId, IEdge>()}],
        layoutTransform: [{x: 0, y: 0, k: 1}, {x: 0, y: 0, k: 1}, {x: 0, y: 0, k: 1}],
        hasLayoutLoaded: [false, false, false],
        // To be deleted - End
        layouts2: [circularLayout, forcedLayout, hierarchicalLayout, gridLayout]
    };
}
