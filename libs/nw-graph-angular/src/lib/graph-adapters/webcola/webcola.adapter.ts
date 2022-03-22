import * as cola from 'webcola'; 
import { INode, IEdge, INwData } from '../../models/nw-data'; 
import { GraphAdapter, GraphOptions } from '../../models/graph-adapter';
import * as d3 from 'd3';
import { gridConstrainsts } from './grid.constraints';
import { treeConstrainsts } from './tree.constraints';

export default class WebcolaAdapter implements GraphAdapter {
    private d3cola: any;

    constructor(private options: GraphOptions) {
        this.initialize(options);
    }

    initialize(options: GraphOptions) {
        this.options = options;
    }
    
    attachNodesPositionByLayout(data: INwData, rootNode: INode, nodeTypes: string[], layoutId: number, shouldNodesFixed: boolean) { 
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
                linkDistance = this.options.edgeLength;
            }
            if(nodes.length > 200) {
                linkDistance = this.options.edgeLength + 100;
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
            if(shouldNodesFixed) {
                _oldValue!.fx = value.x;
                _oldValue!.fy = value.y;
            }
        });
    }
}
    