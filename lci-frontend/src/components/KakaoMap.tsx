import { Map, MapMarker, MarkerClusterer, useKakaoLoader, CustomOverlayMap } from "react-kakao-maps-sdk"
import { useState, useEffect } from "react"
import { useLCIStore } from "../store/useLCIStore"

const KakaoMap = () => {
    const [level, setLevel] = useState(7);
    const [center, setCenter] = useState({ lat: 37.5665, lng: 126.9780 });
    const { results, allRegions } = useLCIStore();

    const [loading, error] = useKakaoLoader({
        appkey: import.meta.env.VITE_KAKAO_MAP_KEY,
        libraries: ["clusterer", "drawing", "services"],
    })

    // 시뮬레이션 결과가 업데이트되면 1순위 지역으로 자동 이동 및 '동' 레벨 확대
    useEffect(() => {
        if (results.length > 0) {
            setCenter({ lat: results[0].lat, lng: results[0].lng });
            setLevel(4); // '동' 단위 레벨 (레벨 4)
        }
    }, [results]);

    if (loading) return <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400 font-mono">LCI Map Loading...</div>;
    if (error) return <div className="w-full h-full flex items-center justify-center bg-slate-900 text-red-400 font-mono">Failed to load map: {error.message}</div>;

    // 결과가 있으면 결과를, 없으면 전체 지역 데이터를 표시
    const displayItems = results.length > 0 ? results : allRegions;

    return (
        <div className="w-full h-full relative">
            <Map
                center={center}
                style={{ width: "100%", height: "100%" }}
                level={level}
                onCenterChanged={(map) => setCenter({ lat: map.getCenter().getLat(), lng: map.getCenter().getLng() })}
                onZoomChanged={(map) => setLevel(map.getLevel())}
            >
                <MarkerClusterer
                    averageCenter={true}
                    minLevel={6}
                    gridSize={70}
                    onClusterclick={(_clusterer, cluster) => {
                        const map = (cluster as any).getMap()
                        // 클러스터 클릭 시 2단계씩 시원하게 확대 (동 레벨 접근성 향상)
                        const nextLevel = Math.max(map.getLevel() - 2, 1)
                        map.setLevel(nextLevel, { anchor: (cluster as any).getCenter() })
                    }}
                    styles={[
                        {
                            width: '40px',
                            height: '40px',
                            background: 'rgba(59, 130, 246, 0.85)',
                            borderRadius: '20px',
                            color: '#fff',
                            textAlign: 'center',
                            fontWeight: '800',
                            fontSize: '12px',
                            lineHeight: '40px',
                            border: '2px solid rgba(255, 255, 255, 0.4)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
                        },
                        {
                            width: '50px',
                            height: '50px',
                            background: 'rgba(37, 99, 235, 0.9)',
                            borderRadius: '25px',
                            color: '#fff',
                            textAlign: 'center',
                            fontWeight: '800',
                            fontSize: '14px',
                            lineHeight: '50px',
                            border: '3px solid rgba(255, 255, 255, 0.5)',
                            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.35)',
                        },
                        {
                            width: '64px',
                            height: '64px',
                            background: 'rgba(29, 78, 216, 0.95)',
                            borderRadius: '32px',
                            color: '#fff',
                            textAlign: 'center',
                            fontWeight: '900',
                            fontSize: '16px',
                            lineHeight: '64px',
                            border: '4px solid rgba(255, 255, 255, 0.6)',
                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                        }
                    ]}
                >
                    {displayItems.map((item, idx) => {
                        const isResult = 'estimatedSavings' in item;
                        return (
                            <MapMarker
                                key={`${item.name || (item as any).regionName}-${idx}`}
                                position={{ lat: item.lat, lng: item.lng }}
                                onClick={() => {
                                    // 마커 클릭 시 해당 위치로 이동 및 '동' 레벨 확대
                                    setCenter({ lat: item.lat, lng: item.lng });
                                    setLevel(4);
                                }}
                                image={isResult ? {
                                    src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
                                    size: { width: 24, height: 35 }
                                } : {
                                    src: "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
                                    size: { width: 14, height: 14 }
                                }}
                            >
                                {isResult && (
                                    <CustomOverlayMap
                                        position={{ lat: item.lat, lng: item.lng }}
                                        yAnchor={2.2}
                                    >
                                        <div className="px-3 py-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-full shadow-2xl flex flex-col items-center">
                                            <span className="text-[10px] font-bold text-white whitespace-nowrap">{(item as any).regionName}</span>
                                            <span className="text-[9px] font-black text-blue-400">{(Number((item as any).estimatedSavings) / 10000).toLocaleString()}만</span>
                                        </div>
                                    </CustomOverlayMap>
                                )}
                            </MapMarker>
                        );
                    })}
                </MarkerClusterer>
            </Map>
        </div>
    )
}



export default KakaoMap
