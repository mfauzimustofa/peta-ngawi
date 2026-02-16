var map = L.map('map').setView([-7.4,111.4], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  attribution:'© OpenStreetMap'
}).addTo(map);

let dataGeojson;
let selectedTahun = 2025;
let selectedKecamatan = "Semua";
let selectedDesa = "Semua";
let wilayahTerklik = null;

const rtlhText = document.getElementById("rtlhCount");
const bspsText = document.getElementById("bspsCount");

fetch("data.geojson")
.then(res=>res.json())
.then(data=>{

  dataGeojson = data;

  isiDropdown(data);

  L.geoJSON(data,{
    style:{
      color:"#3388ff",
      weight:1,
      fillOpacity:0.2
    },

    onEachFeature:function(feature,layer){

      layer.on("click",function(){

        wilayahTerklik = feature.properties.kecamatan;

        selectedKecamatan = feature.properties.kecamatan;
        document.getElementById("kecamatanDropdown").value = selectedKecamatan;

        hitungData();

      });

    }

  }).addTo(map);

  hitungData();

});

function isiDropdown(data){

  let kec = new Set();
  let desa = new Set();

  data.features.forEach(f=>{
    kec.add(f.properties.kecamatan);
    desa.add(f.properties.desa);
  });

  kec.forEach(k=>{
    kecamatanDropdown.innerHTML += `<option value="${k}">${k}</option>`;
  });

  desa.forEach(d=>{
    desaDropdown.innerHTML += `<option value="${d}">${d}</option>`;
  });

}

function hitungData(){

  let rtlh = 0;
  let bsps = 0;

  dataGeojson.features.forEach(f=>{

    if(selectedKecamatan !== "Semua" && f.properties.kecamatan !== selectedKecamatan) return;

    if(selectedDesa !== "Semua" && f.properties.desa !== selectedDesa) return;

    if(wilayahTerklik && f.properties.kecamatan !== wilayahTerklik) return;

    rtlh += Number(f.properties["rtlh_"+selectedTahun]) || 0;
    bsps += Number(f.properties["bsps_"+selectedTahun]) || 0;

  });

  rtlhText.textContent = rtlh;
  bspsText.textContent = bsps;

}

kecamatanDropdown.onchange=function(){
  selectedKecamatan=this.value;
  wilayahTerklik=null;
  hitungData();
}

desaDropdown.onchange=function(){
  selectedDesa=this.value;
  hitungData();
}

tahunSlider.oninput=function(){
  selectedTahun=this.value;
  document.getElementById("tahunLabel").textContent=selectedTahun;
  hitungData();
}

function nextYear(){
  if(selectedTahun<2025){
    selectedTahun++;
    updateTahun();
  }
}

function prevYear(){
  if(selectedTahun>2021){
    selectedTahun--;
    updateTahun();
  }
}

function updateTahun(){
  tahunSlider.value=selectedTahun;
  document.getElementById("tahunLabel").textContent=selectedTahun;
  hitungData();
}
