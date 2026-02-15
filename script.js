document.addEventListener("DOMContentLoaded", function () {

/* ================= BASEMAP ================= */
const map = L.map("map").setView([-7.4,111.4],11);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
attribution:"© OpenStreetMap"
}).addTo(map);

/* ================= TAHUN ================= */
const tahun = document.getElementById("tahun");
const labelTahun = document.getElementById("labelTahun");
const prev = document.getElementById("prevTahun");
const next = document.getElementById("nextTahun");

labelTahun.innerHTML = tahun.value;

let geoLayer;

/* ================= WARNA ================= */
function getColor(d){
return d>50?'#084594':
d>30?'#2171b5':
d>20?'#4292c6':
d>10?'#6baed6':
d>0?'#9ecae1':'#f1f1f1';
}

function style(feature){
let field = "RTLH " + tahun.value;
let value = feature.properties[field] || 0;

return{
fillColor:getColor(value),
weight:1,
color:"#444",
fillOpacity:0.7
};
}

/* ================= LOAD DATA ================= */
function loadData(){

if(geoLayer) map.removeLayer(geoLayer);

fetch("data.geojson")
.then(res=>res.json())
.then(data=>{

geoLayer = L.geoJSON(data,{
style:style,
onEachFeature:(feature,layer)=>{
layer.bindPopup(
"<b>Desa :</b> " + feature.properties.Desa +
"<br><b>Kecamatan :</b> " + feature.properties.Kecamatan
);
}
}).addTo(map);

/* ZOOM KE LAYER */
map.fitBounds(geoLayer.getBounds());

})
.catch(err=>{
console.log("GeoJSON gagal:",err);
});
}

/* ================= EVENT ================= */
tahun.addEventListener("input",()=>{
labelTahun.innerHTML = tahun.value;
loadData();
});

prev.onclick=()=>{
if(tahun.value > tahun.min){
tahun.value--;
labelTahun.innerHTML = tahun.value;
loadData();
}
};

next.onclick=()=>{
if(tahun.value < tahun.max){
tahun.value++;
labelTahun.innerHTML = tahun.value;
loadData();
}
};

loadData();

});
