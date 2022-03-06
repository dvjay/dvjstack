import { centerArray } from "../../utils";
import { setcola } from "./setcola";

export function gridConstrainsts(d3Cola: any, nodes: any[], links: any[], linkDistance: number, types: string[]): any {
    const nodeTypes = centerArray(types);

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
                order: nodeTypes
            }]
        }
    ];

    let _setCola = setcola.nodes(nodes).links(links).guides([]).constraints(constraintDefinitions).gap(70).layout();

    d3Cola.linkDistance(linkDistance)
            .nodes(_setCola.nodes)
            .links(_setCola.links)
            .groups([])
            .constraints(_setCola.constraints);
    return d3Cola;
}