import { centerArray } from "../../utils";
import { setcola } from "./setcola";
import { IEdge, INode, INwData } from "./../../models/nw-data";
import { GraphOptions } from "./../../models/graph-adapter";
import * as cola from 'webcola';
import * as d3 from 'd3';

export function gridConstrainsts(data: INwData, rootNode: INode, nodeTypes: string[], options: GraphOptions): any[] {
    let nodeKeys: any[] = [];
    let nodes: any[] = [];
    let links: any[] = [];
    let rootNodeIdIndex = 0;
    const linkDistance = options.edgeLength;
    
    data.nodes.forEach((node: INode, key: string | undefined) => {
        if(key === rootNode.nodeId) {
            rootNodeIdIndex = nodeKeys.length;
        }
        nodeKeys.push(key);
        nodes.push({name: node.nodeId, order: 0, type: node.nodeType });
    });

    data.edges.forEach((value: IEdge) => {
        let sourceIdx = nodeKeys.indexOf(value.sourceNodeId);
        let targetIdx = nodeKeys.indexOf(value.targetNodeId);
        if(sourceIdx > -1 && targetIdx > -1) {
            links.push({source: sourceIdx, target: targetIdx});
        }
    });
    const orderedNodeTypes = centerArray(nodeTypes);

    let constraintDefinitions = [
        {
            name: "nw_level",
            sets: {"partition": "type"},
            forEach: [
                { constraint: "order", axis: "x", by: "order", gap: 70 },
                { constraint: "align", axis: "x" }
            ]
        },
        {
            sets: ["nw_level"],
            forEach: [{ 
                constraint: "order",
                axis: "y", 
                by: "type",
                gap: 70,
                order: orderedNodeTypes
            }]
        }
    ];

    let _setCola = setcola.nodes(nodes).links(links).guides([]).constraints(constraintDefinitions).gap(70).layout();

    const d3cola = cola.d3adaptor(d3)
                        .size([options.width, options.height])
                        .avoidOverlaps(true)
                        .defaultNodeSize(options.nodeRadius * 2)
                        .linkDistance(linkDistance)
                        .nodes(_setCola.nodes)
                        .links(_setCola.links)
                        .groups([])
                        .constraints(_setCola.constraints);
    d3cola.start(50, 100, 200);
    d3cola.stop();
    return nodes;
}