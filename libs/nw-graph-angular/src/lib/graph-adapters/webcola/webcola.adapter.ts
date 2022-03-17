import * as cola from 'webcola'; 
import { INode, IEdge, INwData } from '../../models/nw-data'; 
import { GraphAdapter, GraphOptions } from '../../models/graph-adapter';
import * as d3 from 'd3';
import { gridConstrainsts } from './grid.constraints';
import { treeConstrainsts } from './tree.constraints';
import { forceSimulation, forceManyBody, forceCollide, forceLink, forceY, forceX, forceCenter, forceRadial } from 'd3-force';

export default class WebcolaAdapter implements GraphAdapter {
    private d3cola: any;

    constructor(private options: GraphOptions) {
        this.initialize(options);
    }

    initialize(options: GraphOptions) {
        this.options = options;
    }
    
    attachNodesPositionByLayout(data: INwData, rootNode: INode, nodeTypes: string[], layoutId: number) { 
        let nodeKeys: any[] = []; 
        let nodes: any[] = []; 
        let links: any[] = []; 
        let linkDistance = 140;
        let groups: any[] = [];
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

        if(layoutId === 1) {
            this.d3cola = cola.d3adaptor(d3)
                                .size([this.options.width, this.options.height])
                                .avoidOverlaps(true)
                                .defaultNodeSize(this.options.nodeRadius * 2);
                                //.linkDistance(150);
            this.d3cola = treeConstrainsts(this.d3cola, rootNodeIdIndex, nodes, links, this.options);
            // this.d3cola.start(50, 100, 200);
            // this.d3cola.stop();
        } else if(layoutId === 2) {
            this.d3cola = cola.d3adaptor(d3)
                        .size([this.options.width, this.options.height])
                        .avoidOverlaps(true)
                        .defaultNodeSize(this.options.nodeRadius * 2);
                        //.linkDistance(150);
            this.d3cola = gridConstrainsts(this.d3cola, nodes, links, linkDistance, nodeTypes);
            this.d3cola.start(50, 100, 200);
            this.d3cola.stop();
        } else {
            if(nodes.length > 100) {
                linkDistance = 220;
            }
            if(nodes.length > 200) {
                linkDistance = 350;
            }
            this.d3cola = cola.d3adaptor(d3)
                        .size([this.options.width, this.options.height])
                        .avoidOverlaps(true)
                        .defaultNodeSize(this.options.nodeRadius * 2)
                        .linkDistance(linkDistance)
                        .nodes(nodes)
                        .links(links)
                        .groups(groups);
            this.d3cola.start(50, 100, 200);
            this.d3cola.stop();
        }
        nodes.forEach((value: any) => {
            let _oldValue = data.nodes.get(value.name); 
            _oldValue!.x = value.x;
            _oldValue!.y = value.y; 
        });
    }

    // attachNodesPosition(data: INwData, rootNode: INode) { 
    //     const nodes = Array.from(data.nodes.values());
    //     const links = Array.from(data.edges.values());
        
    //     // const simulation = forceSimulation(nodes)
    //     //                         .force("charge", forceManyBody().strength(-300))
    //     //                         .force('collide', forceCollide(() =>  this.options.nodeRadius).strength(0.9))
    //     //                         .force("link", forceLink(links).id((d: any)=> { 
    //     //                             return d.nodeId; 
    //     //                         }).distance(this.options.edgeLength))
    //     //                         .force("center", forceCenter(rootNode.x, rootNode.y))
    //     //                         .alphaTarget(0.1);;
    //     // // simulation.alpha(0.3).restart();
    //     // simulation.stop();
    //     // simulation.tick(10);
    //     // // simulation.stop();
    //     const simulation = forceSimulation(nodes)
    //                         .force("charge", forceCollide().radius(this.options.nodeRadius).iterations(10))
    //                         .force("r", forceRadial(140, rootNode.x, rootNode.y).strength(0.5))
    //                         .alpha(.9)
    //                         .alphaMin(.1);
    //     simulation.stop();
    //     for (var i = 0; i < 2000; i++) {
    //         simulation.tick();
    //         console.log("inside for: " + i);
    //     }
    //     console.log("checking alpha");
    //     console.log(simulation.alpha());
    //     // simulation.tick();        
    // }

    // attachNodesPosition(data: INwData, rootNode: INode) {
    //     let nodeKeys: any[] = []; 
    //     let nodes: any[] = []; 
    //     let links: any[] = []; 
    //     let linkDistance = 140;
    //     let rootNodeIdIndex = 0;
        
    //     data.nodes.forEach((node: INode, key: string | undefined) => {
    //         if(key === rootNodeId) {
    //             rootNodeIdIndex = nodeKeys.length;
    //         }
    //         nodeKeys.push(key);
    //         nodes.push({name: node.nodeId, order: 0, type: node.nodeType });
    //     });

    //     data.edges.forEach((value: IEdge) => {
    //         let sourceIdx = nodeKeys.indexOf(value.sourceNodeId);
    //         let targetIdx = nodeKeys.indexOf(value.targetNodeId);
    //         links.push({source: sourceIdx, target: targetIdx});
    //     });

    //     data.edges.forEach((value: IEdge) => {
    //         let sourceIdx = nodeKeys.indexOf(value.sourceNodeId);
    //         let targetIdx = nodeKeys.indexOf(value.targetNodeId);
    //         if(value.sourceNodeId === rootNodeId || value.targetNodeId === rootNodeId) {
    //             if(value.targetNodeId === rootNodeId) {
    //                 links.push({source: targetIdx, target: sourceIdx});
    //             } else {
    //                 links.push({source: sourceIdx, target: targetIdx});
    //             }
    //         } else {
    //             links.push({source: sourceIdx, target: targetIdx});
    //         }
    //     });
    //     if(nodes.length > 100) {
    //         linkDistance = 220;
    //     }
    //     if(nodes.length > 200) {
    //         linkDistance = 350;
    //     }
    //     this.d3cola = cola.d3adaptor(d3)
    //                 .size([this.options.width, this.options.height])
    //                 .avoidOverlaps(true)
    //                 .defaultNodeSize(this.options.nodeRadius * 2)
    //                 .linkDistance(linkDistance)
    //                 .nodes(nodes)
    //                 .links(links);
    //     this.d3cola.start(50, 100, 200);
    //     this.d3cola.stop();

    //     nodes.forEach((value: any) => {
    //         let _oldValue = data.nodes.get(value.name); 
    //         _oldValue!.x = value.x;
    //         _oldValue!.y = value.y; 
    //     });
    // }
}
    