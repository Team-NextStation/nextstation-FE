import type { SubwayLineInfo } from "@/types/subway";
import type { StatusChipVariant } from "../components/StatusChip";

export const PLACE_HASHTAGS = [
  "자연과함께",
  "골목여행",
  "시장구경",
  "핫플레이스",
  "사진찍기좋은",
  "쇼핑",
  "체험",
  "가성비",
  "실내위주",
] as const;

export type PlaceHashtag = (typeof PLACE_HASHTAGS)[number];

export const CATEGORY_LABELS: Record<string, string> = {
  CULTURE: "문화공간",
  CAFE: "카페",
  FOOD: "식당",
  WALK: "산책포인트",
};

export interface PlaceCoordinate {
  x: string;
  y: string;
}

export interface MockPlace {
  id: string;
  name: string;
  station: string;
  line: SubwayLineInfo;
  imageUrl?: string | null;
  images: string[];
  address: string;
  coordinate: PlaceCoordinate;
  link: string;
  category: string;
  tags: PlaceHashtag[];
  description: string;
  status: StatusChipVariant;
  reason?: string;
}

const MOCK_IMAGE1 =
  "https://i.pinimg.com/474x/70/09/6b/70096b3734a656d7fc4dfe64e072c49b.jpg";
const MOCK_IMAGE2 =
  "https://d3mcojo3jv0dbr.cloudfront.net/2024/09/16/22/16/ab31a03112554208033909439.png";

const MOCK_GALLERY = [
  MOCK_IMAGE2,
  MOCK_IMAGE2,
  MOCK_IMAGE2,
  MOCK_IMAGE2,
  MOCK_IMAGE2,
  MOCK_IMAGE2,
  MOCK_IMAGE2,
  MOCK_IMAGE2,
  MOCK_IMAGE2,
  MOCK_IMAGE2,
  MOCK_IMAGE2,
  MOCK_IMAGE2,
];

export const mockPlaces: MockPlace[] = [
  {
    id: "1",
    name: "신림 버섯카페",
    station: "신림역",
    line: { id: 2, name: "2호선", code: "LINE_2" },
    imageUrl: null,
    images: MOCK_GALLERY,
    address: "서울특별시 관악구 신림로 123",
    coordinate: { x: "126.9298", y: "37.4844" },
    link: "http://sillim-mushroom-cafe.com",
    category: "CAFE",
    tags: ["사진찍기좋은", "실내위주"],
    description: "버섯 인형이 반겨주는 아기자기한 감성 카페",
    status: "APPROVED",
  },
  {
    id: "2",
    name: "제기동 벽화거리",
    station: "제기동역",
    line: { id: 1, name: "1호선", code: "LINE_1" },
    imageUrl: MOCK_IMAGE1,
    images: MOCK_GALLERY,
    address: "서울특별시 동대문구 제기로 45",
    coordinate: { x: "127.0359", y: "37.5784" },
    link: "http://jegi-mural-street.com",
    category: "CULTURE",
    tags: ["골목여행", "사진찍기좋은"],
    description: "골목 곳곳에 그려진 벽화를 구경하며 걸을 수 있는 곳",
    status: "PENDING",
  },
  {
    id: "3",
    name: "문래 철공소 맛집",
    station: "문래역",
    line: { id: 2, name: "2호선", code: "LINE_2" },
    imageUrl: MOCK_IMAGE1,
    images: MOCK_GALLERY,
    address: "서울특별시 영등포구 문래로 67",
    coordinate: { x: "126.8955", y: "37.5178" },
    link: "http://munrae-ironworks-restaurant.com",
    category: "FOOD",
    tags: ["가성비", "핫플레이스"],
    description: "철공소 골목 안에 숨어 있는 노포 감성 맛집",
    status: "APPROVED",
  },
  {
    id: "4",
    name: "외대앞 산책로",
    station: "외대앞역",
    line: { id: 1, name: "1호선", code: "LINE_1" },
    imageUrl: MOCK_IMAGE1,
    images: MOCK_GALLERY,
    address: "서울특별시 동대문구 이문로 89",
    coordinate: { x: "127.0587", y: "37.5966" },
    link: "http://oedaeap-walking-trail.com",
    category: "WALK",
    tags: ["자연과함께", "핫플레이스"],
    description: "학교 담벼락을 따라 걷기 좋은 조용한 산책로",
    status: "PENDING",
  },
  {
    id: "5",
    name: "독립문 옥상카페",
    station: "독립문역",
    line: { id: 3, name: "3호선", code: "LINE_3" },
    imageUrl: MOCK_IMAGE1,
    images: MOCK_GALLERY,
    address: "서울특별시 서대문구 통일로 12",
    coordinate: { x: "126.9598", y: "37.5729" },
    link: "http://dokrimmun-rooftop-cafe.com",
    category: "CAFE",
    tags: ["핫플레이스", "사진찍기좋은"],
    description: "정보 확인이 필요해 반려된 옥상 뷰 카페",
    status: "REJECTED",
    reason: "영업시간 정보가 실제와 달라 확인 후 다시 등록해주세요.",
  },
  {
    id: "6",
    name: "마장 축산시장 곱창집",
    station: "마장역",
    line: { id: 5, name: "5호선", code: "LINE_5" },
    imageUrl: MOCK_IMAGE1,
    images: MOCK_GALLERY,
    address: "서울특별시 성동구 마장로 33",
    coordinate: { x: "127.0432", y: "37.5665" },
    link: "http://majang-gopchang.com",
    category: "FOOD",
    tags: ["시장구경", "가성비"],
    description: "주소 확인이 안 돼 반려된 곱창 맛집",
    status: "REJECTED",
    reason:
      "입력하신 주소로 위치를 찾을 수 없어요. 정확한 주소로 다시 등록해주세요.",
  },
  {
    id: "7",
    name: "수유 폐쇄 공방",
    station: "수유역",
    line: { id: 4, name: "4호선", code: "LINE_4" },
    imageUrl: MOCK_IMAGE1,
    images: MOCK_GALLERY,
    address: "서울특별시 강북구 수유로 21",
    coordinate: { x: "127.0257", y: "37.6376" },
    link: "http://suyu-craft-studio.com",
    category: "CULTURE",
    tags: ["체험", "실내위주"],
    description: "폐업으로 삭제된 공방 체험 공간",
    status: "DELETED",
    reason: "업체 폐업이 확인되어 목록에서 삭제되었습니다.",
  },
  {
    id: "8",
    name: "고려대 앞 헌책방",
    station: "고려대역",
    line: { id: 6, name: "6호선", code: "LINE_6" },
    imageUrl: MOCK_IMAGE1,
    images: MOCK_GALLERY,
    address: "서울특별시 성북구 고려대로 5",
    coordinate: { x: "127.0292", y: "37.5905" },
    link: "http://korea-univ-used-bookstore.com",
    category: "CULTURE",
    tags: ["쇼핑", "가성비"],
    description: "폐업으로 삭제된 오래된 헌책방",
    status: "DELETED",
    reason: "중복 등록된 장소로 확인되어 삭제되었습니다.",
  },
];
