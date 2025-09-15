import React, { useMemo } from "react";

import "reactflow/dist/style.css";
import yaml from "js-yaml";
import { Graphite } from "./Graphite";

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
interface OpenApiGraphiteProps {
  yamls: string[]; // list of YAML strings
}

const OpenApiGraphite: React.FC<OpenApiGraphiteProps> = ({ yamls }) => {
  
  function openApiToGraph(openApiYaml: string): Graph {
    const doc: any = yaml.load(openApiYaml);

    const nodes: GraphNode[] = [];
    const edges: GraphEdge[] = [];

    // Track unique IDs
    const seenNodes = new Set<string>();

    // --- Add schemas as nodes ---
    if (doc.components?.schemas) {
      for (const [schemaName, schemaDef] of Object.entries<any>(doc.components.schemas)) {
        const nodeId = `schema:${schemaName}`;
        if (!seenNodes.has(nodeId)) {
          nodes.push({
            id: nodeId,
            name: schemaName,
            type: "schema",
            value: JSON.stringify(schemaDef, null, 2),
          });
          seenNodes.add(nodeId);
        }
      }
    }

    // --- Add paths as nodes & edges ---
    if (doc.paths) {
      for (const [path, methods] of Object.entries<any>(doc.paths)) {
        const pathNodeId = `path:${path}`;
        if (!seenNodes.has(pathNodeId)) {
          nodes.push({
            id: pathNodeId,
            name: path,
            type: "path",
            value: JSON.stringify(methods, null, 2),
          });
          seenNodes.add(pathNodeId);
        }

        for (const [method, op] of Object.entries<any>(methods)) {
          const methodNodeId = `method:${method.toUpperCase()} ${path}`;
          if (!seenNodes.has(methodNodeId)) {
            nodes.push({
              id: methodNodeId,
              name: `${method.toUpperCase()} ${path}`,
              type: "method",
              value: op.summary || "",
            });
            seenNodes.add(methodNodeId);
          }

          // Edge: path -> method
          edges.push({
            source: pathNodeId,
            target: methodNodeId,
            label: "has",
          });

          // Look for $ref in responses
          if (op.responses) {
            for (const [status, resp] of Object.entries<any>(op.responses)) {
              const schemaRef = resp?.content?.["application/json"]?.schema?.["$ref"];
              if (schemaRef) {
                const schemaName = schemaRef.split("/").pop();
                if (schemaName) {
                  edges.push({
                    source: methodNodeId,
                    target: `schema:${schemaName}`,
                    label: `response ${status}`,
                  });
                }
              }
            }
          }
        }
      }
    }

    return {
      type: "openapi-graph",
      direction: "vertical",
      graph: { rankdir: "TB", title: doc.info?.title || "OpenAPI Graph" },
      node: { shape: "box" },
      metadata: { showDetails: true },
      nodes,
      edges,
    };
  }
  // Merge multiple YAML strings into a single object
 
   // Merge multiple YAML strings into a single object
   const mergedSpec = useMemo(() => {
     const docs = yamls.map((y) => yaml.load(y) as Record<string, any>);
     const merged: Record<string, any> = { paths: {}, components: { schemas: {} } };
 
     for (const doc of docs) {
       if (doc.paths) {
         Object.assign(merged.paths, doc.paths);
       }
       if (doc.components?.schemas) {
         Object.assign(merged.components.schemas, doc.components.schemas);
       }
       if (!merged.info && doc.info) {
         merged.info = doc.info;
       }
       if (!merged.openapi && doc.openapi) {
         merged.openapi = doc.openapi;
       }
     }
 
     return merged;
   }, [yamls]);
  // Convert merged spec to GraphData
  const graphData: Graph = useMemo(() => {
    const yamlString = yaml.dump(mergedSpec);
    return openApiToGraph(yamlString);
  }, [mergedSpec]);

  const graphJson = JSON.stringify(graphData);
  console.log(graphJson)
  return (
    <div style={{ width: "100%", height: "600px" }}>
      <Graphite jsonString={graphJson} />
    </div>
  );
};

export default OpenApiGraphite;
