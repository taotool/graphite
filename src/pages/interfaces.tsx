
export interface GraphNode {
    id: string;      // category.entity
    name?: string;
    type: string;
    value?: string;
    from?: string;
    to?: string;
    fields?: {
        id: string;    // full field id: category.entity.field
        name: string;
        type: string;
        value: string;
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


