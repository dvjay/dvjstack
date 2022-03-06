import { INwData } from "./nw-data";

export interface GraphAdapter {
    initialize(options: GraphOptions): void;
    attachNodesPosition(data: INwData, rootNodeId: string, nodeTypes: string[], layoutId: number): void;
}

export interface GraphOptions {
    width: number; 
    height: number; 
    nodeRadius: number; 
}