document.addEventListener("DOMContentLoaded", function () {

const map = L.map("map").setView([-7.4,111.4],11);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

const jenis = document.getElementById("jenis");
const tahun = document.getElementById("tahun");
const labelTahun = document.getElementById("labelTahun");

labelTahun.innerHTML = tahun.value;

tahun.addEventListener("input",()=>{
  labelTahun.innerHTML = tahun.value;
  loadData();
});

jenis.addEventListener("change",loadData);

let geoLayer;

function getColor(d){
return d>50?'#084594':
d>30?'#2171b5':
d>20?'#4292c6':
d>10?'#6baed6':
d>0?'#9ecae1':'#f1f1f1';
}

function style(feature){
let field = jenis.value+" "+tahun.value;
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

fetch("data-bsps-rtlh.geojson")
.then(res=>res.json())
.then(data=>{

geoLayer = L.geoJSON(data,{
style:style
}).addTo(map);

});

}

loadData();

});
