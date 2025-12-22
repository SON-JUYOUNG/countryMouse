import { Map, MapMarker } from "react-kakao-maps-sdk"
import { useState } from "react"

const KakaoMap = () => {
    const [level, setLevel] = useState(3); // Zoom level

    return (
        <div className="w-full h-[500px] rounded-2xl overflow-hidden border border-slate-700 shadow-2xl relative">
            {/* React Kakao Maps SDK requires the script to be loaded in index.html,
           but standard usage allows passing the appkey in the Map component directly via a loader or 
           usually we just add the script tag to index.html for simplicity in Vite. 
           However, react-kakao-maps-sdk assumes the global `kakao` object exists.
           Wait, there is a `useKakaoLoader` hook provided by `react-kakao-maps-sdk`! */}
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
