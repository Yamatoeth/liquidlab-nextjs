export interface CategoryGroup {
  group: string;
  categories: string[];
}

export const categoryGroups: CategoryGroup[] = [
  {
    group: '3D Animations',
    categories: [
      'Scroll Effects',
      'Hover FX',
      'Loading Screens',
      'Particle Systems',
      '3D Text',
      'Product Viewers',
      'Background FX',
      'Transitions',
      'UI Micro-animations',
    ],
  },
  {
    group: 'Liquid Snippets',
    categories: [
      'Header',
      'Product Page',
      'Cart',
      'Sections',
      'Animations',
      'Footer',
      'Utilities',
      'React',
      'TypeScript',
      'Backend',
      'UX',
      'Forms',
      'Performance',
      'Media',
      'Accessibility',
      'PWA',
    ],
  },
];
