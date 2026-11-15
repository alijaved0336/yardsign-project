import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from "react";
import * as olProj from "ol/proj";

import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import StadiaMaps from "ol/source/StadiaMaps.js";
import TileWMS from "ol/source/TileWMS.js";
import Geolocation from "ol/Geolocation.js";
import Button from "@mui/material/Button";
import { grey } from "@mui/material/colors";
import { styled } from "@mui/material/styles";
import { fromLonLat, toLonLat } from "ol/proj";
import { Icon } from "ol/style";
import { Vector as VectorLayer } from "ol/layer";
import { OSM, Vector as VectorSource } from "ol/source";
import { Point } from "ol/geom";
import Feature from "ol/Feature";
import { Style } from "ol/style";
import { toast } from "react-toastify";

const ColorButton = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText(grey[500]),
  backgroundColor: grey[500],
  "&:hover": {
    backgroundColor: grey[700],
  },
}));

const MyServicesMap = (props, ref) => {
  const {
    latLon,
    listItems,
    imgIcon,
    selectItem,
    handleLatAndLog,
    listData,
    screenLat,
    type,
    CsvFileDataWithLatLog,
    submit,
    handlesetLatMap,
  } = props;
  const [defaultLatitude, setDefaultLatitude] = useState(42);
  const [defaultLongitude, setDefaultLongitude] = useState(-71);
  const [defaultZoom, setdefaultZoom] = useState(15);
  const markerLayerRef = useRef(null);
  const [geolocation, setGeolocation] = useState(null);
  const [map, setMap] = useState(null);
  const iconRef = useRef(imgIcon);
  // sector icon
  useEffect(() => {
    iconRef.current = imgIcon;
  }, [imgIcon, selectItem]);
  const flyTo = (location, done) => {
    const view = map?.getView();
    if (view) {
      const duration = 2000;
      const zoom = view.getZoom();

      view.animate(
        {
          center: location,
          duration: duration,
        },
        () => {
          view.animate(
            {
              zoom: zoom - 1,
              duration: duration / 2,
            },
            {
              zoom: zoom,
              duration: duration / 2,
            },
            done
          );
        }
      );
    }
  };
  const getCurrentLocation = () => {
    const coordinates = geolocation?.getPosition();
    if (coordinates) {
      flyTo(coordinates, () => {});
    } else {
      console.error("Error getting current location");
    }
  };
  const handleZoomIn = () => {
    map.getView().animate({
      zoom: map.getView().getZoom() + 1,
      duration: 200,
    });
  };

  const handleZoomOut = () => {
    map.getView().animate({
      zoom: map.getView().getZoom() - 1,
      duration: 200,
    });
  };

  useImperativeHandle(ref, () => ({
    handleZoomIn,
    handleZoomOut,
    getCurrentLocation,
    flyTo,
  }));
  useEffect(() => {
    const newMap = new Map({
      target: "map",
      layers: [
        new TileLayer({
          source: new OSM({
            url: "https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
            attributions:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            CQL_FILTER: "",
          }),
        }),
      ],
      view: new View({
        center: fromLonLat([defaultLongitude, defaultLatitude]),
        zoom: defaultZoom,
      }),
    });

    const geolocationObj = new Geolocation({
      trackingOptions: {
        enableHighAccuracy: true,
      },
      projection: newMap.getView().getProjection(),
    });

    setGeolocation(geolocationObj);

    geolocationObj.setTracking(true);

    geolocationObj.on("change:position", () => {
      const coordinates = geolocationObj.getPosition();
      if (coordinates) {
        flyTo(coordinates, () => {});
      } else {
        console.error("Error getting current location");
      }
    });

   

    newMap.on("pointermove", function (evt) {
      if (evt.dragging) {
        return;
      }

      newMap.getTargetElement().style.cursor = "";
    });

    setMap(newMap);
    return () => {
      newMap.setTarget("");
      geolocationObj.setTracking(false);
    };
  }, []);
  useEffect(() => {
    if (map) {
      // Define the icon style for the marker
      const markerStyle = new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: `${iconRef.current}`, // Set the path to your icon image
        }),
      });

      // Create a vector layer to hold the markers
      const markerLayer = new VectorLayer({
        source: new VectorSource(),
        style: markerStyle,
      });

      // Add the vector layer to the map
      map.addLayer(markerLayer);

      // Attach the markerLayer to the ref
      markerLayerRef.current = markerLayer;

      // Event listener for map click
      map.on("click", handleMapClick);

      return () => {
        // Clean up the event listener
        map.un("click", handleMapClick);
      };
    }
  }, [map, selectItem, imgIcon]);
  const handleMapClick = (event) => {
    if (type === "UploadServices") {
      if (selectItem !== "") {
        const clickedCoord = event.coordinate;
        // Create a feature with the clicked coordinates
        const markerFeature = new Feature({
          geometry: new Point(clickedCoord),
        });
        const [longitude, latitude] = fromLonLat(clickedCoord);
        const lonLat = olProj.transform(clickedCoord, "EPSG:3857", "EPSG:4326"); // Convert coordinate to EPSG:4326 (lat/lon)

        handlesetLatMap([
          {
            longitude: parseFloat(lonLat[0]),
            latitude: parseFloat(lonLat[1]),
          },
        ]);

        // Log the latitude and longitude
        const markerLayerSource = markerLayerRef.current.getSource();
        markerLayerSource.clear();

        // Add the feature to the marker layer
        markerLayerRef.current.getSource().addFeature(markerFeature);
      }
    }
  };

