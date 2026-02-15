document.addEventListener("DOMContentLoaded", function () {

const map = L.map("map").setView([-7.4,111.4],11);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
attribution:"© OpenStreetMap"
}).addTo(map);

const tahun = document.getElementById("tahun");
const labelTahun = document.getElementById("labelTahun");
const prev = document.getElementById("prevTahun");
const next = document.getElementById("nextTahun");

labelTahun.innerHTML = tahun.value;

let geoLayer;

/* WARNA */
function getColor(d){
return d>50?'#084594':
d>30?'#2171b5':
d>20?'#4292c6':
d>10?'#6baed6':
d>0?'#9ecae1':'#f1f1f1';
}

function style(feature){

let field = "RTLH " + tahun.value;

/* CEK FIELD ADA ATAU TIDAK */
if(!feature.properties[field]){
console.log("Field tidak ada:",field);
}

let value = feature.properties[field] || 0;

return{
fillColor:getColor(value),
weight:1,
color:"#444",
fillOpacity:0.7
};
}

function loadData(){

if(geoLayer) map.removeLayer(geoLayer);

fetch("data.geojson")
.then(res=>res.json())
.then(data=>{

console.log("GeoJSON berhasil load");

geoLayer = L.geoJSON(data,{
style:style,
onEachFeature:(feature,layer)=>{

let desa = feature.properties.Desa || feature.properties.desa || "-";
let kec = feature.properties.Kecamatan || feature.properties.kecamatan || "-";

layer.bindPopup(
"<b>Desa:</b> "+desa+"<br><b>Kecamatan:</b> "+kec
);

}
}).addTo(map);

map.fitBounds(geoLayer.getBounds());

})
.catch(err=>{
console.log("GeoJSON gagal:",err);
});
}

/* EVENT */
tahun.addEventListener("input",()=>{
labelTahun.innerHTML = tahun.value;
loadData();
});

prev.onclick=()=>{
tahun.stepDown();
labelTahun.innerHTML = tahun.value;
loadData();
};

next.onclick=()=>{
tahun.stepUp();
labelTahun.innerHTML = tahun.value;
loadData();
};

loadData();

});
