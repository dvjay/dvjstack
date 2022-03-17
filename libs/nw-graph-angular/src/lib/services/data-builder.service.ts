import { Injectable } from "@angular/core";
import { EdgeId, IEdge, INode, INwData, NeighboursStateType, NodeId } from "../models/nw-data";
import { ConfigParserService } from "./config-parser.service";
import {get as lodashGet } from "lodash";
import { NwAttribute } from '../models/nw-config';
import { EMPTY_STRING, isArrayOfNonEmptyStrings, isStringNullorEmpty } from "../utils";

const ERROR_STR = "data-builder Error: ";

@Injectable()
export class DataBuilderService {
    public nwData: INwData = {
        nodes: new Map<NodeId, INode>(),
        edges: new Map<EdgeId, IEdge>()
    };

    constructor(private nwConfigParser: ConfigParserService) {}

    public getNetworkData(rawData: any) {
        this.nwData.nodes.clear();
        this.nwData.edges.clear();
        this.nwData = {...this.nwData};
        if(
            this.nwConfigParser && 
            this.nwConfigParser.nwConfig && 
            this.nwConfigParser.nwConfig.node && 
            this.nwConfigParser.nwConfig.edge
        ) {
            const nodeCollection = lodashGet(rawData, this.nwConfigParser.nwConfig.node.parentRawPath, null);
            const edgeCollection = lodashGet(rawData, this.nwConfigParser.nwConfig.edge.parentRawPath, null); 
            // Node 
            if(Array.isArray(nodeCollection)) { 
                for (const rawNode of nodeCollection) {
                    const newNode = {} as INode; 
                    this.loadNwNodeAttributesFromRawNode(rawNode, newNode); 
                    this.sanitizeNwNode(newNode, this.nwConfigParser.nwConfig.nodeRadius, this.nwConfigParser.nwConfig.rootNodeRadius); 
                    if(this.isNwNodeValid(newNode) && this.shouldAddNodeWithUnknownNodeType(newNode)) {
                        this.nwData.nodes.set(newNode.id, newNode);
                    }
                }
            }
            // Edge 
            if(Array.isArray(edgeCollection)) { 
                for(const rawEdge of edgeCollection) {
                    const newEdge = {} as IEdge; 
                    this.loadNwEdgeAttributesFromRawNode(rawEdge, newEdge); 
                    this.sanitizeNwEdge(newEdge); 
                    if (this.isNwEdgeValid(newEdge, this.nwData.nodes)) {
                        this.nwData.edges.set(newEdge.id, newEdge);
                    }
                }
            }
        }
        this.SanitizeNwData(this.nwData); 
        return this.nwData;
    }

    private loadNwEdgeAttributesFromRawNode(rawEdge: any, nwEdge: IEdge) {
        let eAttrs: NwAttribute[] = [];
        if(this.nwConfigParser && this.nwConfigParser.nwConfig && this.nwConfigParser.nwConfig.edge) { 
            eAttrs = this.nwConfigParser.nwConfig.edge.edgeAttributes;
        }
        if(Array.isArray(eAttrs)) { 
            for (const eAttr of eAttrs) { 
                if(eAttr && eAttr.key && !isStringNullorEmpty(eAttr.key)) {
                    nwEdge[eAttr.key] = lodashGet(rawEdge, eAttr.rawPath as string[], null);
                }
            }
        }

        if(this.nwConfigParser && this.nwConfigParser.nwConfig && this.nwConfigParser.nwConfig.edge 
                    && this.nwConfigParser.nwConfig.edge.edgeSourceIdAttributeKey
                    && this.nwConfigParser.nwConfig.edge.edgeSourceIdAttributeKey
                    && this.nwConfigParser.nwConfig.edge.edgeSourceIdAttributeKey) {
            // Set Edge Source ID
            nwEdge.sourceNodeId = nwEdge[this.nwConfigParser.nwConfig.edge.edgeSourceIdAttributeKey];
            // Set Edge target Type
            nwEdge.targetNodeId = nwEdge[this.nwConfigParser.nwConfig.edge.edgeTargetIdAttributeKey];
            // Set Edge Title
            nwEdge.title = nwEdge[this.nwConfigParser.nwConfig.edge.edgeTitleAttributeKey];
        } else {
            console.info(`${ERROR_STR}Mandatory attributes => sourceNodeId, targetNodeId and title are missing`);
        }
    }

