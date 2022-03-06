import { Injectable } from '@angular/core'; 
import { Selection, select, event } from 'd3-selection';
import { zoom, zoomTransform, zoomIdentity} from 'd3-zoom'; 
import { drag } from 'd3-drag'; 
import { INode} from '../models/nw-data'; 
import { GraphEngineService } from './graph-engine.service';
import { TransformInfo } from '../models/load-nodes-payload';

@Injectable() 
export class D3Service {
    constructor() { }
    /** Bind a pan/zoom behaviour to svg element */ 
    applyZoomableBehaviour(svgElement: any, containerElement: any, transformVal: TransformInfo) {
        let svg, container: Selection<any, any, null, undefined>, zoomed, zm;
        svg = select(svgElement); 
        svg.on(".zoom", null);
        container = select(containerElement);
        
        console.log("test transform", container.attr('transform'));
        // console.log("test transform2", zmT);
        zoomed = () => {
            const transfrm = event.transform;
            container.attr('transform', `translate(${transfrm.x}, ${transfrm.y}) scale(${transfrm.k})`);
        }
        zm = zoom().extent([[0,0],[300,300]]).on('zoom', zoomed); 
        svg.call(zm); 
        svg.on("dblclick.zoom", null);
        if(transformVal && transformVal.x && transformVal.y && transformVal.k) {
            svg.call(zm.transform, zoomIdentity.translate(transformVal.x, transformVal.y).scale(transformVal.k));
        } else {
            svg.call(zm.transform, zoomIdentity.translate(0, 0).scale(1));
        }
    }

    removeZoomableBehaviour(svgElement: any) {
        select(svgElement).on(".zoom", null);
    }
    
    triggerZoomToFit(svgElement: any) {
        // console.log(svgElement);
    }
    
    graphBounds(nodes: INode[]) { 
        var x = Number.POSITIVE_INFINITY, X = Number. NEGATIVE_INFINITY, y = Number.POSITIVE_INFINITY, Y = Number.NEGATIVE_INFINITY; 
        nodes.forEach((v: any) => {
            x = Math.min(x, v.x - 50 / 2); 
            X = Math.max(X, v.x + 50 / 2); 
            y = Math.min(y, v.y - 50 / 2); 
            Y = Math.max(Y, v.y + 50 / 2);
        });
        return { x: x, X: X, y: y, Y: Y };
    }
    
    applyDraggableBehaviour(element: any, node: INode | undefined, graph: GraphEngineService | undefined) {
        const d3element = select(element);

        function started() {
            /** Preventing propogation of dragstart to parent elements */
            event.sourceEvent.stopPropagation();

            if(graph && !event.active) {
                graph.nodes!.forEach(n => {
                    n.fx = n.x;
                    n.fy = n.y;
                });
                graph.simulation.alphaTarget(0.1).restart();
            }

            event.on('drag', dragged).on('end', ended);

            function dragged() {
                if(node) {
                    node.fx = event.x;
                    node.fy = event.y;
                }
            }
            
            function ended() { 
                if (graph && !event.active) {
                    graph.simulation.alphaTarget(0);
                    setTimeout(() => {
                        graph.simulation.stop();
                    }, 0);
                }
            }
        }
        
        d3element.call(drag()
            .on('start', started));
    }
    removeDraggableBehaviour(element: any) {
        const d3element = select(element);
        d3element.on('drag', null);
    }
    
    createTooltip(element: any, node: INode) {
        const d3element = select(element); 
        let titleElem = d3element.select("title");

        if(Array.isArray(node.nodeDescAttributes) && node.nodeDescAttributes.length > 0) {
            let textElems = titleElem.selectAll("text") 
                .data(node.nodeDescAttributes).enter().append("text");
            textElems.append("tspan").text((d: any) => d.title + ": ").attr("font-weight", "bold");
            textElems.append("tspan").text((d: any) => {
                                return (typeof node[d.attribute] === 'undefined'? '-' : node[d.attribute]) + "\n";
            });
        } else {
            titleElem.selectAll("text") 
                .data([node.label])
                .enter().append("text")
                .text((d: any) => d);
        }
    }
}
