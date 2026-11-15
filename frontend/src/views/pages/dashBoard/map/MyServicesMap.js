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

  const [map, setMap] = useState(null);
  const [defaultLatitude, setDefaultLatitude] = useState(null);
  const [defaultLongitude, setDefaultLongitude] = useState(null);
  const [defaultZoom, setdefaultZoom] = useState(null);
  //Current Location Icon
  useEffect(() => {
    if (map) {
      const locationLayer = new VectorLayer({
        source: new VectorSource({
          features: [new Feature(new Point([0, 0]))],
        }),
        style: new Style({
          image: new Icon({
            anchor: [0.5, 1],
            src: "images/locationIcon.svg",
            scale:0.1
            // size: [32,100],
          }),
        }),
      });
      map.addLayer(locationLayer);

      const geolocationObj = new Geolocation({
        trackingOptions: {
          enableHighAccuracy: true,
        },
        projection: map.getView().getProjection(),
      });

      setGeolocation(geolocationObj);

      geolocationObj.setTracking(true);

      geolocationObj.on("change:position", () => {
        const coordinates = geolocationObj.getPosition();
        if (coordinates) {
          const iconFeature = locationLayer.getSource().getFeatures()[0];
          iconFeature.setGeometry(new Point(coordinates));
          // flyTo(coordinates, () => {});
        } else {
          console.error("Error getting current location");
        }
      });

      return () => {
        map.removeLayer(locationLayer);
        geolocationObj.setTracking(false);
      };
    }
  }, [map]);

  //Default Map Set
  useEffect(() => {
    if (
      localStorage.getItem("latitudeInnerMap") &&
      localStorage.getItem("longitudeInnerMap")
    ) {
      setDefaultLatitude(localStorage.getItem("latitudeInnerMap"));
      setDefaultLongitude(localStorage.getItem("longitudeInnerMap"));
      setdefaultZoom(15);
    } else {
      setDefaultLatitude(42.3601);
      setDefaultLongitude(-71.0589);
      setdefaultZoom(15);
    }
  }, [
    localStorage.getItem("latitudeInnerMap"),
    localStorage.getItem("longitudeInnerMap"),
    submit,
  ]);

  useEffect(() => {
    if (map) {
      const view = map.getView();
      const onViewChange = () => {
        const center = view.getCenter();
        const [lon, lat] = toLonLat(center);
        const zoom = view.getZoom();
      };

      view.on("change:center", onViewChange);

      return () => {
        view.un("change:center", onViewChange);
      };
    }
  }, [map]);

  const [geolocation, setGeolocation] = useState(null);
  const [removeIcon, setRemoveIcon] = useState(false);
  const [userIndus, setUserIndus] = useState("");
  const [isPopupActive, setIsPopupActive] = useState(false);
  const [clickedCoordinates, setClickedCoordinates] = useState(null);
  const iconRef = useRef(imgIcon);
  useEffect(() => {
    if (type == "UploadServices") {
      removeAllIcons();
    }

    // setTimeout(() => {
    //   iconRef.current = imgIcon;
    // }, 0);
  }, []);
  useEffect(() => {
    iconRef.current = imgIcon;
  }, [imgIcon, selectItem]);

  const markerLayerRef = useRef(null);
  const parseHtml = (html) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const rows = doc.querySelectorAll("table.featureInfo tr");

    const headers = Array.from(rows[0].querySelectorAll("th")).map((th) =>
      th.textContent.trim()
    );

    const dataRow = Array.from(rows[1].querySelectorAll("td")).map((td) =>
      td.textContent.trim()
    );

    const dataObject = headers.reduce((obj, header, index) => {
      obj[header] = dataRow[index];
      return obj;
    }, {});

    const attributes = [
      "USER_Organ",
      "USER_Websi",
      "USER_First",
      "USER_Last_",
      "USER_Email",
      "USER_Title",
      "USER_Addre",
      "USER_City",
      "USER_Count",
      "USER_State",
      "USER_Zip_C",
      "Country",
      "USER_Phone",
      "Revenue",
      "USER_Emplo",
      "USER_Sic_C",
      "USER_Indus",
    ];

    const filteredData = Object.entries(dataObject)
      .filter(([key]) => attributes.includes(key))
      .map(([key, value]) => `${key}: ${value}`)
      .join("<br/>");

    return filteredData;
  };

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

    newMap.on("click", function () {
      setIsPopupActive(false);
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
  }, [defaultLatitude, defaultLongitude, removeIcon]);

  const handleClick = (value) => {
    value !== "" ? setUserIndus(`USER_Indus='${value}'`) : setUserIndus("");
  };
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
    handleClick,
    flyTo,
    removeAllIcons,
  }));

  useEffect(() => {
    if(latLon[0] != '' || latLon[1] !='')
    {
      handleMapIconView(latLon[1], latLon[0])
    }
  }, [latLon]);

  useEffect(() => {
    if (map) {
      // Define the icon style for the marker
      const markerStyle = new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: `${iconRef.current}`,
          scale:0.1// Set the path to your icon image
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
              src: iconRef.current,
              scale:0.1// Use iconRef.current
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
            src: iconRef.current,
            scale:0.1// Use iconRef.current
          }),
        }),
      });

      // Add the feature to the marker layer
      if (markerLayer) {
        markerLayer.getSource().addFeature(markerFeature);
      }
    }
  };

  useEffect(() => {
    if (listItems?.length > 0) {
      handleMapClickAddress(listItems);
    }
  }, [listItems, selectItem]);
  const handleMapClickAddress = (values) => {
    if (selectItem !== "") {
      if (values?.length > 0) {
        const latitude = values[0]?.geometry?.coordinates[1];
        const longitude = values[0]?.geometry?.coordinates[0];
        handleLatAndLog(latitude, longitude);
        // Convert latitude and longitude to OpenLayers coordinates
        const clickedCoord = fromLonLat([longitude, latitude]);
        flyTo(clickedCoord, () => {});
        const markerLayer = markerLayerRef.current;
        if (markerLayer) {
          // Remove all existing features from the marker layer
          const markerLayerSource = markerLayer.getSource();

          if (markerLayerSource) {
            markerLayerSource.clear();

            // Create a feature with the clicked coordinates and icon
            const markerFeature = new Feature({
              geometry: new Point(clickedCoord),
              style: new Style({
                image: new Icon({
                  anchor: [0.5, 1],
                  src: iconRef.current, 
                  scale:0.1// Use iconRef.current
                }),
              }),
            });

            // Add the feature to the marker layer
            markerLayerSource.addFeature(markerFeature);
          } else {
            console.error("Marker layer source not initialized.");
          }
        } else {
          console.error("Marker layer not initialized.");
        }
      }
    }
  };
  const removeAllIcons = () => {
    const markerLayer = markerLayerRef.current;
    if (markerLayer) {
      const markerLayerSource = markerLayer.getSource();
      markerLayerSource.clear();
      setRemoveIcon(!removeIcon)
    } else {
      console.error("Marker layer not initialized.");
    }
  };
  
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
            src: `${iconRef.current}`,
            scale:0.1// Use iconRef.current
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
