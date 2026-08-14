// İLKİN MƏHSUL BAZASI (LocalStorage təminatı ilə)
let defaultProducts = [
  {
    id: 1,
    title: "JavaScript Tam Praktik Dərslik (Nümunə)",
    author: "Məmməd Əliyev",
    card: "4169738812345678",
    price: 4,
    fileData: null,
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?auto=format&fit=crop&w=500&q=80"
  }
];

// Məhsulları yaddaşdan (LocalStorage) oxu və ya susmaya görə təyin et
let products = JSON.parse(localStorage.getItem("market_products")) || defaultProducts;
let activeProduct = null;

document.addEventListener("DOMContentLoaded", () => {
  renderProducts();
});

// MODALI AÇIB BAĞLAMAQ
function toggleModal(modalId) {
  const modal = document.getElementById(modalId);
  if(modal) modal.classList.toggle("hidden");
}

// MƏHSULLARI EKRANA ÇIXARMAQ
function renderProducts() {
  const grid = document.getElementById("products-grid");
  const countElem = document.getElementById("product-count");
  if(!grid) return;
  
  grid.innerHTML = "";
  if(countElem) countElem.innerText = `${products.length} material`;

  if(products.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full text-center py-12 text-slate-500">
        Hələ ki satışda heç bir material yoxdur. İlk PDF-inizi siz yükləyin!
      </div>
    `;
    return;
  }

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "glass rounded-3xl overflow-hidden shadow-xl border border-slate-800 flex flex-col justify-between hover:border-purple-500/50 transition duration-300 group relative";

    card.innerHTML = `
      <!-- SİLMƏ DÜYMƏSİ (SATICI ÜÇÜN) -->
      <button onclick="deleteProduct(${product.id})" class="absolute top-3 left-3 bg-rose-600/80 hover:bg-rose-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition z-10 shadow-lg" title="Materialı Sil">
        <i class="fa-solid fa-trash-can text-xs"></i>
      </button>

      <div class="relative overflow-hidden">
        <img src="${product.image}" alt="${product.title}" class="w-full h-48 object-cover group-hover:scale-105 transition duration-500">
        <div class="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-emerald-400 border border-slate-800">
          ${product.price} AZN
        </div>
      </div>
      
      <div class="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div class="text-[11px] font-semibold text-purple-400 uppercase tracking-widest mb-1">Müəllif: ${product.author}</div>
          <h3 class="text-base font-bold text-white mb-4 line-clamp-2">${product.title}</h3>
        </div>

        <button onclick="openChat(${product.id})" class="w-full bg-slate-900 hover:bg-purple-600 text-slate-200 hover:text-white py-3 rounded-2xl text-xs font-bold transition duration-300 flex items-center justify-center space-x-2 border border-slate-700/60 hover:border-purple-500 shadow-md">
          <i class="fa-solid fa-cart-shopping"></i>
          <span>Almaq Üçün Çata Keç</span>
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// MATERIALI SİLMƏK (DELETE)
function deleteProduct(productId) {
  if (confirm("Bu materialı silmək istədiyinizdən əminsiniz?")) {
    products = products.filter(p => p.id !== productId);
    saveProducts();
    renderProducts();
    showToast("Material uğurla silindi.", true);
  }
}

// PDF YÜKLƏMƏK VƏ LOCALSTORAGE-DƏ SAXLAMAQ
function handlePDFUpload(event) {
  event.preventDefault();

  const title = document.getElementById("pdf-title").value;
  const author = document.getElementById("pdf-author").value;
  const card = document.getElementById("seller-card").value;
  const price = parseFloat(document.getElementById("pdf-price").value);
  const fileInput = document.getElementById("pdf-file");
  const file = fileInput.files[0];

  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const fileBase64 = e.target.result;

    const newProduct = {
      id: Date.now(),
      title: title,
      author: author,
      card: card,
      price: price,
      fileData: fileBase64,
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=500&q=80"
    };

    products.unshift(newProduct);
    saveProducts();
    renderProducts();
    toggleModal('upload-modal');
    document.getElementById("upload-form").reset();

    showToast("Təbriklər! Material satışa çıxarıldı.");
  };

  reader.readAsDataURL(file);
}

// BAZANI SAXLAMAQ
function saveProducts() {
  localStorage.setItem("market_products", JSON.stringify(products));
}

// ÇAT PƏNCƏRƏSİNİ AÇMAQ
function openChat(productId) {
  activeProduct = products.find(p => p.id === productId);
  if(!activeProduct) return;

  document.getElementById("chat-product-title").innerText = activeProduct.title;
  document.getElementById("chat-seller-name").innerText = `Satıcı: ${activeProduct.author}`;
  document.getElementById("chat-price").innerText = `${activeProduct.price} AZN`;
  document.getElementById("chat-card-number").innerText = formatCardNumber(activeProduct.card);

  const messagesDiv = document.getElementById("chat-messages");
  messagesDiv.innerHTML = `
    <div class="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl text-xs text-slate-300">
      👋 <span class="font-bold text-purple-400">Sistem:</span> Xoş gəldiniz! Lütfən ${activeProduct.price} AZN məbləği yuxarıdakı karta köçürün və qəbzin şəklini çata göndərin.
    </div>
  `;

  toggleModal('chat-modal');
}

// KART NÖMRƏSİNİ KOPYALAMAQ
function copyCard() {
  if(!activeProduct) return;
  navigator.clipboard.writeText(activeProduct.card);
  showToast("Kart nömrəsi kopyalandı!");
}

// QƏBZ GÖNDƏRMƏK (ALICI)
function sendReceiptMessage(event) {
  const file = event.target.files[0];
  if(!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const imageUrl = e.target.result;
    const messagesDiv = document.getElementById("chat-messages");

    const msgHTML = `
      <div class="flex flex-col items-end space-y-1">
        <span class="text-[10px] text-slate-400">Siz (Alıcı)</span>
        <div class="bg-purple-600 p-2 rounded-2xl max-w-[80%] border border-purple-400/30">
          <p class="text-xs text-white mb-2 font-medium">Ödəniş qəbzini göndərdim, zəhmət olmasa yoxlayın:</p>
          <img src="${imageUrl}" class="rounded-xl w-full max-h-48 object-cover cursor-pointer border border-white/20" onclick="window.open('${imageUrl}')">
        </div>
      </div>
    `;

    messagesDiv.innerHTML += msgHTML;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    showToast("Qəbz satıcıya göndərildi. Təsdiq gözlənilir.");
  };

  reader.readAsDataURL(file);
}

// SATICI TƏSDİQLƏYİR ("QƏBZ KEÇƏRLİDİR")
function sellerApprove() {
  if(!activeProduct) return;

  const messagesDiv = document.getElementById("chat-messages");
  const msgHTML = `
    <div class="bg-emerald-950/80 border border-emerald-500/40 p-4 rounded-2xl space-y-2">
      <div class="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
        <i class="fa-solid fa-circle-check text-base"></i>
        <span>Satıcı ödənişi təsdiqlədi!</span>
      </div>
      <p class="text-xs text-slate-300">Materialınız hazırdır.</p>
      <button onclick="downloadPDF(activeProduct.fileData, activeProduct.title)" class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-xl text-xs transition shadow-lg shadow-emerald-600/30">
        <i class="fa-solid fa-download mr-1"></i> PDF Materialı Endir
      </button>
    </div>
  `;

  messagesDiv.innerHTML += msgHTML;
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  showToast("Təşəkkürlər! Məhsul alıcı üçün əlçatan oldu.");
}

// SATICI İMTİNA EDİR ("QƏBZ KEÇƏRSİZDİR")
function sellerRejectPrompt() {
  const reason = prompt("Lütfən imtina səbəbini yazın (Məs: Pul hesabıma gəlməyib, qəbz saxtadır):");

  if (!reason || reason.trim() === "") {
    alert("XƏBƏRDARLIQ: Səbəb yazmadan imtina edə bilməzsiniz!");
    return;
  }

  const messagesDiv = document.getElementById("chat-messages");
  const msgHTML = `
    <div class="bg-rose-950/80 border border-rose-500/40 p-4 rounded-2xl space-y-2">
      <div class="flex items-center space-x-2 text-rose-400 font-bold text-xs">
        <i class="fa-solid fa-circle-xmark text-base"></i>
        <span>Satıcı ödənişi rədd etdi!</span>
      </div>
      <p class="text-xs text-slate-300"><span class="font-bold text-rose-300">Səbəb:</span> ${reason}</p>
      <div class="text-[11px] text-slate-400 border-t border-rose-900/50 pt-2 mt-2">
        📢 <span class="font-bold text-amber-400">Adminə Bildiriş Göndərildi:</span> Mübahisəli vəziyyət yaranarsa Admin qəbzdəki RRN kodunu yoxlayıb yekun qərar verəcəkdir.
      </div>
    </div>
  `;

  messagesDiv.innerHTML += msgHTML;
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  showToast("İmtina səbəbi qeydə alındı və Adminə göndərildi.", true);
}

// 100% ZƏMANƏTLİ VƏ İŞLƏK PDF ENDİRMƏ FUNKSİYASI (BLOB ÜSULU)
function downloadPDF(base64Data, title) {
  if (!base64Data) {
    alert("Bu nümunə məhsuldur. Yalnız özünüzün və ya satıcının YENİ YÜKLƏDİYİ PDF-ləri endirmək mümkündür.");
    return;
  }

  try {
    // Base64 məlumatını sırf PDF baytlarına çeviririk
    const parts = base64Data.split(';base64,');
    const contentType = parts[0].split(':')[1] || 'application/pdf';
    const raw = window.atob(parts[1]);
    const rawLength = raw.length;
    const uInt8Array = new Uint8Array(rawLength);

    for (let i = 0; i < rawLength; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    // Təmiz PDF Blobu yaradırıq
    const blob = new Blob([uInt8Array], { type: contentType });
    const blobUrl = URL.createObjectURL(blob);

    // Endirmə linki yaradıb avtomatik klikləyirik
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${title.replace(/[^a-zA-Z0-9-ƏəĞğIıİiÖöŞşÜü]/g, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();

    // Təmizlik
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 100);

  } catch (error) {
    console.error("PDF Endirmə xətası:", error);
    alert("Fayl endirilərkən xəta baş verdi. Lütfən yenidən cəhd edin.");
  }
}

// KART NÖMRƏSİNİ FORMATLAMAQ
function formatCardNumber(cardStr) {
  if(!cardStr) return "";
  return cardStr.replace(/(.{4})/g, '$1 ').trim();
}

// TOAST BİLDİRİŞİ
function showToast(message, isError = false) {
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");

  if(!toast || !toastMessage) return;

  toastMessage.innerText = message;
  toast.classList.remove("hidden", "bg-purple-600", "bg-rose-600");

  if (isError) {
    toast.classList.add("bg-rose-600");
  } else {
    toast.classList.add("bg-purple-600");
  }

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 4000);
      }
      
