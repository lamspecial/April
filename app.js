// ============================================================
// app.js — آي أم سبيشل — نسخة محسّنة (أداء + هوية بصرية موحّدة)
// ============================================================

// ---- Firebase ----
const firebaseConfig = {
    apiKey: "AIzaSyAkZHewymPnTYF43CzweqlzCN5w1bWSOZI",
    authDomain: "ispecial.firebaseapp.com",
    projectId: "ispecial",
    storageBucket: "ispecial.firebasestorage.app",
    messagingSenderId: "86730383077",
    appId: "1:86730383077:web:ebdf3c92e2239d477f7e0c"
};
let db = null;
try {
    if (typeof firebase !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
    }
} catch (e) { console.error("Firebase init error:", e); }

// ---- حالة التطبيق ----
let isAdminLoggedIn      = false;
let isCarouselPaused     = false;
let lastClickedCardIndex = 0;
let currentBulletinData  = null;
let autoMultiplier       = 1;
let carouselInterval;
let currentArticleModalBranchId = null;
let currentArticleTimestamp     = null;
let currentArticleType          = 'performance';
let isTimeCalcEnabled           = true;
let topContributorTimer         = null;
let _carouselEventsAttached     = false;
let scrollRaf                   = null;

// ---- SVGs ----
const MAP_PIN_SVG = `<svg viewBox="0 0 24 24" width="22" height="22" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335"/><circle cx="12" cy="9" r="2.5" fill="#FFF"/></svg>`;
const DEL_SVG     = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;

// ---- قاعدة البيانات الافتراضية ----
let branchesData = {
    1: { bName:"شرق بلازا",     mName:"فاطمة السبيعي",  dName:"",               safety:0, visitors:1200, complaints:2, positive:31, negative:1, target:50, baseRating:4.3, baseReviews:210, iframeSrc:"https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d164903.2141441533!2d46.81057301314928!3d24.692980163395696!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f070079c56b1f%3A0x467da10cd49ea263!2sI%20am%20special!5e0!3m2!1sar!2ssa!4v1776487837062!5m2!1sar!2ssa" },
    2: { bName:"الرياض جاليري", mName:"",                dName:"فاطمة جعفري",   safety:1, visitors:900,  complaints:5, positive:31, negative:3, target:50, baseRating:4.0, baseReviews:343, iframeSrc:"https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d164913.7756258042!2d46.72418597869817!3d24.684998102760346!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2ee3e72ef25fe1%3A0x80694184f2c8bfa3!2z2KfZiiDYp9mFINiz2KjZiti02YQ!5e0!3m2!1sar!2ssa!4v1776487817232!5m2!1sar!2ssa" },
    3: { bName:"ذافيو",          mName:"اسمهان الغامدي", dName:"فاطمة الحارثي", safety:0, visitors:1500, complaints:1, positive:99, negative:0, target:50, baseRating:4.6, baseReviews:326, iframeSrc:"https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d10306.261765903853!2d46.7286395510535!3d24.69526659713942!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f038fc98c3b9f%3A0xb97168603aaf5b31!2sI%20am%20special!5e0!3m2!1sar!2ssa!4v1776487866148!5m2!1sar!2ssa" },
    4: { bName:"القصر مول",      mName:"منيره هزري",     dName:"",               safety:0, visitors:800,  complaints:0, positive:11, negative:4, target:50, baseRating:4.3, baseReviews:215, iframeSrc:"https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d201771.0028656187!2d46.70064182491825!3d24.597818146740305!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f0574c9346ba1%3A0x71206d42e2e70f9c!2z2KfZiiDYp9mFINiz2KjZiti02YQgfCBJIGFtIHNwZWNpYWw!5e0!3m2!1sar!2ssa!4v1776487726486!5m2!1sar!2ssa" },
    5: { bName:"سلام مول",       mName:"هند المطيري",    dName:"نوف هزازي",     safety:2, visitors:1100, complaints:8, positive:8,  negative:6, target:50, baseRating:4.2, baseReviews:147, iframeSrc:"https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d201771.0028656187!2d46.70064182491825!3d24.597818146740305!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f11aa8f623ed3%3A0x72ab124244a1cf6f!2z2KfZiiDYp9mFINiz2KjZiti02YQ!5e0!3m2!1sar!2ssa!4v1776487753224!5m2!1sar!2ssa" },
    6: { bName:"مركز المملكة",   mName:"",                dName:"هاجر القاسمي", safety:0, visitors:1300, complaints:3, positive:3,  negative:2, target:50, baseRating:4.2, baseReviews:154, iframeSrc:"https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d164913.7756258042!2d46.72418597869817!3d24.684998102760346!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f038149e74eaf%3A0xf8016d2217c1f4ef!2z2KfZiiDYp9mFINiz2KjZiti02YQgfCBJIGFtIHNwZWNpYWw!5e0!3m2!1sar!2ssa!4v1776487781383!5m2!1sar!2ssa" }
};
let branchHistory  = {};
let branchArticles = {};
let globalArticles = [];

// ============================================================
// Firebase helpers
// ============================================================
function _fbTimeout(ms) {
    return new Promise((_,rej) => setTimeout(() => rej(new Error('timeout')), ms));
}
async function _loadDoc(ref) { return Promise.race([ref.get(), _fbTimeout(6000)]); }

async function loadAllDataFromFirebase() {
    if (!db) return;
    try {
        const bd = await _loadDoc(db.collection('appData').doc('branches'));
        if (bd.exists) branchesData = bd.data().data;
        else db.collection('appData').doc('branches').set({ data: branchesData }).catch(()=>{});

        try { const h = await _loadDoc(db.collection('appData').doc('history'));    if (h.exists) branchHistory  = h.data().data; } catch(_){}
        try {
            const ad = await _loadDoc(db.collection('appData').doc('articles'));
            if (ad.exists) {
                const la = ad.data().data;
                for (const id in la) {
                    if (!Array.isArray(la[id])) {
                        const o=la[id], text=typeof o==='string'?o:o.text, ts=typeof o==='object'&&o.date?o.date:Date.now();
                        la[id] = [{ type:'performance', text, timestamp:ts, dateStr:new Date(ts).toISOString().split('T')[0], snapshot:{...branchesData[id]}, scores:calcScores(branchesData[id]) }];
                    } else { la[id]=la[id].map(a=>({type:'performance',...a})); }
                }
                branchArticles = la;
            }
        } catch(_){}
        try { const g=await _loadDoc(db.collection('appData').doc('globalArticles')); if(g.exists) globalArticles=g.data().data||[]; } catch(_){}
    } catch(_){}
}

const _fbSave = (doc, data) => db ? db.collection('appData').doc(doc).set(data).catch(()=>{}) : null;
const saveBranchesToFirebase  = () => _fbSave('branches',      { data: branchesData });
const saveHistoryToFirebase   = () => _fbSave('history',       { data: branchHistory });
const saveArticlesToFirebase  = () => _fbSave('articles',      { data: branchArticles });
const saveGlobalArticlesToFirebase = () => _fbSave('globalArticles', { data: globalArticles });

// ============================================================
// لقطة يومية
// ============================================================
function autoSaveDailySnapshot() {
    const run = () => {
        const dk = new Date().toISOString().split('T')[0];
        let changed = false;
        for (let id=1;id<=6;id++) {
            if (!branchHistory[id]) branchHistory[id] = [];
            if (!branchHistory[id].some(r=>r.date===dk)) {
                const d=branchesData[id], s=calcScores(d), art=getArticleData(id);
                branchHistory[id].push({ date:dk, snapshot:{...d}, scores:{...s}, article:art?art.text:'' });
                changed=true;
            }
        }
        if (changed) saveHistoryToFirebase();
    };
    typeof requestIdleCallback==='function' ? requestIdleCallback(run,{timeout:5000}) : setTimeout(run,3000);
}

function getArticleData(id, ts=null) {
    const a=branchArticles[id];
    if (!a||!Array.isArray(a)||!a.length) return null;
    if (ts) return a.find(x=>x.timestamp===ts)||null;
    return a.reduce((l,c)=>c.timestamp>l.timestamp?c:l, a[0]);
}

// ============================================================
// حساب النقاط
// ============================================================
function calcScores(data) {
    const P=data.positive||0, target=data.target||50;
    const ptsSafety=Math.max(0,3-(data.safety||0));
    const vis=data.visitors||1;
    const rawC=Math.max(0,2-((data.complaints||0)/(vis*0.003)));
    const ptsPositive=Math.min(4,(P/target)*4);
    const steps=Math.floor(P/5)*5;
    const W=steps===0?1.0:Math.max(0.2,60/(1.3*steps+60));
    const rawN=Math.max(0,2-((data.negative||0)*W));

    let ptsC=rawC, ptsN=rawN, sfC=0, sfN=0;
    if (P>target) {
        const surplus=P-target;
        const bC=Math.min(surplus*0.1,2-rawC); ptsC=Math.min(2,rawC+bC); sfC=bC/0.1;
        const rem=surplus-sfC;
        if (rem>0) { const bN=Math.min(rem*0.075,2-rawN); ptsN=Math.min(2,rawN+bN); sfN=bN/0.075; }
    }
    const total=Math.round((ptsSafety+ptsC+ptsPositive+ptsN)*100)/100;
    return { ptsSafety, ptsComplaints:ptsC, ptsPositive, ptsNegative:ptsN, total,
             rawPtsComplaints:rawC, rawPtsNegative:rawN,
             surplus:Math.max(0,P-target), surplusForComplaints:sfC, surplusForNegative:sfN, negWeight:W };
}

