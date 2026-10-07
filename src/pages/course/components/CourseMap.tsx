import { CustomOverlayMap, Map, useKakaoLoader } from "react-kakao-maps-sdk";
import MapMarker from "./MapMarker";

export interface MapPoint {
  lat: number;
  lng: number;
}

export default function CourseMap({ points }: { points: MapPoint[] }) {
  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_API,
  });

  if (loading) {
    return <div className="flex h-full items-center justify-center">지도 로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-gray-70">
        지도를 불러오지 못했어요.
      </div>
    );
  }

  return (
    <Map
      center={points[0] ?? { lat: 37.5665, lng: 126.978 }}
      level={6}
      style={{ width: "100%", height: "100%" }}
    >
      {points.map((point, index) => (
        <CustomOverlayMap
          key={`${point.lat}-${point.lng}-${index}`}
          position={point}
          yAnchor={1}
        >
          <MapMarker number={index + 1} />
        </CustomOverlayMap>
      ))}
    </Map>
  );
}
