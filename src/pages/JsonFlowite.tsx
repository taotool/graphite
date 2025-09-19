import React, { useEffect, useState, useRef } from "react";
import { Flowite } from "./Flowite";
import Editor from "@monaco-editor/react";
import { useMediaQuery } from "@mui/material";
import type { OnMount } from "@monaco-editor/react";
import {jsonToFieldGraph, toEntityGraph} from "./functions"

export interface JsonGraphiteProps {
  jsonString: string;
  options: Record<string, any>
}
export const JsonFlowite: React.FC<JsonGraphiteProps> = (props) => {

  console.log("--------- JsonFlowite render ");
  // const keys = [["seller_id"], ["item_id"], ["order_id", "orderId"], ["buyerId","buyer_id"]]
  const [rawJson, setRawJson] = useState(props.jsonString); // rawJson as state
  const [graphJson, setGraphJson] = useState(() =>
    JSON.stringify(toEntityGraph(jsonToFieldGraph(JSON.parse(props.jsonString), props.options.arr, props.options.keys)), null, 2)
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
      const updatedGraph = jsonToFieldGraph(parsed, props.options.arr, props.options.keys);
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

  //
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
        style={{
          width: "4px", cursor: "col-resize",
          borderStyle: "solid none",
          border: "1px solid #ccc",
          backgroundColor: "var(--border-color)"
        }}
      />
      {/* Left panel: Graph */}
      <div style={{ border: "1px solid #ccc", width: `${100 - dividerX}%` }}>
        <Flowite jsonstr={graphJson} />
      </div>
    </div>
  );
}

