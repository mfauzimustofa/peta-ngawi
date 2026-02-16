var map = L.map('map').setView([-7.4,111.4], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  attribution:'© OpenStreetMap'
}).addTo(map);

let layerDesa;
let dataDesa;

let selectedTahun = 2025;

const rtlhText = document.getElementById("rtlhCount");
const slider = document.getElementById("tahunSlider");
const tahunLabel = document.getElementById("tahunLabel");


// ================= STYLE =================
function styleNormal(){
  return {
    color:"#3388ff",
    weight:1,
    fillOpacity:0.25
  };
}

function styleHighlight(){
  return {
    color:"red",
    weight:3,
    dashArray:"5,5",
    fillOpacity:0.05
  };
}


// ================= LOAD GEOJSON =================
fetch("data-bsps-rtlh.geojson")
.then(res=>res.json())
.then(data=>{

  dataDesa = data;

  layerDesa = L.geoJSON(data,{
    style: styleNormal,
    onEachFeature: onEachFeature
  }).addTo(map);

  isiDropdown(data);
  hitungData();

});


// ================= ON EACH FEATURE =================
function onEachFeature(feature,layer){

  layer.on("click",function(){

    desaDropdown.value = feature.properties.DESA;
    kecamatanDropdown.value = feature.properties.KECAMATAN;

    zoomToDesa(feature.properties.DESA);
    hitungData();

  });

}


// ================= ZOOM KECAMATAN =================
function zoomToKecamatan(namaKecamatan){

  resetStyle();

  let bounds = L.latLngBounds();
  let ada = false;

  layerDesa.eachLayer(layer=>{

    if(layer.feature.properties.KECAMATAN === namaKecamatan){

      bounds.extend(layer.getBounds());
      layer.setStyle(styleHighlight());
      ada = true;

    }

  });

  if(ada){
    map.fitBounds(bounds);
  }

}


// ================= ZOOM DESA =================
function zoomToDesa(namaDesa){

  resetStyle();

  layerDesa.eachLayer(layer=>{

    if(layer.feature.properties.DESA === namaDesa){

      layer.setStyle(styleHighlight());

      map.fitBounds(layer.getBounds(),{
        maxZoom:15
      });

    }

  });

}


// ================= RESET STYLE =================
function resetStyle(){
  layerDesa.setStyle(styleNormal);
}


// ================= DROPDOWN KECAMATAN =================
kecamatanDropdown.onchange = function(){

  let kecamatan = this.value;

  desaDropdown.value = "Semua";

  if(kecamatan === "Semua"){

    resetStyle();
    map.setView([-7.4,111.4],11);
    hitungData();
    return;

  }

  zoomToKecamatan(kecamatan);
  hitungData();

};


// ================= DROPDOWN DESA =================
desaDropdown.onchange = function(){

  let desa = this.value;

  if(desa === "Semua"){
    resetStyle();
    hitungData();
    return;
  }

  zoomToDesa(desa);
  hitungData();

};


// ================= HITUNG DATA =================
function hitungData(){

  let rtlh = 0;

  dataDesa.features.forEach(f => {

    if(kecamatanDropdown.value !== "Semua" &&
       f.properties.KECAMATAN !== kecamatanDropdown.value) return;

    if(desaDropdown.value !== "Semua" &&
       f.properties.DESA !== desaDropdown.value) return;

    rtlh += Number(f.properties["RTLH " + selectedTahun]) || 0;

  });

  rtlhText.textContent = rtlh;

}


// ================= SLIDER TAHUN =================
slider.oninput = function(){

  selectedTahun = this.value;
  tahunLabel.textContent = selectedTahun;

  hitungData();

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
