import { INode, IEdge, NodeId, EdgeId, INwData, ILayout } from "../models/nw-data"; 
import { GraphLog } from "../models/graph-log";
import { TransformInfo } from "../models/load-nodes-payload";
import {cloneDeep as lodashCloneDeep } from "lodash";
// State for graph 
export const STORE_GRAPH_SLICE_NAME = "nwGraph";
export interface State {
    // data: INwData | null;
    nodeTypes: string[];
    rootNodeId: string | undefined;
    rootNodeType: string | undefined;
    selectedNodeIds: string[];
    highlightedNodeIds: string[];
    excludedNodeTypes: string[]; 
    hideLabel: boolean;
    logs: GraphLog[]; 
    maxNodesExceeded: boolean;
    activeLayout: number;
    layouts: ILayout[]
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

export function getInitialLayouts(): ILayout[] {
    // Circualr layout
    const circularLayoutData = getInitialLayoutData();
    const circularLayoutTransform = getInitialLayoutTransform();
    const circularLayout: ILayout = { 
        name: "circular",
        displayName: "Default",
        data: circularLayoutData,
        transform: circularLayoutTransform,
        hasLoaded: false,
        isPositioningCrucial: false
    };
    // hierarchical layout
    const hierarchicalLayoutData = getInitialLayoutData();
    const hierarchicalLayoutTransform = getInitialLayoutTransform();
    const hierarchicalLayout: ILayout = {
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
        name: "grid",
        displayName: "Grid",
        data: gridLayoutData,
        transform: gridLayoutTransform,
        hasLoaded: false,
        isPositioningCrucial: true
    };

    return [circularLayout, hierarchicalLayout, gridLayout];
}

export function getInitialState(): State {
    return {
        nodeTypes: [],
        selectedNodeIds: [],
        highlightedNodeIds: [],
        rootNodeId: undefined,
        rootNodeType: undefined,
        excludedNodeTypes: [], 
        hideLabel: true,
        logs: [], 
        maxNodesExceeded: false,
        activeLayout: 0,
        layouts: getInitialLayouts()
    };
}
