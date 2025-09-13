const yukleButon = document.getElementById('yukle-butonu-js');
const dosyaSecici = document.getElementById('dosya-secici');
const pdfContainer = document.getElementById('pdf-container');
const pdfCanvas = document.getElementById('pdf-canvas');
const geriButonu = document.getElementById('geributonu');
const ileriButonu = document.getElementById('ileributonu');
const sayfaBilgisi = document.getElementById('sayfabilgisi');

let pdfDoc = null;
let sayfaNo = 1;
let toplamSayfa = 0;

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

function isMobile() {
    return window.innerWidth <= 768;
}

yukleButon.addEventListener('click', function() {
    dosyaSecici.click();
});

dosyaSecici.addEventListener('change', function(event) {
    const secilenDosya = event.target.files[0];
    if (secilenDosya && secilenDosya.type === "application/pdf") {
        const reader = new FileReader();
        reader.onload = function(e) {
            const dosyaVerisi = e.target.result;
            yukleVeGoster(dosyaVerisi);
        };
        reader.readAsArrayBuffer(secilenDosya);
    }
});

function yukleVeGoster(dosyaVerisi) {
    const loadingTask = pdfjsLib.getDocument({ data: dosyaVerisi });
   
    loadingTask.promise.then(function(pdf) {
        pdfDoc = pdf;
        toplamSayfa = pdf.numPages;
        sayfaNo = 1;
        
        document.querySelector('.ana-icerik').style.display = 'none';
        pdfContainer.style.display = 'flex';
        pdfContainer.style.flexDirection = 'column';
        pdfContainer.style.alignItems = 'center';
        
        // CSS ile yönetildiği için padding kodunu kaldırıyorum
        // pdfContainer.style.padding = isMobile() ? '10px 5px' : '20px';
        pdfContainer.style.backgroundColor = '#f5f7ff';
        
        sayfaRender(sayfaNo);
        kontrolGuncelle();
    }).catch(function(hata) {
        console.error('PDF yükleme hatası: ' + hata.message);
    });
}

function sayfaRender(sayfa) {
    const context = pdfCanvas.getContext('2d');
    context.clearRect(0, 0, pdfCanvas.width, pdfCanvas.height);
    
    pdfDoc.getPage(sayfa).then(function(page) {
        const scale = isMobile() ? 1.0 : 1.5;
        const viewport = page.getViewport({ scale: scale });
        
        pdfCanvas.height = viewport.height;
        pdfCanvas.width = viewport.width;
        pdfCanvas.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
        pdfCanvas.style.borderRadius = '8px';
        pdfCanvas.style.backgroundColor = 'white';
        
        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        
        page.render(renderContext);
    });
}

function kontrolGuncelle() {
    sayfaBilgisi.textContent = sayfaNo + '/' + toplamSayfa;
    
    geriButonu.disabled = sayfaNo <= 1;
    ileriButonu.disabled = sayfaNo >= toplamSayfa;
    
    geriButonu.style.opacity = sayfaNo <= 1 ? '0.5' : '1';
    ileriButonu.style.opacity = sayfaNo >= toplamSayfa ? '0.5' : '1';
}

function geriSayfa() {
    if (sayfaNo <= 1) return;
    sayfaNo--;
    sayfaRender(sayfaNo);
    kontrolGuncelle();
}

function ileriSayfa() {
    if (sayfaNo >= toplamSayfa) return;
    sayfaNo++;
    sayfaRender(sayfaNo);
    kontrolGuncelle();
}

geriButonu.addEventListener('click', geriSayfa);
ileriButonu.addEventListener('click', ileriSayfa);

window.addEventListener('resize', function() {
    if (pdfContainer.style.display === 'flex') {
        sayfaRender(sayfaNo);
    }
});