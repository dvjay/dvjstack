import * as d3 from 'd3';
import { GraphOptions } from "../../models/graph-adapter";
import { INode, INwData } from '../../models/nw-data';
import { forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY, SimulationLinkDatum, SimulationNodeDatum } from 'd3-force';

interface TreeLink extends SimulationLinkDatum<SimulationNodeDatum> {
    source: number;
    target: number;
}

interface TreeNode extends SimulationNodeDatum {
    index: number;
    name: string;
    x?: number;
    y?: number;
    fx?: number;
    fy?: number;
    children: TreeNode[];
}

export function hierarchicalConstrainsts(data: INwData, rootNode: INode, nodeTypes: string[], options: GraphOptions): any[] {
    const sourceNodeIds = new Set<string>();
    const targetNodeIds = new Set<string>();
    const selectedNodes: TreeNode[] = [];
    const selectedEdges: TreeLink[] = [];
    {
        let i = 0;
        for(var [_,value] of data.nodes) {
            selectedNodes.push({index: i, name: value.nodeId, children: []});
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
                if(value.sourceNodeId === nodeId && !sourceNodeIds.has(value.targetNodeId) && !targetNodeIds.has(value.targetNodeId)) {
                    const tNodeIdNode = data.nodes.get(value.targetNodeId);
                    if(tNodeIdNode && typeof tNodeIdNode.index === 'number') {
                        const nodeIdsByNodeType = unexploredTargets.get(tNodeIdNode.nodeType);
                        if(nodeIdsByNodeType) {
                            targetNodeIds.add(value.targetNodeId);
                            nodeIdsByNodeType.push(value.targetNodeId);
                            const chn = selectedNodes[nodeIdNode.index].children;
                            if(chn.indexOf(selectedNodes[tNodeIdNode.index]) < 0) {
                                chn.push(selectedNodes[tNodeIdNode.index]);
                                selectedEdges.push({source: nodeIdNode.index, target: tNodeIdNode.index});
                            }
                        }
                    }
                }
                if(value.targetNodeId === nodeId && !sourceNodeIds.has(value.sourceNodeId) && !targetNodeIds.has(value.sourceNodeId)) {
                    const sNodeIdNode = data.nodes.get(value.sourceNodeId);
                    if(sNodeIdNode && typeof sNodeIdNode.index === 'number') {
                        const nodeIdsByNodeType = unexploredTargets.get(sNodeIdNode.nodeType);
                        if(nodeIdsByNodeType) {
                            targetNodeIds.add(value.sourceNodeId);
                            nodeIdsByNodeType.push(value.sourceNodeId);
                            // selectedEdges.push({source: nodeIdNode.index, target: sNodeIdNode.index});
                            const chn = selectedNodes[nodeIdNode.index].children;
                            if(chn.indexOf(selectedNodes[sNodeIdNode.index]) < 0) {
                                chn.push(selectedNodes[sNodeIdNode.index]);
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

    const tree = d3.tree()
                    .size([options.width, options.height])
                    // .nodeSize([40, 40])
                    .separation(function(a, b) {
                        return a.parent == b.parent ? 30 : 40;
                    });

    var root = d3.hierarchy(selectedNodes[typeof rootNode.index === 'number'? rootNode.index : 0]);
    tree(root);
    const descendants = root.descendants();
    for (const d of descendants) {
        if(d && d.data && d.data.index) {
            selectedNodes[d.data.index].x = (d as any).x;
            selectedNodes[d.data.index].y = (d as any).y;
            selectedNodes[d.data.index].fx = (d as any).x;
            selectedNodes[d.data.index].fy = (d as any).y;
        }
    }
    const simulation = forceSimulation(selectedNodes)
                            .force("charge", forceManyBody().distanceMax(options.height/2).strength(-2000))
                            .force("collide", forceCollide().radius(30).iterations(10))
                            .force("link", forceLink(selectedEdges).distance(150))
                            .force("x", forceX(options.width/2))
                            .force("y", forceY(options.height/2))
                            .stop();
    simulation.tick(500);
    return selectedNodes;
}