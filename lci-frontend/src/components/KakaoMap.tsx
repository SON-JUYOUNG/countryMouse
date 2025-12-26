import { Map, MapMarker, MarkerClusterer, useKakaoLoader, CustomOverlayMap, Polygon } from "react-kakao-maps-sdk"
import { useState, useEffect, useMemo, memo, useRef, Fragment } from "react"
import { useLCIStore } from "../store/useLCIStore"

const INITIAL_CENTER = { lat: 37.5665, lng: 126.9780 };
const INITIAL_LEVEL = 7;

type HousingType = 'apt' | 'officetel' | 'villa' | 'oneroom' | 'tworoom';

// 가격 데이터 추출 헬퍼
const getPriceData = (item: any, housingType: HousingType, mode: 'rent' | 'jeonse') => {
    let rawValue = 0;

    if (mode === 'rent') {
        switch (housingType) {
            case 'apt': rawValue = item.aptAvgRent || item.avgRent; break;
            case 'officetel': rawValue = item.officetelAvgRent || item.avgRent; break;
            case 'villa': rawValue = item.villaAvgRent || item.avgRent; break;
            case 'oneroom': rawValue = item.oneRoomAvgRent || item.avgRent; break;
            case 'tworoom': rawValue = item.twoRoomAvgRent || item.oneRoomAvgRent || item.avgRent; break;
            default: rawValue = item.avgRent;
        }
        // 만원 단위 변환
        return Math.floor(rawValue / 10000);
    } else {
        switch (housingType) {
            case 'apt': rawValue = item.aptAvgJeonse || item.avgJeonse; break;
            case 'officetel': rawValue = item.officetelAvgJeonse || item.avgJeonse; break;
            case 'villa': rawValue = item.villaAvgJeonse || item.avgJeonse; break;
            case 'oneroom': rawValue = item.oneRoomAvgJeonse || item.avgJeonse; break;
            case 'tworoom': rawValue = item.twoRoomAvgJeonse || item.oneRoomAvgJeonse || item.avgJeonse; break;
            default: rawValue = item.avgJeonse;
        }
        // 만원 단위 변환
        return Math.floor(rawValue / 10000);
    }
};

