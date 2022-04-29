import { INode, INwData } from '../../models/nw-data'; 
import { GraphAdapter, GraphOptions } from '../../models/graph-adapter';
import { gridConstrainsts } from './grid.constraints';
import { hierarchicalConstrainsts } from './hierarchical.constraints';
import { circularConstrainsts } from './circular.constraints';
import { forcedConstrainsts } from './forced.constraints';

export default class WebcolaAdapter implements GraphAdapter {
    constructor(private options: GraphOptions) {
        this.initialize(options);
    }

    initialize(options: GraphOptions) {
        this.options = options;
    }
    
    attachNodesPositionByLayout(data: INwData, rootNode: INode, nodeTypes: string[], layoutId: number) { 
        let nodes: any[] = [];

        switch(layoutId) {
            case 0:
                nodes = circularConstrainsts(data, rootNode, nodeTypes, this.options);
                break;
            case 1:
                nodes = hierarchicalConstrainsts(data, rootNode, nodeTypes, this.options);
                break;
            case 2:
                nodes = gridConstrainsts(data, rootNode, nodeTypes, this.options);
                break;
            default:
                nodes = circularConstrainsts(data, rootNode, nodeTypes, this.options);
                break;
        }

        nodes.forEach((value: any) => {
            let _oldValue = data.nodes.get(value.name);
            _oldValue!.x = value.x;
            _oldValue!.y = value.y;
            _oldValue!.fx = value.x;
            _oldValue!.fy = value.y;
        });
    }
}
    