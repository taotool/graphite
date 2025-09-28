import React, { useEffect, useState, useRef } from "react";
import { Box, FormControl, InputLabel, Select, MenuItem, IconButton } from "@mui/material";
import FilterCenterFocusIcon from '@mui/icons-material/FilterCenterFocus';
import { Graphite } from "./Graphite";
import type { GraphiteRef } from "./Graphite";
import { Flowite } from "./Flowite";
import type { FlowiteRef } from "./Flowite";

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

  console.log("--------- DataO render start ---------");
  const graphiteRef = useRef<GraphiteRef>(null);
  const flowiteRef = useRef<FlowiteRef>(null);

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

    if (type === 'flow') {
      return data; //entity graph in flow format
    }
    if (type === 'openapi') {
      // const fieldGraphData = openapiToFieldGraph(data);
      (async () => {
        const fieldGraphData = await openapiToFieldGraph(data);
        return engine === 'flowite' ? JSON.stringify(toEntityGraph(fieldGraphData), null, 2) : JSON.stringify(fieldGraphData, null, 2);

      })();
    }
  }
  // const keys = [["seller_id"], ["item_id"], ["order_id", "orderId"], ["buyerId","buyer_id"]]
  const [graphJson, setGraphJson] = useState(() => convertToFieldGraph(data, type, engine)); // graphJson as state
  const [dividerX, setDividerX] = useState(30); // left panel width in %
  const [isDragging, setIsDragging] = useState(false);
  const editorRef = useRef<any>(null);
  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: dark)");



  // === divider drag handlers ===
  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newDivider = (e.clientX / window.innerWidth) * 100;
      if (newDivider > 5 && newDivider < 95) {
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

  const handleLocate = () => {
    const model = editorRef.current?.getModel();
    const position = editorRef.current?.getPosition();
    if (model && position) {
      const offset = model.getOffsetAt(position);
      const text = model.getValue();
      if (type.toLowerCase() === "json") {
        const root = jsonc.parseTree(text);
        const node = jsonc.findNodeAtOffset(root!, offset);
        if (node) {
          const path = jsonc.getNodePath(node);
          graphiteRef.current?.highlight(JSON.stringify(path));
          flowiteRef.current?.highlight(JSON.stringify(path));

          // console.log("Locate JSON path:", path);
        }
      } else if (type.toLowerCase() === "graphql") {
        const ast = parse(text, { noLocation: false });

        const node = findGraphQLNodeAt(ast, offset);
        if (node) {
          graphiteRef.current?.highlight(node.value);
          flowiteRef.current?.highlight(node.value);
          console.log("Locate GraphQL node kind:", node.kind);
        }
      }
    }

  }

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


  // Regenerate graphJson whenever type, engine, or rawJson changes
  useEffect(() => {
    try {

      const graphJson = convertToFieldGraph(data, type, engine);
      setGraphJson(graphJson);
      console.log("Graph updated ");

    } catch (err) {
      setGraphJson(""); // invalid JSON → no graph
    }
  }, [type, engine, data]);

  console.log("--------- DataO render end ---------");
  return (
    <div style={{ display: "flex", width: "96vw", flexDirection: "column", gap: "4px", borderRadius: 6, border: "1px solid #e0e0e0" }}>
      <Box
        display="flex"
        alignItems="center"
        gap={2}
        p={1}
      >
        {/* Type Selector */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Type</InputLabel>
          <Select value={type} label="Type" onChange={handleTypeChange}>
            <MenuItem value="flow">FLOW</MenuItem>
            <MenuItem value="json">JSON</MenuItem>
            <MenuItem value="graphql">GraphQL</MenuItem>
            <MenuItem value="yaml">YAML</MenuItem>
            <MenuItem value="openapi">OpenAPI</MenuItem>
          </Select>
        </FormControl>

        {/* Engine Selector */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Engine</InputLabel>
          <Select value={engine} label="Engine" onChange={handleEngineChange}>
            <MenuItem value="flowite">Flowite</MenuItem>
            <MenuItem value="graphite">Graphite</MenuItem>
          </Select>
        </FormControl>

        {/* Action Button */}
        {/* Icon Button */}
        <IconButton color="primary" onClick={handleLocate}>
          <FilterCenterFocusIcon />
        </IconButton>
      </Box>

      {/* Main content */}
      <div style={{ display: "flex", flex: 1, height: "100%", width: "100%" }}>
        {/* Right panel: JSON editor */}
        <div style={{ border: "1px solid #ccc", width: `${dividerX}%` }}>
          <Editor
            height="100%"
            language={type.toLowerCase() === "json" ? "json" : type.toLowerCase() === "yaml" ? "yaml" : "yaml"}
            value={data}
            onChange={handleEditorChange}
            onMount={handleEditorMount}
            theme={prefersDarkMode ? "vs-dark" : "light"}
            options={{
              scrollbar: {
                vertical: "auto",
                horizontal: "auto",
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
                arrowSize: 12,
              },
              minimap: {
                enabled: false,
              }
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
            <Flowite ref={flowiteRef} data={graphJson} onNodeClick={(id: string) => {
              console.log("DataO: onNodeClick:", id);
            }} />
          ) : (
            <Graphite ref={graphiteRef} data={graphJson} onHighlightTable={(id: string) => {
              // console.log("DataO: Highlight table:", id);
            }} />
          )}
        </div>
      </div>
    </div>
  );
}