    private loadNwNodeAttributesFromRawNode(rawNode: any, nwNode: INode) {
        const nodeType = lodashGet(rawNode, this.nwConfigParser.nwNodeTypeRawPath as string[], EMPTY_STRING); 
        const nodeTypeConfig = this.nwConfigParser.nwNodeTypes.get(nodeType);

        const nAttrs = nodeTypeConfig && nodeTypeConfig.nodeAttributes? nodeTypeConfig.nodeAttributes : undefined; 
        nwNode.nodeDescAttributes = [];
        nwNode.nodeRawObject = {};
        if(Array.isArray(nAttrs)) { 
            for(const nAttr of nAttrs) {
                if (nAttr && nAttr.key && !isStringNullorEmpty(nAttr.key) && isArrayOfNonEmptyStrings(nAttr.rawPath)) {
                    nwNode[nAttr.key] = lodashGet(rawNode, nAttr.rawPath as string[], EMPTY_STRING); 
                    nwNode.nodeRawObject[nAttr.key] = typeof nwNode[nAttr.key] === 'string'
                                                        || typeof nwNode[nAttr.key] === 'number' 
                                                        || typeof nwNode[nAttr.key] === 'boolean'? nwNode[nAttr.key]:
                                                            EMPTY_STRING; 
                    if(nAttr.tooltip === true) { 
                        nwNode.nodeDescAttributes.push({
                            attribute: nAttr.key, 
                            title: typeof nAttr.displayName === 'string'? nAttr.displayName : EMPTY_STRING
                        });
                    }
                }
            }
        }

        if(this.nwConfigParser 
                && this.nwConfigParser.nwConfig 
                && this.nwConfigParser.nwConfig.node 
                && this.nwConfigParser.nwConfig.node.nodeIdAttributeKey
                && this.nwConfigParser.nwConfig.node.nodeTypeAttributeKey
                && this.nwConfigParser.nwConfig.node.nodeTypeAttributeKey) {
            // Set Node ID 
            nwNode.id = nwNode[this.nwConfigParser.nwConfig.node.nodeIdAttributeKey];
            // Set Node Type
            nwNode.type = nwNode[this.nwConfigParser.nwConfig.node.nodeTypeAttributeKey];
            // Set Node Title 
            nwNode.label = nwNode[this.nwConfigParser.nwConfig.node.nodeTitleAttributeKey];
            // Set Node neighboursLoaded
            nwNode.neighboursLoaded = nwNode[this.nwConfigParser.nwConfig.node.nodeNeighborsLoadedAttributeKey];
            // Set Node collapsed
            nwNode.collapsed = nwNode[this.nwConfigParser.nwConfig.node.nodeCollapsedAttributeKey];
            // Set Node type name 
            nwNode.title = nodeType;
        } else {
            console.info(`${ERROR_STR}Mandatory attributes => NodeId, NodeType and NodeLabel are missing`);
        }
        // Set color 
        nwNode.color = nodeTypeConfig && typeof nodeTypeConfig.color === 'string'? nodeTypeConfig.color : EMPTY_STRING; 
        // Set ImagePath 
        nwNode.imagePath = nodeTypeConfig && typeof nodeTypeConfig.imagePath === 'string'? nodeTypeConfig.imagePath: EMPTY_STRING;
    }

