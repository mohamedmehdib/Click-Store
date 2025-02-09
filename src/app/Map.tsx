"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { LatLngExpression } from "leaflet";
import { Roboto } from "next/font/google";
import Link from "next/link";

const ul = Roboto({ subsets: ["latin"], weight: "700" });

const Map = () => {
  const position: LatLngExpression = [35.838944, 10.628933];

  const customIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  return (
    <div className={`${ul.className} bg-blue-50 flex flex-col items-center py-10`}>
      <h1 className="py-10 text-3xl sm:text-4xl lg:text-5xl font-semibold text-center">
       Visitez-nous !
      </h1>
      <div className="relative w-3/4 lg:w-1/2 rounded-lg overflow-hidden px-2 md:px-4">
        <MapContainer
          center={position}
          zoom={15}
          className="relative z-10 h-[250px] sm:h-[400px] lg:h-[500px] w-full"
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker position={position} icon={customIcon}>
            <Popup>
              <Link href="https://maps.app.goo.gl/pvLmgGWJMAfELe9GA" target="_blank">
                Click Store
              </Link>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default Map;
