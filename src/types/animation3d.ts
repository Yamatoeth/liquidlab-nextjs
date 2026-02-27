export interface ParamDescriptor {
  key: string;
  type: "number" | "color" | "boolean" | "select" | "text";
  label: string;
  default: number | string | boolean;
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
}

export interface Animation {
  id: string;
  slug: string;
  title: string;
  description?: string;
  shortDescription?: string;

  renderer: "threejs" | "gsap" | "css" | "webgl" | "custom";
  previewType: "iframe" | "video" | "gif";
  previewSrc?: string;
  htmlFile?: string;

  animationTypeId?: string;
  tags: string[];
  performanceTier?: "lightweight" | "moderate" | "heavy";
  colorPalette: string[];
  compatibleBackgrounds: Array<"dark" | "light" | "transparent">;

  dependencies: string[];
  paramsSchema: ParamDescriptor[];
  durationMs?: number;

  price: number;
  isFree: boolean;
  features: string[];

  previewImageUrl?: string;
  previewVideoUrl?: string;
  screenshots: string[];

  isPublished: boolean;
  isFeatured: boolean;
  sortOrder: number;

  createdAt: string;
  updatedAt: string;
}

export type Animation3D = Animation;
