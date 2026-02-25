export interface Animation3D {
  id: string;
  title: string;
  description: string;
  renderer: 'threejs' | 'gsap' | 'css' | 'webgl' | 'custom';
  previewType: 'iframe' | 'video' | 'gif';
  previewSrc: string; // URL vers la preview (iframe src, video, gif)
  htmlFile: string;   // Chemin vers le fichier HTML dans /public/animations/
  tags: string[];
  dependencies: string[]; // ['three', 'gsap', ...]
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  performanceScore: number; // 1-5
  price: number;
  features: string[];
  images?: string[];
}
