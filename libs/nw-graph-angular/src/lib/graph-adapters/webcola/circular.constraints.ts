import * as cola from 'webcola';
import * as d3 from 'd3';
import { GraphOptions } from "../../models/graph-adapter";
import { IEdge, INode, INwData } from '../../models/nw-data';

interface cNode {
    name: string;
}

interface cEdge {
    source: number;
    target: number;
}

export function circularConstrainsts(data: INwData, rootNode: INode, nodeTypes: string[], options: GraphOptions): any[] {
    const sourceNodeIds = new Set<string>();
    const targetNodeIds = new Set<string>();
    const selectedNodes: cNode[] = [];
    const selectedEdges: cEdge[] = [];
    {
        let i = 0;
        for(var [_,value] of data.nodes) {
            selectedNodes.push({name: value.nodeId});
            value.index = i;
            ++i;
        }
    }

    const totalValues = (nodeId: string) => {
        const nodeIdNode = data.nodes.get(nodeId);
        if(nodeIdNode && typeof nodeIdNode.index === 'number' && !sourceNodeIds.has(nodeId)) {        
            sourceNodeIds.add(nodeId);
            const unexploredTargets = new Map<string, string[]>(nodeTypes.map(nType => [nType, []]));
            for (const [_, value] of data.edges) {
                if(value.sourceNodeId === nodeId) {
                    if(!sourceNodeIds.has(value.targetNodeId) && !targetNodeIds.has(value.targetNodeId)) {
                        const tNodeIdNode = data.nodes.get(value.targetNodeId);
                        if(tNodeIdNode && typeof tNodeIdNode.index === 'number') {
                            const nodeIdsByNodeType = unexploredTargets.get(tNodeIdNode.nodeType);
                            if(nodeIdsByNodeType) {
                                targetNodeIds.add(value.targetNodeId);
                                nodeIdsByNodeType.push(value.targetNodeId);
                                selectedEdges.push({source: nodeIdNode.index, target: tNodeIdNode.index});
                            }
                        }
                    }
                }
                if(value.targetNodeId === nodeId) {
                    if(!sourceNodeIds.has(value.sourceNodeId) && !targetNodeIds.has(value.sourceNodeId)) {
                        const sNodeIdNode = data.nodes.get(value.sourceNodeId);
                        if(sNodeIdNode && typeof sNodeIdNode.index === 'number') {
                            const nodeIdsByNodeType = unexploredTargets.get(sNodeIdNode.nodeType);
                            if(nodeIdsByNodeType) {
                                targetNodeIds.add(value.sourceNodeId);
                                nodeIdsByNodeType.push(value.sourceNodeId);
                                selectedEdges.push({source: nodeIdNode.index, target: sNodeIdNode.index});
                            }
                        }
                    }
                }
            }
            let nodeIdsToExplore: string[] = [];
            for (const [_, val] of unexploredTargets) {
                nodeIdsToExplore = nodeIdsToExplore.concat(val);
            }
            for (const n of nodeIdsToExplore) {
                totalValues(n);
            }
        }
    };

    totalValues(rootNode.nodeId);

    const d3cola = cola.d3adaptor(d3)
                            .size([options.width, options.height])
                            .avoidOverlaps(true)
                            .defaultNodeSize(options.nodeRadius * 2)
                            .linkDistance(options.edgeLength)
                            .nodes(selectedNodes as any)
                            .links(selectedEdges as any);
                            // .groups(groups);
    d3cola.start(50, 100, 200);
    d3cola.stop();
    return selectedNodes;
}