function getPerformanceTier(scores) {
    const t=scores.total;
    if (t>=9)   return { label:"أخضر", headerColor:"text-emerald-700 border-emerald-500", labelBg:"border-emerald-500 text-emerald-700", barColor:"bg-emerald-500", badgeCls:"badge-green" };
    if (t>=6.5) return { label:"أصفر", headerColor:"text-amber-700 border-amber-500",   labelBg:"border-amber-500 text-amber-700",   barColor:"bg-amber-500",   badgeCls:"badge-yellow" };
    return             { label:"أحمر", headerColor:"text-rose-700 border-rose-500",     labelBg:"border-rose-500 text-rose-700",     barColor:"bg-rose-500",    badgeCls:"badge-red" };
}

function calcRating(data) {
    return { ratingValue:data.baseRating.toFixed(1), reviewsCount:data.baseReviews+data.positive };
}
function buildStars(rv) {
    const full=parseFloat(rv)>=5.0;
    return `<span class="google-star">★</span>`.repeat(4)+`<span class="${full?'google-star':'google-star-empty'}">★</span>`;
}

// ============================================================
// لوحة الإجماليات
// ============================================================
function updateBrandReviewsPanel() {
    let total=0;
    for (let i=1;i<=6;i++) total+=(branchesData[i].positive||0);
    document.getElementById('brandTotalReviews').textContent=total;

    const contributors=[];
    for (let i=1;i<=6;i++) {
        const d=branchesData[i];
        if ((d.positive||0)<20) continue;
        if (d.mName) contributors.push({name:d.mName,positive:d.positive});
        if (d.dName) contributors.push({name:d.dName,positive:d.positive});
    }
    contributors.sort((a,b)=>b.positive-a.positive);
    const names=contributors.slice(0,5).map(c=>c.name);
    if (!names.length) return;

    clearInterval(topContributorTimer);
    let idx=0;
    const el=document.getElementById('topContributorName');
    const show=()=>{
        el.classList.remove('name-fade');
        requestAnimationFrame(()=>{ el.textContent=names[idx%names.length]; el.classList.add('name-fade'); });
        idx++;
    };
    show();
    topContributorTimer=setInterval(show,4500);
}

// ============================================================
// تنسيق التاريخ
// ============================================================
const _dtfDM  = new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn',{weekday:'long',day:'numeric',month:'long'});
const _dtfFull= new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn',{month:'long',day:'numeric',year:'numeric'});
const formatDateArabic    = ds  => _dtfDM.format(new Date(ds+'T12:00:00'));
const formatFullDateArabic= date=> _dtfFull.format(date instanceof Date?date:new Date(date));

// ============================================================
// Prompt Generator
// ============================================================
function generatePromptText(branchId, snap=null, sc=null) {
    const data=snap||branchesData[branchId], scores=sc||calcScores(data), tier=getPerformanceTier(scores);
    const today=new Date(), dateStr=formatFullDateArabic(today);
    const dim=new Date(today.getFullYear(),today.getMonth()+1,0).getDate(), curDay=today.getDate();
    const ctx=scores.total>=6.5?"الأداء متوسط ومقبول ولكن يحتاج تحسين ملحوظ"
        :scores.ptsSafety<3?"هناك مشكلة جدية في السلامة تستوجب التنبيه العاجل"
        :scores.ptsComplaints<1?"ارتفاع مقلق في الشكاوى يستدعي تدخلاً فورياً"
        :"ضعف واضح في اكتساب التقييمات الإيجابية يحتاج معالجة";
    const safetyNote=data.safety>0?`⚠️ تسجيل ${data.safety} حادثة سلامة هذا الشهر`:"لا حوادث سلامة مسجلة";
    const mgtParts=[]; if(data.mName)mgtParts.push(`المديرة ${data.mName}`); if(data.dName)mgtParts.push(`نائبتها ${data.dName}`);
    const mgtRef=mgtParts.length?`مع الإشارة المباشرة إلى ${mgtParts.join(' و ')}.`:'';
    return `أنت محرر محتوى متخصص في كتابة تقارير الأداء لمراكز ترفيه الأطفال بأسلوب صحفي احترافي ومشوق باللغة العربية.
اكتب تقرير أداء لفرع "${data.bName}" لصالح مجموعة "أي آم سبيشل"، بناءً على البيانات التالية:

═══════════════════════════════════
📋 بيانات الفرع
═══════════════════════════════════
• اسم الفرع: ${data.bName}
• المديرة: ${data.mName||'غير محدد'}
• نائبة المديرة: ${data.dName||'غير محدد'}
• تاريخ التقرير: ${dateStr}
• اليوم من الشهر: ${curDay} من أصل ${dim} يوم

═══════════════════════════════════
📊 الأرقام والمؤشرات
═══════════════════════════════════
• حوادث السلامة: ${data.safety} (${safetyNote})
• الشكاوى المسجلة: ${data.complaints}
• التقييمات الإيجابية: ${data.positive} (الهدف: ${data.target})
• التقييمات السلبية: ${data.negative}
• نسبة تحقيق الهدف: ${Math.round((data.positive/data.target)*100)}%

═══════════════════════════════════
🏆 نتيجة الأداء المحسوبة
═══════════════════════════════════
• نقاط السلامة: ${scores.ptsSafety.toFixed(2)} / 3
• نقاط الشكاوى: ${scores.ptsComplaints.toFixed(2)} / 2
• نقاط التقييمات الإيجابية: ${scores.ptsPositive.toFixed(2)} / 4
• نقاط التقييمات السلبية: ${scores.ptsNegative.toFixed(2)} / 2
• المجموع الكلي: ${scores.total} / 11
• تصنيف الأداء: ${tier.label} (${ctx})

═══════════════════════════════════
✍️ متطلبات التقرير
═══════════════════════════════════
اكتب التقرير بالتنسيق التالي بالضبط:

عنوان رئيسي واحد مشوق وجذاب لا يتجاوز 15 كلمة.
جملة افتتاحية واحدة تلخص الأداء (30-50 كلمة).
تحليل موضوعي لأداء الفرع يشمل نقاط القوة والضعف. ${mgtRef}
اجعله بين 80 و 100 كلمة بأسلوب صحفي.

ملاحظات: أسلوب نشرات اقتصادية جذابة، التقدم اليومي المثالي 1.66 تقييم، لا عناوين فرعية إضافية.`;
}

function generateWeeklyPrompt(reasonsMap) {
    const today=new Date(), dateStr=formatFullDateArabic(today);
    const dim=new Date(today.getFullYear(),today.getMonth()+1,0).getDate(), curDay=today.getDate();
    let lines='';
    for(let i=1;i<=6;i++){
        const d=branchesData[i],s=calcScores(d),tier=getPerformanceTier(s);
        lines+=`\n• فرع ${d.bName}:\n  - الإيجابية: ${d.positive}/${d.target} (${Math.round((d.positive/d.target)*100)}%)\n  - الشكاوى: ${d.complaints} | السلامة: ${d.safety} | سلبي: ${d.negative}\n  - النقاط: ${s.total}/11 | التصنيف: ${tier.label}\n  - ملاحظة: ${reasonsMap[i]||'لم يُذكر'}\n`;
    }
    return `أنت محرر محتوى متخصص في التحديثات الأسبوعية الداخلية لمجموعة "أي آم سبيشل".
اكتب تحديثاً أسبوعياً بتاريخ ${dateStr} (اليوم ${curDay} من أصل ${dim}):\n${lines}
متطلبات: عنوان (12 كلمة)، مقدمة (30-40 كلمة)، تحليل كل فرع (20-30 كلمة)، خاتمة (20-30 كلمة).
أسلوب داخلي مباشر، لا عناوين فرعية.`;
}

// ============================================================
// نوافذ المقالات
// ============================================================
function openArticleTypeSelector() {
    currentArticleModalBranchId=document.getElementById('branchSelector').value;
    closeAdmin();
    document.getElementById('articleTypeModal').style.display='flex';
}
function closeArticleTypeModal() { document.getElementById('articleTypeModal').style.display='none'; }

function selectArticleType(type) {
    closeArticleTypeModal();
    currentArticleType=type;
    if      (type==='performance')  openArticleModal(currentArticleModalBranchId);
    else if (type==='weekly')       openWeeklyModal();
    else if (type==='announcement') openAnnouncementModal();
    else if (type==='opinion')      openOpinionLinkModal();
}