const MarkerContent = memo(({ item, isResult, displayMode, housingType, onHover }: { item: any, isResult: boolean, displayMode: 'rent' | 'jeonse', housingType: HousingType, onHover: (name: string | null) => void }) => {
    const price = getPriceData(item, housingType, displayMode);
    const displayPrice = displayMode === 'rent'
        ? `${price.toLocaleString()}만/월`
        : price >= 10000
            ? `${Math.floor(price / 10000)}억 ${price % 10000 > 0 ? (price % 10000).toLocaleString() + '만' : ''}`
            : `${price.toLocaleString()}만`;

    const typeLabel = {
        apt: '아파트',
        officetel: '오피스텔',
        villa: '빌라/다세대',
        oneroom: '원룸',
        tworoom: '투룸+'
    }[housingType];

    const bgClass = isResult
        ? "bg-blue-600 border-blue-400 shadow-blue-500/30"
        : "bg-slate-900/95 border-slate-700/50 shadow-black/50 backdrop-blur-md";

    const textTheme = isResult ? "text-white" : "text-slate-200";
    const subTextTheme = isResult ? "text-blue-100" : "text-slate-400";
    const highlightText = isResult ? "text-white" : (displayMode === 'rent' ? 'text-blue-400' : 'text-emerald-400');

    return (
        <div
            className={`px-5 py-3 border rounded-full shadow-2xl flex flex-col items-center min-w-[110px] relative mb-2 animate-in fade-in zoom-in duration-200 group hover:scale-110 transition-transform cursor-pointer hover:z-50 ${bgClass}`}
            onMouseEnter={() => onHover(item.name?.replace(/\(전세\)|\(월세\)/g, '').trim() || item.name)}
            onMouseLeave={() => onHover(null)}
        >
            <div className="flex items-center gap-1.5 mb-1">
                <span className={`text-[11px] font-bold ${subTextTheme}`}>{typeLabel}</span>
                {isResult && <span className={`text-[11px] font-bold ${textTheme}`}>• {item.regionName}</span>}
            </div>

            <div className="flex flex-col items-center">
                <span className={`text-[14px] font-black tracking-tight ${highlightText}`}>{displayPrice}</span>
                {!isResult && <span className={`text-[10px] font-medium ${subTextTheme} mt-0.5 whitespace-nowrap`}>{item.name?.replace(/\(전세\)|\(월세\)/g, '') || item.name}</span>}
                {isResult && <span className={`text-[10px] font-medium text-white/90 mt-0.5`}>{(item as any).formattedSavings}</span>}
            </div>

            <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 border-r border-b ${isResult ? 'bg-blue-600 border-blue-400' : 'bg-slate-900 border-slate-700/50'}`} />
        </div>
    );
});

const CUSTOM_MARKER_NORMAL = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#0f172a" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
    </svg>
`);

const CUSTOM_MARKER_RESULT = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#2563eb;stop-opacity:1" />
                <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
            </linearGradient>
            <filter id="shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(37,99,235,0.5)"/>
            </filter>
        </defs>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="url(#grad1)" stroke="#ffffff" stroke-width="1.5" filter="url(#shadow)"/>
    </svg>
`);

const AreaMarker = memo(({ item, isResult, showOverlay, displayMode, housingType, onHover, hoveredRegion }: { item: any, isResult: boolean, showOverlay: boolean, displayMode: 'rent' | 'jeonse', housingType: HousingType, onHover: (name: string | null) => void, hoveredRegion: string | null }) => {
    // Check if this specific marker is the one being hovered
    const isHovered = hoveredRegion === (item.name?.replace(/\(전세\)|\(월세\)/g, '').trim() || item.name);

    return (
        <Fragment>
            <MapMarker
                position={{ lat: item.lat, lng: item.lng }}
                image={isResult ? {
                    src: CUSTOM_MARKER_RESULT,
                    size: { width: 50, height: 50 },
                    options: { offset: { x: 25, y: 25 } }
                } : {
                    src: CUSTOM_MARKER_NORMAL,
                    size: { width: 36, height: 36 },
                    options: { offset: { x: 18, y: 36 } }
                }}
                zIndex={isResult ? 50 : (isHovered ? 49 : 1)}
                onMouseOver={() => onHover(item.name?.replace(/\(전세\)|\(월세\)/g, '').trim() || item.name)}
                onMouseOut={() => onHover(null)}
            />
            {(showOverlay || isHovered) && (
                <CustomOverlayMap position={{ lat: item.lat, lng: item.lng }} yAnchor={isResult ? 1.3 : 1.5} zIndex={isResult ? 51 : 50}>
                    <div className="pointer-events-none">
                        <MarkerContent item={item} isResult={isResult} displayMode={displayMode} housingType={housingType} onHover={onHover} />
                    </div>
                </CustomOverlayMap>
            )}
        </Fragment>
    );
});

const KakaoMap = ({ isSidebarOpen }: { isSidebarOpen: boolean }) => {
    const mapRef = useRef<kakao.maps.Map | null>(null);
    const [level, setLevel] = useState(INITIAL_LEVEL);
    const [geoJsonData, setGeoJsonData] = useState<any>(null);
    const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);

    // Simple Hover Handler (Instant)
    const handleHover = (name: string | null) => {
        setHoveredRegion(name);
    };

    const { results, allRegions, displayMode, setDisplayMode, housingType, setHousingType } = useLCIStore();

    const [loading, error] = useKakaoLoader({
        appkey: import.meta.env.VITE_KAKAO_MAP_KEY,
        libraries: ["clusterer"],
    })

    useEffect(() => {
        fetch('/data/seoul_hangjeongdong.geojson')
            .then(res => res.json())
            .then(data => setGeoJsonData(data))
            .catch(err => console.error("Failed to load GeoJSON:", err));
    }, []);

    useEffect(() => {
        if (results.length > 0 && mapRef.current) {
            const first = results[0];
            mapRef.current.setCenter(new kakao.maps.LatLng(first.lat, first.lng));
            mapRef.current.setLevel(4);
        }
    }, [results]);

    useEffect(() => {
        if (mapRef.current) {
            const timer = setTimeout(() => { mapRef.current?.relayout(); }, 310);
            return () => clearTimeout(timer);
        }
    }, [isSidebarOpen]);

    // 필터링 없이 전체 데이터 전달 (성능 최적화: 클러스터러 위임)
    const visibleItems = useMemo(() => {
        return results.length > 0 ? results : allRegions;
    }, [results, allRegions]);

    // Active Polygon Path Logic
    const activePolygonPath = useMemo(() => {
        if (!hoveredRegion || !geoJsonData) return null;

        const targetDong = hoveredRegion.split(' ').pop() || '';

        // Find features that match
        const matchedFeatures = geoJsonData.features.filter((f: any) => {
            const fullAdmNm = f.properties.adm_nm || ""; // "서울특별시 노원구 상계1동"
            const admDong = fullAdmNm.split(' ').pop() || ""; // "상계1동"

            // Direct match
            if (admDong === targetDong) return true;

            // Remove numeric suffix for grouping match: "상계1동" -> "상계동"
            const normalizedAdm = admDong.replace(/제?\d+동$/, '동');
            if (normalizedAdm === targetDong) return true;

            return false;
        });

        // Use the first active match (or largest)
        const feature = matchedFeatures[0];

        if (!feature) return null;

        const geometry = feature.geometry;
        if (geometry.type === "Polygon") {
            return geometry.coordinates[0].map((coord: any) => ({ lng: coord[0], lat: coord[1] }));
        } else if (geometry.type === "MultiPolygon") {
            return geometry.coordinates[0][0].map((coord: any) => ({ lng: coord[0], lat: coord[1] }));
        }
        return null;
    }, [hoveredRegion, geoJsonData]);

    if (loading) return <div className="w-full h-full flex items-center justify-center bg-slate-900 text-slate-400 font-mono text-xs">Loading...</div>;
    if (error) return <div className="w-full h-full flex items-center justify-center bg-slate-900 text-red-500 font-mono text-xs text-center font-bold">MAP ENGINE ERROR</div>;

    const handleZoomChanged = (map: kakao.maps.Map) => {
        const newLevel = map.getLevel();
        if (level !== newLevel) setLevel(newLevel);
    };

    const housingFilters: { id: HousingType, label: string }[] = [
        { id: 'apt', label: '아파트' },
        { id: 'officetel', label: '오피스텔' },
        { id: 'villa', label: '빌라/다세대' },
        { id: 'oneroom', label: '원룸' },
        { id: 'tworoom', label: '투룸+' },
    ];

    return (
        <div className="w-full h-full relative">
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col gap-2 items-center">
                {/* 1. 전세/월세 토글 */}
                <div className="flex p-1 bg-slate-950/90 backdrop-blur-2xl border border-slate-700/50 rounded-2xl shadow-xl min-w-[220px]">
                    <button
                        onClick={() => setDisplayMode('rent')}
                        className={`flex-1 px-5 py-2 rounded-xl text-[11px] font-black transition-all duration-300 flex items-center justify-center gap-2 ${displayMode === 'rent' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${displayMode === 'rent' ? 'bg-white' : 'bg-blue-500'}`} />
                        월세
                    </button>
                    <button
                        onClick={() => setDisplayMode('jeonse')}
                        className={`flex-1 px-5 py-2 rounded-xl text-[11px] font-black transition-all duration-300 flex items-center justify-center gap-2 ${displayMode === 'jeonse' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${displayMode === 'jeonse' ? 'bg-white' : 'bg-emerald-500'}`} />
                        전세
                    </button>
                </div>

                {/* 2. 주택 유형 필터 (Chips) */}
                <div className="flex gap-2 p-1.5 bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-full shadow-lg overflow-x-auto max-w-[90vw]">
                    {housingFilters.map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setHousingType(filter.id)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all duration-200 border ${housingType === filter.id
                                ? 'bg-slate-100 text-slate-900 border-white shadow-md transform scale-105'
                                : 'bg-transparent text-slate-400 border-transparent hover:bg-slate-800'
                                }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>
            </div>

            <Map
                center={INITIAL_CENTER}
                level={INITIAL_LEVEL}
                style={{ width: "100%", height: "100%" }}
                onCreate={(map) => { mapRef.current = map; }}
                onZoomChanged={handleZoomChanged}
            >
                <MarkerClusterer averageCenter={true} minLevel={7} gridSize={60}>
                    {visibleItems.map((item, idx) => (
                        <AreaMarker
                            key={`${item.name || (item as any).regionName}-${idx}`}
                            item={item}
                            isResult={'estimatedSavings' in item}
                            showOverlay={level <= 5}
                            displayMode={displayMode}
                            housingType={housingType}
                            onHover={handleHover}
                            hoveredRegion={hoveredRegion}
                        />
                    ))}
                </MarkerClusterer>

                {activePolygonPath && (
                    <Polygon
                        path={activePolygonPath}
                        strokeWeight={2}
                        strokeColor={"#3b82f6"}
                        strokeOpacity={0.8}
                        strokeStyle={"solid"}
                        fillColor={"#3b82f6"}
                        fillOpacity={0.2}
                    />
                )}
            </Map>
        </div>
    )
}

export default KakaoMap
