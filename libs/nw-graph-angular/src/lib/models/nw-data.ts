import { SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';
import { TransformInfo } from './load-nodes-payload';

export enum NeighboursStateType {
    NOT_LOADED,
    LOADED,
    LOADING,
    LOADING_FAILED,
}

export interface INode extends SimulationNodeDatum {
    id?: string; 
    type?: string; 
    label?: string; 
    r?: number;
    r0?: number;
    neighboursLoaded: boolean;
    neighboursLoading?: boolean;
    neighboursStatus?: NeighboursStateType;
    sourceIds?: Array<NodeId>; 
    targetIds?: Array<NodeId>; 
    [key: string]: any;
    nodeId: string; 
    nodeType: string; 
    title: string; 
    nodeRawObject: any; 
    collapsed: boolean;
    color: string; 
    imagePath: string; 
    nodeDescAttribute: INodeDescAttribute;
    selected: boolean;
    highlighted: boolean;
    isRootNode: boolean;
    isSkewed?: string;// Has to be string for node Alert
}

export type NodeId = INode['id']; 
export interface INodeDescAttribute {
    attribute: string; 
    title: string;
}
export interface INodeAttribute{
    key: string; 
    displayName: string; 
    rawPath: string; 
    tooltip: boolean;
}

export type NodeAttributeId = INodeAttribute['key'];

export interface INodeType {
    name: string; 
    displayName: string; 
    color: string; 
    imagePath: string; 
    nodeAttributes: INodeAttribute[];
}

export interface NodeAlertIconDetails {
    height: number;
    width: number;
    x: number;
    y: number;
    transform: string;
    color: string;
    text: string;
}

export interface IEdge extends SimulationLinkDatum<SimulationNodeDatum> {
    index?: number; 
    id: string; 
    source: {x?: number, y?: number, fx?: number, fy?: number, vx?: number, vy?: number} | string; 
    target: {x?: number, y?: number, fx?: number, fy?: number, vx?: number, vy?: number} | string;
    title?: string; 
    [key: string]: any;
    // Hack 
    sourceNodeId: string; 
    targetNodeId: string; 
    linkId: string; 
    name: string;
    layoutId: number;
}

export interface ILayout {
    name: string;
    displayName: string;
    data: INwData;
    transform: TransformInfo;
    hasLoaded: boolean;
    isPositioningCrucial: boolean;
}

export interface ServicePayload {
    rootNodeId: string;
    rootNodeType: string;
    numHops: number;
    data?: any;
    success: boolean;
}

export type EdgeId = IEdge['id'];

export interface INwData {
    nodes: Map<NodeId, INode>; 
    edges: Map<EdgeId, IEdge>;
}

export function cloneNwData(data: INwData) {
    const clonedNwData = {...data};
    const clonedNodes = new Map<NodeId, INode>();
    const clonedEdges = new Map<EdgeId, IEdge>();

    for (const [key, value] of clonedNwData.nodes) {
        clonedNodes.set(key, {...value});
    }

    for (const [key, value] of clonedNwData.edges) {
        clonedEdges.set(key, {...value});
    }
}

export enum NodeOutliningColors {
    NODE_SELECTED = "#FF0000", // Red
    NODE_LOADING_FAILED = "#eb0000", // Red
    NODE_EXPANDED_AND_NEIGHBOURS_LOADED = "#000000", // Black
    NODE_EXPANDED_AND_NEIGHBOURS_NOT_LOADED = "#3385c6", //Light blue
    NODE_COLLAPSED_AND_NEIGHBOURS_LOADED = "#0000FF", // Blue
    NODE_COLLAPSED_AND_NEIGHBOURS_NOT_LOADED = "#808080" // Gray 
}