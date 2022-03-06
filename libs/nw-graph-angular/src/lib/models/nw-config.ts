import { EMPTY_STRING } from "../utils";

export const defaultNwConfig: Readonly<NwConfig> = Object.freeze({
    maxSelectedNodes: 2, 
    displayLabel: true, 
    autoExpand: false, 
    numHops: 2, 
    maxNodeCount: 200, 
    viewportHeight: 700, 
    nodeRadius: 20,
    rootNodeRadius: 20,
    nodeBorderWidth: 4,
    displayEdgeDirection: false,
    nodeAlertIconSize: 12,
    node: null, 
    edge: null,
    alert: null
});

export const defaultNwNodeConfig: Readonly<NwNode> = Object.freeze({
    parentRawPath: [], 
    nodeIdAttributeKey: EMPTY_STRING, 
    nodeTypeAttributeKey: EMPTY_STRING,
    nodeTitleAttributeKey: EMPTY_STRING,
    nodeTypes: [] 
});

export const defaultNwEdgeConfig: Readonly<NwEdge> = Object.freeze({
    parentRawPath: [], 
    edgeSourceIdAttributeKey: EMPTY_STRING,
    edgeTargetIdAttributeKey: EMPTY_STRING,
    edgeTitleAttributeKey: EMPTY_STRING,
    edgeAttributes: []
});

export const defaultNwAttribute: Readonly<NwAttribute> = Object.freeze({ 
    key: EMPTY_STRING, 
    displayName: EMPTY_STRING, 
    rawPath: undefined, 
    tooltip: false
});
    
export interface NwConfig {
    maxSelectedNodes: number; 
    displayLabel: boolean;
    autoExpand: boolean; 
    numHops: number; 
    maxNodeCount: number; 
    viewportHeight: number; 
    nodeRadius: number;
    rootNodeRadius: number;
    nodeBorderWidth: number;
    displayEdgeDirection: boolean;
    nodeAlertIconSize: number;
    node: NwNode | null; 
    edge: NwEdge | null;
    alert: NwAlert | null;
}

export interface NwNode {
    parentRawPath: string[]; 
    nodeIdAttributeKey: string; 
    nodeTypeAttributeKey: string; 
    nodeTitleAttributeKey: string;
    nodeTypes: NwNodeType[];
}

export interface NwEdge { 
    parentRawPath: string[]; 
    edgeSourceIdAttributeKey: string; 
    edgeTargetIdAttributeKey: string; 
    edgeTitleAttributeKey: string; 
    edgeAttributes: NwAttribute[];
}

export interface NwNodeType {
    name: string; 
    displayName: string; 
    color: string; 
    imagePath: string; 
    nodeAttributes: NwAttribute[];
}

export interface NwAttribute {
    key?: string; 
    displayName?: string; 
    rawPath: string[] | undefined; 
    tooltip?: boolean;
}

export interface NwAlert {
    nodeAttributes: NwNodeAlertAttribute[];
}

export interface NwNodeAlertAttribute {
    nodeType: string;
    attribute: string;
    condition: string;
    position: NwNodeAlertPosition;
    message: string;
    color: string;
}

export enum NwNodeAlertPosition {
    N, // North
    NE, // North-East
    E, // East
    SE, // South-East
    S, // South
    SW, // South-West
    W, // West
    NW // North-West
}

export interface NwNodeAlertSlot {
    height: number;
    width: number;
    x: number;
    y: number;
    x0: number; // rootNode
    y0: number; // rootNode
}