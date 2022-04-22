import { GraphOptions } from "../../models/graph-adapter";
import { IEdge, INode, INwData } from './../../models/nw-data';

export function circularConstrainsts(data: INwData, rootNode: INode, nodeTypes: string[], options: GraphOptions): any[] {
    // const sourceNodeIds = new Set<string>();
    // const targetNodeIds = new Set<string>();
    // const edges: IEdge[] = [];

    // const totalValues = (nodeId: string) => {
    //     sourceNodeIds.add(nodeId);
    //     for (const [_, value] of data.edges) {
    //         if(value.sourceNodeId === nodeId) {
    //             if(!sourceNodeIds.has(value.targetNodeId)){
    //                 edges.push({source: nodeId, })
    //             }
    //         }
    //         if(value.targetNodeId === nodeId) {
    //             if(targetNodeIds.has(value.sourceNodeId)){
                    
    //             }
    //         }
    //     }

    //     totalValues(nodeId);
    // };

    // totalValues(rootNode.nodeId);

    return [];
}