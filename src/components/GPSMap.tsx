"use client";
import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import { DISEASE_META, DetectionRecord, DiseaseClass } from "@/lib/constants";
import "leaflet/dist/leaflet.css";

interface GPSMapProps {
  records: DetectionRecord[];
  center?: [number, number];
  zoom?: number;
  className?: string;
}

export function GPSMap({ records, center = [9.145, 40.489], zoom = 6, className }: GPSMapProps) {
  const [map, setMap] = useState<any>(null);
  const [selectedDisease, setSelectedDisease] = useState<DiseaseClass | "All">("All");
  const [showHeatmap, setShowHeatmap] = useState(false);
  const mapRef = useRef<any>(null);

  // Filter records by selected disease
  const filteredRecords = selectedDisease === "All" 
    ? records 
    : records.filter(r => r.disease === selectedDisease);

  // Group records by location for heatmap
  const locationClusters = records.reduce((clusters, record) => {
    if (!record.latitude || !record.longitude) return clusters;
    
    const key = `${record.latitude.toFixed(3)},${record.longitude.toFixed(3)}`;
    if (!clusters[key]) {
      clusters[key] = {
        lat: record.latitude,
        lng: record.longitude,
        diseases: {},
        count: 0
      };
    }
    
    clusters[key].diseases[record.disease] = (clusters[key].diseases[record.disease] || 0) + 1;
    clusters[key].count += 1;
    
    return clusters;
  }, {} as Record<string, any>);

  // Get disease statistics for map
  const diseaseStats = records.reduce((stats, record) => {
    if (!record.latitude || !record.longitude) return stats;
    
    if (!stats[record.disease]) {
      stats[record.disease] = {
        count: 0,
        locations: [],
        avgLat: 0,
        avgLng: 0
      };
    }
    
    stats[record.disease].count++;
    stats[record.disease].locations.push([record.latitude, record.longitude]);
    stats[record.disease].avgLat += record.latitude;
    stats[record.disease].avgLng += record.longitude;
    
    return stats;
  }, {} as Record<DiseaseClass, any>);

  // Calculate averages
  Object.keys(diseaseStats).forEach(disease => {
    const stats = diseaseStats[disease as DiseaseClass];
    if (stats.count > 0) {
      stats.avgLat /= stats.count;
      stats.avgLng /= stats.count;
    }
  });

  useEffect(() => {
    if (mapRef.current) {
      setMap(mapRef.current);
    }
  }, []);

  const MapEvents = () => {
    const map = useMap();
    
    useEffect(() => {
      if (map) {
        map.on('zoomend', () => {
          console.log('Map zoom:', map.getZoom());
        });
      }
    }, [map]);
    
    return null;
  };

  return (
    <div className={className} style={{ height: "500px", borderRadius: "12px", overflow: "hidden" }}>
      {/* Disease Filter */}
      <div style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        zIndex: 1000,
        background: "white",
        padding: "12px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        minWidth: "200px"
      }}>
        <div style={{ fontSize: "12px", fontWeight: "600", marginBottom: "8px" }}>
          Filter by Disease
        </div>
        <select
          value={selectedDisease}
          onChange={(e) => setSelectedDisease(e.target.value as DiseaseClass | "All")}
          style={{
            width: "100%",
            padding: "6px",
            border: "1px solid #ddd",
            borderRadius: "4px",
            fontSize: "12px"
          }}
        >
          <option value="All">All Diseases</option>
          {Object.keys(DISEASE_META).map(disease => (
            <option key={disease} value={disease}>
              {DISEASE_META[disease as DiseaseClass].icon} {disease}
            </option>
          ))}
        </select>
        
        <div style={{ marginTop: "12px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}>
            <input
              type="checkbox"
              checked={showHeatmap}
              onChange={(e) => setShowHeatmap(e.target.checked)}
              style={{ margin: 0 }}
            />
            Show Disease Heatmap
          </label>
        </div>
      </div>

      {/* Legend */}
      <div style={{
        position: "absolute",
        bottom: "10px",
        left: "10px",
        zIndex: 1000,
        background: "white",
        padding: "12px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        fontSize: "11px"
      }}>
        <div style={{ fontWeight: "600", marginBottom: "6px" }}>Disease Legend</div>
        {Object.entries(DISEASE_META).map(([disease, meta]) => (
          <div key={disease} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <div style={{
              width: "12px",
              height: "12px",
              borderRadius: "2px",
              background: meta.color
            }} />
            <span>{meta.icon} {disease}</span>
          </div>
        ))}
      </div>

      {/* Map */}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Disease Markers */}
        {filteredRecords.map((record) => {
          if (!record.latitude || !record.longitude) return null;
          
          const meta = DISEASE_META[record.disease];
          return (
            <Marker
              key={record.id}
              position={[record.latitude, record.longitude]}
              icon={
                new (window as any).L.DivIcon({
                  html: `
                    <div style="
                      background: ${meta.color};
                      color: white;
                      border-radius: 50%;
                      width: 24px;
                      height: 24px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      font-size: 12px;
                      font-weight: bold;
                      border: 2px solid white;
                      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    ">
                      ${meta.icon}
                    </div>
                  `,
                  className: "custom-div-icon",
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
                })
              }
            >
              <Popup>
                <div style={{ minWidth: "200px" }}>
                  <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                    {meta.icon} {record.disease}
                  </div>
                  <div style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>
                    Confidence: {Math.round(record.confidence * 100)}%
                  </div>
                  <div style={{ fontSize: "11px", color: "#999" }}>
                    {fmtDate(record.created_at)}
                  </div>
                  {record.treatment && (
                    <div style={{ 
                      fontSize: "11px", 
                      marginTop: "8px", 
                      padding: "6px", 
                      background: "#f8f9fa", 
                      borderRadius: "4px" 
                    }}>
                      <strong>Treatment:</strong> {record.treatment.substring(0, 100)}...
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Heatmap Overlay */}
        {showHeatmap && Object.values(locationClusters).map((cluster, index) => {
          const maxCount = Math.max(...Object.values(locationClusters).map((c: any) => c.count));
          const intensity = cluster.count / maxCount;
          
          // Determine dominant disease in this cluster
          const dominantDisease = Object.keys(cluster.diseases).reduce((a, b) => 
            cluster.diseases[a] > cluster.diseases[b] ? a : b
          );
          const dominantMeta = DISEASE_META[dominantDisease as DiseaseClass];
          
          return (
            <Circle
              key={`cluster-${index}`}
              center={[cluster.lat, cluster.lng]}
              radius={Math.sqrt(cluster.count) * 5000} // Dynamic radius based on case count
              fillColor={dominantMeta.color}
              fillOpacity={0.3 + (intensity * 0.4)} // Variable opacity based on intensity
              color={dominantMeta.color}
              weight={2}
            />
          );
        })}

        <MapEvents />
      </MapContainer>
    </div>
  );
}

// Helper function for date formatting
function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}
