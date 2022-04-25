import { GraphOptions } from "../../models/graph-adapter";
import { INode, INwData } from '../../models/nw-data';

interface dummyNode {
    name: string;
    x?: number;
    y?: number;
}

export function gridConstrainsts(data: INwData, rootNode: INode, nodeTypes: string[], options: GraphOptions): any[] {
    let maxVirticalGap = 140;
    let maxHorizontalGap = 140;
    const margin = 40;
    const viewportHeight = (options.height - (margin * 2));
    const viewportWidth = (options.width - (margin * 2));
    // let mostCountOfNodeTypes = 0;
    let startYCordinate = 0;
    const nodesByNodetypes = new Map<string, dummyNode[]>();

    for (const [key,  value] of data.nodes) {
        value.name = key;
        if(typeof value.nodeType === 'string') {
            const nodes = nodesByNodetypes.get(value.nodeType);
            if(Array.isArray(nodes)) {
                nodes.push({name: value.nodeId});
            } else {
                nodesByNodetypes.set(value.nodeType, [{name: value.nodeId}]);
            }
        }
    }

    if(nodesByNodetypes.size > 0) {
        if((maxVirticalGap * (nodesByNodetypes.size - 1)) > viewportHeight) {
            if(nodesByNodetypes.size === 1) {
                startYCordinate = options.height/2;
            } else {
                maxVirticalGap = (viewportHeight / (nodesByNodetypes.size - 1));
                startYCordinate = margin;
            }
        } else {
            if(nodesByNodetypes.size === 1) {
                startYCordinate = options.height/2;
            } else {
                startYCordinate = margin + ((viewportHeight-(maxVirticalGap * nodesByNodetypes.size - 1))/2);
            }
        }
    } else {
        return [];
    }

    let nodeTypeCounter = 0;
    for (const [_, nodeTypeNodes] of nodesByNodetypes) {
        let startXCordinate = -1;
        if((maxHorizontalGap * (nodeTypeNodes.length - 1)) > viewportWidth) {
            if(nodeTypeNodes.length === 1) {
                startXCordinate = options.width/2;
            } else {
                maxHorizontalGap = (viewportWidth / (nodeTypeNodes.length - 1));
                startXCordinate = margin;
            }
        } else {
            if(nodeTypeNodes.length === 1) {
                startXCordinate = options.width/2;
            } else {
                startXCordinate = margin + ((viewportWidth-(maxHorizontalGap * nodeTypeNodes.length - 1))/2);
            }
        }
        nodeTypeNodes.forEach((node, i) => {
            node.x = startXCordinate + (maxHorizontalGap * i);
            node.y = startYCordinate + (maxVirticalGap * nodeTypeCounter);
        });
        ++nodeTypeCounter;
    }

    let nodes: any[] = [];
    nodesByNodetypes.forEach((nodeIds: dummyNode[]) => {
        nodes = nodes.concat(nodeIds);
    });

    return nodes;

}