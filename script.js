document.addEventListener("DOMContentLoaded", function () {

const map = L.map("map").setView([-7.4,111.4],11);

map.createPane("labels");
map.getPane("labels").style.zIndex = 650;

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

const jenis = document.getElementById("jenis");
const tahun = document.getElementById("tahun");
const labelTahun = document.getElementById("labelTahun");
const filterKecamatan = document.getElementById("filterKecamatan");
const filterDesa = document.getElementById("filterDesa");

let geoLayer;
let labelLayer;
let highlighted=[];
let dataDesaPerKecamatan={};

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
highlighted.forEach(l=>geoLayer.resetStyle(l));
highlighted=[];
}

function highlight(layer){
layer.setStyle({
color:"red",
weight:3,
dashArray:"6,6"
});
highlighted.push(layer);
}

/* ================= HITUNG TOTAL KECAMATAN ================= */
function getTotalKecamatan(namaKecamatan){

let totalRTLH = 0;
let totalBSPS = 0;

geoLayer.eachLayer(l=>{

if(l.feature.properties.KECAMATAN === namaKecamatan){

totalRTLH += l.feature.properties["RTLH "+tahun.value] || 0;
totalBSPS += l.feature.properties["BSPS "+tahun.value] || 0;

}

});

return {rtlh:totalRTLH, bsps:totalBSPS};
}

/* ================= POPUP DESA ================= */
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

/* ================= UPDATE POPUP OTOMATIS ================= */
function updatePopupContent(){

if(!map._popup) return;

let content = map._popup.getContent();

/* popup kecamatan */
if(content.includes("KECAMATAN")){

let namaKec = content.match(/KECAMATAN (.*)<\/b>/)[1];
let total = getTotalKecamatan(namaKec);

map._popup.setContent(`
<b>KECAMATAN ${namaKec}</b>
<hr>
RTLH ${tahun.value} : <b>${total.rtlh}</b><br>
BSPS ${tahun.value} : <b>${total.bsps}</b>
`);

}

/* popup desa */
else{

let layer = map._popup._source;

if(layer && layer.feature){
layer.setPopupContent(popupContent(layer.feature));
}

}

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

let teks=`
<b>Desa ${l.feature.properties.DESA}</b><br>
Kecamatan ${l.feature.properties.KECAMATAN}<br>
${jumlah}
`;

labelLayer.addLayer(
L.marker(center,{
pane:"labels",
interactive:false,
icon:L.divIcon({
className:"label-jumlah",
html:teks
})
})
);

});

labelLayer.addTo(map);
}
}

/* ================= LOAD GEOJSON ================= */
fetch("data-bsps-rtlh.geojson")
.then(res=>res.json())
.then(data=>{

geoLayer=L.geoJSON(data,{
style:style,
onEachFeature:(feature,layer)=>{

let kec=feature.properties.KECAMATAN;
let desa=feature.properties.DESA;

if(!dataDesaPerKecamatan[kec]){
dataDesaPerKecamatan[kec]=[];
filterKecamatan.innerHTML+=`<option value="${kec}">${kec}</option>`;
}

dataDesaPerKecamatan[kec].push({nama:desa,kec:kec});

/* klik desa */
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

/* ================= EVENT ================= */

map.on("zoomend",updateLabel);

jenis.onchange=()=>{
geoLayer.setStyle(style);
updateLabel();
updatePopupContent();
};

tahun.oninput=()=>{
labelTahun.innerHTML=tahun.value;
geoLayer.setStyle(style);
updateLabel();
updatePopupContent();
};

/* ================= FILTER KECAMATAN ================= */
filterKecamatan.onchange=function(){

resetHighlight();
filterDesa.innerHTML='<option value="">Pilih Desa</option>';

let layers=[];
let namaKec=this.value;

geoLayer.eachLayer(l=>{
if(l.feature.properties.KECAMATAN===namaKec){
highlight(l);
layers.push(l);
}
});

let total=getTotalKecamatan(namaKec);

dataDesaPerKecamatan[namaKec].forEach(d=>{
filterDesa.innerHTML+=`
<option value="${d.nama}|${d.kec}">
${d.nama} (${d.kec})
</option>`;
});

let bounds=L.featureGroup(layers).getBounds();
map.flyToBounds(bounds,{duration:0.7});

setTimeout(()=>{

L.popup()
.setLatLng(bounds.getCenter())
.setContent(`
<b>KECAMATAN ${namaKec}</b>
<hr>
RTLH ${tahun.value} : <b>${total.rtlh}</b><br>
BSPS ${tahun.value} : <b>${total.bsps}</b>
`)
.openOn(map);

updateLabel();

},700);

};

/* ================= FILTER DESA ================= */
filterDesa.onchange=function(){

resetHighlight();

let [desaNama,desaKec]=this.value.split("|");

geoLayer.eachLayer(l=>{

if(
l.feature.properties.DESA===desaNama &&
l.feature.properties.KECAMATAN===desaKec
){

highlight(l);

map.flyToBounds(l.getBounds(),{duration:0.7});

setTimeout(()=>{
l.bindPopup(popupContent(l.feature)).openPopup();
updateLabel();
},700);

}

});

};

});
