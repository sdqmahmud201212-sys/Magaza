let products = [];
let activeProduct = null;
let isSellerAuthenticated = false;

document.addEventListener("DOMContentLoaded", () => {
  listenToProducts();
  listenToAdminChat();
});

function toggleModal(modalId) {
  const modal = document.getElementById(modalId);
  if(modal) modal.classList.toggle("hidden");
}

// BAZADAN MƏHSULLARI CANLI DİNLƏMƏK
function listenToProducts() {
  database.ref('products').on('value', (snapshot) => {
    const data = snapshot.val();
    products = [];
    if (data) {
      Object.keys(data).forEach(key => {
        products.push({ id: key, ...data[key] });
      });
    }
    renderProducts();
  });
}

function renderProducts() {
  const grid = document.getElementById("products-grid");
  const countElem = document.getElementById("product-count");
  if(!grid) return;
  
  grid.innerHTML = "";
  if(countElem) countElem.innerText = `${products.length} material`;

  if(products.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center py-12 text-slate-500">Satışda material yoxdur. İlk PDF-i siz yükləyin!</div>`;
    return;
  }

  products.forEach(product => {
    const card = document.createElement("div");
    card.className = "glass rounded-3xl overflow-hidden shadow-xl border border-slate-800 flex flex-col justify-between hover:border-purple-500/50 transition duration-300 group relative";

    card.innerHTML = `
      <button onclick="deleteProductWithAuth('${product.id}', '${product.pinCode}')" class="absolute top-3 left-3 bg-rose-600/80 hover:bg-rose-600 text-white w-8 h-8 rounded-full flex items-center justify-center transition z-10 shadow-lg" title="Materialı Sil">
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

        <button onclick="openChat('${product.id}')" class="w-full bg-slate-900 hover:bg-purple-600 text-slate-200 hover:text-white py-3 rounded-2xl text-xs font-bold transition duration-300 flex items-center justify-center space-x-2 border border-slate-700/60 hover:border-purple-500 shadow-md">
          <i class="fa-solid fa-cart-shopping"></i>
          <span>Almaq Üçün Çata Keç</span>
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// BAZADAN CANLI SİLMƏK (5 RƏQƏMLİ PIN KOD İLƏ)
function deleteProductWithAuth(productId, correctPin) {
  const pinInput = prompt("Materialı silmək üçün 5 rəqəmli məxfi PIN kodunuzu daxil edin:");
  if (pinInput === correctPin) {
    database.ref('products/' + productId).remove()
      .then(() => showToast("Material bütün istifadəçilərdən silindi.", true))
      .catch((err) => alert("Xəta baş verdi: " + err.message));
  } else if (pinInput !== null) {
    alert("XƏTA: Məxfi PIN kod yanlışdır!");
  }
}

// MƏHSUL ƏLAVƏ ETMƏK VƏ KOD GÖSTƏRMƏK
function handlePDFUpload(event) {
  event.preventDefault();

  const title = document.getElementById("pdf-title").value;
  const author = document.getElementById("pdf-author").value;
  const card = document.getElementById("seller-card").value.trim();
  const price = parseFloat(document.getElementById("pdf-price").value);
  const fileInput = document.getElementById("pdf-file");
  const file = fileInput.files[0];

  if (!file) return;

  // 5 RƏQƏMLİ RANDOM PIN KOD
  const generatedPin = Math.floor(10000 + Math.random() * 90000).toString();

  const reader = new FileReader();
  reader.onload = function (e) {
    const fileBase64 = e.target.result;

    const newProductRef = database.ref('products').push();
    newProductRef.set({
      title: title,
      author: author,
      card: card,
      price: price,
      pinCode: generatedPin,
      fileData: fileBase64,
      image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=500&q=80"
    }).then(() => {
      toggleModal('upload-modal');
      document.getElementById("upload-form").reset();
      
      // XÜSUSİ KOD VƏ XƏBƏRDARLIQ PƏNCƏRƏSİNİ AÇMAQ
      showPinModal(generatedPin);
      showToast("Material satışa çıxarıldı!");
    });
  };

  reader.readAsDataURL(file);
}

// SATICI ÜÇÜN 5 RƏQƏMLİ KODU VƏ İTİRMƏ XƏBƏRDARLIĞINI GÖSTƏRƏN FUNKSİYA
function showPinModal(pin) {
  let pinModal = document.getElementById("pin-modal");
  
  if(!pinModal) {
    pinModal = document.createElement("div");
    pinModal.id = "pin-modal";
    pinModal.className = "fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50";
    document.body.appendChild(pinModal);
  }

  pinModal.innerHTML = `
    <div class="bg-slate-900 border border-purple-500/40 w-full max-w-md rounded-3xl p-6 text-center shadow-2xl relative">
      <div class="w-16 h-16 bg-purple-600/20 text-purple-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/30 text-2xl">
        <i class="fa-solid fa-key"></i>
      </div>
      
      <h3 class="text-xl font-bold text-white mb-2">Satıcı Təhlükəsizlik Kodunuz</h3>
      <p class="text-xs text-slate-400 mb-4">Bu kod satıcı panelinə girmək və ya məhsulu silmək üçün lazımdır.</p>

      <div class="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-4 flex items-center justify-between">
        <span id="pin-display-code" class="text-3xl font-black tracking-widest text-emerald-400 font-mono">${pin}</span>
        <button onclick="copyPinCode('${pin}')" class="bg-purple-600 hover:bg-purple-500 text-white text-xs px-3 py-2 rounded-xl transition flex items-center space-x-1 font-semibold">
          <i class="fa-solid fa-copy"></i>
          <span>Kopyala</span>
        </button>
      </div>

      <div class="bg-rose-950/50 border border-rose-500/30 rounded-2xl p-3 mb-6 text-left flex items-start space-x-2 text-rose-300 text-xs">
        <i class="fa-solid fa-triangle-exclamation text-rose-400 mt-0.5 text-sm"></i>
        <span><strong>XƏBƏRDARLIQ:</strong> Bu kodu bir yerə qeyd edin və ya kopyalayın! Kodu itirsəniz, satıcı panelinə keçid edə bilməyəcəksiniz.</span>
      </div>

      <button onclick="document.getElementById('pin-modal').classList.add('hidden')" class="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-2xl text-xs transition">
        Anladım, Kodu Qeyd Etdim
      </button>
    </div>
  `;

  pinModal.classList.remove("hidden");
}

function copyPinCode(pin) {
  navigator.clipboard.writeText(pin);
  showToast("PIN kod buferə kopyalandı!");
}

function openChat(productId) {
  activeProduct = products.find(p => p.id === productId);
  if(!activeProduct) return;

  isSellerAuthenticated = false;
  document.getElementById("seller-action-panel").classList.add("hidden");

  document.getElementById("chat-product-title").innerText = activeProduct.title;
  document.getElementById("chat-seller-name").innerText = `Satıcı: ${activeProduct.author}`;
  document.getElementById("chat-price").innerText = `${activeProduct.price} AZN`;
  document.getElementById("chat-card-number").innerText = formatCardNumber(activeProduct.card);

  const messagesDiv = document.getElementById("chat-messages");
  
  // HƏQİQİ AR CİNAYƏT MƏCƏLLƏSİ VƏ İNZİBATİ XƏTALAR MƏCƏLLƏSİ XƏBƏRDARLIĞI
  messagesDiv.innerHTML = `
    <div class="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl text-xs text-slate-300 space-y-2">
      <p>👋 <span class="font-bold text-purple-400">Sistem:</span> Xoş gəldiniz! Lütfən <strong>${activeProduct.price} AZN</strong> məbləği yuxarıdakı karta köçürün və qəbzin şəklini çata göndərin.</p>
      
      <div class="bg-rose-950/40 border border-rose-500/30 p-2.5 rounded-xl text-[11px] text-rose-200 flex items-start space-x-2">
        <i class="fa-solid fa-scale-balanced text-rose-400 text-sm mt-0.5"></i>
        <div>
          <strong class="text-rose-300">XƏBƏRDARLIQ (AR Cinayət Məcəlləsi):</strong><br>
          Saxta qəbz göndərmək və ya ödəniş alıb malı təqdim etməmək <strong>AR Cinayət Məcəlləsinin 178-ci maddəsi (Dələduzluq)</strong> və <strong>AR İnzibati Xətalar Məcəlləsinin 227-ci maddəsi (Xırda talama)</strong> ilə hüquqi məsuliyyət yaradır. Bütün yazışmalar və IP ünvanlar qeydə alınır.
        </div>
      </div>
    </div>
  `;

  toggleModal('chat-modal');
}

// SATICI PANELİNƏ 5 RƏQƏMLİ PIN İLƏ GİRİŞ
function toggleSellerLogin() {
  if(!activeProduct) return;

  if (isSellerAuthenticated) {
    showToast("Artıq Satıcı Rejimindəsiniz.");
    return;
  }

  const enteredPin = prompt("Satıcı panelinə keçmək üçün 5 rəqəmli məxfi PIN kodunuzu daxil edin:");

  if (enteredPin === activeProduct.pinCode) {
    isSellerAuthenticated = true;
    document.getElementById("seller-action-panel").classList.remove("hidden");
    showToast("Satıcı girişi uğurlu! Təsdiq paneli açıldı.");
  } else if (enteredPin !== null) {
    alert("XƏTA: 5 rəqəmli məxfi PIN kod yanlışdır!");
  }
}

function copyCard() {
  if(!activeProduct) return;
  navigator.clipboard.writeText(activeProduct.card);
  showToast("Kart nömrəsi kopyalandı!");
}

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
          <p class="text-xs text-white mb-2 font-medium">Ödəniş qəbzini göndərdim:</p>
          <img src="${imageUrl}" class="rounded-xl w-full max-h-48 object-cover cursor-pointer border border-white/20" onclick="window.open('${imageUrl}')">
        </div>
      </div>
    `;

    messagesDiv.innerHTML += msgHTML;
    messagesDiv.scrollTop = messagesDiv.scrollHeight;

    showToast("Qəbz satıcıya göndərildi.");
  };

  reader.readAsDataURL(file);
}

function sellerApprove() {
  if(!isSellerAuthenticated) return;

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

function sellerRejectPrompt() {
  if(!isSellerAuthenticated) return;

  const reason = prompt("Lütfən imtina səbəbini yazın:");
  if (!reason) return;

  const messagesDiv = document.getElementById("chat-messages");
  const msgHTML = `
    <div class="bg-rose-950/80 border border-rose-500/40 p-4 rounded-2xl space-y-2">
      <div class="flex items-center space-x-2 text-rose-400 font-bold text-xs">
        <i class="fa-solid fa-circle-xmark text-base"></i>
        <span>Satıcı ödənişi rədd etdi!</span>
      </div>
      <p class="text-xs text-slate-300"><span class="font-bold text-rose-300">Səbəb:</span> ${reason}</p>
    </div>
  `;

  messagesDiv.innerHTML += msgHTML;
  messagesDiv.scrollTop = messagesDiv.scrollHeight;

  showToast("İmtina səbəbi qeydə alındı.", true);
}

// ADMIN ÇATI FUNKSİYALARI (REAL-TIME FIREBASE)
function sendAdminMessage(e) {
  e.preventDefault();
  const input = document.getElementById("admin-msg-input");
  const msg = input.value.trim();
  if(!msg) return;

  database.ref('admin_chats').push({
    text: msg,
    sender: 'User',
    timestamp: Date.now()
  });

  input.value = "";
}

function listenToAdminChat() {
  database.ref('admin_chats').on('value', (snapshot) => {
    const data = snapshot.val();
    const chatContainer = document.getElementById("admin-chat-messages");
    if(!chatContainer) return;

    chatContainer.innerHTML = `
      <div class="bg-blue-900/40 border border-blue-500/30 p-3 rounded-2xl text-xs text-blue-100">
        👋 <strong>Admin Dəstək:</strong> Salam! Hər hansı dələduzluq halı ilə qarşılaşmısınızsa və ya sualınız varsa, buradan bizə yazın. Şikayətlərə dərhal baxılır!
      </div>
    `;

    if(data) {
      Object.keys(data).forEach(key => {
        const item = data[key];
        const isUser = item.sender === 'User';
        const msgHTML = `
          <div class="flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1">
            <span class="text-[9px] text-slate-400">${isUser ? 'Siz' : 'Admin'}</span>
            <div class="${isUser ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-200'} p-2.5 rounded-2xl text-xs max-w-[85%] border border-white/10">
              ${item.text}
            </div>
          </div>
        `;
        chatContainer.innerHTML += msgHTML;
      });
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  });
}

function downloadPDF(base64Data, title) {
  if (!base64Data) return;

  try {
    const parts = base64Data.split(';base64,');
    const contentType = parts[0].split(':')[1] || 'application/pdf';
    const raw = window.atob(parts[1]);
    const uInt8Array = new Uint8Array(raw.length);

    for (let i = 0; i < raw.length; ++i) {
      uInt8Array[i] = raw.charCodeAt(i);
    }

    const blob = new Blob([uInt8Array], { type: contentType });
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `${title}.pdf`;
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 100);

  } catch (error) {
    alert("Fayl endirilərkən xəta baş verdi.");
  }
}

function formatCardNumber(cardStr) {
  if(!cardStr) return "";
  return cardStr.replace(/(.{4})/g, '$1 ').trim();
}

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
    
