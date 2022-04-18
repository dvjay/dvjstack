import { forceSimulation, forceManyBody, forceCollide, forceLink } from 'd3-force';
import * as d3 from 'd3';
import { GraphOptions } from "../../models/graph-adapter";
import { forceX, forceY } from 'd3';

interface TreeLink {
    source: number;
    target: number;
}

interface TreeNode {
    orignalIndex?: number;
    children?: TreeNode[];
}

export function circularConstrainsts(d3Cola: any, rootNodeIndex: number, nodes: any[], links: any[], options: GraphOptions): any {
    const visitedNodesIndices: number[] = [];
    // const setcolaLinks: SetcolaLink[] = [];
    const treeData = [] as TreeNode[];
    const totalValues = (startIndex: number, tData: TreeNode[], nestedLinks: TreeLink[]) => {
        visitedNodesIndices.push(startIndex);
        const targetLinks: TreeLink[] = [];
        const restTargetLinks: TreeLink[] = [];
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

    totalValues(rootNodeIndex, treeData, links as TreeLink[]);
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
    return d3Cola;
}