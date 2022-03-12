import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { defaultNwAttribute, defaultNwEdgeConfig, defaultNwNodeConfig, NwAlert, NwAttribute, NwEdge, NwNodeAlertAttribute, NwNodeAlertPosition, NwNodeAlertSlot, NwNodeType } from '../models/nw-config'; 
import { defaultNwConfig, NwConfig, NwNode} from "../models/nw-config"; 
import { EMPTY_STRING, isArrayOfNonEmptyStrings, toBoolean, toPositiveInteger } from "../utils";

const ERROR_STR = "Config-parse Error: ";

interface NwRawConfig {
    [key: string]: any;
}

@Injectable()
export class ConfigParserService {
    public nwRawConfig: any; 
    public nwConfig: NwConfig = {...defaultNwConfig, node: null, edge: null}; 
    public nwNodeTypes = new Map<string, NwNodeType>();
    public nwNodeAlertSlots = new Map<NwNodeAlertPosition, NwNodeAlertSlot>();
    public nwNodeTypeRawPath: string[] | null = null;
    public processNodeWithUnknownNodeType = false;
    private notificationNumHops = new Subject<number>();
    notificationNumHops$: Observable<number> = this.notificationNumHops.asObservable();
    notififyNumHopsChange(message: number | undefined) {
        if(!this.nwConfig) {
            this.nwConfig = {...defaultNwConfig, node: null, edge: null};
        }
        this.nwConfig.numHops = typeof message === 'number'? message : this.nwConfig.numHops;
        this.notificationNumHops.next(this.nwConfig.numHops);
    }

    private notificationUpdated = new Subject<void>();
    notificationUpdated$ = this.notificationUpdated.asObservable();
    notifyUpdated() {
        this.notificationUpdated.next();
    }

    public parseConfig(config: any) {
        if(typeof config === 'object' && config !== null) {
            this.nwRawConfig = config; 
            this.setProcessNodeWithUnknownNodeType();
            this.setMandatoryConfig(); 
            this.setNodeConfig(); 
            this.setNodeTypesConfig(); 
            this.setEdgeConfig();
            this.setEdgeAttributesConfig();
            this.setAlerts();
            this.setNodeAlertImagePositions();
        } else {
            this.nwRawConfig = undefined; 
            console.log(`${ERROR_STR}Invalid config!`);
        }
    }

    private setProcessNodeWithUnknownNodeType() { 
        this.processNodeWithUnknownNodeType = this.nwRawConfig && this.nwRawConfig.processNodeWithUnknownNodeType === true? true : false;
    }
        
    private setMandatoryConfig() { 
        if(typeof this.nwRawConfig === 'object' && this.nwRawConfig !== null) {
            this.nwConfig.maxSelectedNodes = toPositiveInteger(this.nwRawConfig.maxSelectedNodes, defaultNwConfig.maxSelectedNodes); 
            this.nwConfig.displayLabel = toBoolean(this.nwRawConfig.displayLabel, defaultNwConfig.displayLabel);
            this.nwConfig.autoExpand = toBoolean(this.nwRawConfig.autoExpand, defaultNwConfig.autoExpand); 
            this.nwConfig.numHops = toPositiveInteger(this.nwRawConfig.numHops, defaultNwConfig.numHops); 
            this.nwConfig.maxNodeCount = toPositiveInteger(this.nwRawConfig.maxNodeCount, defaultNwConfig.maxNodeCount);
            this.nwConfig.viewportHeight = toPositiveInteger(this.nwRawConfig.viewportHeight, defaultNwConfig.viewportHeight); 
            this.nwConfig.nodeRadius = toPositiveInteger(this.nwRawConfig.nodeRadius, defaultNwConfig.nodeRadius);
            this.nwConfig.rootNodeRadius = toPositiveInteger(this.nwRawConfig.rootNodeRadius, defaultNwConfig.rootNodeRadius);
            this.nwConfig.nodeBorderWidth = toPositiveInteger(this.nwRawConfig.nodeBorderWidth, defaultNwConfig.nodeBorderWidth);
            this.nwConfig.displayEdgeDirection = toBoolean(this.nwRawConfig.displayEdgeDirection, defaultNwConfig.displayEdgeDirection);
            this.nwConfig.nodeAlertIconSize = toPositiveInteger(this.nwRawConfig.nodeAlertIconSize, defaultNwConfig.nodeAlertIconSize); 
        }
    }

