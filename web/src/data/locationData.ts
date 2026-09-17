export interface Ward {
  code: string;
  name: string;
}

export interface District {
  code: string;
  name: string;
  wards: Ward[];
}

export interface Province {
  code: string;
  name: string;
  districts: District[];
}

export const VIETNAM_LOCATIONS: Province[] = [
  {
    code: '01',
    name: 'TP. Hồ Chí Minh',
    districts: [
      {
        code: '760',
        name: 'Quận 1',
        wards: [
          { code: '26734', name: 'Phường Bến Nghé' },
          { code: '26737', name: 'Phường Bến Thành' },
          { code: '26740', name: 'Phường Cầu Kho' },
          { code: '26743', name: 'Phường Cầu Ông Lãnh' },
          { code: '26746', name: 'Phường Cô Giang' },
          { code: '26749', name: 'Phường Đa Kao' },
          { code: '26752', name: 'Phường Nguyễn Cư Trinh' },
          { code: '26755', name: 'Phường Nguyễn Thái Bình' },
          { code: '26758', name: 'Phường Phạm Ngũ Lão' },
          { code: '26761', name: 'Phường Tân Định' },
        ],
      },
      {
        code: '761',
        name: 'Quận 3',
        wards: [
          { code: '26764', name: 'Phường 01' },
          { code: '26767', name: 'Phường 02' },
          { code: '26770', name: 'Phường 03' },
          { code: '26773', name: 'Phường 04' },
          { code: '26776', name: 'Phường 05' },
          { code: '26791', name: 'Phường Võ Thị Sáu' },
        ],
      },
      {
        code: '769',
        name: 'TP. Thủ Đức',
        wards: [
          { code: '26848', name: 'Phường An Khánh' },
          { code: '26851', name: 'Phường An Lợi Đông' },
          { code: '26854', name: 'Phường An Phú' },
          { code: '26857', name: 'Phường Bình Chiểu' },
          { code: '26860', name: 'Phường Bình Thọ' },
          { code: '26863', name: 'Phường Hiệp Bình Chánh' },
          { code: '26866', name: 'Phường Hiệp Bình Phước' },
          { code: '26869', name: 'Phường Linh Trung' },
          { code: '26872', name: 'Phường Thảo Điền' },
        ],
      },
      {
        code: '770',
        name: 'Quận Bình Thạnh',
        wards: [
          { code: '26875', name: 'Phường 01' },
          { code: '26878', name: 'Phường 02' },
          { code: '26881', name: 'Phường 03' },
          { code: '26884', name: 'Phường 11' },
          { code: '26887', name: 'Phường 12' },
          { code: '26890', name: 'Phường 25' },
        ],
      },
      {
        code: '771',
        name: 'Quận Tân Bình',
        wards: [
          { code: '26900', name: 'Phường 01' },
          { code: '26903', name: 'Phường 02' },
          { code: '26906', name: 'Phường 04' },
          { code: '26909', name: 'Phường 13' },
          { code: '26912', name: 'Phường 15' },
        ],
      },
      {
        code: '772',
        name: 'Quận 7',
        wards: [
          { code: '26915', name: 'Phường Tân Thuận Đông' },
          { code: '26918', name: 'Phường Tân Thuận Tây' },
          { code: '26921', name: 'Phường Tân Kiểng' },
          { code: '26924', name: 'Phường Tân Phong' },
          { code: '26927', name: 'Phường Phú Mỹ' },
        ],
      },
    ],
  },
  {
    code: '02',
    name: 'Hà Nội',
    districts: [
      {
        code: '001',
        name: 'Quận Ba Đình',
        wards: [
          { code: '00001', name: 'Phường Phúc Xá' },
          { code: '00004', name: 'Phường Trúc Bạch' },
          { code: '00006', name: 'Phường Vĩnh Phúc' },
          { code: '00007', name: 'Phường Cống Vị' },
          { code: '00008', name: 'Phường Liễu Giai' },
          { code: '00010', name: 'Phường Nguyễn Trung Trực' },
          { code: '00013', name: 'Phường Quán Thánh' },
          { code: '00016', name: 'Phường Ngọc Hà' },
          { code: '00019', name: 'Phường Điện Biên' },
          { code: '00022', name: 'Phường Đội Cấn' },
          { code: '00025', name: 'Phường Ngọc Khánh' },
          { code: '00028', name: 'Phường Kim Mã' },
          { code: '00031', name: 'Phường Giảng Võ' },
          { code: '00034', name: 'Phường Thành Công' },
        ],
      },
      {
        code: '002',
        name: 'Quận Hoàn Kiếm',
        wards: [
          { code: '00037', name: 'Phường Đồng Xuân' },
          { code: '00040', name: 'Phường Hàng Ma' },
          { code: '00043', name: 'Phường Hàng Buồm' },
          { code: '00046', name: 'Phường Hàng Đào' },
          { code: '00049', name: 'Phường Hàng Bồ' },
          { code: '00052', name: 'Phường Cửa Đông' },
          { code: '00055', name: 'Phường Lý Thái Tổ' },
          { code: '00058', name: 'Phường Hàng Bạc' },
          { code: '00061', name: 'Phường Hàng Gai' },
          { code: '00064', name: 'Phường Chương Dương' },
          { code: '00067', name: 'Phường Hàng Trống' },
          { code: '00070', name: 'Phường Cửa Nam' },
          { code: '00073', name: 'Phường Hàng Bông' },
          { code: '00076', name: 'Phường Tràng Tiền' },
          { code: '00079', name: 'Phường Trần Hưng Đạo' },
          { code: '00082', name: 'Phường Phan Chu Trinh' },
          { code: '00085', name: 'Phường Bạch Đằng' },
        ],
      },
      {
        code: '003',
        name: 'Quận Cầu Giấy',
        wards: [
          { code: '00157', name: 'Phường Nghĩa Đô' },
          { code: '00160', name: 'Phường Nghĩa Tân' },
          { code: '00163', name: 'Phường Mai Dịch' },
          { code: '00166', name: 'Phường Dịch Vọng' },
          { code: '00167', name: 'Phường Dịch Vọng Hậu' },
          { code: '00169', name: 'Phường Quan Hoa' },
          { code: '00172', name: 'Phường Yên Hoà' },
          { code: '00175', name: 'Phường Trung Hoà' },
        ],
      },
      {
        code: '004',
        name: 'Quận Đống Đa',
        wards: [
          { code: '00178', name: 'Phường Cát Linh' },
          { code: '00181', name: 'Phường Văn Miếu' },
          { code: '00184', name: 'Phường Quốc Tử Giám' },
          { code: '00187', name: 'Phường Láng Thượng' },
          { code: '00190', name: 'Phường Ô Chợ Dừa' },
          { code: '00193', name: 'Phường Văn Chương' },
          { code: '00196', name: 'Phường Hàng Bột' },
          { code: '00199', name: 'Phường Láng Hạ' },
          { code: '00202', name: 'Phường Khâm Thiên' },
        ],
      },
      {
        code: '005',
        name: 'Quận Hai Bà Trưng',
        wards: [
          { code: '00214', name: 'Phường Nguyễn Du' },
          { code: '00217', name: 'Phường Bạch Đằng' },
          { code: '00220', name: 'Phường Phạm Đình Hổ' },
          { code: '00223', name: 'Phường Bách Khoa' },
          { code: '00226', name: 'Phường Kim Liên' },
          { code: '00229', name: 'Phường Ô Cầu Dền' },
          { code: '00232', name: 'Phường Trương Định' },
          { code: '00235', name: 'Phường Minh Khai' },
        ],
      },
    ],
  },
  {
    code: '03',
    name: 'Đà Nẵng',
    districts: [
      {
        code: '490',
        name: 'Quận Hải Châu',
        wards: [
          { code: '20197', name: 'Phường Hải Châu I' },
          { code: '20200', name: 'Phường Hải Châu II' },
          { code: '20203', name: 'Phường Thạch Thang' },
          { code: '20206', name: 'Phường Thanh Bình' },
          { code: '20209', name: 'Phường Thuận Phước' },
          { code: '20212', name: 'Phường Hòa Thuận Đông' },
          { code: '20215', name: 'Phường Hòa Thuận Tây' },
        ],
      },
      {
        code: '491',
        name: 'Quận Thanh Khê',
        wards: [
          { code: '20227', name: 'Phường Tam Thuận' },
          { code: '20230', name: 'Phường Thanh Khê Tây' },
          { code: '20233', name: 'Phường Thanh Khê Đông' },
          { code: '20236', name: 'Phường Xuân Hà' },
          { code: '20239', name: 'Phường Tân Chính' },
          { code: '20242', name: 'Phường Chính Gián' },
        ],
      },
      {
        code: '492',
        name: 'Quận Sơn Trà',
        wards: [
          { code: '20248', name: 'Phường Thọ Quang' },
          { code: '20251', name: 'Phường Nại Hiên Đông' },
          { code: '20254', name: 'Phường Mân Thái' },
          { code: '20257', name: 'Phường Phước Mỹ' },
          { code: '20260', name: 'Phường An Hải Bắc' },
          { code: '20263', name: 'Phường An Hải Tây' },
        ],
      },
    ],
  },
  {
    code: '04',
    name: 'Bình Dương',
    districts: [
      {
        code: '718',
        name: 'TP. Thủ Dầu Một',
        wards: [
          { code: '25690', name: 'Phường Phú Cường' },
          { code: '25693', name: 'Phường Hiệp Thành' },
          { code: '25696', name: 'Phường Chánh Nghĩa' },
          { code: '25699', name: 'Phường Phú Hòa' },
          { code: '25702', name: 'Phường Phú Thọ' },
        ],
      },
      {
        code: '721',
        name: 'TP. Thuận An',
        wards: [
          { code: '25741', name: 'Phường Lái Thiêu' },
          { code: '25744', name: 'Phường An Thạnh' },
          { code: '25747', name: 'Phường Vĩnh Phú' },
          { code: '25750', name: 'Phường Thuận Giao' },
          { code: '25753', name: 'Phường An Phú' },
        ],
      },
      {
        code: '722',
        name: 'TP. Dĩ An',
        wards: [
          { code: '25762', name: 'Phường Dĩ An' },
          { code: '25765', name: 'Phường Tân Đông Hiệp' },
          { code: '25768', name: 'Phường Đông Hòa' },
          { code: '25771', name: 'Phường Bình An' },
          { code: '25774', name: 'Phường Bình Thắng' },
        ],
      },
    ],
  },
  {
    code: '05',
    name: 'Đồng Nai',
    districts: [
      {
        code: '731',
        name: 'TP. Biên Hòa',
        wards: [
          { code: '25870', name: 'Phường Trảng Dài' },
          { code: '25873', name: 'Phường Tân Phong' },
          { code: '25876', name: 'Phường Tân Hiệp' },
          { code: '25879', name: 'Phường Hố Nai' },
          { code: '25882', name: 'Phường Trung Dũng' },
          { code: '25885', name: 'Phường Quyết Thắng' },
        ],
      },
      {
        code: '734',
        name: 'Huyện Long Thành',
        wards: [
          { code: '25960', name: 'Thị trấn Long Thành' },
          { code: '25963', name: 'Xã An Phước' },
          { code: '25966', name: 'Xã Bình Sơn' },
          { code: '25969', name: 'Xã Cẩm Đường' },
          { code: '25972', name: 'Xã Lộc An' },
        ],
      },
    ],
  },
  {
    code: '06',
    name: 'Cần Thơ',
    districts: [
      {
        code: '916',
        name: 'Quận Ninh Kiều',
        wards: [
          { code: '31147', name: 'Phường An Hòa' },
          { code: '31150', name: 'Phường An Khánh' },
          { code: '31153', name: 'Phường An Nghiệp' },
          { code: '31156', name: 'Phường An Phú' },
          { code: '31159', name: 'Phường Cái Khế' },
          { code: '31162', name: 'Phường Tân An' },
        ],
      },
      {
        code: '917',
        name: 'Quận Bình Thủy',
        wards: [
          { code: '31174', name: 'Phường Bình Thủy' },
          { code: '31177', name: 'Phường Bùi Hữu Nghĩa' },
          { code: '31180', name: 'Phường Trà An' },
          { code: '31183', name: 'Phường Trà Nóc' },
        ],
      },
    ],
  },
  {
    code: '07',
    name: 'Hải Phòng',
    districts: [
      {
        code: '303',
        name: 'Quận Hồng Bàng',
        wards: [
          { code: '11542', name: 'Phường Quán Toan' },
          { code: '11545', name: 'Phường Hùng Vương' },
          { code: '11548', name: 'Phường Sở Dầu' },
          { code: '11551', name: 'Phường Thượng Lý' },
          { code: '11554', name: 'Phường Hoàng Văn Thụ' },
        ],
      },
      {
        code: '304',
        name: 'Quận Ngô Quyền',
        wards: [
          { code: '11569', name: 'Phường Máy Chai' },
          { code: '11572', name: 'Phường Máy Tơ' },
          { code: '11575', name: 'Phường Vạn Mỹ' },
          { code: '11578', name: 'Phường Cầu Tre' },
          { code: '11581', name: 'Phường Lạch Tray' },
        ],
      },
    ],
  },
];

export function getProvinces(): Province[] {
  return VIETNAM_LOCATIONS;
}

export function getDistricts(provinceName: string): District[] {
  const province = VIETNAM_LOCATIONS.find((p) => p.name === provinceName || p.code === provinceName);
  return province ? province.districts : [];
}

export function getWards(provinceName: string, districtName: string): Ward[] {
  const districts = getDistricts(provinceName);
  const district = districts.find((d) => d.name === districtName || d.code === districtName);
  return district ? district.wards : [];
}
