document.addEventListener("DOMContentLoaded", function(){

const map = L.map('map').setView([-7.4,111.4],11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const jenis = document.getElementById("jenis");
const tahun = document.getElementById("tahun");
const labelTahun = document.getElementById("labelTahun");
const filterKecamatan = document.getElementById("filterKecamatan");
const filterDesa = document.getElementById("filterDesa");

let geoLayer,labelLayer,dataGeojson;
let dataDesaPerKecamatan={};
let highlightedLayers=[];

labelTahun.innerHTML=tahun.value;

/* ================= WARNA ================= */
function getColor(d){
return d>50?'#084594':
d>30?'#2171b5':
d>20?'#4292c6':
d>10?'#6baed6':
d>0?'#9ecae1':'#f1f1f1';
}

function style(feature){
let field=jenis.value+" "+tahun.value;
let value=feature.properties[field]||0;

return{
fillColor:getColor(value),
weight:1,
color:"#444",
fillOpacity:0.7
};
}

/* ================= HIGHLIGHT ================= */
function resetHighlight(){
highlightedLayers.forEach(l=>geoLayer.resetStyle(l));
highlightedLayers=[];
}

function highlight(layer){
layer.setStyle({
color:"yellow",
weight:3,
dashArray:"6,6",
fillOpacity:0.9
});
highlightedLayers.push(layer);
}

/* ================= POPUP ================= */
function popupContent(f){

let thn=tahun.value;

return `
<b>${f.properties.DESA}</b><br>
Kecamatan ${f.properties.KECAMATAN}
<hr>
RTLH ${thn} : <b>${f.properties["RTLH "+thn]||0}</b><br>
BSPS ${thn} : <b>${f.properties["BSPS "+thn]||0}</b>
`;
}

/* ================= LABEL ================= */
function updateLabel(){

if(labelLayer) map.removeLayer(labelLayer);

labelLayer=L.layerGroup();

if(map.getZoom()>=13){

let field=jenis.value+" "+tahun.value;

geoLayer.eachLayer(l=>{

let center=l.getBounds().getCenter();
let jumlah=l.feature.properties[field]||0;

labelLayer.addLayer(
L.marker(center,{
interactive:false,
icon:L.divIcon({
className:"label-jumlah",
html:jumlah
})
})
);

});

labelLayer.addTo(map);
}

}

/* ================= LOAD DATA ================= */
fetch("data-bsps-rtlh.geojson")
.then(res=>res.json())
.then(data=>{

dataGeojson=data;

geoLayer=L.geoJSON(data,{
style:style,
onEachFeature:(feature,layer)=>{

let kec=feature.properties.KECAMATAN;
let desa=feature.properties.DESA;

if(!dataDesaPerKecamatan[kec]){
dataDesaPerKecamatan[kec]=[];
filterKecamatan.innerHTML+=`<option value="${kec}">${kec}</option>`;
}

dataDesaPerKecamatan[kec].push(desa);

layer.on("click",()=>{
resetHighlight();
highlight(layer);

map.flyToBounds(layer.getBounds(),{duration:0.7});

setTimeout(()=>{
layer.bindPopup(popupContent(feature)).openPopup();
updateLabel();
},700);

});

}
}).addTo(map);

map.fitBounds(geoLayer.getBounds());
updateLabel();

});

/* ================= ZOOM EVENT ================= */
map.on("zoomend",updateLabel);

/* ================= DROPDOWN KECAMATAN ================= */
filterKecamatan.onchange=function(){

resetHighlight();

filterDesa.innerHTML='<option value="">Pilih Desa</option>';

let layers=[];

geoLayer.eachLayer(l=>{
if(l.feature.properties.KECAMATAN===this.value){
highlight(l);
layers.push(l);
}
});

dataDesaPerKecamatan[this.value].forEach(d=>{
filterDesa.innerHTML+=`<option value="${d}">${d}</option>`;
});

map.flyToBounds(L.featureGroup(layers).getBounds(),{duration:0.7});

setTimeout(updateLabel,700);

};

/* ================= DROPDOWN DESA ================= */
filterDesa.onchange=function(){

resetHighlight();

geoLayer.eachLayer(l=>{
if(l.feature.properties.DESA===this.value){

highlight(l);

map.flyToBounds(l.getBounds(),{duration:0.7});

setTimeout(()=>{
l.bindPopup(popupContent(l.feature)).openPopup();
updateLabel();
},700);

}
});

};

/* ================= FILTER ================= */
jenis.onchange=()=>{geoLayer.setStyle(style);updateLabel();}
tahun.oninput=()=>{labelTahun.innerHTML=tahun.value;geoLayer.setStyle(style);updateLabel();}

});
