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
const tahunLabel = document.getElementById("tahunLabel");
const slider = document.getElementById("tahunSlider");


// LOAD GEOJSON
fetch("data-bsps-rtlh.geojson")
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

        wilayahTerklik = feature.properties.KECAMATAN;

        selectedKecamatan = feature.properties.KECAMATAN;
        document.getElementById("kecamatanDropdown").value = selectedKecamatan;

        selectedDesa = "Semua";
        document.getElementById("desaDropdown").value = "Semua";

        hitungData();

      });

    }

  }).addTo(map);

  hitungData();

});


// ISI DROPDOWN
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


// HITUNG DATA
function hitungData(){

  let rtlh = 0;

  dataGeojson.features.forEach(f => {

    if(selectedKecamatan !== "Semua" && f.properties.KECAMATAN !== selectedKecamatan) return;

    if(selectedDesa !== "Semua" && f.properties.DESA !== selectedDesa) return;

    if(wilayahTerklik && f.properties.KECAMATAN !== wilayahTerklik) return;

    rtlh += Number(f.properties["RTLH " + selectedTahun]) || 0;

  });

  rtlhText.textContent = rtlh;

}


// DROPDOWN KECAMATAN
kecamatanDropdown.onchange = function(){

  selectedKecamatan = this.value;
  wilayahTerklik = null;

  selectedDesa = "Semua";
  desaDropdown.value = "Semua";

  hitungData();
};


// DROPDOWN DESA
desaDropdown.onchange = function(){

  selectedDesa = this.value;
  hitungData();

};


// SLIDER TAHUN
slider.oninput = function(){

  selectedTahun = this.value;
  tahunLabel.textContent = selectedTahun;

  hitungData();
};


// TOMBOL NEXT
function nextYear(){

  if(selectedTahun < 2025){
    selectedTahun++;
    updateTahun();
  }

}


// TOMBOL PREV
function prevYear(){

  if(selectedTahun > 2021){
    selectedTahun--;
    updateTahun();
  }

}


// UPDATE TAHUN
function updateTahun(){

  slider.value = selectedTahun;
  tahunLabel.textContent = selectedTahun;

  hitungData();

}