function openArticleModal(branchId, ts=null) {
    currentArticleModalBranchId=branchId; currentArticleTimestamp=ts; currentArticleType='performance';
    const data=branchesData[branchId];
    let tData=data, tScores=calcScores(data), existing='';
    if (ts) {
        const ao=getArticleData(branchId,ts);
        if(ao){ tData=ao.snapshot||data; tScores=ao.scores||tScores; existing=ao.text; }
    } else {
        const lo=getArticleData(branchId);
        if(lo&&lo.dateStr===new Date().toISOString().split('T')[0]) existing=lo.text;
    }
    document.getElementById('articleModalTitle').textContent=`مقال فرع ${data.bName}`;
    const sp=[`الفرع: ${data.bName}`];
    if(data.mName) sp.push(`المديرة: ${data.mName}`); else if(data.dName) sp.push(`النائبة: ${data.dName}`);
    document.getElementById('articleModalSubtitle').textContent=sp.join(' — ');
    const prompt=generatePromptText(branchId,tData,tScores);
    document.getElementById('articleModalBody').innerHTML=`
        <div class="flex items-center gap-3 mb-4">
            <span class="w-8 h-8 rounded-full bg-slate-800 text-white text-sm font-black flex items-center justify-center">1</span>
            <span class="font-bold text-slate-800 bg-white/40 px-3 py-1 rounded-lg border border-white/50">انسخ الأمر</span>
        </div>
        <div class="relative">
            <pre id="generatedPrompt" class="prompt-box p-5 text-sm overflow-auto max-h-72">${prompt}</pre>
            <button onclick="copyPrompt()" class="absolute top-3 left-3 btn-solid-dark text-xs px-4 py-2 rounded-lg">نسخ</button>
        </div>
        <div class="flex items-center gap-3 mt-6 mb-2">
            <span class="w-8 h-8 rounded-full bg-slate-800 text-white text-sm font-black flex items-center justify-center">2</span>
            <span class="font-bold text-slate-800 bg-white/40 px-3 py-1 rounded-lg border border-white/50">ألصق هنا</span>
        </div>
        <textarea id="articlePasteInput" class="article-input w-full rounded-xl p-5 glass-input text-slate-800 font-medium" placeholder="اكتب مقالاً...">${existing}</textarea>
        <div class="flex gap-3 pt-2">
            <button onclick="saveArticleFromInput()" class="flex-1 btn-solid-dark py-4 rounded-xl text-lg">حفظ المقال</button>
            <button onclick="closeArticleModal()" class="bg-white/60 hover:bg-white/80 text-slate-800 font-bold py-4 px-6 rounded-xl border border-white/60 transition text-lg">إلغاء</button>
        </div>`;
    document.getElementById('articleModal').style.display='flex';
}
function closeArticleModal() {
    document.getElementById('articleModal').style.display='none';
    currentArticleModalBranchId=null; currentArticleTimestamp=null;
}
function copyPrompt() {
    const text=document.getElementById('generatedPrompt').textContent;
    navigator.clipboard ? navigator.clipboard.writeText(text).then(()=>showCopyToast()) : _fallbackCopy(text);
}
function _fallbackCopy(text) {
    const el=document.createElement('textarea'); el.value=text; document.body.appendChild(el); el.select();
    document.execCommand('copy'); document.body.removeChild(el); showCopyToast();
}
async function saveArticleFromInput() {
    const id=currentArticleModalBranchId, text=document.getElementById('articlePasteInput').value.trim();
    if(!id) return;
    if(!text){ alert('الرجاء لصق المقال أولاً'); return; }
    if(!branchArticles[id]) branchArticles[id]=[];
    const ts=currentArticleTimestamp||Date.now(), dateStr=new Date(ts).toISOString().split('T')[0];
    const obj={ type:'performance', text, timestamp:ts, dateStr, snapshot:JSON.parse(JSON.stringify(branchesData[id])), scores:calcScores(branchesData[id]) };
    const idx=branchArticles[id].findIndex(a=>a.dateStr===dateStr);
    if(idx>=0) branchArticles[id][idx]=obj; else branchArticles[id].push(obj);
    await saveArticlesToFirebase();
    closeArticleModal(); generateNewspaper(); initCarousel(); updateBrandReviewsPanel();
    showCopyToast('تم حفظ المقال');
}

function openAnnouncementModal() {
    document.getElementById('articleModalTitle').textContent='إعلان جديد';
    document.getElementById('articleModalSubtitle').textContent='مقال إعلاني يكتبه المستخدم مباشرةً';
    document.getElementById('articleModalBody').innerHTML=`
        <div><label class="block text-sm font-bold text-slate-700 mb-2">عنوان الإعلان</label>
        <input type="text" id="announcementTitle" class="w-full p-3 rounded-lg glass-input text-sm mb-4" placeholder="أدخل عنوان الإعلان"></div>
        <div><label class="block text-sm font-bold text-slate-700 mb-2">نص الإعلان</label>
        <textarea id="announcementBody" rows="8" class="w-full p-4 rounded-xl glass-input text-sm leading-relaxed resize-y" placeholder="اكتب نص الإعلان هنا..."></textarea></div>
        <div class="flex gap-3 pt-2">
            <button onclick="saveAnnouncementArticle()" class="flex-1 btn-outline btn-outline-amber py-4 rounded-xl text-lg font-black">نشر الإعلان</button>
            <button onclick="closeArticleModal()" class="bg-white/60 hover:bg-white/80 text-slate-800 font-bold py-4 px-6 rounded-xl border border-white/60 transition text-lg">إلغاء</button>
        </div>`;
    document.getElementById('articleModal').style.display='flex';
}
async function saveAnnouncementArticle() {
    const title=document.getElementById('announcementTitle').value.trim(), body=document.getElementById('announcementBody').value.trim();
    if(!title||!body){ alert('يرجى ملء العنوان والنص'); return; }
    const ts=Date.now(), dateStr=new Date(ts).toISOString().split('T')[0];
    globalArticles.push({ type:'announcement', title, body, text:`${title}\n${body}`, timestamp:ts, dateStr });
    await saveGlobalArticlesToFirebase(); closeArticleModal(); generateNewspaper(); showCopyToast('تم نشر الإعلان');
}

function openWeeklyModal() {
    let rows='';
    for(let i=1;i<=6;i++){
        const d=branchesData[i], s=calcScores(d), tier=getPerformanceTier(s);
        rows+=`<div class="bg-white/40 rounded-xl p-4 border border-white/50">
            <div class="flex justify-between items-center mb-2">
                <span class="font-black text-slate-900 text-sm">فرع ${d.bName}</span>
                <span class="badge ${tier.badgeCls}">${tier.label} — ${s.total}/11</span>
            </div>
            <div class="flex gap-3 text-xs text-slate-600 font-bold mb-3 flex-wrap">
                <span>إيجابي: ${d.positive}/${d.target}</span><span>شكاوى: ${d.complaints}</span><span>سلبي: ${d.negative}</span><span>سلامة: ${d.safety}</span>
            </div>
            <input type="text" id="weeklyReason_${i}" class="w-full p-2 rounded-lg glass-input text-sm" placeholder="سبب الانخفاض أو ملاحظة...">
        </div>`;
    }
    document.getElementById('weeklyModalBody').innerHTML=`
        <div class="space-y-3">${rows}</div>
        <div class="relative mt-2">
            <pre id="weeklyPromptBox" class="prompt-box p-5 text-sm overflow-auto max-h-64 hidden"></pre>
            <button id="weeklyPromptCopyBtn" onclick="copyWeeklyPrompt()" class="absolute top-3 left-3 btn-solid-dark text-xs px-4 py-2 rounded-lg hidden">نسخ</button>
        </div>
        <div><label class="block text-sm font-bold text-slate-700 mb-2">المقال الأسبوعي (الصقه هنا)</label>
        <textarea id="weeklyArticleText" rows="6" class="w-full p-4 rounded-xl glass-input text-sm leading-relaxed resize-y" placeholder="الصق المقال الأسبوعي هنا..."></textarea></div>
        <div class="flex gap-3">
            <button onclick="generateWeeklyPromptUI()" class="flex-1 btn-outline btn-outline-emerald py-3 rounded-xl font-black text-sm">توليد البرومبت</button>
            <button onclick="saveWeeklyArticle()" class="flex-1 btn-solid-dark py-3 rounded-xl text-sm">حفظ المقال</button>
            <button onclick="closeWeeklyModal()" class="bg-white/60 hover:bg-white/80 text-slate-800 font-bold py-3 px-4 rounded-xl border border-white/60 transition text-sm">إلغاء</button>
        </div>`;
    document.getElementById('weeklyModal').style.display='flex';
}
function generateWeeklyPromptUI() {
    const rm={};
    for(let i=1;i<=6;i++){ const el=document.getElementById(`weeklyReason_${i}`); rm[i]=el?el.value.trim():''; }
    const box=document.getElementById('weeklyPromptBox'), btn=document.getElementById('weeklyPromptCopyBtn');
    box.textContent=generateWeeklyPrompt(rm); box.classList.remove('hidden'); btn.classList.remove('hidden');
}
function copyWeeklyPrompt() { _fallbackCopy(document.getElementById('weeklyPromptBox').textContent); }
async function saveWeeklyArticle() {
    const text=document.getElementById('weeklyArticleText').value.trim();
    if(!text){ alert('يرجى لصق المقال الأسبوعي أولاً'); return; }
    const rm={};
    for(let i=1;i<=6;i++){ const el=document.getElementById(`weeklyReason_${i}`); rm[i]=el?el.value.trim():''; }
    const ts=Date.now(), dateStr=new Date(ts).toISOString().split('T')[0];
    const lines=text.split('\n').map(l=>l.trim()).filter(l=>l);
    globalArticles.push({ type:'weekly', text, title:lines[0]||'التحديث الأسبوعي', timestamp:ts, dateStr, reasons:rm,
        branchSnapshots:Object.fromEntries(Object.keys(branchesData).map(i=>[i,{...branchesData[i],scores:calcScores(branchesData[i])}])) });
    await saveGlobalArticlesToFirebase(); closeWeeklyModal(); generateNewspaper(); showCopyToast('تم حفظ التحديث الأسبوعي');
}
function closeWeeklyModal() { document.getElementById('weeklyModal').style.display='none'; }

function openOpinionLinkModal() {
    document.getElementById('opinionAuthorName').value=''; document.getElementById('opinionAuthorBio').value='';
    document.getElementById('opinionLinkResult').classList.add('hidden');
    document.getElementById('opinionLinkModal').style.display='flex';
}
function closeOpinionLinkModal() { document.getElementById('opinionLinkModal').style.display='none'; }
function generateOpinionLink() {
    const name=document.getElementById('opinionAuthorName').value.trim(), bio=document.getElementById('opinionAuthorBio').value.trim();
    if(!name||!bio){ alert('يرجى إدخال الاسم والنبذة'); return; }
    const token=`op_${Date.now()}_${Math.random().toString(36).substr(2,8)}`;
    const payload=btoa(encodeURIComponent(JSON.stringify({name,bio,token,exp:Date.now()+7*24*3600*1000})));
    document.getElementById('opinionLinkUrl').value=`${location.origin}${location.pathname}#opinion-${payload}`;
    document.getElementById('opinionLinkResult').classList.remove('hidden');
}
function copyOpinionLink() { _fallbackCopy(document.getElementById('opinionLinkUrl').value); showCopyToast('تم نسخ الرابط'); }

