import { toInteger } from "lodash";
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
