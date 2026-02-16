var map = L.map('map').setView([-7.4,111.4], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let layerDesa;
let allDesaFeatures;

let selectedFeatureLayer = null;


// ================= LOAD GEOJSON =================
fetch("data-bsps-rtlh.geojson")
.then(res=>res.json())
.then(data=>{

  allDesaFeatures = data;

  layerDesa = L.geoJSON(data,{
    style: defaultStyle,
    onEachFeature: onEachFeature
  }).addTo(map);

  isiDropdown(data);
});


// ================= STYLE =================
function defaultStyle(){
  return {
    color:"#3388ff",
    weight:1,
    fillOpacity:0.25
  };
}

function highlightStyle(){
  return {
    color:"red",
    weight:3,
    dashArray:"5,5",
    fillOpacity:0.1
  };
}


// ================= ON EACH FEATURE =================
function onEachFeature(feature,layer){

  layer.on("click", function(){

    zoomToFeature(layer);

    kecamatanDropdown.value = feature.properties.KECAMATAN;
    desaDropdown.value = feature.properties.DESA;

  });

}


// ================= ZOOM KE FEATURE =================
function zoomToFeature(layer){

  if(selectedFeatureLayer){
    layerDesa.resetStyle(selectedFeatureLayer);
  }

  selectedFeatureLayer = layer;

  layer.setStyle(highlightStyle());

  map.fitBounds(layer.getBounds(),{
    maxZoom:15
  });

}


// ================= DROPDOWN KECAMATAN =================
kecamatanDropdown.onchange = function(){

  let kecamatan = this.value;

  desaDropdown.value = "Semua";

  layerDesa.eachLayer(layer=>{

    if(layer.feature.properties.KECAMATAN === kecamatan){

      zoomToFeature(layer);

    }

  });

};


// ================= DROPDOWN DESA =================
desaDropdown.onchange = function(){

  let desa = this.value;

  layerDesa.eachLayer(layer=>{

    if(layer.feature.properties.DESA === desa){

      zoomToFeature(layer);

    }

  });

};


// ================= ISI DROPDOWN =================
function isiDropdown(data){

  let kec = new Set();
  let desa = new Set();

  data.features.forEach(f=>{
    kec.add(f.properties.KECAMATAN);
    desa.add(f.properties.DESA);
  });

  kec.forEach(k=>{
    kecamatanDropdown.innerHTML += `<option value="${k}">${k}</option>`;
  });

  desa.forEach(d=>{
    desaDropdown.innerHTML += `<option value="${d}">${d}</option>`;
  });

}
