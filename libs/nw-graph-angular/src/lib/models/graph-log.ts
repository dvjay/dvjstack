export const nwGraphErrorName = "NwGraphError";

export interface GraphLog {
    id: number; 
    entityId?: string; 
    nodeIds?: string[]; 
    logType: GraphLogType; 
    source: string; 
    message: string; 
    messageDesc: string; 
    timestamp: Date;
}

export class GraphError extends Error {
    logObj: GraphLog; 
    constructor(logobj: GraphLog, ...params: string[]) {
        super(...params); 
        this.logObj = logobj; 
        this.name = nwGraphErrorName;
    }
}

export function extractGraphLogFromError(err: Error | GraphError): GraphLog {
    if(err.name === nwGraphErrorName) {
        return (err as GraphError).logObj;
    } else { 
        return { id: generateUniqueId(), logType: GraphLogType.Error, 
                    message: err.message, source: "Unknown",
                    messageDesc: err.message, 
                    timestamp: new Date() } as GraphLog;
    }
}

export function generateUniqueId(): number {
    return Date.now() + Math.random();
}

export enum GraphLogType {
    Info = 0, Warning = 1, Error = 2, RetryableError = 3
}

export enum GraphLogErrorSeverity {
    Low = 0, Medium = 1, High = 2, Critical = 3
}