    private setNodeConfig() {
        let nodeRawConfig = (this.nwRawConfig && this.nwRawConfig.node? this.nwRawConfig.node: {}) as NwNode;
        this.nwConfig.node = {...defaultNwNodeConfig};

        if(isArrayOfNonEmptyStrings(nodeRawConfig.parentRawPath)) {
            this.nwConfig.node.parentRawPath = nodeRawConfig.parentRawPath;
        } else {
            console.error(`${ERROR_STR}Invalid parentRawPath for Nodes`);
        }
        if(nodeRawConfig && typeof nodeRawConfig.nodeIdAttributeKey === 'string' && nodeRawConfig.nodeIdAttributeKey.length > 0) {
            this.nwConfig.node.nodeIdAttributeKey = nodeRawConfig.nodeIdAttributeKey;
        } else {
            console.error(`${ERROR_STR}Invalid nodeIdAttributeKey for Nodes`);
        }
        if(nodeRawConfig && typeof nodeRawConfig.nodeTypeAttributeKey === 'string' && nodeRawConfig.nodeTypeAttributeKey.length > 0) {
            this.nwConfig.node.nodeTypeAttributeKey = nodeRawConfig.nodeTypeAttributeKey;
        } else {
            console.error(`${ERROR_STR}Invalid nodeTypeAttributeKey for Nodes`);
        }
        if(nodeRawConfig && typeof nodeRawConfig.nodeTitleAttributeKey === 'string' && nodeRawConfig.nodeTitleAttributeKey.length > 0) {
            this.nwConfig.node.nodeTitleAttributeKey = nodeRawConfig.nodeTitleAttributeKey;
        } else {
            console.error(`${ERROR_STR}Invalid nodeTitleAttributeKey for Nodes`);
        }
        if(nodeRawConfig && typeof nodeRawConfig.nodeNeighborsLoadedAttributeKey === 'string' && nodeRawConfig.nodeNeighborsLoadedAttributeKey.length > 0) {
            this.nwConfig.node.nodeNeighborsLoadedAttributeKey = nodeRawConfig.nodeNeighborsLoadedAttributeKey;
        } else {
            console.error(`${ERROR_STR}Invalid nodeNeighborsLoadedAttributeKey for Nodes`);
        }
        if(nodeRawConfig && typeof nodeRawConfig.nodeCollapsedAttributeKey === 'string' && nodeRawConfig.nodeCollapsedAttributeKey.length > 0) {
            this.nwConfig.node.nodeCollapsedAttributeKey = nodeRawConfig.nodeCollapsedAttributeKey;
        } else {
            console.error(`${ERROR_STR}Invalid nodeCollapsedAttributeKey for Nodes`);
        }
    }
    
