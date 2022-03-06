import { INode } from './nw-data';

export interface LoadNodesPayload {
    rootNodeId: string;
    nodesToLoad: INode[];
    currentVisibleNodes: INode[];
    loadByClick: boolean;
}

export interface TransformInfo {
    x: number; 
    y: number; 
    k: number;
}