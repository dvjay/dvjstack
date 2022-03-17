import { INode, INwData } from "./nw-data";

export interface GraphAdapter {
    initialize(options: GraphOptions): void;
    attachNodesPositionByLayout(data: INwData, rootNode: INode, nodeTypes: string[], layoutId: number): void;
    // attachNodesPosition(data: INwData, rootNode: INode): void;
}

export interface GraphOptions {
    width: number; 
    height: number; 
    nodeRadius: number;
    edgeLength: number;
}

export const DEFAULT_GRAPH_OPTIONS: GraphOptions = { width: 2000, height: 725, nodeRadius: 30, edgeLength: 140 };