    private setNodeTypesConfig() { 
        let nodeTypesRawConfig = (this.nwRawConfig && this.nwRawConfig.node 
                                    && Array.isArray((this.nwRawConfig.node as NwNode).nodeTypes) ? (this.nwRawConfig.node as NwNode).nodeTypes: []) as NwNodeType[]; 
        for (const nodeTypeFromConfig of nodeTypesRawConfig) {
            let nodeType: NwNodeType; 
            let nodeAttributes = []; 
            let nodeAttributesRawConfig = Array.isArray(nodeTypeFromConfig.nodeAttributes) ? nodeTypeFromConfig.nodeAttributes: []; 
            
            for(const nAttr of nodeAttributesRawConfig) {
                const nodeAttribute = {
                    key: typeof nAttr.key === 'string'? nAttr.key: EMPTY_STRING, 
                    displayName: typeof nAttr.displayName === 'string'? nAttr.displayName: EMPTY_STRING, 
                    rawPath: Array.isArray(nAttr.rawPath)? nAttr.rawPath: [],
                    tooltip: typeof nAttr.tooltip === 'boolean'? nAttr.tooltip: false 
                    };
                nodeAttributes.push(nodeAttribute);
                if(this.nwConfig && this.nwConfig.node && this.nwConfig.node.nodeTypeAttributeKey) {
                    if(this.nwConfig.node.nodeTypeAttributeKey === nodeAttribute.key) {
                        if(this.nwNodeTypeRawPath) {
                            if(this.nwNodeTypeRawPath.join('') !== nodeAttribute.rawPath.join('')) {
                                console.info(`${ERROR_STR}nodeTypeAttributeKey's rawPath must be same in every nodeType's nodeAttributes`);
                                
                            }
                        } else {
                            this.nwNodeTypeRawPath = nodeAttribute.rawPath;
                        }
                    }
                } else {
                    console.info(`${ERROR_STR}nodeTypeAttributeKey is missing in config`);
                }
            }
            nodeType = {
                name: typeof nodeTypeFromConfig.name === 'string'? nodeTypeFromConfig.name : EMPTY_STRING, 
                displayName: typeof nodeTypeFromConfig.displayName === 'string'? nodeTypeFromConfig.displayName : EMPTY_STRING, 
                color: typeof nodeTypeFromConfig.color === 'string'? nodeTypeFromConfig.color : EMPTY_STRING, 
                imagePath: typeof nodeTypeFromConfig.imagePath === 'string'? nodeTypeFromConfig.imagePath: EMPTY_STRING, 
                nodeAttributes: nodeAttributes
            };
            if(nodeType && typeof nodeType.name === 'string' && nodeType.name.length > 0) {
                this.nwNodeTypes.set(nodeType.name, nodeType);
            }
            if(this.nwConfig && this.nwConfig.node && Array.isArray(this.nwConfig.node.nodeTypes)) { 
                this.nwConfig.node.nodeTypes.push(nodeType);
            }
        }
    }
    
    private setEdgeAttributesConfig() { 
        let edgeAttributesRawConfig = (this.nwRawConfig && this.nwRawConfig.edge && Array.isArray((this.nwRawConfig.edge as NwEdge).edgeAttributes) ? (this.nwRawConfig.edge as NwEdge).edgeAttributes: []) as NwAttribute[]; 
        
        for(const edgeAttributeFromConfig of edgeAttributesRawConfig) { 
            if(this.nwConfig && this.nwConfig.edge && Array.isArray(this.nwConfig.edge.edgeAttributes)) { 
                this.nwConfig.edge.edgeAttributes.push({
                    key: typeof edgeAttributeFromConfig.key === 'string'? edgeAttributeFromConfig.key: EMPTY_STRING, 
                    displayName: typeof edgeAttributeFromConfig.displayName === 'string'? 
                    edgeAttributeFromConfig.displayName : EMPTY_STRING, 
                    rawPath: Array.isArray(edgeAttributeFromConfig.rawPath) ? edgeAttributeFromConfig.rawPath: [], 
                    tooltip: typeof edgeAttributeFromConfig.tooltip === 'string'? edgeAttributeFromConfig.tooltip : false
                });
            }
        }
    }

