export type BirthPlaceCoordinates = {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  timezone: string;
  aliases: string[];
};

const chinaCities: BirthPlaceCoordinates[] = [
  { id: "beijing", label: "北京市", latitude: 39.9042, longitude: 116.4074, timezone: "Asia/Shanghai", aliases: ["北京", "北京市"] },
  { id: "shanghai", label: "上海市", latitude: 31.2304, longitude: 121.4737, timezone: "Asia/Shanghai", aliases: ["上海", "上海市"] },
  { id: "guangzhou", label: "广东省广州市", latitude: 23.1291, longitude: 113.2644, timezone: "Asia/Shanghai", aliases: ["广州", "广州市", "广东广州", "广东省广州市"] },
  { id: "shenzhen", label: "广东省深圳市", latitude: 22.5431, longitude: 114.0579, timezone: "Asia/Shanghai", aliases: ["深圳", "深圳市", "广东深圳", "广东省深圳市"] },
  { id: "hangzhou", label: "浙江省杭州市", latitude: 30.2741, longitude: 120.1551, timezone: "Asia/Shanghai", aliases: ["杭州", "杭州市", "浙江杭州", "浙江省杭州市"] },
  { id: "chengdu", label: "四川省成都市", latitude: 30.5728, longitude: 104.0668, timezone: "Asia/Shanghai", aliases: ["成都", "成都市", "四川成都", "四川省成都市"] },
  { id: "chongqing", label: "重庆市", latitude: 29.563, longitude: 106.5516, timezone: "Asia/Shanghai", aliases: ["重庆", "重庆市"] },
  { id: "wuhan", label: "湖北省武汉市", latitude: 30.5928, longitude: 114.3055, timezone: "Asia/Shanghai", aliases: ["武汉", "武汉市", "湖北武汉", "湖北省武汉市"] },
  { id: "xian", label: "陕西省西安市", latitude: 34.3416, longitude: 108.9398, timezone: "Asia/Shanghai", aliases: ["西安", "西安市", "陕西西安", "陕西省西安市"] },
  { id: "nanjing", label: "江苏省南京市", latitude: 32.0603, longitude: 118.7969, timezone: "Asia/Shanghai", aliases: ["南京", "南京市", "江苏南京", "江苏省南京市"] },
  { id: "tianjin", label: "天津市", latitude: 39.0842, longitude: 117.2009, timezone: "Asia/Shanghai", aliases: ["天津", "天津市"] },
  { id: "suzhou", label: "江苏省苏州市", latitude: 31.2989, longitude: 120.5853, timezone: "Asia/Shanghai", aliases: ["苏州", "苏州市", "江苏苏州", "江苏省苏州市"] },
  { id: "changsha", label: "湖南省长沙市", latitude: 28.2282, longitude: 112.9388, timezone: "Asia/Shanghai", aliases: ["长沙", "长沙市", "湖南长沙", "湖南省长沙市"] },
  { id: "zhengzhou", label: "河南省郑州市", latitude: 34.7466, longitude: 113.6254, timezone: "Asia/Shanghai", aliases: ["郑州", "郑州市", "河南郑州", "河南省郑州市"] },
  { id: "qingdao", label: "山东省青岛市", latitude: 36.0671, longitude: 120.3826, timezone: "Asia/Shanghai", aliases: ["青岛", "青岛市", "山东青岛", "山东省青岛市"] },
  { id: "xiamen", label: "福建省厦门市", latitude: 24.4798, longitude: 118.0894, timezone: "Asia/Shanghai", aliases: ["厦门", "厦门市", "福建厦门", "福建省厦门市"] },
  { id: "fuzhou", label: "福建省福州市", latitude: 26.0745, longitude: 119.2965, timezone: "Asia/Shanghai", aliases: ["福州", "福州市", "福建福州", "福建省福州市"] },
  { id: "kunming", label: "云南省昆明市", latitude: 25.0389, longitude: 102.7183, timezone: "Asia/Shanghai", aliases: ["昆明", "昆明市", "云南昆明", "云南省昆明市"] },
  { id: "shenyang", label: "辽宁省沈阳市", latitude: 41.8057, longitude: 123.4315, timezone: "Asia/Shanghai", aliases: ["沈阳", "沈阳市", "辽宁沈阳", "辽宁省沈阳市"] },
  { id: "dalian", label: "辽宁省大连市", latitude: 38.914, longitude: 121.6147, timezone: "Asia/Shanghai", aliases: ["大连", "大连市", "辽宁大连", "辽宁省大连市"] },
  { id: "harbin", label: "黑龙江省哈尔滨市", latitude: 45.8038, longitude: 126.534, timezone: "Asia/Shanghai", aliases: ["哈尔滨", "哈尔滨市", "黑龙江哈尔滨", "黑龙江省哈尔滨市"] },
  { id: "changchun", label: "吉林省长春市", latitude: 43.8171, longitude: 125.3235, timezone: "Asia/Shanghai", aliases: ["长春", "长春市", "吉林长春", "吉林省长春市"] },
  { id: "jinan", label: "山东省济南市", latitude: 36.6512, longitude: 117.1201, timezone: "Asia/Shanghai", aliases: ["济南", "济南市", "山东济南", "山东省济南市"] },
  { id: "hefei", label: "安徽省合肥市", latitude: 31.8206, longitude: 117.2272, timezone: "Asia/Shanghai", aliases: ["合肥", "合肥市", "安徽合肥", "安徽省合肥市"] },
  { id: "nanchang", label: "江西省南昌市", latitude: 28.682, longitude: 115.8579, timezone: "Asia/Shanghai", aliases: ["南昌", "南昌市", "江西南昌", "江西省南昌市"] },
  { id: "nanning", label: "广西壮族自治区南宁市", latitude: 22.817, longitude: 108.3665, timezone: "Asia/Shanghai", aliases: ["南宁", "南宁市", "广西南宁", "广西壮族自治区南宁市"] },
  { id: "haikou", label: "海南省海口市", latitude: 20.044, longitude: 110.1999, timezone: "Asia/Shanghai", aliases: ["海口", "海口市", "海南海口", "海南省海口市"] },
  { id: "guiyang", label: "贵州省贵阳市", latitude: 26.647, longitude: 106.6302, timezone: "Asia/Shanghai", aliases: ["贵阳", "贵阳市", "贵州贵阳", "贵州省贵阳市"] },
  { id: "taiyuan", label: "山西省太原市", latitude: 37.8706, longitude: 112.5489, timezone: "Asia/Shanghai", aliases: ["太原", "太原市", "山西太原", "山西省太原市"] },
  { id: "shijiazhuang", label: "河北省石家庄市", latitude: 38.0428, longitude: 114.5149, timezone: "Asia/Shanghai", aliases: ["石家庄", "石家庄市", "河北石家庄", "河北省石家庄市"] },
  { id: "urumqi", label: "新疆维吾尔自治区乌鲁木齐市", latitude: 43.8256, longitude: 87.6168, timezone: "Asia/Shanghai", aliases: ["乌鲁木齐", "乌鲁木齐市", "新疆乌鲁木齐", "新疆维吾尔自治区乌鲁木齐市"] },
  { id: "lhasa", label: "西藏自治区拉萨市", latitude: 29.652, longitude: 91.1721, timezone: "Asia/Shanghai", aliases: ["拉萨", "拉萨市", "西藏拉萨", "西藏自治区拉萨市"] },
  { id: "hohhot", label: "内蒙古自治区呼和浩特市", latitude: 40.8426, longitude: 111.7492, timezone: "Asia/Shanghai", aliases: ["呼和浩特", "呼和浩特市", "内蒙古呼和浩特", "内蒙古自治区呼和浩特市"] },
  { id: "yinchuan", label: "宁夏回族自治区银川市", latitude: 38.4872, longitude: 106.2309, timezone: "Asia/Shanghai", aliases: ["银川", "银川市", "宁夏银川", "宁夏回族自治区银川市"] },
  { id: "lanzhou", label: "甘肃省兰州市", latitude: 36.0611, longitude: 103.8343, timezone: "Asia/Shanghai", aliases: ["兰州", "兰州市", "甘肃兰州", "甘肃省兰州市"] },
  { id: "xining", label: "青海省西宁市", latitude: 36.6171, longitude: 101.7782, timezone: "Asia/Shanghai", aliases: ["西宁", "西宁市", "青海西宁", "青海省西宁市"] },
  { id: "hong-kong", label: "香港特别行政区", latitude: 22.3193, longitude: 114.1694, timezone: "Asia/Hong_Kong", aliases: ["香港", "香港特别行政区"] },
  { id: "macau", label: "澳门特别行政区", latitude: 22.1987, longitude: 113.5439, timezone: "Asia/Macau", aliases: ["澳门", "澳门特别行政区"] },
  { id: "taipei", label: "台湾省台北市", latitude: 25.033, longitude: 121.5654, timezone: "Asia/Taipei", aliases: ["台北", "台北市", "台湾台北", "台湾省台北市"] },
];

export const birthPlaceOptions = chinaCities.map(({ label }) => label);

export function resolveBirthPlace(value: string): BirthPlaceCoordinates | null {
  const normalized = value.replace(/\s+/g, "").trim();
  if (!normalized) return null;
  return chinaCities.find((city) => city.aliases.some((alias) => normalized === alias || normalized.includes(alias))) ?? null;
}

export const chinaTimezoneAnchor = chinaCities.find((city) => city.id === "shanghai")!;
