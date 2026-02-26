export type ParamType = "number" | "color" | "select" | "boolean";

export type ParamOption = {
  value: string | number | boolean;
  label: string;
};

export type ParamSchemaEntry = {
  key: string;
  type: ParamType;
  label?: string;
  default?: any;
  min?: number;
  max?: number;
  step?: number;
  options?: ParamOption[];
};

export type ParamsSchema = ParamSchemaEntry[];

export type Params = Record<string, any>;
