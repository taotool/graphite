import React, { useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import type { Node, Edge } from "reactflow";
import { jsonToFieldGraph, toEntityGraph, toEntityGraphFlow } from "./functions"
// import type { GraphNode, GraphData } from "./interfaces";


interface JsonGraphProps {
  jsonstr: string; // list of YAML strings
}
export interface GraphFlow {
  nodes: Node[];
  edges: Edge[];
}
export const Flowite: React.FC<JsonGraphProps> = ({ jsonstr }) => {
const [highlightEntity, setHighlightEntity] = useState<string | undefined>(undefined);

  // Convert merged spec to GraphData
  // const graphData: GraphFlow = useMemo( () => {

  //   const fieldGraph = jsonToFieldGraph(JSON.parse(jsonstr));
  //   const entityGraph = toEntityGraph(fieldGraph);

  //   const a =  toEntityGraphFlow(entityGraph, highlightEntity, "LR");

  //   return a;
  // }, [jsonstr, highlightEntity]);
const [graphData, setGraphData] = useState<{nodes: Node[]; edges: Edge[]}>({nodes: [], edges: []});

useEffect(() => {
  (async () => {
    const fieldGraph = jsonToFieldGraph(JSON.parse(jsonstr), true, [["order_id", "orderId"]]);
    const entityGraph = toEntityGraph(fieldGraph);
    const data = await toEntityGraphFlow(entityGraph, highlightEntity, 'LR');
    setGraphData(data);
  })();
}, [jsonstr, highlightEntity]);


  return (
    <div style={{ border:"1px solid var(--border-color)", width: "100%", height: "600px" }}>

      <ReactFlow nodes={graphData.nodes} edges={graphData.edges}
        onNodeClick={(_, node) => {
          console.log(node.id)
          setHighlightEntity(node.id); // set clicked node as highlighted
        }}
        fitView>
        {/* <MiniMap /> */}
        {/* <Controls /> */}
        {/* <Background gap={16} color="#aaa" /> */}
      </ReactFlow>
    </div>
  );
};

