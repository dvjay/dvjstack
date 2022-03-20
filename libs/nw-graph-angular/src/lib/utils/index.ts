import { toInteger } from "lodash";
import { INwData } from "../models/nw-data";
export const EMPTY_STRING= "";

export function toPositiveInteger(param: any, defaultValue: number): number { 
    if(typeof param === 'number' || typeof param === 'string') {
        let intVal = Math.abs(toInteger(param)); 
        if(intVal !== 0) {
            return intVal;
        }
    }
    return defaultValue;
}

export function toBoolean(param: any, defaultValue: boolean) : boolean { 
    if(typeof param === 'boolean') {
        defaultValue = param; 
    } else if(typeof param === 'string') { 
        if (param.trim().toLowerCase() === 'true') {
            defaultValue = true;
        }
        if(param.trim().toLowerCase() === 'false') {
            defaultValue = false;
        }
    }
    return defaultValue;
}

export function isStringNullorEmpty(value: any) {
    return !(typeof value === "string" && value.trim().length > 0);
}

export function isArrayOfNonEmptyStrings(value: any) { 
    if(Array.isArray(value) && value.length > 0) { 
        for(const iterator of value) { 
            if(isStringNullorEmpty(iterator)) {
                return false;
            }
        }
        return true;
    }
    return false;
}

export function nwToString(value: any): string {
    if(typeof value !== 'number' && typeof value !== 'string') {
        return "";
    } else {
        return value.toString().trim();
    }
}

/* Example: [1, 2, 3, 4, 5] => [4, 2, 1, 3, 5] */
export function centerArray<T>(arr: T[]): T[] {
    const retArr: T[] = [];

    arr.forEach((element, i) => {
        if(i % 2 === 0) {
            retArr.unshift(element);
        } else {
            retArr.push(element);
        }
    });
    return retArr;
}

export function identifyFullyLoadedNodesByNumHops(rootNodeId: string, graphData: INwData, NumHops: number) {
    const uniqueNodeIds = new Set<string>();
    const temp = new Set<string>();
    uniqueNodeIds.add(rootNodeId);
    temp.add(rootNodeId);
    const loadedNodeIds = [temp];
    let hopPointer: Set<string>;
    for (let hopIndex = 0; hopIndex < NumHops+1; hopIndex++) {
        if (!loadedNodeIds[hopIndex + 1]) {
            loadedNodeIds.push(new Set<string>());
            hopPointer = loadedNodeIds[hopIndex + 1];
            
            for (const hIds of loadedNodeIds[hopIndex].values()) {
                for (const [_, edg] of graphData.edges) {
                    if(edg.sourceNodeId === hIds) {
                        if(!uniqueNodeIds.has(edg.targetNodeId)) {
                            uniqueNodeIds.add(edg.targetNodeId);
                            hopPointer.add(edg.targetNodeId)
                        }
                    }
                    if(edg.targetNodeId === hIds) {
                        if(!uniqueNodeIds.has(edg.sourceNodeId)) {
                            uniqueNodeIds.add(edg.sourceNodeId);
                            hopPointer.add(edg.sourceNodeId)
                        }
                    }
                }
            }
        }
    }
    return Array.from(uniqueNodeIds);
}