    private setEdgeConfig() {
        let edgeRawConfig = (this.nwRawConfig && this.nwRawConfig.edge? this.nwRawConfig.edge: {}) as NwEdge;
        this.nwConfig.edge = {...defaultNwEdgeConfig};
        if(this.nwConfig && this.nwConfig.edge && isArrayOfNonEmptyStrings(edgeRawConfig.parentRawPath)) {
            this.nwConfig.edge.parentRawPath = edgeRawConfig.parentRawPath;
        } else {
            console.info(`${ERROR_STR}Invalid parentRawPath for Edges`);
        }
        if(edgeRawConfig && typeof edgeRawConfig.edgeSourceIdAttributeKey === 'string' && edgeRawConfig.edgeSourceIdAttributeKey.length > 0) {
            this.nwConfig.edge.edgeSourceIdAttributeKey = edgeRawConfig.edgeSourceIdAttributeKey;
        } else {
            console.info(`${ERROR_STR}Invalid edgeSourceIdAttributeKey for Edges`);
        }
        if(edgeRawConfig && typeof edgeRawConfig.edgeTargetIdAttributeKey === 'string' && edgeRawConfig.edgeTargetIdAttributeKey.length > 0) {
            this.nwConfig.edge.edgeTargetIdAttributeKey = edgeRawConfig.edgeTargetIdAttributeKey;
        } else {
            console.info(`${ERROR_STR}Invalid edgeTargetIdAttributeKey for Edges`);
        }
        if(edgeRawConfig && typeof edgeRawConfig.edgeTitleAttributeKey === 'string' && edgeRawConfig.edgeTitleAttributeKey.length > 0) {
            this.nwConfig.edge.edgeTitleAttributeKey = edgeRawConfig.edgeTitleAttributeKey;
        } else {
            console.info(`${ERROR_STR}Invalid edgeTitleAttributeKey for Edges`);
        }
    }

    private setAlerts() {
        const alertRawConfig = (this.nwRawConfig && this.nwRawConfig.alert? this.nwRawConfig.alert: {});
        const validNodeTypes = Array.from(this.nwNodeTypes.keys());
        this.nwConfig.alert = {nodeAttributes: []};
        if(alertRawConfig && Array.isArray(alertRawConfig.nodeAttributes)) {
            for (const nAttr of alertRawConfig.nodeAttributes) {
                const nodeAlertAttribute = {} as NwNodeAlertAttribute;
                if(typeof nAttr.nodeType === 'string') {
                    nodeAlertAttribute.nodeType = nAttr.nodeType.trim();;
                } else {
                    continue;
                }
                if(typeof nAttr.attribute === 'string') {
                    nodeAlertAttribute.attribute = nAttr.attribute.trim();
                } else {
                    continue;
                }
                if(typeof nAttr.condition === 'string') {
                    nodeAlertAttribute.condition = nAttr.condition.trim();
                } else {
                    continue;
                }
                if(typeof nAttr.position === 'string') {
                    switch (nAttr.position.trim().toUpperCase()) {
                        case 'N':
                            nodeAlertAttribute.position = NwNodeAlertPosition.N;
                            break;
                        case 'NE':
                            nodeAlertAttribute.position = NwNodeAlertPosition.NE;
                            break;
                        case 'E':
                            nodeAlertAttribute.position = NwNodeAlertPosition.E;
                            break;
                        case 'SE':
                            nodeAlertAttribute.position = NwNodeAlertPosition.SE;
                            break;
                        case 'S':
                            nodeAlertAttribute.position = NwNodeAlertPosition.S;
                            break;
                        case 'SW':
                            nodeAlertAttribute.position = NwNodeAlertPosition.SW;
                            break;
                        case 'W':
                            nodeAlertAttribute.position = NwNodeAlertPosition.W;
                            break;
                        case 'NW':
                            nodeAlertAttribute.position = NwNodeAlertPosition.NW;
                            break;
                        default:
                            break;
                    }
                    if(typeof nodeAlertAttribute.position === 'undefined') {
                        continue;
                    }
                } else {
                    continue;
                }
                if(typeof nAttr.message === 'string') {
                    nodeAlertAttribute.message = nAttr.message.trim();
                } else {
                    continue;
                }
                if(typeof nAttr.color === 'string') {
                    nodeAlertAttribute.color = nAttr.color.trim();
                }
                this.nwConfig.alert.nodeAttributes.push(nodeAlertAttribute);
            }
        }
    }

