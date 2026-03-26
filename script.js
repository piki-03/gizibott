const SUPABASE_URL = "https://unipgrkundayjaudznjn.supabase.co";
const SUPABASE_KEY = "sb_publishable_oV3aBukpqULi2fhILB8BpQ_h09lm8bQ";

// ================= AMBIL UID TERBARU =================
function ambilUIDTerbaru(){
    fetch(`${SUPABASE_URL}/rest/v1/log_rfid?select=uid&order=created_at.desc&limit=1`, {
        headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": "Bearer " + SUPABASE_KEY
        }
    })
    .then(res => res.json())
    .then(data => {
        if(data.length > 0){
            let uid = data[0].uid;
            ambilDataAnak(uid);
            ambilTinggi(uid);
        }
    });
}

// ================= DATA ANAK =================
function ambilDataAnak(uid){
    fetch(`${SUPABASE_URL}/rest/v1/anak?uid=eq.${uid}`, {
        headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": "Bearer " + SUPABASE_KEY
        }
    })
    .then(res => res.json())
    .then(data => {

        if(data.length === 0){
            alert("Data anak tidak ditemukan");
            return;
        }

        let anak = data[0];

        document.querySelector(".profile b").innerText = anak.nama;

        document.querySelector(".profile small").innerText =
            hitungUmur(anak.tanggal_lahir) + " Tahun • " + anak.tempat_lahir;

        document.querySelector(".profile .ortu").innerText =
            "Orang Tua: " + anak.nama_ortu;

        document.querySelector(".profile .text-muted").innerText =
            "UID: " + anak.uid;
    });
}

// ================= HITUNG UMUR =================
function hitungUmur(tanggal){
    let lahir = new Date(tanggal);
    let sekarang = new Date();

    let umur = sekarang.getFullYear() - lahir.getFullYear();
    return umur;
}

// ================= AMBIL TINGGI =================
function ambilTinggi(uid){
    fetch(`${SUPABASE_URL}/rest/v1/tinggi_badan?uid=eq.${uid}&order=created_at.desc&limit=1`, {
        headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": "Bearer " + SUPABASE_KEY
        }
    })
    .then(res => res.json())
    .then(data => {
        if(data.length > 0){
            let tinggi = data[0].tinggi;
            updateTinggi(tinggi);
        }
    });
}

// ================= UPDATE TINGGI =================
function updateTinggi(tinggi){
    const text = document.getElementById("tinggi");
    const bar = document.getElementById("bar");

    text.innerHTML = tinggi + " cm";

    let persen = (tinggi / 140) * 100;
    bar.style.width = persen + "%";

    if(tinggi >= 110){
        bar.className = "progress-bar bg-success";
        text.style.color = "#27AE60";
    }
    else if(tinggi >= 90){
        bar.className = "progress-bar bg-warning";
        text.style.color = "#F39C12";
    }
    else{
        bar.className = "progress-bar bg-danger";
        text.style.color = "#E74C3C";
    }
}

// ================= AUTO REFRESH =================
setInterval(() => {
    ambilUIDTerbaru();
}, 3000);

// ================= CHART =================
let data = [80, 95, 105, 115, 120];
let chart = document.getElementById("chart");

if(chart){
    data.forEach(val=>{
        let bar = document.createElement("div");
        bar.className = "bar";
        bar.style.height = val + "px";
        chart.appendChild(bar);
    });
}

// ================= NAV =================
function setActive(el){
    document.querySelectorAll(".nav-item").forEach(i=>i.classList.remove("active"));
    el.classList.add("active");
}

function goTodata(){
    window.location.href = "data.html";
}

// ================= GIZI =================
function kirimGizi(mode, event){

    document.querySelectorAll(".menu-btn").forEach(btn=>{
        btn.classList.remove("active");
    });

    let tombol = event.currentTarget;
    tombol.classList.add("active");

    console.log("Simulasi pilih Gizi " + mode);
}

// ================= PDF =================
function downloadPDF(){
    const element = document.querySelector(".card-pro:nth-of-type(2)");

    let opt = {
        margin: 0.5,
        filename: 'data-anak.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
}