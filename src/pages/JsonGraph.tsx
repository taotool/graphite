import { useEffect, useState, useRef } from "react";
import { Graphite } from "./Graphite";
import "./Graphite.css"
import Editor from "@monaco-editor/react";
import { useMediaQuery } from "@mui/material";
import type { OnMount } from "@monaco-editor/react";


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

export function convertJsonToGraph(jsonObj: Record<string, any>, separateNodeForArray = true, linkedFields=[[""]]): Graph {
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
        const tp = key[0].toUpperCase() + key.slice(1);
        if (!root) {// for root level, no node
          makeNode(entity, entityId, tp, `[${tp}]`, "[{...}]");
        }
        if (separateNodeForArray) {
          // create an edge from parent entity to the array field
          let linkedToArray = false;
          value.forEach((item, idx) => {
            const childEntity = key.toUpperCase(); // e.g. addresses -> ADDRESS
            const childId = item.id || `${childEntity}[${idx}]`;
            if (!root) {// for root level, no edge from outside
              makeNode(`[${childEntity}]`, entityId, childId, `[${childId}]`, "[{...}]");//array item node
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
        const tp = key[0].toUpperCase() + key.slice(1);
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
export const JsonGraph: React.FC<any> = (props) => {

  console.log("--------- JsonGraph render ");
  const keys = [["seller_id"], ["item_id"], ["order_id", "orderId"], ["buyerId","buyer_id"]]
  const [rawJson, setRawJson] = useState(props.json); // rawJson as state
  const [graphJson, setGraphJson] = useState(() =>
    JSON.stringify(convertJsonToGraph(JSON.parse(props.json), true, keys), null, 2)
  );
  const [dividerX, setDividerX] = useState(40); // left panel width in %
  const [isDragging, setIsDragging] = useState(false);
  const editorRef = useRef<any>(null);


  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newDivider = (e.clientX / window.innerWidth) * 100;
      if (newDivider > 10 && newDivider < 90) {
        setDividerX(newDivider);
      }
    }
  };
  // handle JSON editor changes
  const handleEditorChange = (value: string | undefined) => {
    console.log("Editor changed");
    if (!value) return;
    setRawJson(value);

    // try updating graph only if JSON is valid
    try {
      const parsed = JSON.parse(value);
      const updatedGraph = convertJsonToGraph(parsed, true, keys);
      const graphJson = JSON.stringify(updatedGraph, null, 2);
      setGraphJson(graphJson);
      console.log("Graph updated ");
    } catch (err) {
      // invalid JSON, ignore for now
    }
  };
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;
  };
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("pointerup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("pointerup", handleMouseUp);
    };
  }, [isDragging]);
  return (
    <div style={{ display: "flex", height: "90vh", width: "96vw" }} >


      {/* Right panel: JSON editor */}
      <div style={{ border: "1px solid #ccc", width: `${dividerX}%` }}>
        <Editor
          height="100%"
          defaultLanguage="json"
          value={rawJson}
          onChange={handleEditorChange}
          onMount={handleEditorMount}
          theme={prefersDarkMode ? "vs-dark" : "light"}
          options={{
            scrollbar: {
              vertical: "auto",      // "auto" | "visible" | "hidden"
              horizontal: "auto",
              verticalScrollbarSize: 4, // <-- width of vertical scrollbar (px)
              horizontalScrollbarSize: 4, // <-- height of horizontal scrollbar (px)
              arrowSize: 12,             // optional, size of arrows
            }
          }}
        />
      </div>
      {/* Divider */}
      <div
        onPointerDown={handleMouseDown}
        style={{ width: "8px", cursor: "col-resize", backgroundColor: "#f0f0f0" }}
      />
      {/* Left panel: Graph */}
      <div style={{ border: "1px solid #ccc", width: `${100 - dividerX}%` }}>
        <Graphite jsonString={graphJson} />
      </div>
    </div>
  );
}

export default JsonGraph;
