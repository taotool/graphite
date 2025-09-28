import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import ForceGraph3D from "react-force-graph-3d";
import SpriteText from "three-spritetext";
import type { Node, Edge } from "reactflow";
import { toEntityGraphFlow } from "./functions";

export interface FlowiteProps {
  data?: string; // JSON string
  onNodeClick?: (id: string) => void;
}
export interface FlowiteRef {
  highlight: (id: string) => void;
}

export const Flowite3D = forwardRef<FlowiteRef, FlowiteProps>(({ data, onNodeClick }, ref) => {
  const fgRef = useRef<any>(undefined);
  const highlightEntity = useRef<string | undefined>(undefined);
  const [graphData, setGraphData] = useState<{ nodes: Node[]; edges: Edge[] }>({ nodes: [], edges: [] });

  useImperativeHandle(ref, () => ({
    highlight(id: string) {
      highlightEntity.current = id;
      updateGraph(id);
    }
  }));

  const updateGraph = async (hid?: string) => {
    if (!data) return;
    const entityGraph = JSON.parse(data);
    const gd = await toEntityGraphFlow(entityGraph, hid, "LR");
    setGraphData(gd);
  };

  useEffect(() => {
    updateGraph(highlightEntity.current);
  }, [data]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ForceGraph3D
        ref={fgRef}
        graphData={{
          nodes: graphData.nodes.map(n => ({ ...n, val: 5 })), // val 决定球体大小
          links: graphData.edges.map(e => ({
            source: e.source,
            target: e.target,
            label: e.label,
            width: e.animated ? 3 : 1
          }))
        }}
        nodeThreeObject={(node: any) => {
          const sprite = new SpriteText(node.name || node.id);
          sprite.color =
            node.id === highlightEntity.current
              ? "#ff4136"
              : "#00aaff"; // 高亮当前节点
          sprite.textHeight = 8;
          return sprite;
        }}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        linkWidth={(link: any) => link.width || 1}
        linkColor={(link: any) => {
          if (!highlightEntity.current) return "#aaa";
          return (
            graphData.edges.some(
              e =>
                (e.source === highlightEntity.current && e.target === link.target) ||
                (e.target === highlightEntity.current && e.source === link.source)
            )
              ? "#1976d2"
              : "#aaa"
          );
        }}
        onNodeClick={(node: any) => {
          highlightEntity.current = node.id;
          updateGraph(node.id);
          onNodeClick?.(node.id);
        }}
        enableNodeDrag={true}
        onNodeDragEnd={(node: any) => {
          node.fx = node.x;
          node.fy = node.y;
          node.fz = node.z;
        }}
        cooldownTicks={50} // 让自动布局稳定后停止力导向
        enablePointerInteraction={true}
        autoPauseRedraw={false}
      />
    </div>
  );
});
