import type { ParamDescriptor } from "@/types/animation3d";

export type ParamType = ParamDescriptor["type"];
export type ParamSchemaEntry = ParamDescriptor;
export type ParamsSchema = ParamSchemaEntry[];
export type Params = Record<string, string | number | boolean>;
