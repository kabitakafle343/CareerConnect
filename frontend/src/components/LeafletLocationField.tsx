import { useEffect, useState, type FormEvent } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import "leaflet/dist/leaflet.css";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";

type Position = [number, number];
type SearchResult = { lat: string; lon: string; display_name: string };

const marker = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const reverseGeocode = async ([latitude, longitude]: Position) => {
  const query = new URLSearchParams({ format: "jsonv2", lat: String(latitude), lon: String(longitude) });
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${query}`);
  if (!response.ok) throw new Error("Address lookup failed");
  const result = await response.json() as { display_name?: string };
  return result.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
};

const LocationMapEvents = ({ onSelect }: { onSelect: (position: Position) => void }) => {
  useMapEvents({ click: ({ latlng }) => onSelect([latlng.lat, latlng.lng]) });
  return null;
};

const MapRecenter = ({ position }: { position: Position | null }) => {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, 14);
  }, [map, position]);
  return null;
};

const LeafletLocationField = ({ value, onChange, required = false }: { value: string; onChange: (value: string) => void; required?: boolean }) => {
  const [searchText, setSearchText] = useState("");
  const [pendingAddress, setPendingAddress] = useState("");
  const [position, setPosition] = useState<Position | null>(null);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [mapError, setMapError] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const choosePosition = async (nextPosition: Position) => {
    setPosition(nextPosition);
    setResults([]);
    setIsResolving(true);
    setMapError("");
    try {
      const address = await reverseGeocode(nextPosition);
      setPendingAddress(address);
      setSearchText(address);
    } catch {
      const coordinates = `${nextPosition[0].toFixed(6)}, ${nextPosition[1].toFixed(6)}`;
      setPendingAddress(coordinates);
      setSearchText(coordinates);
      setMapError("Address lookup failed. The pin coordinates are selected instead.");
    } finally {
      setIsResolving(false);
    }
  };

  const searchPlaces = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!searchText.trim()) return;
    setIsSearching(true);
    setResults([]);
    setMapError("");
    try {
      const query = new URLSearchParams({ format: "jsonv2", q: searchText.trim(), limit: "5" });
      const response = await fetch(`https://nominatim.openstreetmap.org/search?${query}`);
      if (!response.ok) throw new Error("Place search failed");
      const matches = await response.json() as SearchResult[];
      setResults(matches);
      if (matches.length === 0) setMapError("No matching places found. Try another search or select a point on the map.");
    } catch {
      setMapError("Place search failed. You can still select a point on the map.");
    } finally {
      setIsSearching(false);
    }
  };

  const selectResult = (result: SearchResult) => {
    const nextPosition: Position = [Number(result.lat), Number(result.lon)];
    setPosition(nextPosition);
    setPendingAddress(result.display_name);
    setSearchText(result.display_name);
    setResults([]);
    setMapError("");
  };

  const openMapPicker = () => {
    setSearchText(value);
    setPendingAddress(value);
    setPosition(null);
    setResults([]);
    setMapError("");
    onOpen();
  };

  return (
    <FormControl isRequired={required}>
      <FormLabel htmlFor="job-location" color="app.muted" fontSize="sm" fontWeight="600">Job location</FormLabel>
      <HStack align="stretch" spacing={2}>
        <Input
          id="job-location"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Enter a city, address, or remote"
          bg="app.field"
          borderColor="app.border"
          _hover={{ borderColor: "app.muted" }}
          _focusVisible={{ borderColor: "#b7e36c", boxShadow: "0 0 0 1px #b7e36c" }}
        />
        <Button type="button" onClick={openMapPicker} flexShrink={0}>Choose on map</Button>
      </HStack>

      <Modal isOpen={isOpen} onClose={onClose} size="5xl" isCentered>
        <ModalOverlay />
        <ModalContent bg="app.panel" color="app.text">
          <ModalHeader>Choose job location</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={3}>
              <Text color="app.muted" fontSize="sm">Search for a place, click the map to drop a pin, or drag the pin to adjust it.</Text>
              <Box as="form" onSubmit={searchPlaces} position="relative">
                <HStack>
                  <Input
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    placeholder="Search an address or place"
                    bg="app.field"
                    borderColor="app.border"
                    autoComplete="off"
                  />
                  <Button type="submit" isLoading={isSearching} flexShrink={0}>Search</Button>
                </HStack>
                {results.length > 0 && <Box position="absolute" zIndex={1000} top="calc(100% + 4px)" left={0} right={0} maxH="220px" overflowY="auto" border="1px solid" borderColor="app.border" borderRadius="md" bg="app.panel" boxShadow="lg">
                  {results.map((result) => <Button key={`${result.lat},${result.lon}`} variant="ghost" justifyContent="flex-start" w="full" h="auto" minH="44px" px={4} py={3} borderRadius={0} whiteSpace="normal" textAlign="left" onClick={() => selectResult(result)}>{result.display_name}</Button>)}
                </Box>}
              </Box>
              <Box h={{ base: "48vh", md: "58vh" }} minH="320px" borderRadius="md" overflow="hidden" bg="app.field">
                <MapContainer center={[20, 0]} zoom={2} scrollWheelZoom style={{ width: "100%", height: "100%" }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <LocationMapEvents onSelect={choosePosition} />
                  <MapRecenter position={position} />
                  {position && <Marker position={position} icon={marker} draggable eventHandlers={{ dragend: (event) => {
                    const next = event.target.getLatLng();
                    void choosePosition([next.lat, next.lng]);
                  } }} />}
                </MapContainer>
              </Box>
              <Text textAlign="right" color="app.subtle" fontSize="xs">Search powered by Nominatim · Map data © OpenStreetMap contributors</Text>
              {isResolving && <HStack><Spinner size="xs" /><Text color="app.muted" fontSize="sm">Finding the address...</Text></HStack>}
              {pendingAddress && <Text color="app.muted" fontSize="sm">Selected location: <Text as="span" color="app.text" fontWeight="600">{pendingAddress}</Text></Text>}
              {mapError && <Text color="orange.400" fontSize="sm">{mapError}</Text>}
            </VStack>
          </ModalBody>
          <ModalFooter gap={3}>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={() => { onChange(pendingAddress); onClose(); }} isDisabled={!pendingAddress || isResolving}>Use this location</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </FormControl>
  );
};

export default LeafletLocationField;