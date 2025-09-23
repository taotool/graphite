import React, { useEffect, useState, useRef } from "react";
import { Graphite  } from "./Graphite";
import type { GraphiteRef } from "./Graphite";
import { Flowite } from "./Flowite";

import "./Graphite.css"
import Editor from "@monaco-editor/react";
import { useMediaQuery } from "@mui/material";
import type { OnMount } from "@monaco-editor/react";
import { yamlToFieldGraph, graphqlToFieldGraph, openapiToFieldGraph, jsonToFieldGraph, toEntityGraph } from "./functions"
import { json, graphql, yaml, openapi } from "./samples";
import * as jsonc from "jsonc-parser";
import { parse } from "graphql";
export interface DataOProps {
  data: string;
  options: Record<string, any>
}

export const DataO: React.FC<DataOProps> = (props) => {
  const graphiteRef = useRef<GraphiteRef>(null);

  const [data, setData] = useState(props.data); // rawJson as state
  const [type, setType] = useState(props.options.type || "json");
  const [engine, setEngine] = useState(props.options.engine || "flowite");
  const disposeRef = useRef<any>(null);
  const convertToFieldGraph = (data: string, type: string, engine: string) => {
    if (!type || type === 'json') {
      const fieldGraphData = jsonToFieldGraph(JSON.parse(data), props.options.arr, props.options.keys)
      return engine === 'flowite' ? JSON.stringify(toEntityGraph(fieldGraphData), null, 2) : JSON.stringify(fieldGraphData, null, 2);
    }

    if (type === 'graphql') {
      const fieldGraphData = graphqlToFieldGraph(data);
      return engine === 'flowite' ? JSON.stringify(toEntityGraph(fieldGraphData), null, 2) : JSON.stringify(fieldGraphData, null, 2);
    }

    if (type === 'yaml') {
      const fieldGraphData = yamlToFieldGraph(data, props.options.arr, props.options.keys);
      return engine === 'flowite' ? JSON.stringify(toEntityGraph(fieldGraphData), null, 2) : JSON.stringify(fieldGraphData, null, 2);
    }

    if (type === 'openapi') {
      const fieldGraphData = openapiToFieldGraph(JSON.parse(data), props.options.arr, props.options.keys);
      return engine === 'flowite' ? JSON.stringify(toEntityGraph(fieldGraphData), null, 2) : JSON.stringify(fieldGraphData, null, 2);
    }
  }
  // const keys = [["seller_id"], ["item_id"], ["order_id", "orderId"], ["buyerId","buyer_id"]]
  const [graphJson, setGraphJson] = useState(() => convertToFieldGraph(data, type, engine)); // graphJson as state
  const [dividerX, setDividerX] = useState(30); // left panel width in %
  const [isDragging, setIsDragging] = useState(false);
  const editorRef = useRef<any>(null);
  console.log("--------- DataO render start ---------");

  function findGraphQLNodeAt(astNode: any, offset: number): any {
    if (!astNode?.loc) return null;
    if (offset < astNode.loc.start || offset > astNode.loc.end) return null;

    for (const key in astNode) {
      const value = astNode[key];
      if (Array.isArray(value)) {
        for (const child of value) {
          const found = findGraphQLNodeAt(child, offset);
          if (found) return found;
        }
      } else if (typeof value === "object" && value?.loc) {
        // const found = findGraphQLNodeAt(value, offset);
        // if (found) return found;
        return value;
      }
    }
    return astNode;
  }

  /**
   * Attach AST node detection to a Monaco editor instance.
   */
  function attachAstNodeListener(
    editor: any,
    mode: "json" | "graphql",
    onNodeChange: (node: any | null) => void
  ) {
    if (!editor) return;

    const model = editor.getModel();

    function handlePositionChange(position: any) {
      const offset = model.getOffsetAt(position);
      const text = model.getValue();

      try {
        if (mode === "json") {
          const root = jsonc.parseTree(text);
          const node = jsonc.findNodeAtOffset(root!, offset);
          onNodeChange(node ?? null);
        } else if (mode === "graphql") {
          const ast = parse(text, { noLocation: false });
          const node = findGraphQLNodeAt(ast, offset);
          onNodeChange(node ?? null);
        }
      } catch (err) {
        console.error("AST parse error:", err);
        onNodeChange(null);
      }
    }

    const sub1 = editor.onDidChangeCursorPosition((e: any) =>
      handlePositionChange(e.position)
    );
    // const sub2 = editor.onMouseDown((e: any) => {
    //   if (e.target.position) {
    //     handlePositionChange(e.target.position);
    //   }
    // });

    return () => {
      sub1.dispose();
      // sub2.dispose();
    };
  }



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
    if (!value) return;
    setData(value);
  };

  // Handle dropdown changes
  const handleTypeChange = (e: any) => {
      // dispose old listener first
  disposeRef.current?.();

    setType(e.target.value);
    if (e.target.value === "json") {
      setData(json);
    } else if (e.target.value === "graphql") {
      setData(graphql);
    } else if (e.target.value === "yaml") {
      setData(yaml);
    } else if (e.target.value === "openapi") {
      setData(openapi);
    }

  };

  const handleEngineChange = (e: any) => {
    setEngine(e.target.value);
  };
  function handleNodeChange(node: any | null) {
    console.log("Current node:", node.value + " type: " + type);
          graphiteRef.current?.doSomething(node.value);

    // 👇 Do whatever you want here
    if (type.toLowerCase() === "json" && node) {
      console.log("JSON path:", jsonc.getNodePath(node));
    }
  }
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
  const handleEditorMount: OnMount = (editor) => {
    editorRef.current = editor;

    // attach the initial listener immediately
    disposeRef.current = attachAstNodeListener(
      editor,
      type.toLowerCase(),
      handleNodeChange
    );
  };


  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("pointerup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("pointerup", handleMouseUp);
    };
  }, [isDragging]);


  // Regenerate graphJson whenever type, engine, or rawJson changes
  useEffect(() => {
    try {
      const graphJson = convertToFieldGraph(data, type, engine);
      setGraphJson(graphJson);
      console.log("Graph updated ");
      if (!editorRef.current) return;

      // re-attach whenever type/engine/data changes
      disposeRef.current?.(); // cleanup old
      disposeRef.current = attachAstNodeListener(
        editorRef.current,
        type.toLowerCase(),
        handleNodeChange
      );

      // cleanup when effect re-runs or component unmounts
      return () => {
        disposeRef.current?.();
      };
      
    } catch (err) {
      setGraphJson(""); // invalid JSON → no graph
    }
  }, [type, engine, data]);

  console.log("--------- DataO render end ---------");
  return (
    <div>
      {/* Head div with dropdowns */}
      <div style={{ border: "0px solid red", padding: "0.5rem", textAlign: "left" }}>
        <label>
          Type:{" "}
          <select value={type} onChange={handleTypeChange}>
            <option value="json">JSON</option>
            <option value="graphql">GraphQL</option>
            <option value="yaml">YAML</option>
            <option value="openapi">OpenAPI</option>
          </select>
        </label>

        <label style={{ marginLeft: "1rem" }}>
          Engine:{" "}
          <select value={engine} onChange={handleEngineChange}>
            <option value="flowite">Flowite</option>
            <option value="graphite">Graphite</option>
          </select>
        </label>
      </div>

      {/* Main content */}
      <div style={{ display: "flex", height: "90vh", width: "96vw" }}>
        {/* Right panel: JSON editor */}
        <div style={{ border: "1px solid #ccc", width: `${dividerX}%` }}>
          <Editor
            height="100%"
            language={type.toLowerCase()}
            value={data}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            theme={prefersDarkMode ? "vs-dark" : "light"}
            options={{
              scrollbar: {
                vertical: "auto",
                horizontal: "auto",
                verticalScrollbarSize: 4,
                horizontalScrollbarSize: 4,
                arrowSize: 12,
              },
            }}
          />
          {/* </Editor> */}
        </div>

        {/* Divider */}
        <div
          onPointerDown={handleMouseDown}
          style={{
            width: "4px",
            cursor: "col-resize",
            border: "1px solid #ccc",
            backgroundColor: "var(--border-color)",
          }}
        />

        {/* Left panel: Graph */}
        <div style={{ border: "1px solid #ccc", width: `${100 - dividerX}%` }}>
          {engine === "flowite" ? (
            <Flowite data={graphJson} />
          ) : (
            <Graphite ref={graphiteRef} data={graphJson} onHighlightTable={(id: string)=>{
              console.log("DataO: Highlight table:", id);
            }} />
          )}
        </div>
      </div>
    </div>
  );
}

