import "./Graphite.css";
interface GraphNode {
    id: string;
    name: string;
    type: string;
    value: string;
}
interface GraphEdge {
    source: string;
    target: string;
    label: string;
}
interface Graph {
    metadata: Record<string, any>;
    nodes: GraphNode[];
    edges: GraphEdge[];
}
export declare function convertJsonToGraph(jsonObj: Record<string, any>, separateNodeForArray?: boolean, linkedFields?: string[][]): Graph;
export declare const JsonGraph: React.FC<any>;
export default JsonGraph;
