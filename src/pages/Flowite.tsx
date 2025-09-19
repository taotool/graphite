import React, { useState, useEffect } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import type { Node, Edge } from "reactflow";
import { toEntityGraphFlow } from "./functions"
// import type { GraphNode, GraphData } from "./interfaces";


interface JsonFlowiteProps {
  jsonstr: string; // list of YAML strings
}
export interface GraphFlow {
  nodes: Node[];
  edges: Edge[];
}
export const Flowite: React.FC<JsonFlowiteProps> = ({ jsonstr }) => {
  console.log("--------- Flowite render ");
  const [highlightEntity, setHighlightEntity] = useState<string | undefined>(undefined);


  const [graphData, setGraphData] = useState<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] });

  useEffect(() => {
    (async () => {
      // const fieldGraph = jsonToFieldGraph(JSON.parse(jsonstr), true, [["order_id", "orderId"]]);
      // const entityGraph = toEntityGraph(fieldGraph);
      const entityGraph = JSON.parse(jsonstr);
      const gd = await toEntityGraphFlow(entityGraph, highlightEntity, 'LR');
      setGraphData(gd);

    })();
  }, [jsonstr, highlightEntity]);


  return (
    <div style={{ border: "1px solid var(--border-color)", width: "100%", height: "100%" }}>

      <ReactFlow 
          nodes={graphData.nodes}
          edges={graphData.edges}
          onNodeClick={(_, node) => {
            console.log(node.id)
            setHighlightEntity(node.id); // set clicked node as highlighted
          }}
          fitView
          proOptions={{ hideAttribution: true }}
        >
        {/* <MiniMap /> */}
        {/* <Controls /> */}
        {/* <Background gap={16} color="#aaa" /> */}

      </ReactFlow>
    </div>
  );
};

