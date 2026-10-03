export interface CategoryThematicData {
  covers: [string, string];
  countText: string;
  blobBg: string;
  arrowBg: string;
  arrowColor: string;
}

const DEFAULT_PALETTES = [
  { blobBg: '#fee2e2', arrowBg: '#fecaca', arrowColor: '#dc2626' },
  { blobBg: '#e0f2fe', arrowBg: '#dbeafe', arrowColor: '#2563eb' },
  { blobBg: '#f3e8ff', arrowBg: '#e9d5ff', arrowColor: '#9333ea' },
  { blobBg: '#fef3c7', arrowBg: '#fed7aa', arrowColor: '#ea580c' },
  { blobBg: '#ecfdf5', arrowBg: '#d1fae5', arrowColor: '#059669' },
  { blobBg: '#fdf2f8', arrowBg: '#fce7f3', arrowColor: '#db2777' },
  { blobBg: '#e0e7ff', arrowBg: '#c7d2fe', arrowColor: '#4f46e5' },
  { blobBg: '#fff1f2', arrowBg: '#ffe4e6', arrowColor: '#e11d48' },
];

export const CATEGORY_THEMES: Record<string, CategoryThematicData> = {
  'van-hoc': {
    covers: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300',
      'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300',
    ],
    countText: '532 sản phẩm',
    blobBg: '#fffbeb',
    arrowBg: '#fef3c7',
    arrowColor: '#d97706',
  },
  'khoa-hoc': {
    covers: [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=300',
      'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=300',
    ],
    countText: '321 sản phẩm',
    blobBg: '#e0f2fe',
    arrowBg: '#dbeafe',
    arrowColor: '#2563eb',
  },
  'lich-su': {
    covers: [
      'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&q=80&w=300',
      'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=300',
    ],
    countText: '280 sản phẩm',
    blobBg: '#fef3c7',
    arrowBg: '#fed7aa',
    arrowColor: '#ea580c',
  },
  'tam-ly-hoc': {
    covers: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=300',
      'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=300',
    ],
    countText: '267 sản phẩm',
    blobBg: '#fdf2f8',
    arrowBg: '#fce7f3',
    arrowColor: '#db2777',
  },
  'nghe-thuat': {
    covers: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&q=80&w=300',
      'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=300',
    ],
    countText: '183 sản phẩm',
    blobBg: '#fff1f2',
    arrowBg: '#ffe4e6',
    arrowColor: '#e11d48',
  },
  'truyen-tranh': {
    covers: [
      'https://pub-54a4535e6b5a49edbde1f541e9b89389.r2.dev/uploads/2026/10/01/3da2b2f0-9f27-4eec-8571-c5741acfb5c5.webp',
      'https://pub-54a4535e6b5a49edbde1f541e9b89389.r2.dev/uploads/2026/09/12/4d9e57b5-204f-4ef8-afca-54f1cbdfb804.webp',
    ],
    countText: '1.024 sản phẩm',
    blobBg: '#fee2e2',
    arrowBg: '#fecaca',
    arrowColor: '#dc2626',
  },
  'dam-my': {
    covers: [
      'https://pub-54a4535e6b5a49edbde1f541e9b89389.r2.dev/uploads/2026/09/24/c80a120e-4cab-43cd-a30c-295a9ffc567a.webp',
      'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&q=80&w=300',
    ],
    countText: '318 sản phẩm',
    blobBg: '#fce7f3',
    arrowBg: '#fbcfe8',
    arrowColor: '#db2777',
  },
  'chuyen-sinh': {
    covers: [
      'https://pub-54a4535e6b5a49edbde1f541e9b89389.r2.dev/uploads/2026/10/02/2078b2e5-c5dc-4f7e-9df4-a8cb02989713.jpg',
      'https://pub-54a4535e6b5a49edbde1f541e9b89389.r2.dev/uploads/2026/10/02/9ffd8212-e04d-4188-9d41-ce1afd33c6e8.webp',
    ],
    countText: '298 sản phẩm',
    blobBg: '#f3e8ff',
    arrowBg: '#e9d5ff',
    arrowColor: '#9333ea',
  },
  'kinh-te': {
    covers: [
      'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&q=80&w=300',
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&q=80&w=300',
    ],
    countText: '246 sản phẩm',
    blobBg: '#ecfdf5',
    arrowBg: '#d1fae5',
    arrowColor: '#059669',
  },
  'cong-nghe': {
    covers: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=300',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=300',
    ],
    countText: '193 sản phẩm',
    blobBg: '#e0e7ff',
    arrowBg: '#c7d2fe',
    arrowColor: '#4f46e5',
  },
  'thieu-nhi': {
    covers: [
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=300',
      'https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&q=80&w=300',
    ],
    countText: '412 sản phẩm',
    blobBg: '#fef3c7',
    arrowBg: '#fde68a',
    arrowColor: '#d97706',
  },
  'giao-duc': {
    covers: [
      'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80&w=300',
      'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=300',
    ],
    countText: '221 sản phẩm',
    blobBg: '#f0fdf4',
    arrowBg: '#dcfce7',
    arrowColor: '#16a34a',
  },
  'suc-khoe': {
    covers: [
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&q=80&w=300',
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=300',
    ],
    countText: '176 sản phẩm',
    blobBg: '#f0fdf4',
    arrowBg: '#bbf7d0',
    arrowColor: '#15803d',
  },
  'tieu-thuyet': {
    covers: [
      'https://pub-54a4535e6b5a49edbde1f541e9b89389.r2.dev/uploads/2026/09/24/0bc8a5b4-4a5e-4829-9ae4-a2b212e9960e.jpg',
      'https://pub-54a4535e6b5a49edbde1f541e9b89389.r2.dev/uploads/2026/10/01/9467847d-a314-40bc-80b1-4b83437d1fd0.jpg',
    ],
    countText: '489 sản phẩm',
    blobBg: '#f5f3ff',
    arrowBg: '#ede9fe',
    arrowColor: '#7c3aed',
  },
  'hoc-duong': {
    covers: [
      'https://pub-54a4535e6b5a49edbde1f541e9b89389.r2.dev/uploads/2026/10/02/046e67af-3c58-4a18-8855-8122b916dea7.webp',
      'https://pub-54a4535e6b5a49edbde1f541e9b89389.r2.dev/uploads/2026/10/01/2b64e86e-fd92-426c-bdd9-aea7dbf0b68a.webp',
    ],
    countText: '304 sản phẩm',
    blobBg: '#ecfdf5',
    arrowBg: '#a7f3d0',
    arrowColor: '#047857',
  },
};

export function getCategoryTheme(slug?: string, id?: number): CategoryThematicData {
  if (slug && CATEGORY_THEMES[slug]) {
    return CATEGORY_THEMES[slug];
  }
  const idx = Math.abs(id ?? 0) % DEFAULT_PALETTES.length;
  const palette = DEFAULT_PALETTES[idx];
  return {
    covers: [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300',
      'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=300',
    ],
    countText: 'Khám phá ngay',
    ...palette,
  };
}