let currentOpinionToken=null, currentOpinionAuthor=null;
function openOpinionWritePage(payload) {
    try {
        const data=JSON.parse(decodeURIComponent(atob(payload)));
        if(data.exp&&Date.now()>data.exp){ alert('انتهت صلاحية هذا الرابط'); history.replaceState('','',location.pathname); return; }
        currentOpinionToken=data.token; currentOpinionAuthor={name:data.name,bio:data.bio};
        document.getElementById('opinionWriteTitle').textContent='كتابة مقال رأي';
        document.getElementById('opinionWriteSubtitle').textContent=`الكاتبة: ${data.name} — ${data.bio}`;
        document.getElementById('opinionTitleInput').value=''; document.getElementById('opinionBodyInput').value='';
        document.getElementById('opinionWritePage').style.display='flex';
        document.getElementById('mainPageWrapper').style.display='none';
    } catch(e){ console.error(e); }
}
async function submitOpinionArticle() {
    const title=document.getElementById('opinionTitleInput').value.trim(), body=document.getElementById('opinionBodyInput').value.trim();
    if(!title||!body){ alert('يرجى إدخال العنوان والمحتوى'); return; }
    if(!currentOpinionAuthor) return;
    const ts=Date.now(), dateStr=new Date(ts).toISOString().split('T')[0];
    globalArticles.push({ type:'opinion', title, body, text:`${title}\n${body}`, timestamp:ts, dateStr,
        authorName:currentOpinionAuthor.name, authorBio:currentOpinionAuthor.bio, token:currentOpinionToken });
    await saveGlobalArticlesToFirebase();
    document.getElementById('opinionWritePage').style.display='none';
    document.getElementById('mainPageWrapper').style.display='flex';
    history.replaceState('','',location.pathname);
    generateNewspaper(); showCopyToast('تم إرسال مقال الرأي بنجاح ✓');
}

// ============================================================
// الكاروسيل
// ============================================================
function initCarousel() {
    const carousel=document.getElementById('branchesCarousel');
    const frag=document.createDocumentFragment();
    const sorted=[1,2,3,4,5,6].sort((a,b)=>(branchesData[b].positive||0)-(branchesData[a].positive||0));
    sorted.forEach((i,idx)=>{
        const data=branchesData[i], {ratingValue,reviewsCount}=calcRating(data);
        const scores=calcScores(data), tier=getPerformanceTier(scores);
        const mgt=[]; if(data.mName)mgt.push(data.mName); if(data.dName)mgt.push(data.dName);
        const mgtText=mgt.length?`إدارة: ${mgt.join(' و ')}`:'إدارة الفرع';
        const card=document.createElement('div');
        card.className='carousel-card min-w-[85%] md:min-w-[320px] lg:min-w-[340px] flex-shrink-0 glass-panel rounded-2xl p-5 snap-center transition-transform hover:-translate-y-1 cursor-pointer border border-white/60';
        card.onclick=(e)=>{
            if(e.target.closest('.map-btn')){ openIframeModal(data.iframeSrc,idx); return; }
            isAdminLoggedIn ? (document.getElementById('branchSelector').value=i, loadAdminData(), document.getElementById('adminModal').style.display='flex') : openBranchDetailModal(i);
        };
        card.innerHTML=`
            <div class="flex justify-between items-start mb-5">
                <div>
                    <h3 class="font-black text-xl text-slate-900 tracking-tight">فرع ${data.bName}</h3>
                    <p class="text-xs text-slate-600 font-bold mt-1">${mgtText}</p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="badge ${tier.badgeCls}">${tier.label}</span>
                    <button class="map-btn w-10 h-10 bg-white/70 rounded-full flex items-center justify-center border border-white/60 shadow-sm hover:scale-110 transition" title="عرض الخريطة">${MAP_PIN_SVG}</button>
                </div>
            </div>
            <div class="bg-white/50 rounded-xl p-3 border border-white/60 flex items-center justify-between shadow-sm">
                <div class="flex items-center gap-3">
                    <span class="text-2xl font-black text-slate-900">${ratingValue}</span>
                    <div class="flex text-lg leading-none mb-1">${buildStars(ratingValue)}</div>
                </div>
                <div class="flex flex-col items-end">
                    <span class="text-xs font-bold text-slate-600 mb-1">المراجعات</span>
                    <span class="badge badge-blue text-xs px-2.5 py-0.5">${reviewsCount.toLocaleString('en-US')}</span>
                </div>
            </div>
            <div class="mt-4 pt-4 border-t border-white/40 flex justify-between items-center text-sm">
                <div class="font-bold text-slate-600 bg-white/30 px-2 py-0.5 rounded text-xs">من بداية الشهر</div>
                <div class="font-black text-emerald-700">${data.positive} <span class="text-xs font-bold">مراجعة إيجابية</span></div>
            </div>`;
        frag.appendChild(card);
    });
    carousel.innerHTML=''; carousel.appendChild(frag);
    setupCarouselDots(); setupCarouselEvents();
}

function openBranchDetailModal(branchId) {
    const data=branchesData[branchId], scores=calcScores(data), tier=getPerformanceTier(scores);
    document.getElementById('branchDetailTitle').textContent=`مؤشرات فرع ${data.bName}`;
    const cNote=scores.surplusForComplaints>0?`<span class="surplus-badge">تم استخدام فائض التقييمات الإيجابية لتصحيح نقاط الشكاوى</span>`:'';
    const nNote=scores.surplusForNegative>0?`<span class="surplus-badge">تم استخدام فائض التقييمات الإيجابية لتصحيح نقاط السلبية</span>`:'';
    const pct=Math.min(100,(scores.total/11)*100);
    document.getElementById('branchDetailContent').innerHTML=`
        <div class="flex items-center justify-between mb-2">
            <span class="font-bold text-slate-600 text-sm">الأداء العام</span>
            <span class="font-black text-4xl text-slate-900">${scores.total} <span class="text-sm font-bold text-slate-400">/ 11</span></span>
        </div>
        <div class="w-full bg-slate-200/50 border border-white/60 rounded-full h-3 overflow-hidden mb-1"><div class="${tier.barColor} h-3 rounded-full transition-all" style="width:${pct}%"></div></div>
        <p class="text-xs font-bold mb-4"><span class="badge ${tier.badgeCls}">${tier.label}</span></p>
        <div class="grid grid-cols-2 gap-3">
            ${_detailCard('السلامة',scores.ptsSafety,3,`${data.safety} حوادث`,data.safety===0?'badge-green':'badge-red','')}
            ${_detailCard('الشكاوى',scores.ptsComplaints,2,`${data.complaints} شكوى`,data.complaints===0?'badge-green':data.complaints===1?'badge-yellow':'badge-red',cNote)}
            ${_detailCard('الإيجابية',scores.ptsPositive,4,`${data.positive} تقييم`,data.positive>=10?'badge-green':'badge-yellow','')}
            ${_detailCard('السلبية',scores.ptsNegative,2,`${data.negative} تقييم`,data.negative===0?'badge-green':data.negative===1?'badge-yellow':'badge-red',nNote)}
        </div>
        <div class="mt-4 bg-white/30 rounded-xl p-3 border border-white/40">
            <div class="flex justify-between items-center mb-1">
                <span class="text-xs font-bold text-slate-600">الإيجابية من الهدف</span>
                <span class="text-xs font-black text-slate-900">${data.positive} / ${data.target}</span>
            </div>
            <div class="w-full bg-slate-200/50 rounded-full h-2 overflow-hidden border border-white/50">
                <div class="${data.positive>=data.target?'bg-emerald-500':'bg-slate-700'} h-2 rounded-full" style="width:${Math.min(100,(data.positive/data.target)*100)}%"></div>
            </div>
        </div>`;
    document.getElementById('branchDetailModal').style.display='flex';
}
function _detailCard(title,pts,max,badgeText,badgeCls,extra) {
    return `<div class="bg-white/50 rounded-xl p-3 border border-white/60">
        <div class="flex items-center justify-between mb-1"><p class="text-xs font-bold text-slate-500">${title}</p><span class="badge ${badgeCls} text-[10px]">${badgeText}</span></div>
        <div class="flex items-baseline gap-1.5"><p class="text-2xl font-black text-slate-900">${pts.toFixed(2)}</p><p class="text-xs text-slate-400">(من ${max})</p></div>${extra}
    </div>`;
}
function closeBranchDetailModal(e) {
    if(e&&e.target!==e.currentTarget) return;
    document.getElementById('branchDetailModal').style.display='none';
}

function setupCarouselDots() {
    const dc=document.getElementById('carouselDots'); dc.innerHTML='';
    for(let i=0;i<6;i++) { const b=document.createElement('button'); b.onclick=()=>scrollToCard(i); b.className='carousel-dot w-2.5 h-2.5 rounded-full bg-slate-300/80 transition-all duration-300 border border-white/50'; dc.appendChild(b); }
    updateActiveDot();
}
function scrollToCard(index) {
    const c=document.getElementById('branchesCarousel'); if(c.children[index]) c.children[index].scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'});
}
function updateActiveDot() {
    const c=document.getElementById('branchesCarousel'), dots=document.querySelectorAll('.carousel-dot');
    if(!dots.length||!c.children.length) return;
    const cCx=c.getBoundingClientRect().left+c.getBoundingClientRect().width/2;
    let ci=0, minD=Infinity;
    for(let i=0;i<c.children.length;i++){ const cc=c.children[i].getBoundingClientRect(); const d=Math.abs(cCx-(cc.left+cc.width/2)); if(d<minD){minD=d;ci=i;} }
    dots.forEach((d,i)=>{ d.className=i===ci?'carousel-dot w-6 h-2.5 rounded-full bg-slate-800 transition-all duration-300 border border-white/50':'carousel-dot w-2.5 h-2.5 rounded-full bg-slate-300/80 transition-all duration-300 border border-white/50'; });
}
function scrollCarousel(dir) { const el=document.getElementById('branchesCarousel'); if(el) el.scrollBy({left:dir*-340,behavior:'smooth'}); }

