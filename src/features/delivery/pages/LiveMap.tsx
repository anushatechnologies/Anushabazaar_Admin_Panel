import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useGetDeliveryPersonsQuery } from '../api/deliveryApi';
import { baseApiWithAuth } from '@api/baseApi';

// "API delivery" key from Google Cloud Console (project: anushabazaar-2288e)
const GOOGLE_MAPS_API_KEY =
  import.meta.env.VITE_GOOGLE_MAPS_KEY || 'AIzaSyA1boMLneteAG92WXtgzEOaLLzpBK7j1Lg';
const DEFAULT_CENTER = { lat: 17.385, lng: 78.4867 }; // Hyderabad

const storesApi = baseApiWithAuth.injectEndpoints({
  endpoints: (builder) => ({
    getStoresForMap: builder.query<{ stores: any[] }, void>({
      query: () => '/api/stores',
    }),
  }),
  overrideExisting: false,
});

declare global {
  interface Window {
    google: any;
    initLiveMap?: () => void;
  }
}

const LiveMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const ridersMarkersRef = useRef<any[]>([]);
  const storeMarkersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const {
    data: ridersData,
    refetch: refetchRiders,
    isFetching: fetchingRiders,
  } = useGetDeliveryPersonsQuery(undefined, { pollingInterval: 10000 });
  const { data: storesData, refetch: refetchStores } = storesApi.endpoints.getStoresForMap.useQuery(
    undefined,
    { pollingInterval: 30000 },
  );

  // Load Google Maps script once.
  // setMapLoaded is called either immediately (already loaded) or via the
  // global callback when the script finishes — both are intentional side-effects.

  useEffect(() => {
    if (window.google?.maps) {
      setMapLoaded(true);
      return;
    }
    if (document.getElementById('gmaps-livemap')) return;

    window.initLiveMap = () => setMapLoaded(true);
    const script = document.createElement('script');
    script.id = 'gmaps-livemap';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initLiveMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }, []);

  // Initialize map instance
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: 12,
    });
  }, [mapLoaded]);

  // Rider markers
  useEffect(() => {
    if (!mapInstanceRef.current || !ridersData?.deliveryPersons) return;
    ridersMarkersRef.current.forEach((m) => m.setMap(null));
    ridersMarkersRef.current = [];

    ridersData.deliveryPersons
      .filter((r: any) => r.isOnline && r.latitude && r.longitude)
      .forEach((rider: any) => {
        const marker = new window.google.maps.Marker({
          position: { lat: rider.latitude, lng: rider.longitude },
          map: mapInstanceRef.current,
          title: `${rider.firstName} ${rider.lastName}`,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new window.google.maps.Size(32, 32),
          },
        });
        const info = new window.google.maps.InfoWindow({
          content: `<div style="color:#000;font-size:12px">
            <b>${rider.firstName} ${rider.lastName}</b><br/>
            ${rider.vehicleType} — ${rider.vehicleModel ?? ''}<br/>
            Last GPS: ${rider.latitude?.toFixed(5)}, ${rider.longitude?.toFixed(5)}
          </div>`,
        });
        marker.addListener('click', () => info.open(mapInstanceRef.current, marker));
        ridersMarkersRef.current.push(marker);
      });
  }, [ridersData, mapLoaded]);

  // Store markers
  useEffect(() => {
    if (!mapInstanceRef.current || !storesData?.stores) return;
    storeMarkersRef.current.forEach((m) => m.setMap(null));
    storeMarkersRef.current = [];

    storesData.stores
      .filter((s: any) => s.latitude && s.longitude)
      .forEach((store: any) => {
        const marker = new window.google.maps.Marker({
          position: { lat: store.latitude, lng: store.longitude },
          map: mapInstanceRef.current,
          title: store.name,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new window.google.maps.Size(32, 32),
          },
        });
        const info = new window.google.maps.InfoWindow({
          content: `<div style="color:#000;font-size:12px">
            <b>🏪 ${store.name}</b><br/>
            ${store.address ?? ''}
          </div>`,
        });
        marker.addListener('click', () => info.open(mapInstanceRef.current, marker));
        storeMarkersRef.current.push(marker);
      });
  }, [storesData, mapLoaded]);

  const handleRefresh = () => {
    refetchRiders();
    refetchStores();
    setLastRefresh(new Date());
  };

  const onlineRiders = ridersData?.deliveryPersons?.filter((r: any) => r.isOnline) ?? [];
  const ridersOnMap = onlineRiders.filter((r: any) => r.latitude && r.longitude);
  const storesOnMap = storesData?.stores?.filter((s: any) => s.latitude && s.longitude) ?? [];

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5" fontWeight={700}>
          Live Delivery Map
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="caption" color="text.secondary">
            {lastRefresh.toLocaleTimeString()}
          </Typography>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} size="small" disabled={fetchingRiders}>
              {fetchingRiders ? <CircularProgress size={16} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats row */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
        {[
          {
            icon: <TwoWheelerIcon color="success" />,
            value: onlineRiders.length,
            label: 'Online riders',
          },
          {
            icon: <TwoWheelerIcon color="primary" />,
            value: ridersOnMap.length,
            label: 'Riders on map',
          },
          {
            icon: <StorefrontIcon color="error" />,
            value: storesOnMap.length,
            label: 'Stores pinned',
          },
        ].map(({ icon, value, label }) => (
          <Card key={label} sx={{ minWidth: 140 }}>
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {icon}
                <Box>
                  <Typography variant="h6" lineHeight={1}>
                    {value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {label}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Chip
          size="small"
          icon={<TwoWheelerIcon />}
          label="Online rider"
          color="primary"
          variant="outlined"
        />
        <Chip
          size="small"
          icon={<StorefrontIcon />}
          label="Store"
          color="error"
          variant="outlined"
        />
        <Typography variant="caption" color="text.secondary">
          Auto-refreshes every 10 s
        </Typography>
      </Box>

      {/* Online but no GPS warning */}
      {onlineRiders.length > 0 && ridersOnMap.length === 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <strong>{onlineRiders.map((r: any) => `${r.firstName} ${r.lastName}`).join(', ')}</strong>{' '}
          is online but has no GPS location yet. Location will appear once the rider opens the app
          and pings location (every 30 s automatically).
        </Alert>
      )}

      {storesOnMap.length === 0 && (
        <Alert severity="info" sx={{ mb: 2, py: 0 }}>
          No stores have GPS. Add via: <code>PUT /api/delivery-admin/stores/{'{id}'}/location</code>
        </Alert>
      )}

      {/* Map */}
      {!mapLoaded ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading Google Maps...</Typography>
        </Box>
      ) : (
        <Box
          ref={mapRef}
          sx={{
            width: '100%',
            height: 'calc(100vh - 340px)',
            minHeight: 450,
            borderRadius: 2,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
          }}
        />
      )}
    </Box>
  );
};

export default LiveMap;