    private sanitizeNwNode(nwNode: INode, nodeRadius: number, rootNodeRadius: number) {
        let nodeNeighborsLoadedAttributeDefaultValue = true;
        let nodeCollapsedAttributeDefaultValue = false;
        if(this.nwConfigParser && this.nwConfigParser.nwConfig && this.nwConfigParser.nwConfig.node) { 
            if(typeof this.nwConfigParser.nwConfig.node.nodeNeighborsLoadedAttributeDefaultValue === 'boolean') {
                nodeNeighborsLoadedAttributeDefaultValue = this.nwConfigParser.nwConfig.node.nodeNeighborsLoadedAttributeDefaultValue;
            }
            if(typeof this.nwConfigParser.nwConfig.node.nodeCollapsedAttributeDefaultValue === 'boolean') {
                nodeCollapsedAttributeDefaultValue = this.nwConfigParser.nwConfig.node.nodeCollapsedAttributeDefaultValue;
            }
        }

        if(typeof nwNode === 'object') {
            nwNode.id = nwNode && (typeof nwNode.id === 'string' || typeof nwNode.id === 'number') ? 
                        nwNode.id.toString(): EMPTY_STRING; 
            nwNode.type = nwNode && (typeof nwNode.type === 'string' || typeof nwNode.type === 'number') ? 
                        nwNode.type.toString(): EMPTY_STRING; 
            nwNode.r = nodeRadius;
            nwNode.r0 = rootNodeRadius;
            nwNode.sourceIds = []; 
            nwNode.targetIds = [];
            nwNode.neighboursLoaded = nwNode && typeof nwNode.neighboursLoaded === 'boolean'? nwNode.neighboursLoaded : nodeNeighborsLoadedAttributeDefaultValue;
            nwNode.neighboursStatus = nwNode.neighboursLoaded ? NeighboursStateType.LOADED : NeighboursStateType.NOT_LOADED;
            nwNode.collapsed = nwNode && typeof nwNode.collapsed === 'boolean'? nwNode.collapsed : nodeCollapsedAttributeDefaultValue;
            nwNode.selected = false;
            nwNode.highlighted = false;
            nwNode.isRootNode = false;
            // Hack for now 
            nwNode.nodeId = nwNode.id!; 
            nwNode.nodeType = nwNode.type!;
        }
    }
    private sanitizeNwEdge(nwEdge: IEdge) {
        if (typeof nwEdge === 'object') {
            nwEdge.sourceNodeId = typeof nwEdge.sourceNodeId === 'string' || typeof nwEdge.sourceNodeId === 'number' ? 
                nwEdge.sourceNodeId.toString() : EMPTY_STRING; 
            nwEdge.targetNodeId = typeof nwEdge.targetNodeId === 'string' || typeof nwEdge.targetNodeId === 'number' ? 
                nwEdge.targetNodeId.toString() : EMPTY_STRING; 
            nwEdge.title = typeof nwEdge.title === 'string' || typeof nwEdge.title === 'number' ? 
                nwEdge.title.toString() : EMPTY_STRING; 
            nwEdge.id = typeof nwEdge.id === 'string' || typeof nwEdge.id === 'number' ? 
                nwEdge.id.toString() : `${nwEdge.sourceNodeId}-${nwEdge.targetNodeId}`;
            nwEdge.name = nwEdge.title!; 
            nwEdge.linkId = nwEdge.id; 
            nwEdge.source = nwEdge.sourceNodeId;
            nwEdge.target = nwEdge.targetNodeId;
        }
    }
    private isNwNodeValid(nwNode: INode): boolean {
        let idValid = false;
        let typeValid = false;
        if(nwNode) {
            // Validating Node ID
            if(typeof nwNode.id === 'string' && nwNode.id.trim().length > 0) {
                idValid = true;
            }
            // Validating Node Type
            if(typeof nwNode.type === 'string' && nwNode.type.trim().length > 0) {
                typeValid = true;
            }
            return idValid && typeValid;        
        } else {
            return false;
        }
    }

    private shouldAddNodeWithUnknownNodeType(nwNode: INode): boolean {
        if(this.nwConfigParser) {
            const processNodeWithUnknownNodeType = this.nwConfigParser.processNodeWithUnknownNodeType;
            if(processNodeWithUnknownNodeType === true) {
                return true;
            } else {
                if(this.nwConfigParser.nwNodeTypes.has(nwNode.nodeType)) {
                    return true;
                }
                return false;
            }
        } 
        return false;
    }

    private isNwEdgeValid(nwEdge: IEdge, nodeCollection: Map<NodeId, INode>) {
        let sourceValid = false;
        let targetValid = false;
        if(nwEdge) {
            // Validating Source Node ID
            if(nodeCollection.has(nwEdge.sourceNodeId)) {
                sourceValid = true;
            }
            // Validating Target Node Type 
            if(nodeCollection.has(nwEdge.targetNodeId)) {
                targetValid = true;
            }
            return sourceValid && targetValid; 
        } else { 
            return false;
        }
    }
    SanitizeNwData(nwData: INwData) {
        const invalidEdgeIds: string[] = []; 
        nwData.edges.forEach(edge => { 
            if(isStringNullorEmpty(edge.sourceNodeId) || isStringNullorEmpty(edge.targetNodeId)) {
                invalidEdgeIds.push(edge.id); 
            } else { 
                if(nwData.nodes.has(edge.sourceNodeId) && nwData.nodes.has(edge.targetNodeId)) {
                    const sourceNode = nwData.nodes.get(edge.sourceNodeId); 
                    const targetNode = nwData.nodes.get(edge.targetNodeId); 
                    if(sourceNode && targetNode && Array.isArray(sourceNode.targetIds) && Array.isArray(targetNode.sourceIds)) {
                        sourceNode.targetIds.indexOf(edge.targetNodeId) === -1? sourceNode.targetIds.push(edge.targetNodeId) : null;
                        targetNode.sourceIds.indexOf(edge.sourceNodeId) === -1? targetNode.sourceIds.push(edge.sourceNodeId) : null; 
                    } else {
                        invalidEdgeIds.push(edge.id);
                    }
                } else {
                    invalidEdgeIds.push(edge.id);
                }
            }
        }); 
        invalidEdgeIds.forEach(id => { 
            if(nwData.edges.has(id)) {
                nwData.edges.delete(id);
            }
        });
    }
}