function setupCarouselEvents() {
    const el=document.getElementById('branchesCarousel'); if(!el) return;
    const startAuto=()=>{
        clearInterval(carouselInterval); if(isCarouselPaused) return;
        carouselInterval=setInterval(()=>{
            const mx=el.scrollWidth-el.clientWidth;
            if(Math.abs(el.scrollLeft)>=mx-10) el.scrollTo({left:0,behavior:'smooth'}); else el.scrollBy({left:-340,behavior:'smooth'});
        },6000);
    };
    if(_carouselEventsAttached){ startAuto(); return; }
    _carouselEventsAttached=true;
    el.addEventListener('scroll',()=>{ if(scrollRaf) return; scrollRaf=requestAnimationFrame(()=>{updateActiveDot();scrollRaf=null;}); },{passive:true});
    el.addEventListener('mouseenter',()=>{if(!isCarouselPaused)clearInterval(carouselInterval);},{passive:true});
    el.addEventListener('mouseleave',startAuto,{passive:true});
    el.addEventListener('touchstart',()=>{if(!isCarouselPaused)clearInterval(carouselInterval);},{passive:true});
    el.addEventListener('touchend',startAuto,{passive:true});
    startAuto();
}

function openIframeModal(src,cardIndex) {
    if(cardIndex!==undefined){lastClickedCardIndex=cardIndex;scrollToCard(cardIndex);}
    isCarouselPaused=true; clearInterval(carouselInterval);
    document.getElementById('branchMapIframe').src=src;
    document.getElementById('iframeModal').style.display='flex';
}
function closeIframeModal(e) {
    if(e&&e.target!==e.currentTarget&&e.target.tagName!=='BUTTON') return;
    document.getElementById('iframeModal').style.display='none';
    document.getElementById('branchMapIframe').src='';
    setTimeout(()=>{ scrollToCard(lastClickedCardIndex); isCarouselPaused=false;
        const el=document.getElementById('branchesCarousel'); if(!el) return;
        carouselInterval=setInterval(()=>{ const mx=el.scrollWidth-el.clientWidth; if(Math.abs(el.scrollLeft)>=mx-10) el.scrollTo({left:0,behavior:'smooth'}); else el.scrollBy({left:-340,behavior:'smooth'}); },6000);
    },3000);
}

// ============================================================
// صفحة التقرير التفصيلي
// ============================================================
function openBulletinPage(branchId, timestamp=null) {
    let data, scores, articleData, dateStr;
    if(timestamp){
        articleData=getArticleData(branchId,timestamp);
        if(articleData&&articleData.snapshot){ data=articleData.snapshot; scores=articleData.scores||calcScores(data); dateStr=formatFullDateArabic(new Date(articleData.timestamp)); }
        else { data=branchesData[branchId]; scores=calcScores(data); dateStr=formatFullDateArabic(new Date()); }
    } else {
        data=branchesData[branchId]; scores=calcScores(data); articleData=getArticleData(branchId); dateStr=formatFullDateArabic(new Date());
    }
    const tier=getPerformanceTier(scores), {ratingValue,reviewsCount}=calcRating(data);
    const pct=Math.min(100,(scores.total/11)*100);
    const article=articleData?articleData.text:null, artTs=articleData?articleData.timestamp:null;
    let aHead='', aLead='', aBody='';
    if(article){ const lines=article.split('\n').map(l=>l.trim()).filter(l=>l); if(lines[0])aHead=lines[0]; if(lines[1])aLead=lines[1]; if(lines.length>2)aBody=lines.slice(2).join(' '); }
    currentBulletinData={ branchId, bName:data.bName, head:aHead||`تقرير أداء فرع ${data.bName}`, lead:aLead||`مؤشر الأداء العام: ${scores.total}/11 — تصنيف: ${tier.label}`, performanceLabel:tier.label, dateStr };
    document.getElementById('bulletinBreadcrumbBranch').textContent=`فرع ${data.bName}`;
    const hashUrl=timestamp?`#bulletin-${branchId}-${timestamp}`:`#bulletin-${branchId}`;
    history.pushState('','',hashUrl);
    updateOGTags(`تقرير فرع ${data.bName} - أي آم سبيشل`,`${currentBulletinData.head} | ${scores.total}/11 | ${tier.label}`,location.href);
    document.getElementById('bulletinContent').innerHTML=buildBulletinHTML(data,scores,tier,{head:aHead,lead:aLead,body:aBody},ratingValue,reviewsCount,dateStr,pct,branchId,!!article,artTs);
    showPage('bulletin');
    const cel=document.getElementById('bulletinContent'); cel.classList.remove('slide-up'); requestAnimationFrame(()=>cel.classList.add('slide-up'));
    window.scrollTo({top:0,behavior:'smooth'});
}

function buildBulletinHTML(data,scores,tier,text,rv,rc,dateStr,pct,branchId,hasArticle,tsToPass) {
    const tsP=tsToPass||'null';
    const cNote=scores.surplusForComplaints>0?`<div class="mt-2"><span class="surplus-badge">تم استخدام فائض التقييمات الإيجابية لتصحيح نقاط الشكاوى</span></div>`:'';
    const nNote=scores.surplusForNegative>0?`<div class="mt-2"><span class="surplus-badge">تم استخدام فائض التقييمات الإيجابية لتصحيح نقاط السلبية</span></div>`:'';
    const adminBtns=isAdminLoggedIn?`<div class="flex gap-2 flex-wrap">
        <button onclick="openHistoryModal(${branchId})" class="btn-outline btn-outline-slate text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>السجل</button>
        <button onclick="openArticleModal(${branchId},${tsP})" class="btn-solid-dark text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>${hasArticle?'تعديل المقال':'كتابة مقال'}</button>
        ${hasArticle&&tsToPass?`<button onclick="deleteArticle(${branchId},${tsToPass})" class="btn-outline btn-outline-rose text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5">${DEL_SVG}حذف المقال</button>`:''}
    </div>`:'';
    const waiting=[]; if(data.mName)waiting.push(`المديرة ${data.mName}`); if(data.dName)waiting.push(`نائبتها ${data.dName}`);
    const waitText=waiting.length?`بانتظار تحركات ${waiting.join(' و ')}`:'بانتظار تحركات الإدارة';
    const articleSection=hasArticle?`
        <div class="mb-8">
            <div class="flex flex-wrap items-center gap-3 mb-4">
                <span class="badge ${tier.badgeCls}">الأداء ◂ ${data.bName}</span>
                <span class="text-slate-500 bg-white/40 px-3 py-1 rounded-full text-sm font-bold border border-white/50">${dateStr}</span>
            </div>
            <h1 class="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4">${text.head}</h1>
            <p class="text-lg text-slate-700 font-bold leading-relaxed mb-3 bg-white/30 p-3 rounded-lg border-l-4 border-slate-300">${text.lead}</p>
            <p class="text-slate-700 leading-relaxed text-justify font-medium">${text.body}</p>
        </div>`
    :`<div class="mb-8 ${isAdminLoggedIn?'bg-amber-50/50 border-amber-200':'bg-slate-100/40 border-slate-200'} border rounded-2xl p-6">
        <div class="flex items-start gap-4">
            <span class="text-3xl">${isAdminLoggedIn?'✍️':'⏳'}</span>
            <div>${isAdminLoggedIn
                ?`<h3 class="font-black text-amber-900 text-lg mb-1">لم يُكتب مقال هذا الفرع بعد</h3>
                  <p class="text-amber-700 text-sm font-medium mb-4">اكتب مقالاً يعكس الأرقام والمؤشرات أدناه.</p>
                  <button onclick="openArticleModal(${branchId})" class="btn-outline btn-outline-amber px-5 py-2.5 rounded-lg text-sm font-black">✦ كتابة المقال الآن</button>`
                :`<p class="text-slate-800 text-lg font-bold mt-1">${waitText}</p>`}</div>
        </div>
    </div>`;
    let teamHTML='';
    if(data.mName) teamHTML+=buildPersonRow(data.mName,'مديرة الفرع',!!data.dName);
    if(data.dName) teamHTML+=buildPersonRow(data.dName,'نائبة المديرة',false);
    if(!data.mName&&!data.dName) teamHTML='<p class="text-slate-500 text-sm font-bold">لا يوجد بيانات إدارة مسجلة</p>';
    return `${articleSection}
        <div class="mb-8 glass-panel rounded-2xl p-6">
            <div class="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h2 class="text-xl font-black text-slate-800">الإنجاز الشهري</h2>${adminBtns}
            </div>
            <div class="flex justify-between items-center mb-3">
                <span class="font-bold text-slate-700 text-sm bg-white/40 px-2 py-0.5 rounded">التقييمات الإيجابية المحققة</span>
                <span class="font-black text-slate-900 text-lg">${data.positive} / ${data.target}</span>
            </div>
            <div class="w-full bg-slate-200/50 border border-white/60 rounded-full h-3 overflow-hidden mb-2">
                <div class="${data.positive>=data.target?'bg-emerald-500':'bg-slate-700'} h-3 rounded-full transition-all" style="width:${Math.min(100,(data.positive/data.target)*100)}%"></div>
            </div>
            <p class="text-xs text-slate-600 font-bold text-left">${Math.round((data.positive/data.target)*100)}% من الهدف</p>
        </div>
        <div class="border-t border-slate-200/40 my-8"></div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="md:col-span-1 bg-slate-800/88 text-white rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-tr from-slate-900/50 to-transparent z-0"></div>
                <div class="z-10 relative flex flex-col items-center">
                    <p class="text-slate-300 font-bold text-sm mb-2">الأداء العام</p>
                    <div class="text-7xl font-black mb-1">${scores.total}</div>
                    <p class="text-slate-300 text-sm font-bold">من 11</p>
                    <div class="w-full bg-slate-600/50 rounded-full h-2 mt-4 overflow-hidden">
                        <div class="${tier.barColor} h-2 rounded-full transition-all" style="width:${pct}%"></div>
                    </div>
                    <span class="mt-4 badge ${tier.badgeCls} text-sm px-4 py-1.5">${tier.label}</span>
                </div>
            </div>
            <div class="md:col-span-2 grid grid-cols-2 gap-4">
                ${buildStatCard('نقاط السلامة',scores.ptsSafety,3,`${data.safety} حوادث`,data.safety===0?'badge-green':'badge-red','')}
                ${buildStatCard('نقاط الشكاوى',scores.ptsComplaints,2,`${data.complaints} شكوى`,data.complaints===0?'badge-green':data.complaints===1?'badge-yellow':'badge-red',cNote)}
                ${buildStatCard('نقاط الإيجابية',scores.ptsPositive,4,`${data.positive} تقييم`,data.positive>=10?'badge-green':'badge-yellow','')}
                ${buildStatCard('نقاط السلبية',scores.ptsNegative,2,`${data.negative} تقييم`,data.negative===0?'badge-green':data.negative===1?'badge-yellow':'badge-red',nNote)}
            </div>
        </div>
        <div class="border-t border-slate-200/40 my-8"></div>
        <div class="mb-8">
            <h2 class="text-xl font-black text-slate-800 mb-6">معلومات الفرع</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="glass-panel rounded-2xl p-6">
                    <h3 class="font-black text-slate-700 text-xs mb-5 uppercase tracking-wide bg-white/40 inline-block px-3 py-1 rounded border border-white/50">فريق الإدارة</h3>
                    ${teamHTML}
                </div>
                <div class="glass-panel rounded-2xl p-6">
                    <h3 class="font-black text-slate-700 text-xs mb-5 uppercase tracking-wide bg-white/40 inline-block px-3 py-1 rounded border border-white/50">تقييم Google</h3>
                    <div class="bg-white/50 rounded-xl p-4 border border-white/60 flex items-center justify-between mb-4 shadow-sm">
                        <div class="flex items-center gap-3">
                            <span class="text-4xl font-black text-slate-900">${rv}</span>
                            <div class="flex flex-col">
                                <div class="flex text-2xl leading-none mb-1">${buildStars(rv)}</div>
                                <span class="text-xs text-slate-600 font-bold">${rc.toLocaleString('en-US')} مراجعة</span>
                            </div>
                        </div>
                        <div class="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center border border-white shadow-sm">${MAP_PIN_SVG}</div>
                    </div>
                    <div class="flex justify-between items-center text-sm bg-white/30 px-3 py-2 rounded-lg">
                        <span class="text-slate-700 font-bold">من بداية الشهر</span>
                        <span class="font-black text-emerald-700">+${data.positive} مراجعة جديدة</span>
                    </div>
                </div>
            </div>
        </div>`;
}

