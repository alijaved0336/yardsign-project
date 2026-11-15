import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
  useContext,
} from "react";
import "ol/ol.css";
import Map from "ol/Map";
import View from "ol/View";
import TileLayer from "ol/layer/Tile";
import StadiaMaps from "ol/source/StadiaMaps.js";
import GeoJSON from "ol/format/GeoJSON";
import { transform } from "ol/proj";
import Geolocation from "ol/Geolocation.js";
import Modify from "ol/interaction/Modify";
import { fromLonLat, toLonLat } from "ol/proj";
import { Text,Icon, Fill } from "ol/style";
import { Vector as VectorLayer } from "ol/layer";
import { OSM, Vector as VectorSource } from "ol/source";
import { Point } from "ol/geom";
import Feature from "ol/Feature";
import { Style } from "ol/style";
import axios from "axios";
import { useMemo } from "react";
import Axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ApiConfig from "../config/ApiConfig";

const MapLayer = (props, ref) => {
  const {
    latLon,
    setopenBox,
    handleDefaultMap,
    resetCall,
    setCompanyDetails,
    updateCheck,
  } = props;
  const [map, setMap] = useState(null);
  const [yardSigns, setYardSigns] = useState([]);
  const [defaultLatitude, setDefaultLatitude] = useState(null);
  const [sectorId, setSectorId] = useState(0);
  const [defaultLongitude, setDefaultLongitude] = useState(null);
  const [sectorList, setSectorList] = useState([]);
  const [defaultZoom, setdefaultZoom] = useState(null);
  const [geolocation, setGeolocation] = useState(null);
  const [popupContent, setPopupContent] = useState("");
  const [open, setOpen] = React.useState(false);
  const updateCheckRef = useRef(updateCheck);
  const originalCoordinatesRef = useRef(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const vectorLayerRef = useRef(null);
  const navigate = useNavigate();

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const userIndusRef = useRef("");
  const userSectorRef = useRef("");
  const target = document.getElementById("map");

  const computedFeatures = useMemo(() => {
    if (yardSigns.length < 1 || sectorList.length < 1) return null;
  
    const iconFeatures = yardSigns
      .map((yardSign) => {
        const  coordinates  = yardSign.geometry?.coordinates;
        const { address, company_name, sector_name, category_name, sector, user_id } =
          yardSign.properties;
        const matchedSector = sectorList.find(
          (sector) => sector.sector_name === yardSign.properties.sector_name
        );
        const iconFeature = new Feature({
          geometry: coordinates?new Point(fromLonLat(coordinates)):"",
          id: yardSign["id"],
          name: company_name,
          user_id: user_id,
          sector: sector_name,
          category: category_name,
          sector_id: sector,
          address: address,
        });
        const iconStyle = new Style({
          image: new Icon({
            anchor: [0.2, 5],
            anchorXUnits: "fraction",
            anchorYUnits: "pixels",
            src: `${process.env.REACT_APP_BACKEND_DJANGO_URL}${
              matchedSector ? matchedSector.logo : "images/locationIcon"
            }`,
            scale: 0.05,
          }),
          text: new Text({
            text:iconFeature.values_.name,
            font:"10px Arial",
            fill : new Fill ({color :"#000"}),
            offsetY:40,
            textAlign :"center",
            offsetX:18
          })
        });
  
        iconFeature.setStyle(iconStyle);
  
        return iconFeature;
      })
      .filter((feature) => feature !== null);
  
    const filteredFeatures =
      sectorId > 0
        ? iconFeatures.filter((i) => i.values_.sector_id == sectorId)
        : iconFeatures;
  
    return filteredFeatures;
  }, [yardSigns, sectorList, sectorId]);
  
 
  useEffect(() => {
    updateCheckRef.current = updateCheck;
  }, [updateCheck]);

  const getSectorData = async (values) => {
    try {
      const res = await Axios.get(ApiConfig.sectorlist, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (res.status === 200 || res.status === 201) {
        setSectorList(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const updateYardSignCoordinates = async (idStr, coordinates) => {
    const [longitude, latitude] = toLonLat(coordinates);

    const id = Number(idStr.split(".")[1]);
    const raw = JSON.stringify({
      id: id,
      latitude: latitude,
      longitude: longitude,
    });
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append('X-CSRFToken', getCookie('csrftoken'));
    const requestOptions = {
      method: "PUT",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        ApiConfig.uploadmultiplefile,
        requestOptions
      );
      if (response.status === 200) {
        toast.success("Address of this yardsign is updated successfully.");
      }
    } catch (error) {
      toast.error("User must be admin to perform this functionality.");
      console.error(error);
    }
  };
  const storageLatitude = localStorage.getItem("latitude");
  const storageLongitude = localStorage.getItem("longitude");
  useEffect(() => {
    if (
      localStorage.getItem("latitude") &&
      localStorage.getItem("longitude") &&
      localStorage.getItem("zoomValue")
    ) {
      setDefaultLatitude(localStorage.getItem("latitude"));
      setDefaultLongitude(localStorage.getItem("longitude"));
      setdefaultZoom(localStorage.getItem("zoomValue"));
    } else {
      setDefaultLatitude(42.3601);
      setDefaultLongitude(-71.0589);
      setdefaultZoom(9);
      localStorage.setItem("latitude", 42.3601);
      localStorage.setItem("longitude", -71.0589);
      localStorage.setItem("zoomValue", 10);
    }
  }, [storageLatitude, storageLongitude, resetCall]);

  useEffect(() => {
    if (map) {
      const view = map.getView();
      const onViewChange = () => {
        const center = view.getCenter();
        const [lon, lat] = toLonLat(center);
        const zoom = view.getZoom();

        handleDefaultMap({ latitude: lat, longitude: lon, zoomValue: zoom });
      };

      view.on("change:center", onViewChange);

      return () => {
        view.un("change:center", onViewChange);
      };
    }
  }, [map]);

  useEffect(() => {
    if (latLon) {
      flyTo(fromLonLat(latLon), () => {});
    }
  }, [latLon]);

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
  
  useEffect(() => {
    getSectorData();
  }, []);

  useEffect(()=>
  {
    if(map)
    {
      map.on("click", async function (evt) {
        map.forEachFeatureAtPixel(evt.pixel, async function (feature) {
          const user_id= feature.values_.user_id;
          try {
            const resp = await fetch(ApiConfig.userFromId, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
              },
              body: JSON.stringify({ id: user_id }),
            });
            
            const res = await resp.json();
              
             const values=res.company_website
             if (values) {
              let url;
              if (values.includes("http://") || values.includes("https://")) {
                url = values;
              } else {
                url = `http://${encodeURIComponent(values)}`;
              }
              window.open(url, "_blank");
            
            }
          } catch (error) {
            console.error(error);
          }
        });
      });
    }
  },[map])
  
  
  useEffect(() => {
    if (map && computedFeatures) {
      let zoom;
    

      const view = map.getView();

      const updateLayerVisibility = () => {
        zoom = view.getZoom();

        if (vectorLayerRef.current) {
          map.removeLayer(vectorLayerRef.current);
        }

        if (zoom < 14) {
          computedFeatures.forEach((feature) => {
              feature.getStyle().getText().setText( '');
          });
        }
        else
        {
          computedFeatures.forEach((feature) => {
            const name = feature.get('name');
            if (name) {
              feature.getStyle().getText().setText(name);
            }
          });
        }
          const vectorSource = new VectorSource({
            features: computedFeatures ,
          });

          const vectorLayer = new VectorLayer({
            source: vectorSource,
          });

          map.addLayer(vectorLayer);
          vectorLayerRef.current = vectorLayer;

      const modify = new Modify({
        hitDetection: vectorLayer,
        source: vectorSource,
      });
  
      modify.on(["modifystart", "modifyend"], function (evt) {
        const modifiedFeature = evt.features.getArray()[0];
        const geometry = modifiedFeature.getGeometry();
        const coordinates = geometry.getCoordinates();
  
        if (evt.type === "modifystart") {
          originalCoordinatesRef.current = coordinates.slice();
  
          if (!updateCheckRef.current) {
            setopenBox(true);
            localStorage.setItem("modalShown", true);
          }
        }
        if (evt.type === "modifyend") {
          if (updateCheckRef.current) {
            updateYardSignCoordinates(modifiedFeature.get("id"), coordinates);
          } else {
            if (originalCoordinatesRef.current) {
              geometry.setCoordinates(originalCoordinatesRef.current);
            }
          }
        }
  
        target.style.cursor =
          evt.type === "modifystart" ? "grabbing" : "pointer";
      });
  
      map.addInteraction(modify);
        
      };
      view.on("change:resolution", updateLayerVisibility);
      updateLayerVisibility();

      return () => view.un("change:resolution", updateLayerVisibility);
    }
  }, [map, computedFeatures]);

  useEffect(() => {
    const handlePostRequest = async () => {
      try {
        const response = await axios.post(
          "https://yardsignproshop.com:8081/geoserver/yard_sign/ows?service=WFS&version=2.0.0&request=GetFeature&typeName=yard_sign:yard_db_local&outputFormat=application/json",
          new URLSearchParams({}).toString(),
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        setYardSigns(response.data.features);
      } catch (err) {
        console.error(err);
      }
    };

    handlePostRequest();
    const newMap = new Map({
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
      target: target,
      view: new View({
        center: [-7899999, 5200000] ,
        zoom: 9   
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

    setMap(newMap);
    return () => {
      newMap.setTarget("");
      geolocationObj.setTracking(false);
    };
  }, [defaultLatitude, defaultLongitude]);

  const handleClick = (cateId, sectorId) => {
    setSectorId(sectorId);
  };
  const flyTo = (location, done) => {
    const view = map?.getView();
    if (view) {
      const duration = 2000;
      const zoom = 16;

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
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {},
          (error) => {
            console.error("Error getting location:", error);
            if (error.code === error.PERMISSION_DENIED) {
              alert("Please allow location access and try again.");
            }
          }
        );
      } else {
        alert("Geolocation is not supported by your browser.");
      }
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
  }));

  return (
    <>
      <div id="map" style={{ width: "100%", height: "100%" }} />

      {/* {isPopupActive && (
            <div className={`popup-box ${isPopupActive ? "active" : ""}`}>
              <p dangerouslySetInnerHTML={{ __html: popupContent }} />
            </div>
          )} */}
    </>
  );
};
export default forwardRef(MapLayer);