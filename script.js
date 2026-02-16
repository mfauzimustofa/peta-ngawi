var map = L.map('map').setView([-7.4,111.4], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  attribution:'© OpenStreetMap'
}).addTo(map);

let layerDesa;
let layerKecamatan;
let dataDesa;

let selectedTahun = 2025;
let selectedKecamatan = "Semua";
let selectedDesa = "Semua";
let wilayahTerklik = null;

const rtlhText = document.getElementById("rtlhCount");
const slider = document.getElementById("tahunSlider");
const tahunLabel = document.getElementById("tahunLabel");


// ================= LOAD DESA =================
fetch("data-bsps-rtlh.geojson")
.then(res=>res.json())
.then(data=>{

  dataDesa = data;

  layerDesa = L.geoJSON(data,{
    style:{ color:"#3388ff", weight:1, fillOpacity:0.25 },

    onEachFeature:function(feature,layer){

      layer.on("click",function(){

        wilayahTerklik = feature.properties.KECAMATAN;
        selectedKecamatan = feature.properties.KECAMATAN;

        kecamatanDropdown.value = selectedKecamatan;

        hitungData();

      });

    }
  });

  isiDropdown(data);

  hitungData();

});


// ================= LOAD KECAMATAN =================
fetch("kecamatan.geojson")
.then(res=>res.json())
.then(data=>{

  layerKecamatan = L.geoJSON(data,{
    style:{
      color:"yellow",
      weight:2,
      dashArray:"5,5",
      fillOpacity:0
    }
  });

  updateLayerByZoom();

});


// ================= ZOOM EVENT =================
map.on("zoomend", updateLayerByZoom);

function updateLayerByZoom(){

  if(map.getZoom() >= 13){

    map.removeLayer(layerKecamatan);
    map.addLayer(layerDesa);

  }else{

    map.removeLayer(layerDesa);
    map.addLayer(layerKecamatan);

    wilayahTerklik = null;
    selectedKecamatan = "Semua";
    selectedDesa = "Semua";

    kecamatanDropdown.value = "Semua";
    desaDropdown.value = "Semua";

    hitungData();
  }

}


// ================= HITUNG DATA =================
function hitungData(){

  let rtlh = 0;

  dataDesa.features.forEach(f => {

    if(selectedKecamatan !== "Semua" && f.properties.KECAMATAN !== selectedKecamatan) return;
    if(selectedDesa !== "Semua" && f.properties.DESA !== selectedDesa) return;
    if(wilayahTerklik && f.properties.KECAMATAN !== wilayahTerklik) return;

    rtlh += Number(f.properties["RTLH " + selectedTahun]) || 0;

  });

  rtlhText.textContent = rtlh;

}


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

kecamatanDropdown.onchange=function(){

  selectedKecamatan=this.value;
  wilayahTerklik=null;

  selectedDesa="Semua";
  desaDropdown.value="Semua";

  hitungData();
};

desaDropdown.onchange=function(){

  selectedDesa=this.value;
  hitungData();
};


// ================= SLIDER =================
slider.oninput=function(){

  selectedTahun=this.value;
  tahunLabel.textContent=selectedTahun;

  hitungData();
};


// ================= TOMBOL TAHUN =================
function nextYear(){
  if(selectedTahun<2025){ selectedTahun++; updateTahun(); }
}

function prevYear(){
  if(selectedTahun>2021){ selectedTahun--; updateTahun(); }
}

function updateTahun(){
  slider.value=selectedTahun;
  tahunLabel.textContent=selectedTahun;
  hitungData();
}
