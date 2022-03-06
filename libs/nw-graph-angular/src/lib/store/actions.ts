import { Action } from '@ngrx/store'; 
import { TransformInfo } from '../models/load-nodes-payload';
import { INode, IEdge, INwData } from '../models/nw-data';

export enum ActionTypes {
    EXCLUDE_NODE_TYPES = '[NW]EXCLUDE_NODE_TYPES',
    EXPAND_NODE = '[NW]EXPAND_NODE',
    SELECT_NODE = '[NW]SELECT_NODE',
    SELECT_ONLY_CLICKED_NODE = '[NW]SELECT_ONLY_CLICKED_NODE',
    UNSELECT_ALL_NODES = '[NW]UNSELECT_ALL_NODES',
    TOGGLE_LABEL = '[NW]TOGGLE_LABEL',
    COLLAPSE_NODE = '[NW]COLLAPSE_NODE',
    RESET_GRAPH = '[NW]RESET_GRAPH',
    RESET_NODES_POSITIONS = '[NW]RESET_NODES_POSITIONS',
    LOAD_EXTERNAL_DATA = '[NW]LOAD_EXTERNAL_DATA',
    EXPAND_ONLY_ROOT_NODE = '[NW]EXPAND_ONLY_ROOT_NODE',
    EXPAND_ALL_NODES = '[NW]EXPAND_ALL_NODES',
    EXPAND_NODES_AFTER_LOAD = '[NW]EXPAND_NODES_AFTER_LOAD',
    COLLAPSE_ALL_NODES = '[NW]COLLAPSE_ALL_NODES',
    COLLAPSE_LEAF_NODES = '[NW]COLLAPSE_LEAF_NODES',
    CHANGE_ACTIVE_LAYOUT = '[NW]CHANGE_ACTIVE_LAYOUT',
    TOGGLE_RENDER = '[NW]TOGGLE_RENDER'
}

export interface ExternalDataPayload { 
    rootNodeId: string; 
    data: INwData;
    nodeTypes: string[],
    maxNodeCount: number; 
    nodeCount: number;
    enableRender: boolean
}

export interface ChangeLayoutPayload { 
    layoutId: number;
    prevLayoutId: number;
    prevLayoutTransform: TransformInfo;
    enableRender: boolean;
}

export class ExcludeNodeTypes implements Action {
    public readonly type = ActionTypes.EXCLUDE_NODE_TYPES; 
    constructor(public payload: string[]) {}
}
export class ExpandNode implements Action {
    public readonly type = ActionTypes.EXPAND_NODE; 
    constructor(public payload: { nodeId: string; currentVisibleNodes: INode[]; currentVisibleEdges: IEdge[];}) {
    }
}
export class SelectNode implements Action {
    public readonly type = ActionTypes.SELECT_NODE; 
    constructor(public payload: string) {}
}
export class SelectOnlyClickedNode implements Action {
    public readonly type = ActionTypes.SELECT_ONLY_CLICKED_NODE; 
    constructor(public payload: string) {}
}
export class UnselectAllNodes implements Action {
    public readonly type = ActionTypes.UNSELECT_ALL_NODES; 
}
export class CollapseNode implements Action {
    public readonly type = ActionTypes.COLLAPSE_NODE; 
    constructor(public payload: { nodeId: string; currentVisibleNodes: INode[]; currentVisibleEdges: IEdge[];}) {}
}
export class ResetGraph implements Action {
    public readonly type = ActionTypes.RESET_GRAPH;
}
export class ToggleLabel implements Action {
    public readonly type = ActionTypes.TOGGLE_LABEL;
}
export class ResetNodesPositions implements Action {
    public readonly type = ActionTypes.RESET_NODES_POSITIONS;
    constructor(public layoutId: number) {}
}
export class LoadExternalData implements Action {
    public readonly type = ActionTypes.LOAD_EXTERNAL_DATA; 
    constructor(public payload: ExternalDataPayload) {}
}
export class ExpandOnlyRootNode implements Action {
    public readonly type = ActionTypes.EXPAND_ONLY_ROOT_NODE;
    constructor(public enableRender: boolean) {}
}
export class ExpandAllNodes implements Action {
    public readonly type = ActionTypes.EXPAND_ALL_NODES;
}
export class ExpandNodesAfterLoad implements Action {
    public readonly type = ActionTypes.EXPAND_NODES_AFTER_LOAD;
    constructor(public enableRender: boolean) {}
}
export class CollapseAllNodes implements Action {
    public readonly type = ActionTypes.COLLAPSE_ALL_NODES;
}
export class CollapseLeafNodes implements Action {
    public readonly type = ActionTypes.COLLAPSE_LEAF_NODES;
}
export class ChangeActiveLayout implements Action {
    public readonly type = ActionTypes.CHANGE_ACTIVE_LAYOUT;
    constructor(public payload: ChangeLayoutPayload) {}
}
export class ToggleRender implements Action {
    public readonly type = ActionTypes.TOGGLE_RENDER;
    constructor() {}
}
export type Actions = ExcludeNodeTypes
                        | ExpandNode 
                        | ToggleLabel
                        | CollapseNode
                        | ResetGraph 
                        | ResetNodesPositions 
                        | SelectNode
                        | SelectOnlyClickedNode 
                        | UnselectAllNodes 
                        | LoadExternalData
                        | ExpandOnlyRootNode
                        | ExpandAllNodes
                        | ExpandNodesAfterLoad
                        | CollapseAllNodes
                        | ChangeActiveLayout
                        | ToggleRender;
    

