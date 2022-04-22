import { forceSimulation, forceManyBody, forceCollide, forceLink } from 'd3-force';
import * as d3 from 'd3';
import { GraphOptions } from "../../models/graph-adapter";
import { forceX, forceY } from 'd3';
import { IEdge, INode, INwData } from "./../../models/nw-data";

export interface TLink {
    source: number;
    target: number;
}

export interface TNode {
    orignalIndex?: number;
    children?: TNode[];
}

export function hierarchicalConstrainsts(data: INwData, rootNode: INode, nodeTypes: string[], options: GraphOptions): any[] {
    const visitedNodesIndices: number[] = [];
    const treeData = [] as TNode[];
    let nodeKeys: any[] = [];
    let nodes: any[] = [];
    let links: any[] = [];
    let rootNodeIdIndex = 0;
    
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
    const totalValues = (startIndex: number, tData: TNode[], nestedLinks: TLink[]) => {
        visitedNodesIndices.push(startIndex);
        const targetLinks: TLink[] = [];
        const restTargetLinks: TLink[] = [];
        nestedLinks.forEach(x => {
            if(x.source === startIndex || x.target === startIndex) {
                if(x.source === startIndex) {
                    targetLinks.push(x);
                }
            } else {
                restTargetLinks.push(x);
            }
        });
        const tfgData: any = {orignalIndex: startIndex, children: []};
        tData.push(tfgData);
        for (const tgt of targetLinks) {
            if(visitedNodesIndices.indexOf(tgt.target) === -1) {
                totalValues(tgt.target, tfgData.children, restTargetLinks);
            }
        }
    };

    totalValues(rootNodeIdIndex, treeData, links as TLink[]);
    // const nodeWidth = 100;
    // const nodeHeight = 100;
    // const horizontalSeparationBetweenNodes = 16;
    // const verticalSeparationBetweenNodes = 128;
    const tree = d3.tree()
                    .size([options.width, options.height])
                    // .nodeSize([40, 40])
                    .separation(function(a, b) {
                        return a.parent == b.parent ? 30 : 40;
                    });
    var root = d3.hierarchy(treeData[0]);
    tree(root);
    const descendants = root.descendants();
    for (const d of descendants) {
        if(d && d.data && d.data.orignalIndex) {
            nodes[d.data.orignalIndex].x = (d as any).x;
            nodes[d.data.orignalIndex].y = (d as any).y;
            nodes[d.data.orignalIndex].fx = (d as any).x;
            nodes[d.data.orignalIndex].fy = (d as any).y;
        }
    }
    const simulation = forceSimulation(nodes)
                            .force("charge", forceManyBody().distanceMax(options.height/2).strength(-2000))
                            .force("collide", forceCollide().radius(30).iterations(10))
                            .force("link", forceLink(links).distance(150))
                            .force("x", forceX(options.width/2))
                            .force("y", forceY(options.height/2))
                            .stop();
    simulation.tick(500);
    return nodes;
}