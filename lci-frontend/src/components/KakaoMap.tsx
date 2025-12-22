import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk"
import { useState } from "react"

const KakaoMap = () => {
    const [level, setLevel] = useState(3);

    const [loading, error] = useKakaoLoader({
        appkey: import.meta.env.VITE_KAKAO_MAP_KEY,
        libraries: ["clusterer", "drawing", "services"],
    })

    if (loading) return <div className="w-full h-[500px] flex items-center justify-center text-slate-400 font-mono">Loading Map SDK...</div>;
    if (error) return <div className="w-full h-[500px] flex items-center justify-center text-red-400 font-mono">Failed to load map: {error.message}</div>;

    return (
        <div className="w-full h-full relative">
            <Map
                center={{ lat: 37.5665, lng: 126.9780 }} // Seoul City Hall
                style={{ width: "100%", height: "100%" }}
                level={level}
                onZoomChanged={(map) => setLevel(map.getLevel())}
            >
                <MapMarker position={{ lat: 37.5665, lng: 126.9780 }}>
                    <div style={{ padding: "5px", color: "#000" }}>Seoul Center</div>
                </MapMarker>
            </Map>
        </div>
    )
}

export default KakaoMap
