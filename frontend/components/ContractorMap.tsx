"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Contractor } from "@/lib/api";
import { getContractorRank } from "@/lib/api";
import { calcMatchScore } from "@/lib/matchScore";

interface ContractorMapProps {
  contractors: Contractor[];
  onSelect: (contractor: Contractor) => void;
  selectedId?: string;
  userLocation?: { lat: number; lng: number };
  searchWorkType?: string;
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mapboxgl: any;
  }
}

export default function ContractorMap({
  contractors,
  onSelect,
  selectedId,
  userLocation,
  searchWorkType,
}: ContractorMapProps) {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);

  const initMap = useCallback(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const mapboxgl = window.mapboxgl;
    if (!mapboxgl) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    const center: [number, number] = userLocation
      ? [userLocation.lng, userLocation.lat]
      : [139.6917, 35.6895]; // Tokyo default

    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center,
      zoom: 11,
      language: "ja",
    });

    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
      }),
      "top-right"
    );

    mapInstanceRef.current = map;
  }, [userLocation]);

  const updateMarkers = useCallback(() => {
    const mapboxgl = window.mapboxgl;
    const map = mapInstanceRef.current;
    if (!map || !mapboxgl) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    contractors.forEach((contractor) => {
      if (!contractor.latitude || !contractor.longitude) return;

      const isSelected = contractor.id === selectedId;
      const { rank, color, bg } = getContractorRank(contractor.rank || contractor.ai_score);
      const match = calcMatchScore(contractor.main_work_type, contractor.work_types, searchWorkType);
      const matchBadge = searchWorkType ? `<span style="background:${match.bg};color:${match.color};border:1px solid ${match.border};font-size:10px;font-weight:700;padding:2px 6px;border-radius:10px;">${match.label}</span>` : "";
      const starCount = contractor.rating || 0;
      const starFilled = Math.round(starCount * 2) / 2;
      const starsHtml = starCount > 0 ? `<span style="color:#f59e0b;font-size:11px;font-weight:700;">★${starFilled.toFixed(1)}</span><span style="color:#9ca3af;font-size:10px;">(${contractor.review_count||0}件)</span>` : "";
      const size = isSelected ? 48 : 40;

      // Custom marker element with rank badge
      const el = document.createElement("div");
      el.className = "contractor-marker";
      el.style.position = "relative";
      el.innerHTML = `
        <div style="
          width: ${size}px;
          height: ${size}px;
          background: ${isSelected ? "#1d4ed8" : "#ffffff"};
          border: 3px solid ${isSelected ? "#1e40af" : color};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 10px rgba(0,0,0,${isSelected ? 0.4 : 0.25});
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        ">
          <span style="
            font-size: ${isSelected ? 16 : 14}px;
            font-weight: 900;
            color: ${isSelected ? "#ffffff" : color};
            font-family: sans-serif;
            line-height: 1;
            letter-spacing: -0.5px;
          ">${rank}</span>
        </div>
      `;

      el.addEventListener("click", () => {
        onSelect(contractor);
        router.push("/contractors/" + contractor.id);
      });
      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.15)";
        el.style.zIndex = "10";
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1)";
        el.style.zIndex = "1";
      });

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: "contractor-popup",
      }).setHTML(`
        <div style="padding: 8px 12px; font-family: sans-serif; min-width: 180px;">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
            <span style="background:${bg};color:${color};font-size:11px;font-weight:900;padding:2px 6px;border-radius:6px;">${rank}</span>
            ${matchBadge}
          </div>
          <div style="font-weight: 700; font-size: 13px; color: #1f2937; margin-bottom: 2px;">
            ${contractor.company_name}
          </div>
          ${starsHtml ? `<div style="margin-bottom:4px;">${starsHtml}</div>` : ""}
          ${contractor.main_work_type ? `<div style="font-size:11px;color:#1d4ed8;font-weight:600;margin-bottom:4px;">⭐ ${contractor.main_work_type}</div>` : ""}
          <div style="font-size: 11px; color: #6b7280; margin-bottom:4px;">
            ${contractor.prefecture}${contractor.city}
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 4px;">
            ${contractor.work_types
              .slice(0, 2)
              .map(
                (t) =>
                  `<span style="background: #eff6ff; color: #3b82f6; font-size: 10px; padding: 2px 6px; border-radius: 10px;">${t}</span>`
              )
              .join("")}
            ${contractor.work_types.length > 2 ? `<span style="color: #9ca3af; font-size: 10px;">+${contractor.work_types.length - 2}</span>` : ""}
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([contractor.longitude, contractor.latitude])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });

    // User location marker
    if (userLocation) {
      const userEl = document.createElement("div");
      userEl.innerHTML = `
        <div style="
          width: 20px; height: 20px;
          background: #22c55e; border: 3px solid white;
          border-radius: 50%; box-shadow: 0 0 0 4px rgba(34,197,94,0.2);
        "/>
      `;
      new mapboxgl.Marker(userEl)
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map);
    }
  }, [contractors, onSelect, selectedId, userLocation]);

  // Load Mapbox and initialize
  useEffect(() => {
    const checkAndInit = () => {
      if (window.mapboxgl) {
        initMap();
        updateMarkers();
      } else {
        setTimeout(checkAndInit, 100);
      }
    };
    checkAndInit();
    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update markers when data changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      updateMarkers();
    }
  }, [contractors, selectedId, updateMarkers]);

  // Fly to selected
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedId) return;
    const contractor = contractors.find((c) => c.id === selectedId);
    if (contractor?.latitude && contractor?.longitude) {
      map.flyTo({
        center: [contractor.longitude, contractor.latitude],
        zoom: 14,
        duration: 800,
      });
    }
  }, [selectedId, contractors]);

  return (
    <div
      ref={mapRef}
      className="w-full h-full rounded-xl overflow-hidden"
      style={{ minHeight: "400px" }}
    />
  );
}
