import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import ReactFlow, {
  StraightEdge, SimpleBezierEdge, SmoothStepEdge, BezierEdge,
  applyNodeChanges,
  applyEdgeChanges, Handle, Position, Background, Controls
} from "reactflow";
import type { Node, Edge } from "reactflow";
import "reactflow/dist/style.css";
import { Dialog, DialogTitle, DialogContent, Button } from "@mui/material";

import { toEntityGraphFlow } from "./functions";
import "./Flowite.css";

export interface FlowiteProps {
  data?: string; // JSON string
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
    const [graphData, setGraphData] = useState<GraphFlow>({
      nodes: [],
      edges: [],
    });

    useImperativeHandle(ref, () => ({
      highlight(id) {
        console.log("Highlight entity:", id);
        setHighlightEntity(id);
      },
    }));


    // ---------- 带动画的 setGraphData ----------
    const animateGraphUpdate = (newData: GraphFlow) => {
      setGraphData((prev) => {
        // 找出位置发生变化的节点
        const mergedNodes = newData.nodes.map((n) => {
          const old = prev.nodes.find((p) => p.id === n.id);
          if (!old) return n; // 新节点，直接更新

          // 如果位置和尺寸都一样，返回旧的，避免动画
          const samePosition =
            old.position.x === n.position.x &&
            old.position.y === n.position.y &&
            old.width === n.width &&
            old.height === n.height;

          if (samePosition) {
            return old; // 复用旧节点，不触发动画
          }

          // 位置变了：先用旧位置渲染一次，等下一帧切换到新位置
          return { ...n, position: old.position };
        });

        return { ...newData, nodes: mergedNodes };
      });

      // 下一帧切换到真正的新位置（只对变动节点生效）
      requestAnimationFrame(() => {
        setGraphData((prev) => {
          const updatedNodes = prev.nodes.map((n) => {
            const target = newData.nodes.find((m) => m.id === n.id);
            if (!target) return n;
            // 如果本来就是目标位置，不改动
            if (
              n.position.x === target.position.x &&
              n.position.y === target.position.y
            ) {
              return n;
            }
            return { ...n, position: target.position };
          });
          return { ...newData, nodes: updatedNodes };
        });
      });
    };


    // ---------- 设置高亮并更新图 ----------
    const setHighlightEntity = async (hid: string) => {
      highlightEntity.current = hid;
      const entityGraph = JSON.parse(data || "{}");
      const gd = await toEntityGraphFlow(entityGraph, hid, "LR", onFieldClick);
      // console.log("Updated graph data with highlight:", JSON.stringify(gd));
      animateGraphUpdate(gd);
    };

    const onFieldClick = (nodeId: string, field: { id: string; name: string; type: string; value: string }) => {
      console.log("Field clicked:", nodeId, field);
      const ss = nodeId.split(".");
      // setSelectedNode(node); // 显示节点详情
      setHighlightEntity(ss[0] + "." + ss[1]); // 高亮父节点
    };
    // 节点变化时更新 state
    const onNodesChange = useCallback(
      (changes: any) => setGraphData((gd) => ({ ...gd, nodes: applyNodeChanges(changes, gd.nodes) })),
      []
    );

    // 边变化（可选，比如删除边）
    const onEdgesChange = useCallback(
      (changes: any) => setGraphData((gd) => ({ ...gd, edges: applyEdgeChanges(changes, gd.edges) })),
      []
    );
    useEffect(() => {
      (async () => {
        if (data) {
          const entityGraph = JSON.parse(data);
          const gd = await toEntityGraphFlow(
            entityGraph,
            highlightEntity.current,
            "LR",
            onFieldClick
          );
          animateGraphUpdate(gd);
        }
      })();
    }, [data]);

    console.log("--------- Flowite render end ---------");
    return (
      <div
        style={{
          border: "1px solid var(--border-color)",
          width: "100%",
          height: "100%",
        }}
      >
        <ReactFlow
          nodes={graphData.nodes}
          edges={graphData.edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeDragStart={(_, node) => {
            const el = document.querySelector(`[data-id='${node.id}']`);
            el?.classList.add("dragging");
          }}
          onNodeDragStop={(_, node) => {
            const el = document.querySelector(`[data-id='${node.id}']`);
            el?.classList.remove("dragging");
          }}
          
          nodesDraggable
          nodesConnectable
          //           edgeTypes={{
          //   smart: SimpleBezierEdge, // 或 BezierEdge
          // }}
          // defaultEdgeOptions={{ type: "smart" }}
          onNodeClick={(_, node) => {
            console.log(node.id);
            // setSelectedNode(node);
            setHighlightEntity(node.id);
            onNodeClick?.(node.id);
          }}
          fitView
          proOptions={{ hideAttribution: true }}
          minZoom={0.2}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        >
          {/* <Controls /> */}
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