function buildStatCard(title,pts,max,badgeText,badgeCls,extra) {
    return `<div class="glass-panel rounded-xl p-4 flex flex-col justify-between hover:scale-[1.01] transition-transform">
        <div class="flex items-center justify-between mb-2">
            <p class="text-slate-600 font-bold text-xs">${title}</p>
            <span class="badge ${badgeCls} text-[10px]">${badgeText}</span>
        </div>
        <div class="flex items-baseline gap-2 mt-1">
            <p class="text-3xl font-black text-slate-900">${pts.toFixed(2)}</p>
            <p class="text-xs font-medium text-slate-400">من ${max} نقاط</p>
        </div>${extra||''}
    </div>`;
}
function buildPersonRow(name,role,border) {
    return `<div class="flex items-center gap-4 ${border?'mb-4 pb-4 border-b border-white/30':''}">
        <div class="w-12 h-12 bg-white/70 rounded-full flex items-center justify-center font-black text-slate-800 text-lg border border-white">${name.charAt(0)}</div>
        <div><p class="font-black text-slate-900 text-base">${name}</p><p class="text-slate-600 text-sm font-bold bg-white/30 inline-block px-2 rounded-sm mt-0.5">${role}</p></div>
    </div>`;
}

function openGlobalArticleModal(ts) {
    const art=globalArticles.find(a=>a.timestamp===ts); if(!art) return;
    const lines=art.text?art.text.split('\n').map(l=>l.trim()).filter(l=>l):[];
    const head=lines[0]||art.title||'', body=lines.slice(1).join('<br>')||art.body||'';
    const typeLabels={weekly:'تحديث أسبوعي',announcement:'إعلان',opinion:'رأي'};
    const typeBadge={weekly:'badge-emerald',announcement:'badge-amber',opinion:'badge-rose'};
    const byline=art.authorName?`<p class="text-sm font-bold text-slate-500 mt-4 border-t border-slate-200/50 pt-3">${art.authorName}${art.authorBio?` — ${art.authorBio}`:''}</p>`:'';
    document.getElementById('globalArticleModalBody').innerHTML=`
        <span class="badge ${typeBadge[art.type]||'badge-slate'} mb-4 inline-block">${typeLabels[art.type]||''}</span>
        <h2 class="text-2xl font-black text-slate-900 mb-4 leading-snug">${head}</h2>
        <p class="text-slate-700 text-sm leading-relaxed font-medium whitespace-pre-line">${body}</p>${byline}`;
    document.getElementById('globalArticleModal').style.display='flex';
}
function closeGlobalArticleModal(e) {
    if(e&&e.target!==e.currentTarget) return;
    document.getElementById('globalArticleModal').style.display='none';
}

