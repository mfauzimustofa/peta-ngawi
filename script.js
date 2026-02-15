document.addEventListener("DOMContentLoaded", function () {

const map = L.map("map").setView([-7.4,111.4],11);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
attribution:"© OpenStreetMap"
}).addTo(map);

/* RANGE TAHUN */
const tahun = document.getElementById("tahun");
tahun.min = 2021;
tahun.max = 2025;
tahun.value = 2025;

const labelTahun = document.getElementById("labelTahun");
const prev = document.getElementById("prevTahun");
const next = document.getElementById("nextTahun");

labelTahun.innerHTML = tahun.value;

let geoLayer;
let geoData;

/* WARNA */
function getColor(d){
return d>50?'#084594':
d>30?'#2171b5':
d>20?'#4292c6':
d>10?'#6baed6':
d>0?'#9ecae1':'#f1f1f1';
}

/* STYLE DINAMIS */
function style(feature){

let field = "RTLH " + tahun.value;

if(!(field in feature.properties)){
console.log("FIELD TIDAK ADA:",field);
}

let value = feature.properties[field] || 0;

return{
fillColor:getColor(value),
weight:1,
color:"#444",
fillOpacity:0.7
};
}

/* LOAD GEOJSON SEKALI SAJA */
fetch("data.geojson")
.then(res=>res.json())
.then(data=>{

geoData = data;

geoLayer = L.geoJSON(geoData,{
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
console.log("Gagal load geojson:",err);
});

/* UPDATE STYLE TANPA RELOAD LAYER */
function updateMap(){
labelTahun.innerHTML = tahun.value;
geoLayer.setStyle(style);
}

/* EVENT */
tahun.addEventListener("input",updateMap);

prev.onclick=()=>{
tahun.stepDown();
updateMap();
};

next.onclick=()=>{
tahun.stepUp();
updateMap();
};

});