//Mark available yard sign

useEffect(() => {
  if (listData) {
    setTimeout(() => {
      markerLayerRef?.current?.getSource().clear();
      listData.forEach((values) => {
        handleMapIconView(values.longitude, values.latitude);
      });
    }, 1000);
  }
}, [listData, imgIcon]);

const handleMapIconView = (longitude, latitude) => {
  const clickedCoord = fromLonLat([longitude, latitude]);

  // handleLatAndLog(latitude, longitude);
  const markerLayer = markerLayerRef.current;
  if (markerLayer) {
    const markerLayerSource = markerLayer.getSource();
    flyTo(clickedCoord, () => {});
    // markerLayerSource.clear();
    // Create a feature with the clicked coordinates and icon
    const markerFeature = new Feature({
      geometry: new Point(clickedCoord),
      style: new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: iconRef.current, // Use iconRef.current
        }),
      }),
    });

    // Add the feature to the marker layer
    if (markerLayer) {
      markerLayer.getSource().addFeature(markerFeature);
    }
  }
};


//CSV DATA ICON
useEffect(() => {
  if (CsvFileDataWithLatLog?.length > 0) {
    CsvFileDataWithLatLog.forEach((values) => {
      handleMapCSVView(values.lon, values.lat);
    });
  }
}, [CsvFileDataWithLatLog]);
const handleMapCSVView = (longitude, latitude) => {
  if (longitude && latitude) {
    const clickedCoord = fromLonLat([longitude, latitude]);

    // handleLatAndLog(latitude, longitude);
    const markerLayer = markerLayerRef.current;
    if (markerLayer) {
      const markerLayerSource = markerLayer.getSource();
      flyTo(clickedCoord, () => {});
      // markerLayerSource.clear();
      // Create a feature with the clicked coordinates and icon
      const markerFeature = new Feature({
        geometry: new Point(clickedCoord),
        style: new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: iconRef.current, // Use iconRef.current
          }),
        }),
      });

      // Add the feature to the marker layer
      if (markerLayer) {
        markerLayer.getSource().addFeature(markerFeature);
      }
    }
  } else {
    toast.error("Error fetching latitudes and longitudes.");
  }
};

//Edit icon view
useEffect(() => {
  if (screenLat?.length !== 0) {
    setTimeout(() => {
      screenLat?.forEach((values) => {
        if (values.longitude && values.latitude) {
          handleModelMap(values.longitude, values.latitude);
        }
      });
    }, 1000);
  }
}, [screenLat]);

const handleModelMap = (longitude, latitude) => {
  const clickedCoord = fromLonLat([longitude, latitude]);
  handleLatAndLog(latitude, longitude);
  const markerLayer = markerLayerRef.current;
  if (markerLayer) {
    const markerLayerSource = markerLayer.getSource();
    flyTo(clickedCoord, () => {});
    markerLayerSource.clear();
    // Create a feature with the clicked coordinates and icon
    const markerFeature = new Feature({
      geometry: new Point(clickedCoord),
      style: new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: `${iconRef.current}`, // Use iconRef.current
        }),
      }),
    });

    // Add the feature to the marker layer
    if (markerLayer) {
      markerLayer.getSource().addFeature(markerFeature);
    }
  }
};
  return (
    <>
      <div id="map" style={{ width: "100%", height: "100%" }} />
    </>
  );
};
export default forwardRef(MyServicesMap);
