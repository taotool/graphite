import React, { useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";
import type { Node, Edge } from "reactflow";
interface GraphNode {
  id: string;
  name: string;
  type: string;
  value: string;
}

interface GraphEdge {
  source: string;
  target: string;
  label?: string;
}

interface Graph {
  type?: string;
  direction?: "vertical" | "horizontal";
  graph?: { rankdir: string; title?: string };
  node?: { shape: string };
  metadata?: { showDetails?: boolean };
  nodes: GraphNode[];
  edges: GraphEdge[];
}

interface JsonGraphProps {
  jsonstr: string; // list of YAML strings
}

const JsonGraph: React.FC<JsonGraphProps> = ({ jsonstr }) => {
  function convertJsonToGraph(jsonObj: Record<string, any>, separateNodeForArray = true, linkedFields = [[""]]): Graph {
    const result: Graph = { metadata: {}, nodes: [], edges: [] };

    function makeNode(entity: string, entityId: string, id: string, type: string, value: string) {
      result.nodes.push({
        id: `${entity}.${entityId}.${id}`,
        name: id,
        type,
        value
      });
    }

    function processEntity(entity: string, entityId: string, obj: Record<string, any>, root = false) {

      for (const [key, value] of Object.entries(obj)) {
        if (value === null || value === undefined) continue;

        if (typeof value !== "object" || (Array.isArray(value) === false && typeof value !== "object")) {
          // primitive field
          makeNode(entity, entityId, key, typeof value, String(value));
        } else if (Array.isArray(value)) {
          // array of objects
          const tp = key;
          if (!root) {// for root level, no node
            makeNode(entity, entityId, tp, `[${tp}]`, "[...]");
          }
          if (separateNodeForArray) {
            // create an edge from parent entity to the array field
            let linkedToArray = false;
            value.forEach((item, idx) => {
              const childEntity = key.toUpperCase(); // e.g. addresses -> ADDRESS
              const childId = item.id || `${childEntity}[${idx}]`;
              if (!root) {// for root level, no edge from outside
                makeNode(`[${childEntity}]`, entityId, childId, `[${childId}]`, "[...]");//array item node
              }
              // PARENT -> ARRAY
              if (!linkedToArray) {
                if (!root) {// for root level, no edge from outside
                  result.edges.push({
                    source: `${entity}.${entityId}.${tp}`,
                    target: `[${childEntity}].${entityId}.${childId}`,
                    label: "has"
                  });
                }
                linkedToArray = true;
              }
            });
          }

          // each item in the array is a separate entity
          value.forEach((item, idx) => {
            const childEntity = key.toUpperCase(); // e.g. addresses -> ADDRESS
            const childId = item.id || `${childEntity}[${idx}]`;

            if (separateNodeForArray) {
              if (!root) {// for root level, no edge from outside
                // ARRAY -> ITEM
                result.edges.push({
                  source: `[${childEntity}].${entityId}.${childId}`,
                  target: `${childEntity}.${childId}.id`,
                  label: "contains"
                });
              }
              processEntity(childEntity, childId, item);

            } else {
              if (!root) {// for root level, no edge from outside
                result.edges.push({
                  source: `${entity}.${entityId}.${key}`,
                  target: `${childEntity}.${childId}.id`,
                  label: "has"
                });
              }
              processEntity(childEntity, childId, item);
            }
          });
        } else if (typeof value === "object") {
          // nested object
          const tp = key;
          if (!root) {
            makeNode(entity, entityId, key, tp, "{...}");
          }
          const childEntity = key.toUpperCase();
          const childId = value.id || `${tp}Id`;//  if no id
          if (!root) {// for root level, no edge from outside
            result.edges.push({
              source: `${entity}.${entityId}.${key}`,//parent
              target: `${childEntity}.${childId}.id`,//child - current
              label: "has"
            });
          }
          processEntity(childEntity, childId, value);
        } else {
          // unknown type, skip
          console.warn("Unknown type for key:", key, value);
          alert("Unknown type for key: " + key);
        }
      }
    }
    /**
     * Connect nodes with the same value, restricted to certain field groups.
     * Field groups allow treating multiple field names as equivalent (e.g., ["orderId", "order_id"]).
     *
     * @param graph Input graph
     * @param fieldGroups Array of field groups, each being a list of equivalent field names
     * @returns A new graph with edges added for duplicates
     */
    function connectNodesWithSameValue(
      graph: Graph,
      fieldGroups: string[][]
    ): Graph {
      const { nodes, edges } = graph;

      // Normalize groups into a lookup: fieldName -> groupId
      const fieldToGroup = new Map<string, number>();
      fieldGroups.forEach((group, idx) => {
        for (const field of group) {
          fieldToGroup.set(field, idx);
        }
      });

      // Map: groupId + value -> node ids
      const valueMap = new Map<string, string[]>();

      for (const node of nodes) {
        if (!node.value) continue;

        const fieldName = node.id.split(".")[2];
        const groupId = fieldToGroup.get(fieldName);

        if (groupId !== undefined) {
          const key = `${groupId}::${node.value}`;
          if (!valueMap.has(key)) {
            valueMap.set(key, []);
          }
          valueMap.get(key)!.push(node.id);
        }
      }

      // Create new edges for nodes that share the same value in the same field group
      const newEdges: GraphEdge[] = [];
      for (const [key, ids] of valueMap.entries()) {
        if (ids.length > 1) {
          const [first, ...rest] = ids;
          const value = key.split("::")[1];
          for (const other of rest) {

            newEdges.push({
              source: first,
              target: other,
              label: `L:${value}`,
            });
          }
        }
      }

      return {
        ...graph,
        edges: [...edges, ...newEdges],
      };
    }


    // entry point: assume root objects are entities
    for (const [rootKey, rootVal] of Object.entries(jsonObj)) {
      const entity = rootKey.toUpperCase();
      if (Array.isArray(rootVal)) {
        rootVal.forEach((item, idx) => {
          const entityId = item.id || `${entity}${idx + 1}`;
          processEntity(entity, entityId, item);
        });
      } else if (typeof rootVal === "object") {
        const entityId = rootVal.id || `${entity}`;
        processEntity(entity, entityId, rootVal, true);
      }
    }

    //
    const updatedGraph = connectNodesWithSameValue(result, linkedFields);
    return updatedGraph;
  }

  // Convert merged spec to GraphData
  const graphData: Graph = useMemo(() => {
   
    return convertJsonToGraph(JSON.parse(jsonstr));
  }, [jsonstr]);

  // Build ReactFlow nodes & edges
  const nodes: Node[] = useMemo(
    () =>
      graphData.nodes.map((n, i) => ({
        id: n.id,
        data: { label: `${n.name}\n(${n.type})` },
        position: { x: (i % 5) * 250, y: Math.floor(i / 5) * 120 },
        style: {
          border: "1px solid #888",
          borderRadius: "12px",
          padding: "8px",
          background:
            n.type === "path"
              ? "#E3F2FD"
              : n.type === "method"
                ? "#E8F5E9"
                : "#FFF3E0",
        },
      })),
    [graphData.nodes]
  );

  const edges: Edge[] = useMemo(
    () =>
      graphData.edges.map((e, i) => ({
        id: `edge-${i}`,
        source: e.source,
        target: e.target,
        label: e.label,
        animated: true,
        style: { stroke: "#555" },
      })),
    [graphData.edges]
  );

  return (
    <div style={{ width: "100%", height: "600px" }}>
      <h2 className="text-xl font-semibold mb-2">
        {graphData.graph?.title || "OpenAPI Graph"}
      </h2>
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <MiniMap />
        <Controls />
        <Background gap={16} color="#aaa" />
      </ReactFlow>
    </div>
  );
};

export default JsonGraph;