    private setNodeAlertImagePositions() {
        const ptOnCircle0deg = this.nwConfig.nodeRadius;
        const ptOnCircle0degRootNode = this.nwConfig.rootNodeRadius;
        const negPtOnCircle0deg = -Math.abs(this.nwConfig.nodeRadius);
        const negPtOnCircle0degRootNode = -Math.abs(this.nwConfig.rootNodeRadius);
        const ptOnCircle45deg = Math.floor(this.nwConfig.nodeRadius/1.4);
        const ptOnCircle45degRootNode = Math.floor(this.nwConfig.rootNodeRadius/1.4);
        const negPtOnCircle45deg = -Math.abs(Math.floor(this.nwConfig.nodeRadius/1.4));
        const negPtOnCircle45degRootNode = -Math.abs(Math.floor(this.nwConfig.rootNodeRadius/1.4));

        this.nwNodeAlertSlots.set(NwNodeAlertPosition.N, { height: this.nwConfig.nodeAlertIconSize, width: this.nwConfig.nodeAlertIconSize, x: 0,
                    y: negPtOnCircle0deg,
                    x0: 0,
                    y0: negPtOnCircle0degRootNode});
        this.nwNodeAlertSlots.set(NwNodeAlertPosition.NE, { height: this.nwConfig.nodeAlertIconSize, width: this.nwConfig.nodeAlertIconSize, x: ptOnCircle45deg,
                    y: negPtOnCircle45deg,
                    x0: ptOnCircle45degRootNode,
                    y0: negPtOnCircle45degRootNode});
        this.nwNodeAlertSlots.set(NwNodeAlertPosition.E, { height: this.nwConfig.nodeAlertIconSize, width: this.nwConfig.nodeAlertIconSize, x: negPtOnCircle0deg, 
                    y: 0, 
                    x0: negPtOnCircle0degRootNode, 
                    y0: 0});
        this.nwNodeAlertSlots.set(NwNodeAlertPosition.SE, { height: this.nwConfig.nodeAlertIconSize, width: this.nwConfig.nodeAlertIconSize, x: ptOnCircle45deg,
                    y: ptOnCircle45deg,
                    x0: ptOnCircle45degRootNode,
                    y0: ptOnCircle45degRootNode});
        this.nwNodeAlertSlots.set(NwNodeAlertPosition.S, { height: this.nwConfig.nodeAlertIconSize, width: this.nwConfig.nodeAlertIconSize, x: 0, 
                    y: ptOnCircle0deg,
                    x0: 0, 
                    y0: ptOnCircle0degRootNode});
        this.nwNodeAlertSlots.set(NwNodeAlertPosition.SW, { height: this.nwConfig.nodeAlertIconSize, width: this.nwConfig.nodeAlertIconSize, x: negPtOnCircle45deg,
                    y: ptOnCircle45deg,
                    x0: negPtOnCircle45degRootNode,
                    y0: ptOnCircle45degRootNode});
        this.nwNodeAlertSlots.set(NwNodeAlertPosition.W, { height: this.nwConfig.nodeAlertIconSize, width: this.nwConfig.nodeAlertIconSize, x: negPtOnCircle0deg, 
                    y: 0, 
                    x0: negPtOnCircle0degRootNode, 
                    y0: 0});
        this.nwNodeAlertSlots.set(NwNodeAlertPosition.NW, { height: this.nwConfig.nodeAlertIconSize, width: this.nwConfig.nodeAlertIconSize, x: negPtOnCircle45deg,
                    y: negPtOnCircle45deg,
                    x0: negPtOnCircle45degRootNode,
                    y0: negPtOnCircle45degRootNode});
    }
}
