document.addEventListener("DOMContentLoaded", function(){

var map = L.map('map').setView([-7.4,111.4], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

let layerDesa;
let dataDesa;
let wilayahAktif = null;
let selectedTahun = 2025;

const slider = document.getElementById("tahunSlider");
const tahunLabel = document.getElementById("tahunLabel");
const kecamatanDropdown = document.getElementById("kecamatanDropdown");
const desaDropdown = document.getElementById("desaDropdown");


// ================= LOAD GEOJSON =================
fetch("data-bsps-rtlh.geojson")
.then(res=>res.json())
.then(data=>{

  dataDesa = data;

  layerDesa = L.geoJSON(data,{
    style:{color:"#3388ff",weight:1,fillOpacity:0.25},
    onEachFeature:onEachFeature
  }).addTo(map);

  isiDropdown(data);
  hitungKabupaten();

});


// ================= DROPDOWN =================
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


// ================= KLIK DESA =================
function onEachFeature(feature,layer){

  layer.on("click",function(){

    wilayahAktif = feature.properties;

    kecamatanDropdown.value = feature.properties.KECAMATAN;
    desaDropdown.value = feature.properties.DESA;

    tampilkanInfo(wilayahAktif);

  });

}


// ================= INFO BOX =================
function tampilkanInfo(props){

  document.getElementById("infoBox").style.display="block";

  document.getElementById("infoWilayah").textContent =
    props.DESA + " - " + props.KECAMATAN;

  document.getElementById("infoDesa").textContent = props.DESA;

  document.getElementById("infoRTLH").textContent =
    props["RTLH " + selectedTahun] || 0;

  document.getElementById("infoTahun").textContent = selectedTahun;

}


// ================= HITUNG KABUPATEN =================
function hitungKabupaten(){

  let total = 0;

  dataDesa.features.forEach(f=>{
    total += Number(f.properties["RTLH " + selectedTahun]) || 0;
  });

  document.getElementById("infoBox").style.display="block";

  document.getElementById("infoWilayah").textContent = "KABUPATEN NGAWI";
  document.getElementById("infoDesa").textContent = "-";
  document.getElementById("infoRTLH").textContent = total;
  document.getElementById("infoTahun").textContent = selectedTahun;

}


// ================= DROPDOWN KECAMATAN =================
kecamatanDropdown.onchange = function(){

  let kec = this.value;
  desaDropdown.value = "Semua";

  if(kec==="Semua"){
    map.setView([-7.4,111.4],11);
    wilayahAktif = null;
    hitungKabupaten();
    return;
  }

  let bounds = L.latLngBounds();

  layerDesa.eachLayer(layer=>{
    if(layer.feature.properties.KECAMATAN===kec){
      bounds.extend(layer.getBounds());
    }
  });

  map.fitBounds(bounds);

};


// ================= DROPDOWN DESA =================
desaDropdown.onchange = function(){

  let desa = this.value;

  if(desa==="Semua"){
    wilayahAktif = null;
    hitungKabupaten();
    return;
  }

  layerDesa.eachLayer(layer=>{

    if(layer.feature.properties.DESA===desa){

      map.fitBounds(layer.getBounds());

      wilayahAktif = layer.feature.properties;
      tampilkanInfo(wilayahAktif);

    }

  });

};


// ================= SLIDER =================
slider.oninput = function(){

  selectedTahun = parseInt(this.value);
  tahunLabel.textContent = selectedTahun;

  if(wilayahAktif){
    tampilkanInfo(wilayahAktif);
  }else{
    hitungKabupaten();
  }

};


// ================= TOMBOL TAHUN =================
window.prevYear = function(){
  if(selectedTahun>2021){
    selectedTahun--;
    updateTahun();
  }
}

window.nextYear = function(){
  if(selectedTahun<2025){
    selectedTahun++;
    updateTahun();
  }
}

function updateTahun(){
  slider.value = selectedTahun;
  tahunLabel.textContent = selectedTahun;

  if(wilayahAktif){
    tampilkanInfo(wilayahAktif);
  }else{
    hitungKabupaten();
  }
}

});
