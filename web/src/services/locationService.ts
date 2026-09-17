export interface Province {
  code: number;
  name: string;
}

export interface District {
  code: number;
  name: string;
  province_code: number;
}

export interface Ward {
  code: number;
  name: string;
  district_code: number;
}

const API_BASE = 'https://provinces.open-api.vn/api';

// Simple in-memory cache to prevent re-fetching
const districtCache = new Map<number, District[]>();
const wardCache = new Map<number, Ward[]>();

export const locationService = {
  // Fetch all 63 Provinces / Cities in Vietnam
  getProvinces: async (): Promise<Province[]> => {
    try {
      const res = await fetch(`${API_BASE}/p/`);
      if (!res.ok) throw new Error('Failed to fetch provinces');
      const data: Province[] = await res.json();
      return data;
    } catch (err) {
      console.warn('Falling back to default provinces list:', err);
      return [
        { code: 1, name: 'Thành phố Hà Nội' },
        { code: 79, name: 'Thành phố Hồ Chí Minh' },
        { code: 48, name: 'Thành phố Đà Nẵng' },
        { code: 31, name: 'Thành phố Hải Phòng' },
        { code: 92, name: 'Thành phố Cần Thơ' },
        { code: 74, name: 'Tỉnh Bình Dương' },
        { code: 75, name: 'Tỉnh Đồng Nai' },
        { code: 77, name: 'Tỉnh Bà Rịa - Vũng Tàu' },
        { code: 27, name: 'Tỉnh Bắc Ninh' },
        { code: 22, name: 'Tỉnh Quảng Ninh' },
        { code: 46, name: 'Tỉnh Thừa Thiên Huế' },
        { code: 56, name: 'Tỉnh Khánh Hòa' },
        { code: 68, name: 'Tỉnh Lâm Đồng' },
        { code: 80, name: 'Tỉnh Long An' },
        { code: 82, name: 'Tỉnh Tiền Giang' },
        { code: 86, name: 'Tỉnh Vĩnh Long' },
        { code: 89, name: 'Tỉnh An Giang' },
        { code: 91, name: 'Tỉnh Kiên Giang' },
      ];
    }
  },

  // Fetch all Districts for a specific Province code
  getDistricts: async (provinceCode: number): Promise<District[]> => {
    if (!provinceCode) return [];
    if (districtCache.has(provinceCode)) {
      return districtCache.get(provinceCode)!;
    }

    try {
      const res = await fetch(`${API_BASE}/p/${provinceCode}?depth=2`);
      if (!res.ok) throw new Error('Failed to fetch districts');
      const data = await res.json();
      const districts: District[] = data.districts || [];
      districtCache.set(provinceCode, districts);
      return districts;
    } catch (err) {
      console.warn(`Failed to fetch districts for province ${provinceCode}:`, err);
      return [];
    }
  },

  // Fetch all Wards for a specific District code
  getWards: async (districtCode: number): Promise<Ward[]> => {
    if (!districtCode) return [];
    if (wardCache.has(districtCode)) {
      return wardCache.get(districtCode)!;
    }

    try {
      const res = await fetch(`${API_BASE}/d/${districtCode}?depth=2`);
      if (!res.ok) throw new Error('Failed to fetch wards');
      const data = await res.json();
      const wards: Ward[] = data.wards || [];
      wardCache.set(districtCode, wards);
      return wards;
    } catch (err) {
      console.warn(`Failed to fetch wards for district ${districtCode}:`, err);
      return [];
    }
  },
};