// ============================================================
// الجريدة (Timeline)
// ============================================================
function generateNewspaper() {
    const tl=document.getElementById('newsTimeline'); tl.innerHTML='';
    let all=[];
    for(let i=1;i<=6;i++){
        const arts=branchArticles[i];
        if(arts&&Array.isArray(arts)) arts.forEach(a=>all.push({branchId:i,type:a.type||'performance',article:a.text,timestamp:a.timestamp,dateStr:a.dateStr,snapshot:a.snapshot||branchesData[i],scores:a.scores||calcScores(branchesData[i])}));
    }
    globalArticles.forEach(a=>all.push({branchId:null,type:a.type,article:a.text,title:a.title||null,timestamp:a.timestamp,dateStr:a.dateStr,authorName:a.authorName||null,authorBio:a.authorBio||null,snapshot:null,scores:null}));
    all.sort((a,b)=>b.timestamp-a.timestamp);
    if(!all.length){
        tl.innerHTML=`<div class="relative"><div class="absolute -right-6 top-0 w-4 h-4 rounded-full bg-slate-800 border-4 border-white/60"></div>
            <h3 class="text-xl font-black text-slate-800 mb-6 bg-white/60 inline-block px-4 py-2 rounded-lg border border-white/80">${formatDateArabic(new Date().toISOString().split('T')[0])}</h3>
            <p class="text-center text-slate-600 bg-white/40 rounded-xl py-8 font-bold border border-white/60">لا توجد تقارير</p></div>`;
        return;
    }
    const grouped={};
    all.forEach(r=>{ if(!grouped[r.dateStr]) grouped[r.dateStr]=[]; grouped[r.dateStr].push(r); });
    const frag=document.createDocumentFragment();
    Object.keys(grouped).sort((a,b)=>new Date(b)-new Date(a)).forEach(dk=>{
        const sec=document.createElement('div'); sec.className='relative mb-12';
        const gridId=`grid-${dk.replace(/[^a-z0-9]/gi,'_')}`;
        sec.innerHTML=`<div class="absolute -right-6 top-0 w-4 h-4 rounded-full bg-slate-800 border-4 border-white/60"></div>
            <h3 class="text-xl font-black text-slate-800 mb-6 bg-white/60 inline-block px-4 py-2 rounded-lg border border-white/80">${formatDateArabic(dk)}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="${gridId}"></div>`;
        const grid=sec.querySelector(`#${gridId}`);
        grouped[dk].forEach(item=>{
            const card=document.createElement('div');
            card.className='glass-panel p-6 rounded-2xl flex flex-col justify-between transition-transform hover:-translate-y-1 border border-white/60 newspaper-card';
            const delBtn=isAdminLoggedIn?`<button onclick="event.stopPropagation();${item.branchId?`deleteArticle(${item.branchId},${item.timestamp})`:`deleteGlobalArticle(${item.timestamp})`}" class="w-7 h-7 flex items-center justify-center btn-outline btn-outline-rose rounded-full" title="حذف">${DEL_SVG}</button>`:'';
            if(item.type==='performance'&&item.branchId){
                const tier=getPerformanceTier(item.scores), lines=item.article?item.article.split('\n').map(l=>l.trim()).filter(l=>l):[];
                card.innerHTML=`<div>
                    <div class="flex justify-between items-start mb-3"><span class="badge ${tier.badgeCls}">الأداء ◂ ${item.snapshot.bName}</span>${delBtn}</div>
                    <h3 onclick="openBulletinPage(${item.branchId},${item.timestamp})" class="font-black text-xl mt-5 mb-3 leading-snug text-slate-900 cursor-pointer hover:text-blue-700 transition">${lines[0]||''}</h3>
                    <p class="text-slate-700 text-sm font-bold mb-4 leading-relaxed bg-white/30 p-2 rounded">${lines[1]||''}</p>
                </div>
                <div class="mt-auto pt-5 border-t border-white/40">
                    <div class="flex justify-between items-center bg-white/40 px-3 py-2 rounded-lg text-slate-800 font-black">
                        <span>النقاط</span><span class="btn-solid-dark px-3 py-1 rounded text-sm">${item.scores.total} ◠</span>
                    </div>
                </div>`;
            } else if(item.type==='weekly'){
                const lines=item.article?item.article.split('\n').map(l=>l.trim()).filter(l=>l):[];
                card.innerHTML=`<div>
                    <div class="flex justify-between items-start mb-3"><span class="badge badge-emerald">جميع الفروع</span>${delBtn}</div>
                    <h3 onclick="openGlobalArticleModal(${item.timestamp})" class="font-black text-xl mt-5 mb-3 leading-snug text-slate-900 cursor-pointer hover:text-blue-700 transition">${lines[0]||'التحديث الأسبوعي'}</h3>
                    <p class="text-slate-700 text-sm font-bold mb-4 leading-relaxed bg-white/30 p-2 rounded">${lines[1]||''}</p>
                </div>
                <div class="mt-auto pt-5 border-t border-white/40 flex justify-between items-center bg-white/40 px-3 py-2 rounded-lg">
                    <span class="text-sm font-bold text-slate-700">تحديث أسبوعي</span><span class="badge badge-emerald text-xs">شامل</span>
                </div>`;
            } else if(item.type==='announcement'){
                const lines=item.article?item.article.split('\n').map(l=>l.trim()).filter(l=>l):[];
                const body=(lines.slice(1).join(' ')||'').substring(0,150);
                card.innerHTML=`<div>
                    <div class="flex justify-between items-start mb-3"><span class="badge badge-amber">إعلان</span>${delBtn}</div>
                    <h3 onclick="openGlobalArticleModal(${item.timestamp})" class="font-black text-xl mt-5 mb-3 leading-snug text-slate-900 cursor-pointer hover:text-blue-700 transition">${lines[0]||'إعلان'}</h3>
                    <p class="text-slate-700 text-sm font-bold mb-4 leading-relaxed bg-white/30 p-2 rounded">${body}${body.length>=150?'...':''}</p>
                </div>
                <div class="mt-auto pt-5 border-t border-white/40 bg-white/40 px-3 py-2 rounded-lg text-xs font-bold text-amber-700">إعلان رسمي</div>`;
            } else if(item.type==='opinion'){
                const lines=item.article?item.article.split('\n').map(l=>l.trim()).filter(l=>l):[];
                const bodyRaw=lines.slice(1).join(' ')||'', body=bodyRaw.substring(0,150);
                const byline=item.authorName?`<div class="opinion-byline mt-3">${item.authorName}${item.authorBio?` — ${item.authorBio}`:''}</div>`:'';
                card.innerHTML=`<div>
                    <div class="flex justify-between items-start mb-3"><span class="badge badge-rose">رأي</span>${delBtn}</div>
                    <h3 onclick="openGlobalArticleModal(${item.timestamp})" class="font-black text-xl mt-5 mb-3 leading-snug text-slate-900 cursor-pointer hover:text-blue-700 transition">${lines[0]||'مقال رأي'}</h3>
                    <p class="text-slate-700 text-sm font-medium mb-3 leading-relaxed">${body}${bodyRaw.length>150?'...':''}</p>${byline}
                </div>
                <div class="mt-auto pt-5 border-t border-white/40 bg-white/40 px-3 py-2 rounded-lg text-xs font-bold text-rose-700">مقال رأي خارجي</div>`;
            }
            grid.appendChild(card);
        });
        frag.appendChild(sec);
    });
    tl.appendChild(frag);
}

