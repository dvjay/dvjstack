export interface NodeRequest {
    id: string;
    idType: IdTypes;
    depth: number;
    nodeAttributes: any;
}

export enum IdTypes {
    node = 1,
    entity,
    party
}