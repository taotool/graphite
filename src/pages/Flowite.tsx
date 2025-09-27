import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
} from "reactflow";import "reactflow/dist/style.css";
import type { Node, Edge } from "reactflow";
import { Dialog, DialogTitle, DialogContent, Button } from "@mui/material";



import { toEntityGraphFlow } from "./functions"
// import type { GraphNode, GraphData } from "./interfaces";
import './Flowite.css';

export interface FlowiteProps {
  data?: string; // list of YAML strings
  onNodeClick?: (id: string) => void;
}
export interface GraphFlow {
  nodes: Node[];
  edges: Edge[];
}
export interface FlowiteRef {
  highlight: (id: string) => void;
}
export const Flowite = forwardRef<FlowiteRef, FlowiteProps>(
  ({ data, onNodeClick }, ref) => {
    console.log("--------- Flowite render start ---------");
      const highlightEntity = useRef<string>(undefined);

    const [selectedNode, setSelectedNode] = useState<Node | null>(null);
    const [graphData, setGraphData] = useState<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] });

    useImperativeHandle(ref, () => ({
      highlight(id) {
        console.log("Highlight entity:", id);

        // setHighlightEntity(id);
      }
    }));


    //通过这个函数设置高亮实体，并更新图数据，又利用到了state来触发useEffect。
    //click -> setHighlightEntity -> setGraphData state -> 更新图数据
    const setHighlightEntity = async (hid: string) => {
          highlightEntity.current = hid;

      const entityGraph = JSON.parse(data || '{}');
            console.log("b", JSON.stringify(data));

      const gd = await toEntityGraphFlow(entityGraph, hid, 'LR');
      console.log("Updated graph data with highlight:", JSON.stringify(gd));
      setGraphData(gd);
    }


    useEffect(() => {
      (async () => {
        if (data) {
          const entityGraph = JSON.parse(data);
          const gd = await toEntityGraphFlow(entityGraph, highlightEntity.current, 'LR');
          setGraphData(gd);
        }
      })();
    }, [data]);

    console.log("--------- Flowite render end ---------");
    return (
      <div style={{ border: "1px solid var(--border-color)", width: "100%", height: "100%" }}>

        <ReactFlow
          nodes={graphData.nodes}
          edges={graphData.edges}
          onNodeClick={(_, node) => {
            console.log(node.id)
            setHighlightEntity(node.id); // set clicked node as highlighted
            //setSelectedNode(node);
            onNodeClick?.(node.id);
          }}
          fitView
          proOptions={{ hideAttribution: true }}
                minZoom={0.1}   // allow zooming out a lot more
      maxZoom={2}     // (optional) prevent zooming in too far
      defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        >
          {/* <MiniMap /> */}
          <Controls />
          {/* <Background gap={16} color="#aaa" /> */}

        </ReactFlow>

        {/* 节点详情对话框 */}
        <Dialog open={!!selectedNode} onClose={() => setSelectedNode(null)}>
          <DialogTitle>
            节点详情: {selectedNode?.data?.label || selectedNode?.id}
          </DialogTitle>
          <DialogContent>
            <p>ID: {selectedNode?.id}</p>
            <Button
              variant="contained"
              onClick={() => alert(`调用 ${selectedNode?.id} 的接口`)}
            >
              调用接口
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);