declare module "swagger-client" {
  interface SwaggerClientOptions {
    url?: string;
    spec?: object;
    requestInterceptor?: (req: any) => any;
    responseInterceptor?: (res: any) => any;
  }

  interface SwaggerClientResponse {
    spec: any; // dereferenced OpenAPI spec
    apis: Record<string, any>;
    execute: (options: any) => Promise<any>;
  }

  export default function SwaggerClient(
    options: SwaggerClientOptions | { url: string } | { spec: object }
  ): Promise<SwaggerClientResponse>;
}
