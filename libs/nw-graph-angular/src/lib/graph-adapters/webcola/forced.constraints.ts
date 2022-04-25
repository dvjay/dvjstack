import * as cola from 'webcola';
import { IEdge, INode, INwData } from './../../models/nw-data';
import * as d3 from 'd3';
import { GraphOptions } from "../../models/graph-adapter";

export function forcedConstrainsts(data: INwData, rootNode: INode, _: string[], options: GraphOptions): any[] {
    let nodeKeys: any[] = [];
    let nodes: any[] = [];
    let links: any[] = [];
    
    data.nodes.forEach((node: INode, key: string | undefined) => {
        nodeKeys.push(key);
        nodes.push({name: node.nodeId});
    });

    data.edges.forEach((value: IEdge) => {
        let sourceIdx = nodeKeys.indexOf(value.sourceNodeId);
        let targetIdx = nodeKeys.indexOf(value.targetNodeId);
        if(sourceIdx > -1 && targetIdx > -1) {
            links.push({source: sourceIdx, target: targetIdx});
        }
    });

    const d3cola = cola.d3adaptor(d3)
                            .size([options.width, options.height])
                            .avoidOverlaps(true)
                            .defaultNodeSize(options.nodeRadius * 2)
                            .linkDistance(options.edgeLength)
                            .nodes(nodes)
                            .links(links);
                            // .groups(groups);
    d3cola.start(50, 100, 200);
    d3cola.stop();
    return nodes;
}