// ============================================================
// مساعدات الصفحة
// ============================================================
function showPage(id) {
    const isMain=id==='main';
    const mw=document.getElementById('mainPageWrapper'), bp=document.getElementById('bulletinPage');
    mw.style.display=isMain?'flex':'none'; mw.style.flexDirection='column';
    bp.style.display=isMain?'none':'flex'; bp.style.flexDirection='column';
}
function goToMainPage() { showPage('main'); history.pushState('',document.title,location.pathname); updateOGTags('التقارير - آي أم سبيشل','تقرير الأداء',location.href); }
function updateOGTags(title,desc,url) {
    ['og_title','twitter_title'].forEach(id=>{const el=document.getElementById(id);if(el)el.setAttribute('content',title);});
    ['og_description','twitter_description','meta_description'].forEach(id=>{const el=document.getElementById(id);if(el)el.setAttribute('content',desc);});
    const u=document.getElementById('og_url'); if(u)u.setAttribute('content',url);
    document.title=title;
}
function shareBulletinPage() {
    const url=location.href, bn=currentBulletinData?.bName||'', sl=currentBulletinData?.performanceLabel||'';
    const head=currentBulletinData?.head||'التقارير', lead=currentBulletinData?.lead||'';
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`*تقرير أداء فرع ${bn}*\nأي آم سبيشل\n\n${head}\n\n${lead}\n\nتصنيف: ${sl}\n\n${url}`)}`,'_blank');
}
function showCopyToast(msg) {
    const t=document.getElementById('copyToast'); t.textContent=msg||'تم النسخ';
    t.classList.remove('hidden'); t.classList.add('copy-toast');
    setTimeout(()=>{t.classList.add('hidden');t.classList.remove('copy-toast');},2500);
}

// ============================================================
// حاسبة التوقع
// ============================================================
function toggleTimeCalc() {
    isTimeCalcEnabled=!isTimeCalcEnabled;
    const btn=document.getElementById('timeCalcToggleBtn'), note=document.getElementById('predictionNote'), label=document.getElementById('timeCalcLabel');
    if(isTimeCalcEnabled){
        btn.textContent='قياس الأداء'; btn.className='w-24 text-[10px] font-bold px-2 py-1 rounded-lg border-2 transition bg-transparent border-emerald-500 text-emerald-600 flex-shrink-0';
        if(note) note.classList.remove('hidden');
        if(label) label.innerHTML='قياس الأداء<br><span class="font-medium text-slate-400">يعطيك النظام نظرة سريعة على النتيجة المتوقعة لنهاية الشهر بناءً على أدائك الحالي. مثال: في يوم 28 إذا كان لديك 34 تقييمًا يتوقع النتيجة 9.7 نقاط — يمكن التبديل بضغط الزر</span>';
    } else {
        btn.textContent='حساب النتيجة'; btn.className='w-24 text-[10px] font-bold px-2 py-1 rounded-lg border-2 transition bg-transparent border-blue-500 text-blue-600 flex-shrink-0';
        if(note) note.classList.add('hidden');
        if(label) label.innerHTML='الحاسبة<br><span class="font-medium text-slate-400">يحسب بناءً على 30 يوم ويطبق نظام التعويض ويخفض وزن التقييمات السلبية عند ارتفاع الإيجابية</span>';
    }
    calculateTrial();
}

function openPredictionModal() {
    isTimeCalcEnabled=true;
    const btn=document.getElementById('timeCalcToggleBtn'), note=document.getElementById('predictionNote'), label=document.getElementById('timeCalcLabel');
    if(btn){ btn.textContent='قياس الأداء'; btn.className='w-24 text-[10px] font-bold px-2 py-1 rounded-lg border-2 transition bg-transparent border-emerald-500 text-emerald-600 flex-shrink-0'; }
    if(note) note.classList.remove('hidden');
    if(label) label.innerHTML='قياس الأداء<br><span class="font-medium text-slate-400">يعطيك النظام نظرة سريعة على النتيجة المتوقعة لنهاية الشهر بناءً على أدائك الحالي. مثال: في يوم 28 إذا كان لديك 34 تقييمًا يتوقع النتيجة 9.7 نقاط — يمكن التبديل بضغط الزر</span>';
    document.getElementById('predictionModal').style.display='flex';
    setupDateCalculator(); loadTrialDataFromDB();
}
function closePredictionModal() { document.getElementById('predictionModal').style.display='none'; }
function setupDateCalculator() {
    const today=new Date(), cur=today.getDate(), dim=new Date(today.getFullYear(),today.getMonth()+1,0).getDate();
    autoMultiplier=cur>0?dim/cur:1;
}
function loadTrialDataFromDB() {
    const d=branchesData[document.getElementById('trial_branch_select').value];
    document.getElementById('trial_positive').value=d.positive;
    document.getElementById('trial_negative').value=d.negative;
    calculateTrial();
}
function calculateTrial() {
    const data=branchesData[document.getElementById('trial_branch_select').value];
    const rawP=parseFloat(document.getElementById('trial_positive').value)||0;
    const rawN=parseFloat(document.getElementById('trial_negative').value)||0;
    const multiplier=isTimeCalcEnabled?autoMultiplier:1;
    const scores=calcScores({...data,positive:rawP*multiplier,negative:rawN});
    let total=Math.round((scores.ptsSafety+scores.ptsComplaints+scores.ptsPositive+scores.ptsNegative)*100)/100;
    if(isNaN(total)) total=0;
    document.getElementById('resSafety').textContent=scores.ptsSafety.toFixed(2);
    document.getElementById('resComplaints').textContent=scores.ptsComplaints.toFixed(2);
    document.getElementById('resPos').textContent=scores.ptsPositive.toFixed(2);
    document.getElementById('resNeg').textContent=scores.ptsNegative.toFixed(2);
    document.getElementById('totalPoints').textContent=total;
    document.getElementById('progressBar').style.width=`${Math.min(100,(total/11)*100)}%`;
    const levels=[{min:9,text:"أداء مرتفع ✓",border:"#10b981",bar:"bg-emerald-500"},{min:7,text:"أداء متوسط ◬",border:"#f59e0b",bar:"bg-amber-500"},{min:4,text:"أداء منخفض ⚠",border:"#f97316",bar:"bg-orange-500"},{min:-Infinity,text:"أداء حرج ⨂",border:"#ef4444",bar:"bg-rose-500"}];
    const lv=levels.find(l=>total>=l.min);
    const rb=document.getElementById('rewardBox');
    document.getElementById('rewardText').textContent=lv.text;
    document.getElementById('progressBar').className=`${lv.bar} h-2.5 rounded-full transition-all`;
    rb.style.borderColor=lv.border; rb.style.backgroundColor=`${lv.border}18`;
}

// ============================================================
// Admin
// ============================================================
const SESSION_KEY='ispecial_admin_session';
const saveSession=()=>sessionStorage.setItem(SESSION_KEY,new Date().toISOString().split('T')[0]);
const checkSession=()=>sessionStorage.getItem(SESSION_KEY)===new Date().toISOString().split('T')[0];
const pinBoxes=document.querySelectorAll('.pin-box');

function handleBoxInput(el,idx) {
    el.value=el.value.replace(/[^0-9]/g,'');
    if(el.value!==''){ if(idx<3)pinBoxes[idx+1].focus(); checkAdminPinLength(); }
}
function handleBoxKey(e,idx) {
    if(e.key==='Backspace'&&e.target.value===''&&idx>0){ pinBoxes[idx-1].focus(); pinBoxes[idx-1].value=''; }
}
function checkAdminPinLength() { const pin=Array.from(pinBoxes).map(b=>b.value).join(''); if(pin.length===4)verifyMaintenance(pin); }
function verifyMaintenance(pin) {
    const today=new Date(), correct=today.getDate().toString().padStart(2,'0')+(today.getMonth()+1).toString().padStart(2,'0');
    if(pin===correct){ isAdminLoggedIn=true; saveSession(); closeMaintenanceAuth(); document.getElementById('adminModal').style.display='flex'; loadAdminData(); generateNewspaper(); if(currentBulletinData?.branchId)openBulletinPage(currentBulletinData.branchId,currentArticleTimestamp); }
    else { alert("غير صحيح!"); pinBoxes.forEach(b=>b.value=''); pinBoxes[0].focus(); }
}
function openMaintenanceAuth() {
    if(checkSession()){ isAdminLoggedIn=true; document.getElementById('adminModal').style.display='flex'; loadAdminData(); generateNewspaper(); return; }
    document.getElementById('maintenanceAuthModal').style.display='flex';
    pinBoxes.forEach(b=>b.value=''); setTimeout(()=>pinBoxes[0].focus(),100);
}
function closeMaintenanceAuth() { document.getElementById('maintenanceAuthModal').style.display='none'; }
function closeAdmin() { document.getElementById('adminModal').style.display='none'; }

async function deleteArticle(branchId,ts) {
    if(!confirm('هل تريد حذف هذا المقال نهائياً؟')) return;
    if(!branchArticles[branchId]) return;
    branchArticles[branchId]=branchArticles[branchId].filter(a=>a.timestamp!==ts);
    await saveArticlesToFirebase(); generateNewspaper(); initCarousel();
    if(currentBulletinData?.branchId==branchId)goToMainPage();
    showCopyToast('تم حذف المقال');
}
async function deleteGlobalArticle(ts) {
    if(!confirm('هل تريد حذف هذا المقال نهائياً؟')) return;
    globalArticles=globalArticles.filter(a=>a.timestamp!==ts);
    await saveGlobalArticlesToFirebase(); generateNewspaper(); showCopyToast('تم حذف المقال');
}

function loadAdminData() {
    const id=document.getElementById('branchSelector').value, d=branchesData[id];
    const map={ admin_bName:d.bName, admin_mName:d.mName, admin_dName:d.dName, admin_safety:d.safety, admin_visitors:d.visitors, admin_complaints:d.complaints, admin_negative:d.negative, admin_target:d.target, admin_startReviews:d.baseReviews, admin_currentReviews:d.baseReviews+d.positive, admin_baseRating:d.baseRating };
    Object.entries(map).forEach(([fid,val])=>{ const el=document.getElementById(fid); if(el)el.value=val; });
}
async function saveAdminData() {
    const id=document.getElementById('branchSelector').value;
    const num=(fid,def=0)=>parseFloat(document.getElementById(fid).value)||def;
    const sr=num('admin_startReviews',branchesData[id].baseReviews), cr=num('admin_currentReviews',sr+branchesData[id].positive), neg=num('admin_negative');
    let pos=cr-sr-neg; if(pos<0)pos=0;
    branchesData[id]={ bName:document.getElementById('admin_bName').value, mName:document.getElementById('admin_mName').value, dName:document.getElementById('admin_dName').value, safety:num('admin_safety'), visitors:num('admin_visitors',1), complaints:num('admin_complaints'), positive:pos, negative:neg, target:num('admin_target',50), baseRating:num('admin_baseRating',branchesData[id].baseRating), baseReviews:sr, iframeSrc:branchesData[id].iframeSrc };
    closeAdmin();
    const dk=new Date().toISOString().split('T')[0];
    if(!branchHistory[id])branchHistory[id]=[];
    const sc=calcScores(branchesData[id]), la=getArticleData(id);
    const entry={date:dk,snapshot:{...branchesData[id]},scores:{...sc},article:la?la.text:''};
    const ti=branchHistory[id].findIndex(r=>r.date===dk);
    if(ti>=0)branchHistory[id][ti]=entry; else branchHistory[id].push(entry);
    await saveBranchesToFirebase(); await saveHistoryToFirebase();
    generateNewspaper(); initCarousel(); updateBrandReviewsPanel();
}

function openHistoryModal(branchId) {
    const data=branchesData[branchId], hist=branchHistory[branchId]||[];
    document.getElementById('historyModalTitle').textContent=`سجل فرع ${data.bName}`;
    const cont=document.getElementById('historyContent');
    if(!hist.length){ cont.innerHTML=`<p class="text-slate-500 text-center font-bold py-8 bg-white/40 rounded-xl border border-white/50">لا يوجد سجل حتى الآن</p>`; }
    else {
        cont.innerHTML=[...hist].reverse().map(e=>{
            const tier=getPerformanceTier(e.scores);
            return `<div class="history-item bg-white/60 border border-white/50 rounded-xl p-5 shadow-sm">
                <div class="flex justify-between items-center mb-3">
                    <span class="font-black text-slate-800 text-base">${formatFullDateArabic(new Date(e.date))}</span>
                    <span class="badge ${tier.badgeCls}">${tier.label}</span>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div class="bg-white/50 rounded-lg p-2 border border-white/60"><p class="text-xs text-slate-600 font-bold mb-1">النقاط</p><p class="text-xl font-black text-slate-900">${e.scores.total}</p><p class="text-xs text-slate-400">/ 11</p></div>
                    <div class="bg-emerald-50/50 rounded-lg p-2 border border-emerald-100"><p class="text-xs text-slate-600 font-bold mb-1">إيجابي</p><p class="text-xl font-black text-emerald-700">${e.snapshot.positive}</p></div>
                    <div class="bg-rose-50/50 rounded-lg p-2 border border-rose-100"><p class="text-xs text-slate-600 font-bold mb-1">سلبي</p><p class="text-xl font-black text-rose-700">${e.snapshot.negative}</p></div>
                    <div class="bg-amber-50/50 rounded-lg p-2 border border-amber-100"><p class="text-xs text-slate-600 font-bold mb-1">شكاوى</p><p class="text-xl font-black text-amber-700">${e.snapshot.complaints}</p></div>
                </div>
                ${e.article?`<div class="mt-4 bg-white/40 rounded-lg p-3 border border-white/60"><p class="text-xs text-slate-600 font-bold mb-1.5">المقال:</p><p class="text-slate-700 text-sm leading-relaxed line-clamp-3 font-medium">${e.article.substring(0,200)}${e.article.length>200?'...':''}</p></div>`:''}
            </div>`;
        }).join('');
    }
    document.getElementById('historyModal').style.display='flex';
}
function closeHistoryModal() { document.getElementById('historyModal').style.display='none'; }

// ============================================================
// التهيئة
// ============================================================
document.addEventListener('DOMContentLoaded',async()=>{
    await loadAllDataFromFirebase();
    const lo=document.getElementById('loadingOverlay'); if(lo)lo.style.display='none';
    if(checkSession()) isAdminLoggedIn=true;
    const hash=location.hash;
    if(hash&&hash.startsWith('#opinion-')){ const p=hash.replace('#opinion-',''); generateNewspaper(); initCarousel(); updateBrandReviewsPanel(); autoSaveDailySnapshot(); openOpinionWritePage(p); return; }
    if(hash&&hash.startsWith('#bulletin-')){ const parts=hash.split('-'), bid=parseInt(parts[1]), ts=parts.length>2?parseInt(parts[2]):null;
        if(bid>=1&&bid<=6){ generateNewspaper(); initCarousel(); updateBrandReviewsPanel(); autoSaveDailySnapshot(); setTimeout(()=>openBulletinPage(bid,ts),100); return; } }
    generateNewspaper(); initCarousel(); updateBrandReviewsPanel(); autoSaveDailySnapshot();
});
