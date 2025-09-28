// '{ id: string; name: string | undefined; type: string; value: string | undefined; from: string[]; to: string[]; }[]' is not assignable to parameter of type 'GraphNode[]'.
// '{ id: string; name: string | undefined; type: string; value: string | undefined; from: string[]; to: string[]; }' is not assignable to type 'GraphNode'.
export interface GraphNode {
    id: string;      // category.entity
    name?: string;
    type: string;
    value?: string;
    from?: [string];
    to?: [string];
    path?: (string | number)[]; // 👈 JSONC path

    fields?: {
        id: string;    // full field id: category.entity.field
        name: string;
        type: string;
        value: string;
        parents?: [string];
        children?: [string];
    }[];
}

export interface GraphEdge {
    source: string;
    target: string;
    label?: string;
}

export interface GraphData {
    nodes: GraphNode[];
    edges: GraphEdge[];
    direction?: "horizontal" | "vertical";
}


