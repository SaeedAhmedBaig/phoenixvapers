"use client";

import { useState, useCallback } from "react";
import { MapPin, Phone, Clock, Globe, Search, Loader2 } from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";

export function StoreLocatorClient({ initialStores }) {
  const [stores, setStores] = useState(initialStores || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStore, setSelectedStore] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGetLocation = useCallback(() => {
    setLoading(true);
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      () => {
        alert("Unable to get your location. Please enable location permissions.");
        setLoading(false);
      }
    );
  }, []);

  const filteredStores = stores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.postcode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedStores = userLocation
    ? [...filteredStores].sort((a, b) => {
        const distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
        const distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
        return distA - distB;
      })
    : filteredStores;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Map placeholder (Google Maps requires API key) */}
        <div className="lg:col-span-2">
          <div className="relative h-96 overflow-hidden rounded-xl border border-border bg-muted">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
              <MapPin className="h-12 w-12 text-muted-foreground" />
              <p className="text-center text-muted-foreground">
                <strong>Interactive Map</strong>
                <br />
                Google Maps integration ready (add API key in environment)
              </p>
              <Button onClick={handleGetLocation} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                {loading ? "Getting location..." : "Find Nearest Store"}
              </Button>
            </div>
          </div>
        </div>

        {/* Store List */}
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, city, postcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Store count */}
          <p className="text-sm font-bold text-muted-foreground">
            {sortedStores.length} of {stores.length} stores
            {userLocation && " • Sorted by distance"}
          </p>

          {/* Stores List */}
          <div className="flex-1 space-y-3 overflow-y-auto max-h-96">
            {sortedStores.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No stores found</p>
            ) : (
              sortedStores.map((store) => {
                const distance = userLocation
                  ? calculateDistance(userLocation.lat, userLocation.lng, store.lat, store.lng)
                  : null;

                return (
                  <button
                    key={store.id}
                    onClick={() => setSelectedStore(store)}
                    className="w-full rounded-lg border border-border bg-card p-3 text-left transition hover:border-primary/50 hover:bg-secondary"
                  >
                    <div className="font-bold text-foreground">{store.name}</div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {store.city}
                      {distance && <span> • {distance.toFixed(1)} miles</span>}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{store.postcode}</div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Store Detail Modal */}
      <Dialog open={!!selectedStore} onOpenChange={(open) => !open && setSelectedStore(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{selectedStore?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Address */}
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-foreground">{selectedStore?.address}</p>
                <p className="text-sm text-muted-foreground">{selectedStore?.postcode}</p>
              </div>
            </div>

            {/* Phone */}
            {selectedStore?.phone && (
              <div className="flex gap-3">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <a href={`tel:${selectedStore.phone}`} className="text-sm font-bold text-primary hover:underline">
                  {selectedStore.phone}
                </a>
              </div>
            )}

            {/* Hours */}
            {selectedStore?.hours && (
              <div className="flex gap-3">
                <Clock className="h-5 w-5 text-primary flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-foreground">Opening Hours</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedStore.hours}</p>
                </div>
              </div>
            )}

            {/* Website */}
            {selectedStore?.website && (
              <div className="flex gap-3">
                <Globe className="h-5 w-5 text-primary flex-shrink-0" />
                <a href={selectedStore.website} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-primary hover:underline">
                  Visit website
                </a>
              </div>
            )}

            {/* Distance */}
            {userLocation && selectedStore && (
              <div className="rounded-lg bg-secondary p-3">
                <p className="text-sm font-bold text-foreground">
                  {calculateDistance(userLocation.lat, userLocation.lng, selectedStore.lat, selectedStore.lng).toFixed(1)} miles from you
                </p>
              </div>
            )}

            <Button className="w-full" asChild>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStore?.lat},${selectedStore?.lng}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Get Directions
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

// Haversine formula: calculate distance between two coordinates (in miles)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
