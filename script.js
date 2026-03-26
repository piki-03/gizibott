const SUPABASE_URL = "https://unipgrkundayjaudznjn.supabase.co";
const SUPABASE_KEY = "sb_publishable_oV3aBukpqULi2fhILB8BpQ_h09lm8bQ";

// ================= STATE =================
let lastScanTime = Date.now();
let currentUID = null;
let lastRFID_ID = null;

// ================= AMBIL DATA SCAN TERBARU =================
function ambilScanTerbaru(){
    fetch(`${SUPABASE_URL}/rest/v1/hasil_scan?select=id,uid,tinggi&order=created_at.desc&limit=1`, {
        headers: {
            "apikey": SUPABASE_KEY,
            "Authorization": "Bearer " + SUPABASE_KEY
        }
    })
    .then(res => res.json())
    .then(data => {

        if(data.length > 0){

            let scan = data[0];

            // 🔥 ANTI LOOP
            if(scan.id !== lastRFID_ID){

                lastRFID_ID = scan.id;
                currentUID = scan.uid;
                lastScanTime = Date.now();

                console.log("Scan baru:", scan);

                ambilDataAnak(scan.uid);
                updateTinggi(scan.tinggi); // 🔥 langsung dari sini
            }
        }

    })
    .catch(err => console.error("Error ambilScan:", err));
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
            console.log("Data anak tidak ditemukan");
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
    })
    .catch(err => console.error("Error ambilDataAnak:", err));
}

// ================= HITUNG UMUR =================
function hitungUmur(tanggal){
    let lahir = new Date(tanggal);
    let sekarang = new Date();
    return sekarang.getFullYear() - lahir.getFullYear();
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

// ================= RESET UI =================
function resetUI(){

    document.getElementById("tinggi").innerHTML = "0 cm";
    document.getElementById("bar").style.width = "0%";

    document.querySelector(".profile b").innerText = "Menunggu scan...";
    document.querySelector(".profile small").innerText = "-";
    document.querySelector(".profile .ortu").innerText = "-";
    document.querySelector(".profile .text-muted").innerText = "UID: -";

    currentUID = null;
}

// ================= POLLING =================
setInterval(() => {
    ambilScanTerbaru();
}, 2000);

// ================= AUTO RESET =================
setInterval(() => {

    let sekarang = Date.now();

    if(sekarang - lastScanTime > 5000){
        resetUI();
    }

}, 1000);

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