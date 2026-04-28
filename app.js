// ============================================================
// app.js — آي أم سبيشل — النسخة الكاملة المحدّثة (تم الإصلاح والتحسين)
// ============================================================

// ============================================================
// إعداد فايربيس (Firebase Initialization) بأمان
// ============================================================
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
    } else {
        console.warn("مكتبات Firebase لم يتم تحميلها. سيتم استخدام البيانات الافتراضية.");
    }
} catch (e) {
    console.error("خطأ في تهيئة Firebase:", e);
}

// ============================================================
// حالة التطبيق
// ============================================================
let isAdminLoggedIn = false;
let isCarouselPaused = false;
let lastClickedCardIndex = 0;
let currentBulletinData = null;
let autoMultiplier = 1;
let carouselInterval;
let currentArticleModalBranchId = null;
let currentArticleTimestamp = null;
let currentArticleType = 'performance'; // performance | weekly | announcement | opinion
let isTimeCalcEnabled = true;
let topContributorTimer = null;

// ============================================================
// قاعدة البيانات الافتراضية
// ============================================================
let branchesData = {
    1: { bName: "شرق بلازا",       mName: "فاطمة السبيعي",  dName: "",                safety: 0, visitors: 1200, complaints: 2, positive: 31, negative: 1, target: 50, baseRating: 4.3, baseReviews: 210, iframeSrc: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d164903.2141441533!2d46.81057301314928!3d24.692980163395696!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f070079c56b1f%3A0x467da10cd49ea263!2sI%20am%20special!5e0!3m2!1sar!2ssa!4v1776487837062!5m2!1sar!2ssa" },
    2: { bName: "الرياض جاليري",   mName: "",                dName: "فاطمة جعفري",    safety: 1, visitors: 900,  complaints: 5, positive: 31, negative: 3, target: 50, baseRating: 4.0, baseReviews: 343, iframeSrc: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d164913.7756258042!2d46.72418597869817!3d24.684998102760346!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2ee3e72ef25fe1%3A0x80694184f2c8bfa3!2z2KfZiiDYp9mFINiz2KjZiti02YQ!5e0!3m2!1sar!2ssa!4v1776487817232!5m2!1sar!2ssa" },
    3: { bName: "ذافيو",            mName: "اسمهان الغامدي", dName: "فاطمة الحارثي",  safety: 0, visitors: 1500, complaints: 1, positive: 99, negative: 0, target: 50, baseRating: 4.6, baseReviews: 326, iframeSrc: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d10306.261765903853!2d46.7286395510535!3d24.69526659713942!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f038fc98c3b9f%3A0xb97168603aaf5b31!2sI%20am%20special!5e0!3m2!1sar!2ssa!4v1776487866148!5m2!1sar!2ssa" },
    4: { bName: "القصر مول",        mName: "منيره هزري",     dName: "",                safety: 0, visitors: 800,  complaints: 0, positive: 11, negative: 4, target: 50, baseRating: 4.3, baseReviews: 215, iframeSrc: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d201771.0028656187!2d46.70064182491825!3d24.597818146740305!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f0574c9346ba1%3A0x71206d42e2e70f9c!2z2KfZiiDYp9mFINiz2KjZiti02YQgfCBJIGFtIHNwZWNpYWw!5e0!3m2!1sar!2ssa!4v1776487726486!5m2!1sar!2ssa" },
    5: { bName: "سلام مول",         mName: "هند المطيري",    dName: "نوف هزازي",      safety: 2, visitors: 1100, complaints: 8, positive: 8,  negative: 6, target: 50, baseRating: 4.2, baseReviews: 147, iframeSrc: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d201771.0028656187!2d46.70064182491825!3d24.597818146740305!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f11aa8f623ed3%3A0x72ab124244a1cf6f!2z2KfZiiDYp9mFINiz2KjZiti02YQ!5e0!3m2!1sar!2ssa!4v1776487753224!5m2!1sar!2ssa" },
    6: { bName: "مركز المملكة",     mName: "",                dName: "هاجر القاسمي",  safety: 0, visitors: 1300, complaints: 3, positive: 3,  negative: 2, target: 50, baseRating: 4.2, baseReviews: 154, iframeSrc: "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d164913.7756258042!2d46.72418597869817!3d24.684998102760346!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f038149e74eaf%3A0xf8016d2217c1f4ef!2z2KfZiiDYp9mFINiz2KjZiti02YQgfCBJIGFtIHNwZWNpYWw!5e0!3m2!1sar!2ssa!4v1776487781383!5m2!1sar!2ssa" }
};

let branchHistory  = {};
let branchArticles = {};
let globalArticles = [];

// ============================================================
// ثوابت SVG
// ============================================================
const SHARE_SVG   = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`;
const MAP_PIN_SVG = `<svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#EA4335"/><circle cx="12" cy="9" r="2.5" fill="#FFF"/></svg>`;

// ============================================================
// تحميل البيانات من فايربيس
// ============================================================
function _fbTimeout(ms) {
    return new Promise((_, reject) =>
        setTimeout(() => reject(new Error('firebase_timeout')), ms)
    );
}

async function _loadDoc(docRef) {
    return Promise.race([docRef.get(), _fbTimeout(6000)]);
}

async function loadAllDataFromFirebase() {
    if (!db) return; // الخروج بأمان إذا لم يعمل فايربيس
    try {
        const branchesDoc = await _loadDoc(db.collection('appData').doc('branches'));
        if (branchesDoc.exists) {
            branchesData = branchesDoc.data().data;
        } else {
            db.collection('appData').doc('branches').set({ data: branchesData }).catch(() => {});
        }

        try {
            const historyDoc = await _loadDoc(db.collection('appData').doc('history'));
            if (historyDoc.exists) branchHistory = historyDoc.data().data;
        } catch (_) {}

        try {
            const articlesDoc = await _loadDoc(db.collection('appData').doc('articles'));
            if (articlesDoc.exists) {
                const loadedArticles = articlesDoc.data().data;
                for (const id in loadedArticles) {
                    if (!Array.isArray(loadedArticles[id])) {
                        const oldData = loadedArticles[id];
                        const text    = typeof oldData === 'string' ? oldData : oldData.text;
                        const ts      = typeof oldData === 'object' && oldData.date ? oldData.date : Date.now();
                        const dateStr = new Date(ts).toISOString().split('T')[0];
                        loadedArticles[id] = [{ type: 'performance', text, timestamp: ts, dateStr, snapshot: { ...branchesData[id] }, scores: calcScores(branchesData[id]) }];
                    } else {
                        loadedArticles[id] = loadedArticles[id].map(a => ({ type: 'performance', ...a }));
                    }
                }
                branchArticles = loadedArticles;
            }
        } catch (_) {}

        try {
            const globalDoc = await _loadDoc(db.collection('appData').doc('globalArticles'));
            if (globalDoc.exists) globalArticles = globalDoc.data().data || [];
        } catch (_) {}

    } catch (e) {
        // Firebase timeout أو غير متاح
    }
}

async function saveBranchesToFirebase() {
    if(!db) return;
    try { await db.collection('appData').doc('branches').set({ data: branchesData }); } catch (_) {}
}
async function saveHistoryToFirebase() {
    if(!db) return;
    try { await db.collection('appData').doc('history').set({ data: branchHistory }); } catch (_) {}
}
async function saveArticlesToFirebase() {
    if(!db) return;
    try { await db.collection('appData').doc('articles').set({ data: branchArticles }); } catch (_) {}
}
async function saveGlobalArticlesToFirebase() {
    if(!db) return;
    try { await db.collection('appData').doc('globalArticles').set({ data: globalArticles }); } catch (_) {}
}

// ============================================================
// لقطة يومية تلقائية
// ============================================================
function autoSaveDailySnapshot() {
    const run = () => {
        const dateKey = new Date().toISOString().split('T')[0];
        let changed = false;
        for (let id = 1; id <= 6; id++) {
            if (!branchHistory[id]) branchHistory[id] = [];
            if (!branchHistory[id].some(r => r.date === dateKey)) {
                const data    = branchesData[id];
                const scores  = calcScores(data);
                const article = getArticleData(id);
                branchHistory[id].push({ date: dateKey, snapshot: { ...data }, scores: { ...scores }, article: article ? article.text : '' });
                changed = true;
            }
        }
        if (changed) saveHistoryToFirebase();
    };
    if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(run, { timeout: 5000 });
    } else {
        setTimeout(run, 3000);
    }
}

function getArticleData(id, timestamp = null) {
    const articles = branchArticles[id];
    if (!articles || !Array.isArray(articles) || articles.length === 0) return null;
    if (timestamp) return articles.find(a => a.timestamp === timestamp) || null;
    return articles.reduce((l, c) => c.timestamp > l.timestamp ? c : l, articles[0]);
}

// ============================================================
// حساب النقاط
// ============================================================
function calcScores(data) {
    const P       = data.positive || 0;
    const target  = data.target || 50;
    const ptsSafety = Math.max(0, 3 - (data.safety || 0));
    const visitors = data.visitors || 1;
    const rawPtsComplaints = Math.max(0, 2 - ((data.complaints || 0) / (visitors * 0.003)));
    const ptsPositive = Math.min(4, (P / target) * 4);
    
    const steps = Math.floor(P / 5) * 5;
    const W = steps === 0 ? 1.0 : Math.max(0.2, 60 / (1.3 * steps + 60));
    const rawPtsNegative = Math.max(0, 2 - ((data.negative || 0) * W));

    let ptsComplaints = rawPtsComplaints;
    let ptsNegative   = rawPtsNegative;
    let surplusUsed   = 0;
    let surplusForComplaints = 0;
    let surplusForNegative   = 0;

    if (P > target) {
        const surplus            = P - target;
        const maxComplaintsBoost = 2 - rawPtsComplaints;
        const complaintsBoost    = Math.min(surplus * 0.1, maxComplaintsBoost);
        ptsComplaints            = Math.min(2, rawPtsComplaints + complaintsBoost);
        surplusForComplaints     = complaintsBoost / 0.1;

        const remainingSurplus   = surplus - surplusForComplaints;
        if (remainingSurplus > 0) {
            const maxNegativeBoost = 2 - rawPtsNegative;
            const negativeBoost    = Math.min(remainingSurplus * 0.075, maxNegativeBoost);
            ptsNegative            = Math.min(2, rawPtsNegative + negativeBoost);
            surplusForNegative     = negativeBoost / 0.075;
        }
        surplusUsed = surplusForComplaints + surplusForNegative;
    }

    const total = Math.round((ptsSafety + ptsComplaints + ptsPositive + ptsNegative) * 100) / 100;

    return {
        ptsSafety, ptsComplaints, ptsPositive, ptsNegative, total,
        rawPtsComplaints, rawPtsNegative,
        surplus: Math.max(0, P - target),
        surplusForComplaints, surplusForNegative, surplusUsed,
        negWeight: W
    };
}

function getPerformanceTier(scores) {
    const { total } = scores;
    if (total >= 9) return {
        headerColor: "text-emerald-700 border-emerald-500",
        label: "أخضر",
        labelBg: "border-emerald-500 text-emerald-700",
        borderColor: "border-emerald-500",
        barColor: "bg-emerald-500"
    };
    if (total >= 6.5) return {
        headerColor: "text-amber-700 border-amber-500",
        label: "أصفر",
        labelBg: "border-amber-500 text-amber-700",
        borderColor: "border-amber-500",
        barColor: "bg-amber-500"
    };
    return {
        headerColor: "text-rose-700 border-rose-500",
        label: "أحمر",
        labelBg: "border-rose-500 text-rose-700",
        borderColor: "border-rose-500",
        barColor: "bg-rose-500"
    };
}

function calcRating(data) {
    return { ratingValue: data.baseRating.toFixed(1), reviewsCount: data.baseReviews + data.positive };
}

function buildStars(ratingValue) {
    const isFull = parseFloat(ratingValue) >= 5.0;
    return `<span class="google-star">★</span>`.repeat(4)
         + `<span class="${isFull ? 'google-star' : 'google-star-empty'}">★</span>`;
}

// ============================================================
// تحديث لوحة إجمالي التقييمات
// ============================================================
function updateBrandReviewsPanel() {
    let total = 0;
    for (let i = 1; i <= 6; i++) total += (branchesData[i].positive || 0);
    document.getElementById('brandTotalReviews').textContent = total;

    let contributors = [];
    for (let i = 1; i <= 6; i++) {
        const d = branchesData[i];
        if ((d.positive || 0) < 20) continue;
        if (d.mName) contributors.push({ name: d.mName, positive: d.positive });
        if (d.dName) contributors.push({ name: d.dName, positive: d.positive });
    }
    contributors.sort((a, b) => b.positive - a.positive);
    const topNames = contributors.slice(0, 5).map(c => c.name);

    if (topNames.length === 0) return;

    clearInterval(topContributorTimer);
    let idx = 0;
    const nameEl = document.getElementById('topContributorName');

    function showName() {
        nameEl.classList.remove('name-fade');
        requestAnimationFrame(() => {
            nameEl.textContent = topNames[idx % topNames.length];
            nameEl.classList.add('name-fade');
        });
        idx++;
    }
    showName();
    topContributorTimer = setInterval(showName, 4500);
}

// ============================================================
// تنسيق التاريخ 
// ============================================================
const _dtfDayMonth    = new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn', { weekday: 'long', day: 'numeric', month: 'long' });
const _dtfFullDate    = new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn', { month: 'long', day: 'numeric', year: 'numeric' });

function formatDateArabic(dateStr) {
    return _dtfDayMonth.format(new Date(dateStr + 'T12:00:00'));
}
function formatFullDateArabic(date) {
    return _dtfFullDate.format(date instanceof Date ? date : new Date(date));
}

// ============================================================
// توليد نص Prompt
// ============================================================
function generatePromptText(branchId, snapshotData = null, snapshotScores = null) {
    const data   = snapshotData || branchesData[branchId];
    const scores = snapshotScores || calcScores(data);
    const tier   = getPerformanceTier(scores);

    const today       = new Date();
    const dateStr     = formatFullDateArabic(today);
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const currentDay  = today.getDate();

    // تم إصلاح الخطأ القواعدي هنا (= بدلاً من :)
    const performanceContext = 
        scores.total >= 6.5 ? "الأداء متوسط ومقبول ولكن يحتاج تحسين ملحوظ"
        : scores.ptsSafety < 3 ? "هناك مشكلة جدية في السلامة تستوجب التنبيه العاجل"
        : scores.ptsComplaints < 1 ? "ارتفاع مقلق في الشكاوى يستدعي تدخلاً فورياً"
        : "ضعف واضح في اكتساب التقييمات الإيجابية يحتاج معالجة";

    const safetyNote = data.safety > 0 ? `⚠️ تسجيل ${data.safety} حادثة سلامة هذا الشهر` : "لا حوادث سلامة مسجلة";

    let mgtLine = [];
    if (data.mName) mgtLine.push(`المديرة ${data.mName}`);
    if (data.dName) mgtLine.push(`نائبتها ${data.dName}`);
    let mgtRef = mgtLine.length > 0 ? `مع الإشارة المباشرة إلى ${mgtLine.join(' و ')}.` : '';

    return `أنت محرر محتوى متخصص في كتابة تقارير الأداء لمراكز ترفيه الأطفال بأسلوب صحفي احترافي ومشوق باللغة العربية.
اكتب تقرير أداء لفرع "${data.bName}" انت تعمل لصالح مجموعة "أي آم سبيشل" لمراكز ترفيه الأطفال وتكتب تقارير داخلية للزملاء والمالك، بناءً على البيانات التالية:

═══════════════════════════════════
📋 بيانات الفرع
═══════════════════════════════════
• اسم الفرع: ${data.bName}
• المديرة: ${data.mName || 'غير محدد'}
• نائبة المديرة: ${data.dName || 'غير محدد'}
• تاريخ التقرير: ${dateStr}
• اليوم من الشهر: ${currentDay} من أصل ${daysInMonth} يوم

═══════════════════════════════════
📊 الأرقام والمؤشرات
═══════════════════════════════════
• حوادث السلامة: ${data.safety} (${safetyNote})
• الشكاوى المسجلة: ${data.complaints}
• التقييمات الإيجابية: ${data.positive} (الهدف: ${data.target})
• التقييمات السلبية: ${data.negative}
• نسبة تحقيق الهدف: ${Math.round((data.positive / data.target) * 100)}%

═══════════════════════════════════
🏆 نتيجة الأداء المحسوبة
═══════════════════════════════════
• نقاط السلامة: ${scores.ptsSafety.toFixed(2)} / 3
• نقاط الشكاوى: ${scores.ptsComplaints.toFixed(2)} / 2
• نقاط التقييمات الإيجابية: ${scores.ptsPositive.toFixed(2)} / 4
• نقاط التقييمات السلبية: ${scores.ptsNegative.toFixed(2)} / 2
• المجموع الكلي: ${scores.total} / 11
• تصنيف الأداء: ${tier.label} (${performanceContext})

═══════════════════════════════════
✍️ متطلبات التقرير
═══════════════════════════════════
اكتب التقرير بالتنسيق التالي بالضبط:

عنوان رئيسي واحد مشوق وجذاب لا يتجاوز 15 كلمة، يعكس أداء الفرع بأسلوب صحفي.

جملة افتتاحية واحدة تلخص الأداء بشكل مكثف (30-50 كلمة).

تحليل موضوعي ودقيق لأداء الفرع يشمل نقاط القوة والضعف، ${mgtRef}
اجعله بين 80 و 100 كلمة بأسلوب صحفي احترافي.

ملاحظات أسلوبية مهمة:
- استخدم أسلوب النشرات الاقتصادية الجذابة، لا أسلوب التقارير الرسمية الجافة
- ضع في الاعتبار ان الفرع يكتسب التقييميات يوميا على مدى الشهر والتقدم اليومي المثالي هو 1.66 تقييم 
- اجعل العنوان لافتاً ومحفزاً على القراءة
- اجعل التقرير باسلوب طبيعي بحيث يفهمه الشخص غير المتعمق في قراءة التقارير
- لا تضف أي عناوين فرعية أو تنسيقات إضافية غير المطلوبة أعلاه`;
}

function generateWeeklyPrompt(reasonsMap) {
    const today       = new Date();
    const dateStr     = formatFullDateArabic(today);
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const currentDay  = today.getDate();

    let branchLines = '';
    for (let i = 1; i <= 6; i++) {
        const d      = branchesData[i];
        const scores = calcScores(d);
        const tier   = getPerformanceTier(scores);
        const reason = reasonsMap[i] || 'لم يُذكر سبب';
        branchLines += `
• فرع ${d.bName}:
  - التقييمات الإيجابية: ${d.positive} / ${d.target} (${Math.round((d.positive/d.target)*100)}%)
  - الشكاوى: ${d.complaints} | السلامة: ${d.safety} | سلبي: ${d.negative}
  - النقاط: ${scores.total} / 11 | التصنيف: ${tier.label}
  - سبب الانخفاض / ملاحظة: ${reason}
`;
    }

    return `أنت محرر محتوى متخصص في كتابة التحديثات الأسبوعية الداخلية لمجموعة "أي آم سبيشل" لمراكز ترفيه الأطفال.
اكتب تحديثاً أسبوعياً شاملاً بتاريخ ${dateStr} (اليوم ${currentDay} من أصل ${daysInMonth})، يتضمن أداء جميع الفروع الستة:

═══════════════════════════════════
📊 أرقام جميع الفروع هذا الأسبوع
═══════════════════════════════════
${branchLines}

═══════════════════════════════════
✍️ متطلبات التحديث الأسبوعي
═══════════════════════════════════
اكتب التحديث بالتنسيق التالي:

عنوان رئيسي واحد يلخص حالة الأسبوع ولا يتجاوز 12 كلمة.

مقدمة موجزة (30-40 كلمة) تصف الحالة العامة للمجموعة.

تحليل لكل فرع في فقرة قصيرة واحدة (20-30 كلمة لكل فرع)، مع ذكر سبب الانخفاض وما يجب فعله.

خاتمة تحفيزية قصيرة (20-30 كلمة).

ملاحظات مهمة:
- أسلوب داخلي مباشر للزملاء والمالك
- لا تُضف عناوين فرعية ولا رموز تنسيق إضافية`;
}

// ============================================================
// النوافذ (Modals)
// ============================================================
function openArticleTypeSelector() {
    const id = document.getElementById('branchSelector').value;
    currentArticleModalBranchId = id;
    closeAdmin();
    document.getElementById('articleTypeModal').style.display = 'flex';
}
function closeArticleTypeModal() { document.getElementById('articleTypeModal').style.display = 'none'; }

function selectArticleType(type) {
    closeArticleTypeModal();
    currentArticleType = type;
    if      (type === 'performance')  openArticleModal(currentArticleModalBranchId);
    else if (type === 'weekly')       openWeeklyModal();
    else if (type === 'announcement') openAnnouncementModal();
    else if (type === 'opinion')      openOpinionLinkModal();
}

function openArticleModal(branchId, timestamp = null) {
    currentArticleModalBranchId = branchId;
    currentArticleTimestamp     = timestamp;
    currentArticleType          = 'performance';

    const data         = branchesData[branchId];
    let targetData     = data;
    let targetScores   = calcScores(data);
    let existingText   = '';

    if (timestamp) {
        const articleObj = getArticleData(branchId, timestamp);
        if (articleObj) {
            targetData   = articleObj.snapshot || data;
            targetScores = articleObj.scores   || targetScores;
            existingText = articleObj.text;
        }
    } else {
        const latestObj = getArticleData(branchId);
        if (latestObj && latestObj.dateStr === new Date().toISOString().split('T')[0]) {
            existingText = latestObj.text;
        }
    }

    document.getElementById('articleModalTitle').textContent    = `مقال فرع ${data.bName}`;
    let subtitleParts = [`الفرع: ${data.bName}`];
    if (data.mName) subtitleParts.push(`المديرة: ${data.mName}`);
    else if (data.dName) subtitleParts.push(`النائبة: ${data.dName}`);
    document.getElementById('articleModalSubtitle').textContent = subtitleParts.join(' — ');

    const promptText = generatePromptText(branchId, targetData, targetScores);

    document.getElementById('articleModalBody').innerHTML = `
        <div class="flex items-center gap-3 mb-4">
            <span class="w-8 h-8 rounded-full bg-slate-800 text-white text-sm font-black flex items-center justify-center shadow-md">1</span>
            <span class="font-bold text-slate-800 bg-white/40 px-3 py-1 rounded-lg backdrop-blur border border-white/50">انسخ الأمر</span>
        </div>
        <div class="relative">
            <pre id="generatedPrompt" class="prompt-box p-5 text-sm overflow-auto max-h-72 shadow-inner">${promptText}</pre>
            <button onclick="copyPrompt()" class="absolute top-3 left-3 bg-slate-800/90 backdrop-blur hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition flex items-center gap-1.5 shadow">نسخ</button>
        </div>
        <div class="flex items-center gap-3 mt-6 mb-2">
            <span class="w-8 h-8 rounded-full bg-slate-800 text-white text-sm font-black flex items-center justify-center shadow-md">2</span>
            <span class="font-bold text-slate-800 bg-white/40 px-3 py-1 rounded-lg backdrop-blur border border-white/50">ألصق هنا</span>
        </div>
        <textarea id="articlePasteInput" class="article-input w-full rounded-xl p-5 glass-input focus:outline-none focus:ring-2 focus:ring-slate-400 text-slate-800 font-medium shadow-inner" placeholder="اكتب مقالاً...">${existingText}</textarea>
        <div class="flex gap-3 pt-2">
            <button onclick="saveArticleFromInput()" class="flex-1 bg-slate-800/90 backdrop-blur hover:bg-slate-900 text-white font-black py-4 rounded-xl transition shadow-lg border border-white/20 text-lg">حفظ المقال</button>
            <button onclick="closeArticleModal()" class="bg-white/60 hover:bg-white/80 backdrop-blur text-slate-800 font-bold py-4 px-6 rounded-xl transition border border-white/60 shadow-sm text-lg">إلغاء</button>
        </div>
    `;

    document.getElementById('articleModal').style.display = 'flex';
}

function closeArticleModal() {
    document.getElementById('articleModal').style.display = 'none';
    currentArticleModalBranchId = null;
    currentArticleTimestamp     = null;
}

function copyPrompt() {
    const text = document.getElementById('generatedPrompt').textContent;
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => showCopyToast());
    else {
        const el = document.createElement('textarea');
        el.value = text; document.body.appendChild(el); el.select();
        document.execCommand('copy'); document.body.removeChild(el);
        showCopyToast();
    }
}

async function saveArticleFromInput() {
    const id   = currentArticleModalBranchId;
    const text = document.getElementById('articlePasteInput').value.trim();
    if (!id) return;
    if (!text) { alert('الرجاء لصق المقال أولاً'); return; }

    if (!branchArticles[id]) branchArticles[id] = [];
    const ts      = currentArticleTimestamp || new Date().getTime();
    const dateStr = new Date(ts).toISOString().split('T')[0];

    const articleObj = {
        type: 'performance',
        text, timestamp: ts, dateStr,
        snapshot: JSON.parse(JSON.stringify(branchesData[id])),
        scores:   calcScores(branchesData[id])
    };

    const existingIndex = branchArticles[id].findIndex(a => a.dateStr === dateStr);
    if (existingIndex >= 0) branchArticles[id][existingIndex] = articleObj;
    else branchArticles[id].push(articleObj);

    await saveArticlesToFirebase();
    closeArticleModal();
    generateNewspaper();
    initCarousel();
    updateBrandReviewsPanel();
    showCopyToast('تم حفظ المقال وارتباطه بأرقام اليوم');
}

function openAnnouncementModal() {
    document.getElementById('articleModalTitle').textContent    = 'إعلان جديد';
    document.getElementById('articleModalSubtitle').textContent = 'مقال إعلاني يكتبه المستخدم مباشرةً';

    document.getElementById('articleModalBody').innerHTML = `
        <div>
            <label class="block text-sm font-bold text-slate-700 mb-2">عنوان الإعلان</label>
            <input type="text" id="announcementTitle" class="w-full p-3 rounded-lg glass-input focus:outline-none focus:ring-2 focus:ring-slate-400 text-sm mb-4" placeholder="أدخل عنوان الإعلان">
        </div>
        <div>
            <label class="block text-sm font-bold text-slate-700 mb-2">نص الإعلان</label>
            <textarea id="announcementBody" rows="8" class="w-full p-4 rounded-xl glass-input focus:outline-none focus:ring-2 focus:ring-slate-400 text-sm leading-relaxed resize-y" placeholder="اكتب نص الإعلان هنا..."></textarea>
        </div>
        <div class="flex gap-3 pt-2">
            <button onclick="saveAnnouncementArticle()" class="flex-1 bg-amber-600/90 backdrop-blur hover:bg-amber-700 text-white font-black py-4 rounded-xl transition shadow-lg border border-white/20 text-lg">نشر الإعلان</button>
            <button onclick="closeArticleModal()" class="bg-white/60 hover:bg-white/80 backdrop-blur text-slate-800 font-bold py-4 px-6 rounded-xl transition border border-white/60 shadow-sm text-lg">إلغاء</button>
        </div>
    `;
    document.getElementById('articleModal').style.display = 'flex';
}

async function saveAnnouncementArticle() {
    const title = document.getElementById('announcementTitle').value.trim();
    const body  = document.getElementById('announcementBody').value.trim();
    if (!title || !body) { alert('يرجى ملء العنوان والنص'); return; }

    const ts      = new Date().getTime();
    const dateStr = new Date(ts).toISOString().split('T')[0];
    const article = { type: 'announcement', title, body, text: `${title}\n${body}`, timestamp: ts, dateStr };
    globalArticles.push(article);

    await saveGlobalArticlesToFirebase();
    closeArticleModal();
    generateNewspaper();
    showCopyToast('تم نشر الإعلان');
}

function openWeeklyModal() {
    let rows = '';
    for (let i = 1; i <= 6; i++) {
        const d      = branchesData[i];
        const scores = calcScores(d);
        const tier   = getPerformanceTier(scores);
        rows += `
        <div class="bg-white/30 backdrop-blur rounded-xl p-4 border border-white/50">
            <div class="flex justify-between items-center mb-2">
                <span class="font-black text-slate-900 text-sm">فرع ${d.bName}</span>
                <span class="text-xs font-bold px-2 py-0.5 rounded-full border ${tier.labelBg}">${tier.label} — ${scores.total}/11</span>
            </div>
            <div class="flex gap-3 text-xs text-slate-600 font-bold mb-3 flex-wrap">
                <span>إيجابي: ${d.positive}/${d.target}</span>
                <span>شكاوى: ${d.complaints}</span>
                <span>سلبي: ${d.negative}</span>
                <span>سلامة: ${d.safety}</span>
            </div>
            <input type="text" id="weeklyReason_${i}" class="w-full p-2 rounded-lg glass-input text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="سبب الانخفاض أو ملاحظة...">
        </div>`;
    }

    document.getElementById('weeklyModalBody').innerHTML = `
        <div class="space-y-3">${rows}</div>
        <div class="relative mt-2">
            <pre id="weeklyPromptBox" class="prompt-box p-5 text-sm overflow-auto max-h-64 shadow-inner hidden"></pre>
            <button id="weeklyPromptCopyBtn" onclick="copyWeeklyPrompt()" class="absolute top-3 left-3 bg-slate-800/90 backdrop-blur hover:bg-slate-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition hidden">نسخ</button>
        </div>
        <div>
            <label class="block text-sm font-bold text-slate-700 mb-2">المقال الأسبوعي (الصقه هنا بعد توليده)</label>
            <textarea id="weeklyArticleText" rows="6" class="w-full p-4 rounded-xl glass-input focus:outline-none focus:ring-2 focus:ring-slate-400 text-sm leading-relaxed resize-y" placeholder="الصق المقال الأسبوعي هنا بعد نسخ البرومبت وتوليده..."></textarea>
        </div>
        <div class="flex gap-3">
            <button onclick="generateWeeklyPromptUI()" class="flex-1 bg-emerald-600/90 hover:bg-emerald-700 text-white font-black py-3 rounded-xl transition shadow border border-white/20 text-sm">توليد البرومبت</button>
            <button onclick="saveWeeklyArticle()" class="flex-1 bg-slate-800/90 hover:bg-slate-900 text-white font-black py-3 rounded-xl transition shadow border border-white/20 text-sm">حفظ المقال</button>
            <button onclick="closeWeeklyModal()" class="bg-white/60 hover:bg-white/80 text-slate-800 font-bold py-3 px-4 rounded-xl border border-white/60 transition text-sm">إلغاء</button>
        </div>
    `;
    document.getElementById('weeklyModal').style.display = 'flex';
}

function generateWeeklyPromptUI() {
    const reasonsMap = {};
    for (let i = 1; i <= 6; i++) {
        const el = document.getElementById(`weeklyReason_${i}`);
        reasonsMap[i] = el ? el.value.trim() : '';
    }
    const prompt = generateWeeklyPrompt(reasonsMap);
    const box    = document.getElementById('weeklyPromptBox');
    const btn    = document.getElementById('weeklyPromptCopyBtn');
    box.textContent = prompt;
    box.classList.remove('hidden');
    btn.classList.remove('hidden');
}

function copyWeeklyPrompt() {
    const text = document.getElementById('weeklyPromptBox').textContent;
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => showCopyToast());
    else {
        const el = document.createElement('textarea');
        el.value = text; document.body.appendChild(el); el.select();
        document.execCommand('copy'); document.body.removeChild(el);
        showCopyToast();
    }
}

async function saveWeeklyArticle() {
    const text = document.getElementById('weeklyArticleText').value.trim();
    if (!text) { alert('يرجى لصق المقال الأسبوعي أولاً'); return; }

    const reasonsMap = {};
    for (let i = 1; i <= 6; i++) {
        const el = document.getElementById(`weeklyReason_${i}`);
        reasonsMap[i] = el ? el.value.trim() : '';
    }

    const ts      = new Date().getTime();
    const dateStr = new Date(ts).toISOString().split('T')[0];
    const lines   = text.split('\n').map(l => l.trim()).filter(l => l);
    const title   = lines[0] || 'التحديث الأسبوعي';

    const article = {
        type: 'weekly', text, title, timestamp: ts, dateStr,
        reasons: reasonsMap,
        branchSnapshots: Object.fromEntries(
            Object.keys(branchesData).map(i => [i, { ...branchesData[i], scores: calcScores(branchesData[i]) }])
        )
    };
    globalArticles.push(article);

    await saveGlobalArticlesToFirebase();
    closeWeeklyModal();
    generateNewspaper();
    showCopyToast('تم حفظ التحديث الأسبوعي');
}

function closeWeeklyModal() { document.getElementById('weeklyModal').style.display = 'none'; }

function openOpinionLinkModal() {
    document.getElementById('opinionAuthorName').value = '';
    document.getElementById('opinionAuthorBio').value  = '';
    document.getElementById('opinionLinkResult').classList.add('hidden');
    document.getElementById('opinionLinkModal').style.display = 'flex';
}
function closeOpinionLinkModal() { document.getElementById('opinionLinkModal').style.display = 'none'; }

function generateOpinionLink() {
    const name = document.getElementById('opinionAuthorName').value.trim();
    const bio  = document.getElementById('opinionAuthorBio').value.trim();
    if (!name || !bio) { alert('يرجى إدخال الاسم والنبذة'); return; }

    const token   = `op_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    const payload = btoa(encodeURIComponent(JSON.stringify({ name, bio, token, exp: Date.now() + 7 * 24 * 3600 * 1000 })));
    const url     = `${window.location.origin}${window.location.pathname}#opinion-${payload}`;

    document.getElementById('opinionLinkUrl').value = url;
    document.getElementById('opinionLinkResult').classList.remove('hidden');
}

function copyOpinionLink() {
    const url = document.getElementById('opinionLinkUrl').value;
    if (navigator.clipboard) navigator.clipboard.writeText(url).then(() => showCopyToast('تم نسخ الرابط'));
    else {
        const el = document.createElement('textarea');
        el.value = url; document.body.appendChild(el); el.select();
        document.execCommand('copy'); document.body.removeChild(el);
        showCopyToast('تم نسخ الرابط');
    }
}

let currentOpinionToken = null;
let currentOpinionAuthor = null;

function openOpinionWritePage(payload) {
    try {
        const data = JSON.parse(decodeURIComponent(atob(payload)));
        if (data.exp && Date.now() > data.exp) {
            alert('انتهت صلاحية هذا الرابط');
            history.replaceState('', '', window.location.pathname);
            return;
        }
        currentOpinionToken  = data.token;
        currentOpinionAuthor = { name: data.name, bio: data.bio };
        document.getElementById('opinionWriteTitle').textContent   = 'كتابة مقال رأي';
        document.getElementById('opinionWriteSubtitle').textContent = `الكاتبة: ${data.name} — ${data.bio}`;
        document.getElementById('opinionTitleInput').value = '';
        document.getElementById('opinionBodyInput').value  = '';
        document.getElementById('opinionWritePage').style.display = 'flex';
        document.getElementById('mainPageWrapper').style.display = 'none';
    } catch (e) {
        console.error('Opinion link parse error', e);
    }
}

async function submitOpinionArticle() {
    const title = document.getElementById('opinionTitleInput').value.trim();
    const body  = document.getElementById('opinionBodyInput').value.trim();
    if (!title || !body) { alert('يرجى إدخال العنوان والمحتوى'); return; }
    if (!currentOpinionAuthor) return;

    const ts      = new Date().getTime();
    const dateStr = new Date(ts).toISOString().split('T')[0];
    const article = {
        type:       'opinion',
        title,
        body,
        text:       `${title}\n${body}`,
        timestamp:  ts,
        dateStr,
        authorName: currentOpinionAuthor.name,
        authorBio:  currentOpinionAuthor.bio,
        token:      currentOpinionToken
    };
    globalArticles.push(article);
    await saveGlobalArticlesToFirebase();

    document.getElementById('opinionWritePage').style.display = 'none';
    document.getElementById('mainPageWrapper').style.display  = 'flex';
    history.replaceState('', '', window.location.pathname);
    generateNewspaper();
    showCopyToast('تم إرسال مقال الرأي بنجاح ✓');
}

// ============================================================
// الكاروسيل — بطاقات الفروع
// ============================================================
function initCarousel() {
    const carousel = document.getElementById('branchesCarousel');
    const fragment  = document.createDocumentFragment(); 

    const sortedIds = [1,2,3,4,5,6].sort((a,b) => (branchesData[b].positive||0) - (branchesData[a].positive||0));

    sortedIds.forEach((i, idx) => {
        const data = branchesData[i];
        const { ratingValue, reviewsCount } = calcRating(data);
        const scores = calcScores(data);
        const tier   = getPerformanceTier(scores);
        let mgtNames = [];
        if (data.mName) mgtNames.push(data.mName);
        if (data.dName) mgtNames.push(data.dName);
        let mgtText = mgtNames.length > 0 ? `إدارة: ${mgtNames.join(' و ')}` : 'إدارة الفرع';

        const cardIdx = idx; 
        const card = document.createElement('div');
        card.className = `min-w-[85%] md:min-w-[320px] lg:min-w-[340px] flex-shrink-0 glass-panel rounded-2xl p-5 snap-center transition-transform hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)] cursor-pointer active:cursor-grabbing border border-white/60`;

        card.onclick = (e) => {
            if (e.target.closest('.map-btn')) {
                openIframeModal(data.iframeSrc, cardIdx);
                return;
            }
            if (isAdminLoggedIn) {
                document.getElementById('branchSelector').value = i;
                loadAdminData();
                document.getElementById('adminModal').style.display = 'flex';
            } else {
                openBranchDetailModal(i);
            }
        };

        card.innerHTML = `
            <div class="flex justify-between items-start mb-5">
                <div>
                    <h3 class="font-black text-xl text-slate-900 tracking-tight drop-shadow-sm">فرع ${data.bName}</h3>
                    <p class="text-xs text-slate-600 font-bold mt-1">${mgtText}</p>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-xs font-bold px-2 py-1 rounded-full border ${tier.labelBg}">${tier.label}</span>
                    <button class="map-btn w-10 h-10 bg-white/70 backdrop-blur rounded-full flex items-center justify-center border border-white shadow-sm hover:scale-110 transition" title="عرض الخريطة">${MAP_PIN_SVG}</button>
                </div>
            </div>
            <div class="bg-white/50 backdrop-blur rounded-xl p-3 border border-white/60 flex items-center justify-between shadow-sm">
                <div class="flex items-center gap-3">
                    <span class="text-2xl font-black text-slate-900 drop-shadow-sm">${ratingValue}</span>
                    <div class="flex text-lg leading-none mb-1">${buildStars(ratingValue)}</div>
                </div>
                <div class="flex flex-col items-end">
                    <span class="text-xs font-bold text-slate-600 mb-1">المراجعات</span>
                    <span class="text-xs font-black text-blue-800 bg-blue-100/60 backdrop-blur px-2.5 py-1 rounded-md border border-blue-200/50">${reviewsCount.toLocaleString('en-US')}</span>
                </div>
            </div>
            <div class="mt-4 pt-4 border-t border-white/40 flex justify-between items-center text-sm">
                <div class="font-bold text-slate-700 bg-white/30 px-2 py-0.5 rounded">من بداية الشهر</div>
                <div class="font-black text-emerald-700">${data.positive} <span class="text-xs font-bold">مراجعة إيجابية</span></div>
            </div>
        `;
        fragment.appendChild(card);
    });

    carousel.innerHTML = '';
    carousel.appendChild(fragment);

    setupCarouselDots();
    setupCarouselEvents();
}

function openBranchDetailModal(branchId) {
    const data   = branchesData[branchId];
    const scores = calcScores(data);
    const tier   = getPerformanceTier(scores);

    document.getElementById('branchDetailTitle').textContent = `مؤشرات فرع ${data.bName}`;

    let complaintsNote = '';
    let negativeNote   = '';
    if (scores.surplusForComplaints > 0) {
        complaintsNote = `<span class="surplus-badge">تم استخدام فائض التقييمات الإيجابية لتصحيح نقاط الشكاوى</span>`;
    }
    if (scores.surplusForNegative > 0) {
        negativeNote = `<span class="surplus-badge">تم استخدام فائض التقييمات الإيجابية لتصحيح نقاط السلبية</span>`;
    }

    const progressPct = Math.min(100, (scores.total / 11) * 100);

    document.getElementById('branchDetailContent').innerHTML = `
        <div class="flex items-center justify-between mb-2">
            <span class="font-bold text-slate-600 text-sm">الأداء العام</span>
            <span class="font-black text-4xl text-slate-900">${scores.total} <span class="text-sm font-bold text-slate-500">/ 11</span></span>
        </div>
        <div class="w-full bg-slate-200/50 border border-white/60 rounded-full h-3 overflow-hidden mb-1 shadow-inner">
            <div class="${tier.barColor} h-3 rounded-full transition-all" style="width:${progressPct}%"></div>
        </div>
        <p class="text-xs font-bold ${tier.headerColor} border inline-block px-2 py-0.5 rounded-full mb-4">${tier.label}</p>

        <div class="grid grid-cols-2 gap-3">
            <div class="bg-white/50 rounded-xl p-3 border border-white/60">
                <p class="text-xs font-bold text-slate-500 mb-1">السلامة</p>
                <div class="flex items-baseline gap-1.5">
                    <p class="text-2xl font-black text-slate-900">${scores.ptsSafety.toFixed(2)}</p>
                    <p class="text-xs text-slate-400 font-medium">(من 3)</p>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">/ ${data.safety} حوادث</p>
            </div>
            <div class="bg-white/50 rounded-xl p-3 border border-white/60">
                <p class="text-xs font-bold text-slate-500 mb-1">الشكاوى</p>
                <div class="flex items-baseline gap-1.5">
                    <p class="text-2xl font-black text-slate-900">${scores.ptsComplaints.toFixed(2)}</p>
                    <p class="text-xs text-slate-400 font-medium">(من 2)</p>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">/ ${data.complaints} شكوى</p>
                ${complaintsNote}
            </div>
            <div class="bg-emerald-50/60 rounded-xl p-3 border border-emerald-100">
                <p class="text-xs font-bold text-slate-500 mb-1">التقييمات الإيجابية</p>
                <div class="flex items-baseline gap-1.5">
                    <p class="text-2xl font-black text-emerald-700">${scores.ptsPositive.toFixed(2)}</p>
                    <p class="text-xs text-slate-400 font-medium">(من 4)</p>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">/ ${data.positive} من ${data.target}</p>
            </div>
            <div class="bg-rose-50/60 rounded-xl p-3 border border-rose-100">
                <p class="text-xs font-bold text-slate-500 mb-1">التقييمات السلبية</p>
                <div class="flex items-baseline gap-1.5">
                    <p class="text-2xl font-black text-rose-700">${scores.ptsNegative.toFixed(2)}</p>
                    <p class="text-xs text-slate-400 font-medium">(من 2)</p>
                </div>
                <p class="text-xs text-slate-500 mt-0.5">/ ${data.negative} تقييم</p>
                ${negativeNote}
            </div>
        </div>
        <div class="mt-4 bg-white/30 rounded-xl p-3 border border-white/40">
            <div class="flex justify-between items-center mb-1">
                <span class="text-xs font-bold text-slate-600">التقييمات الإيجابية من الهدف</span>
                <span class="text-xs font-black text-slate-900">${data.positive} / ${data.target}</span>
            </div>
            <div class="w-full bg-slate-200/50 rounded-full h-2 overflow-hidden border border-white/50">
                <div class="${data.positive >= data.target ? 'bg-emerald-500' : 'bg-slate-700'} h-2 rounded-full" style="width:${Math.min(100, (data.positive / data.target) * 100)}%"></div>
            </div>
        </div>
    `;
    document.getElementById('branchDetailModal').style.display = 'flex';
}

function closeBranchDetailModal(e) {
    if (e && e.target !== e.currentTarget) return;
    document.getElementById('branchDetailModal').style.display = 'none';
}

function setupCarouselDots() {
    const dotsContainer = document.getElementById('carouselDots');
    dotsContainer.innerHTML = '';
    for (let i = 0; i < 6; i++) {
        dotsContainer.innerHTML += `<button onclick="scrollToCard(${i})" class="carousel-dot w-2.5 h-2.5 rounded-full bg-slate-300/80 backdrop-blur transition-all duration-300 border border-white/50"></button>`;
    }
    updateActiveDot();
}

function scrollToCard(index) {
    const carousel = document.getElementById('branchesCarousel');
    const cards    = carousel.children;
    if (cards[index]) cards[index].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

function updateActiveDot() {
    const carousel = document.getElementById('branchesCarousel');
    const dots     = document.querySelectorAll('.carousel-dot');
    if (!dots.length || !carousel.children.length) return;
    const cards = carousel.children;
    let closestIndex  = 0;
    let minDistance   = Infinity;
    const carouselCenter = carousel.getBoundingClientRect().left + carousel.getBoundingClientRect().width / 2;
    for (let i = 0; i < cards.length; i++) {
        const cardCenter = cards[i].getBoundingClientRect().left + cards[i].getBoundingClientRect().width / 2;
        const distance   = Math.abs(carouselCenter - cardCenter);
        if (distance < minDistance) { minDistance = distance; closestIndex = i; }
    }
    dots.forEach((dot, idx) => {
        dot.className = idx === closestIndex
            ? "carousel-dot w-6 h-2.5 rounded-full bg-slate-800 shadow-sm transition-all duration-300 border border-white/50"
            : "carousel-dot w-2.5 h-2.5 rounded-full bg-slate-300/80 backdrop-blur transition-all duration-300 border border-white/50";
    });
}

function scrollCarousel(direction) {
    const el = document.getElementById('branchesCarousel');
    if (el) el.scrollBy({ left: direction * -340, behavior: 'smooth' });
}

// ============================================================
// إصلاح الكاروسيل (منع تدمير onclick عبر الاستنساخ)
// ============================================================
let _carouselEventsAttached = false;
let scrollRaf = null;

function setupCarouselEvents() {
    const el = document.getElementById('branchesCarousel');
    if(!el) return;

    const startAutoScroll = () => {
        clearInterval(carouselInterval);
        if (isCarouselPaused) return;
        carouselInterval = setInterval(() => {
            const maxScroll = el.scrollWidth - el.clientWidth;
            if (Math.abs(el.scrollLeft) >= maxScroll - 10) el.scrollTo({ left: 0, behavior: 'smooth' });
            else el.scrollBy({ left: -340, behavior: 'smooth' });
        }, 6000);
    };

    if (_carouselEventsAttached) {
        // الإبقاء على نفس الـ listeners، فقط إعادة تعيين الـ Interval
        startAutoScroll();
        return; 
    }
    _carouselEventsAttached = true;

    el.addEventListener('scroll', () => {
        if (scrollRaf) return;
        scrollRaf = requestAnimationFrame(() => { updateActiveDot(); scrollRaf = null; });
    }, { passive: true });

    el.addEventListener('mouseenter', () => { if (!isCarouselPaused) clearInterval(carouselInterval); }, { passive: true });
    el.addEventListener('mouseleave', startAutoScroll, { passive: true });
    el.addEventListener('touchstart', () => { if (!isCarouselPaused) clearInterval(carouselInterval); }, { passive: true });
    el.addEventListener('touchend', startAutoScroll, { passive: true });
    startAutoScroll();
}

function openIframeModal(src, cardIndex) {
    if (cardIndex !== undefined) { lastClickedCardIndex = cardIndex; scrollToCard(cardIndex); }
    isCarouselPaused = true;
    clearInterval(carouselInterval);
    document.getElementById('branchMapIframe').src = src;
    document.getElementById('iframeModal').style.display = 'flex';
}

function closeIframeModal(e) {
    if (e && e.target !== e.currentTarget && e.target.tagName !== 'BUTTON') return;
    document.getElementById('iframeModal').style.display = 'none';
    document.getElementById('branchMapIframe').src = '';
    setTimeout(() => {
        scrollToCard(lastClickedCardIndex);
        isCarouselPaused = false;
        clearInterval(carouselInterval);
        const el = document.getElementById('branchesCarousel');
        if (!el) return;
        carouselInterval = setInterval(() => {
            const maxScroll = el.scrollWidth - el.clientWidth;
            if (Math.abs(el.scrollLeft) >= maxScroll - 10) el.scrollTo({ left: 0, behavior: 'smooth' });
            else el.scrollBy({ left: -340, behavior: 'smooth' });
        }, 6000);
    }, 3000);
}

function openBulletinPage(branchId, timestamp = null) {
    let data, scores, articleData, dateStr;

    if (timestamp) {
        articleData = getArticleData(branchId, timestamp);
        if (articleData && articleData.snapshot) {
            data    = articleData.snapshot;
            scores  = articleData.scores || calcScores(data);
            dateStr = formatFullDateArabic(new Date(articleData.timestamp));
        } else {
            data    = branchesData[branchId];
            scores  = calcScores(data);
            dateStr = formatFullDateArabic(new Date());
        }
    } else {
        data        = branchesData[branchId];
        scores      = calcScores(data);
        articleData = getArticleData(branchId);
        dateStr     = formatFullDateArabic(new Date());
    }

    const tier              = getPerformanceTier(scores);
    const { ratingValue, reviewsCount } = calcRating(data);
    const progressPercent   = Math.min(100, (scores.total / 11) * 100);
    const article           = articleData ? articleData.text : null;
    const articleTimestamp  = articleData ? articleData.timestamp : null;

    let articleHead = '', articleLead = '', articleBody = '';
    if (article) {
        const lines = article.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length >= 1) articleHead = lines[0];
        if (lines.length >= 2) articleLead = lines[1];
        if (lines.length >= 3) articleBody = lines.slice(2).join(' ');
    }

    currentBulletinData = {
        branchId,
        bName:            data.bName,
        head:             articleHead || `تقرير أداء فرع ${data.bName}`,
        lead:             articleLead || `مؤشر الأداء العام: ${scores.total} / 11 — تصنيف: ${tier.label}`,
        performanceLabel: tier.label,
        dateStr
    };

    document.getElementById('bulletinBreadcrumbBranch').textContent = `فرع ${data.bName}`;

    const hashUrl = timestamp ? `#bulletin-${branchId}-${timestamp}` : `#bulletin-${branchId}`;
    history.pushState('', '', hashUrl);
    updateOGTags(
        `تقرير فرع ${data.bName} - أي آم سبيشل`,
        `${currentBulletinData.head} | المؤشر العام: ${scores.total}/11 | تصنيف: ${tier.label}`,
        window.location.href
    );

    document.getElementById('bulletinContent').innerHTML = buildBulletinHTML(
        data, scores, tier,
        { head: articleHead, lead: articleLead, body: articleBody },
        ratingValue, reviewsCount, dateStr, progressPercent, branchId, !!article, articleTimestamp
    );

    showPage('bulletin');
    const contentEl = document.getElementById('bulletinContent');
    contentEl.classList.remove('slide-up');
    requestAnimationFrame(() => contentEl.classList.add('slide-up'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function buildBulletinHTML(data, scores, tier, text, ratingValue, reviewsCount, dateStr, progressPercent, branchId, hasArticle, timestampToPass) {
    const tsParam = timestampToPass ? timestampToPass : 'null';

    let complaintsNote = '';
    let negativeNote   = '';
    if (scores.surplusForComplaints > 0) {
        complaintsNote = `<div class="mt-2"><span class="surplus-badge">تم استخدام  فائض التقييمات الإيجابية لتصحيح نقاط الشكاوى</span></div>`;
    }
    if (scores.surplusForNegative > 0) {
        negativeNote = `<div class="mt-2"><span class="surplus-badge">تم استخدام فائض التقييمات الإيجابية لتصحيح نقاط السلبية</span></div>`;
    }

    const adminButtons = isAdminLoggedIn ? `
        <div class="flex gap-2 flex-wrap">
            <button onclick="openHistoryModal(${branchId})" class="text-xs font-bold bg-white/60 hover:bg-white border border-white/60 text-slate-800 px-3 py-1.5 rounded-lg transition shadow-sm backdrop-blur flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                السجل
            </button>
            <button onclick="openArticleModal(${branchId}, ${tsParam})" class="text-xs font-bold bg-slate-800/90 hover:bg-slate-900 border border-white/20 text-white px-3 py-1.5 rounded-lg transition shadow backdrop-blur flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                ${hasArticle ? 'تعديل المقال' : 'كتابة مقال'}
            </button>
            ${hasArticle && timestampToPass ? `<button onclick="deleteArticle(${branchId}, ${timestampToPass})" class="text-xs font-bold bg-rose-600/90 hover:bg-rose-700 border border-white/20 text-white px-3 py-1.5 rounded-lg transition shadow backdrop-blur flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                حذف المقال
            </button>` : ''}
        </div>
    ` : '';

    let waitingNames = [];
    if (data.mName) waitingNames.push(`المديرة ${data.mName}`);
    if (data.dName) waitingNames.push(`نائبتها ${data.dName}`);
    let waitingText = waitingNames.length > 0 ? `بانتظار تحركات ${waitingNames.join(' و ')}` : `بانتظار تحركات الإدارة`;

    const articleSection = hasArticle ? `
        <div class="mb-8">
            <div class="flex flex-wrap items-center gap-3 mb-4">
                <span class="${tier.headerColor} border font-bold text-sm px-4 py-1.5 rounded-full shadow-sm">الأداء ◂ ${data.bName}</span>
                <span class="text-slate-500 bg-white/40 backdrop-blur px-3 py-1 rounded-full text-sm font-bold border border-white/50">${dateStr}</span>
            </div>
            <h1 class="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4 drop-shadow-sm">${text.head}</h1>
            <p class="text-lg text-slate-700 font-bold leading-relaxed mb-3 bg-white/30 p-3 rounded-lg backdrop-blur border-l-4 border-slate-400">${text.lead}</p>
            <p class="text-slate-700 leading-relaxed text-justify font-medium">${text.body}</p>
        </div>
    ` : `
        <div class="mb-8 ${isAdminLoggedIn ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-100/50 border-slate-200'} backdrop-blur border rounded-2xl p-6 shadow-sm">
            <div class="flex items-start gap-4">
                <span class="text-3xl drop-shadow">${isAdminLoggedIn ? '✍️' : '⏳'}</span>
                <div>
                    ${isAdminLoggedIn
                        ? `<h3 class="font-black text-amber-900 text-lg mb-1">لم يُكتب مقال هذا الفرع بعد</h3>
                           <p class="text-amber-800 text-sm font-medium mb-4">اكتب مقالاً يعكس الأرقام والمؤشرات أدناه.</p>
                           <button onclick="openArticleModal(${branchId})" class="bg-amber-700/90 hover:bg-amber-800 backdrop-blur text-white font-black px-5 py-2.5 rounded-lg text-sm transition shadow border border-white/20">✦ كتابة المقال الآن</button>`
                        : `<p class="text-slate-800 text-lg font-bold mt-1">${waitingText}</p>`
                    }
                </div>
            </div>
        </div>
    `;

    let teamHTML = '';
    if (data.mName) teamHTML += buildPersonRow(data.mName, 'مديرة الفرع', data.dName !== '');
    if (data.dName) teamHTML += buildPersonRow(data.dName, 'نائبة المديرة', false);
    if (!data.mName && !data.dName) teamHTML = '<p class="text-slate-500 text-sm font-bold">لا يوجد بيانات إدارة مسجلة</p>';

    return `
        ${articleSection}
        <div class="mb-8 glass-panel rounded-2xl p-6">
            <div class="flex justify-between items-center mb-4 flex-wrap gap-2">
                <h2 class="text-xl font-black text-slate-800 drop-shadow-sm">الإنجاز الشهري</h2>
                ${adminButtons}
            </div>
            <div class="flex justify-between items-center mb-3">
                <span class="font-bold text-slate-700 text-sm bg-white/40 px-2 py-0.5 rounded">التقييمات الإيجابية المحققة</span>
                <span class="font-black text-slate-900 text-lg">${data.positive} / ${data.target}</span>
            </div>
            <div class="w-full bg-slate-200/50 backdrop-blur border border-white/60 rounded-full h-3 overflow-hidden mb-2 shadow-inner">
                <div class="${data.positive >= data.target ? 'bg-emerald-500' : 'bg-slate-700'} h-3 rounded-full transition-all" style="width:${Math.min(100, (data.positive / data.target) * 100)}%"></div>
            </div>
            <p class="text-xs text-slate-600 font-bold text-left">${Math.round((data.positive / data.target) * 100)}% من الهدف</p>
        </div>

        <div class="border-t border-slate-300/30 my-8"></div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div class="md:col-span-1 bg-slate-800/90 backdrop-blur border border-white/20 text-white rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden">
                <div class="absolute inset-0 bg-gradient-to-tr from-slate-900 to-transparent opacity-50 z-0"></div>
                <div class="z-10 relative flex flex-col items-center">
                    <p class="text-slate-300 font-bold text-sm mb-2">الأداء العام</p>
                    <div class="text-7xl font-black mb-1 drop-shadow-lg">${scores.total}</div>
                    <p class="text-slate-300 text-sm font-bold">من 11</p>
                    <div class="w-full bg-slate-600/50 rounded-full h-2 mt-4 overflow-hidden border border-white/10 shadow-inner">
                        <div class="${tier.barColor} h-2 rounded-full transition-all" style="width:${progressPercent}%"></div>
                    </div>
                    <span class="mt-4 font-bold text-sm px-4 py-1.5 rounded-full ${tier.labelBg} border shadow-sm">${tier.label}</span>
                </div>
            </div>
            <div class="md:col-span-2 grid grid-cols-2 gap-4">
                ${buildStatCard('نقاط السلامة',   scores.ptsSafety,    '', `${data.safety} حوادث`,   data.safety === 0 ? 'text-emerald-700 border-emerald-400' : 'text-rose-700 border-rose-400',    3, '')}
                ${buildStatCard('نقاط الشكاوى',   scores.ptsComplaints,'', `${data.complaints} شكوى`, data.complaints === 0 ? 'text-emerald-700 border-emerald-400' : data.complaints === 1 ? 'text-amber-600 border-amber-400' : 'text-rose-700 border-rose-400', 2, complaintsNote)}
                ${buildStatCard('نقاط الإيجابية', scores.ptsPositive,  '', `${data.positive} تقييم`,  data.positive >= 10 ? 'text-emerald-700 border-emerald-400' : 'text-amber-600 border-amber-400',  4, '')}
                ${buildStatCard('نقاط السلبية',   scores.ptsNegative,  '', `${data.negative} تقييم`,  data.negative === 0 ? 'text-emerald-700 border-emerald-400' : data.negative === 1 ? 'text-amber-600 border-amber-400' : 'text-rose-700 border-rose-400',    2, negativeNote)}
            </div>
        </div>

        <div class="border-t border-slate-300/30 my-8"></div>

        <div class="mb-8">
            <h2 class="text-xl font-black text-slate-800 mb-6 drop-shadow-sm">معلومات الفرع</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="glass-panel rounded-2xl p-6">
                    <h3 class="font-black text-slate-800 text-sm mb-5 uppercase tracking-wide bg-white/40 inline-block px-3 py-1 rounded backdrop-blur border border-white/50">فريق الإدارة</h3>
                    ${teamHTML}
                </div>
                <div class="glass-panel rounded-2xl p-6">
                    <h3 class="font-black text-slate-800 text-sm mb-5 uppercase tracking-wide bg-white/40 inline-block px-3 py-1 rounded backdrop-blur border border-white/50">تقييم Google</h3>
                    <div class="bg-white/50 backdrop-blur rounded-xl p-4 border border-white/60 flex items-center justify-between mb-4 shadow-sm">
                        <div class="flex items-center gap-3">
                            <span class="text-4xl font-black text-slate-900 drop-shadow-sm">${ratingValue}</span>
                            <div class="flex flex-col">
                                <div class="flex text-2xl leading-none mb-1">${buildStars(ratingValue)}</div>
                                <span class="text-xs text-slate-600 font-bold">${reviewsCount.toLocaleString('en-US')} مراجعة</span>
                            </div>
                        </div>
                        <div class="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center border border-white shadow-sm">${MAP_PIN_SVG}</div>
                    </div>
                    <div class="flex justify-between items-center text-sm bg-white/30 px-3 py-2 rounded-lg backdrop-blur">
                        <span class="text-slate-700 font-bold">من بداية الشهر</span>
                        <span class="font-black text-emerald-700">+${data.positive} مراجعة جديدة</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function buildStatCard(title, pts, badgeClass, badgeText, badgeColorClass, maxPts, extraHTML) {
    return `
        <div class="glass-panel rounded-xl p-4 flex flex-col justify-between hover:scale-[1.02] transition-transform">
            <div class="flex items-center justify-between mb-2">
                <p class="text-slate-600 font-bold text-xs">${title}</p>
                <span class="text-xs font-bold px-2 py-0.5 rounded-full border ${badgeColorClass}">${badgeText}</span>
            </div>
            <div class="flex items-baseline gap-2 mt-1">
                <p class="text-3xl font-black text-slate-900 drop-shadow-sm">${pts.toFixed(2)}</p>
                <p class="text-xs font-medium text-slate-400">من أصل ${maxPts} نقاط</p>
            </div>
            ${extraHTML || ''}
        </div>`;
}

function buildPersonRow(name, role, withBorder) {
    return `
        <div class="flex items-center gap-4 ${withBorder ? 'mb-4 pb-4 border-b border-white/30' : ''}">
            <div class="w-12 h-12 bg-white/70 backdrop-blur rounded-full flex items-center justify-center font-black text-slate-800 text-lg shadow-inner border border-white">${name.charAt(0)}</div>
            <div>
                <p class="font-black text-slate-900 text-base drop-shadow-sm">${name}</p>
                <p class="text-slate-600 text-sm font-bold bg-white/30 inline-block px-2 rounded-sm mt-0.5">${role}</p>
            </div>
        </div>`;
}

function openGlobalArticleModal(timestamp) {
    const article = globalArticles.find(a => a.timestamp === timestamp);
    if (!article) return;
    const lines = article.text ? article.text.split('\n').map(l => l.trim()).filter(l => l) : [];
    const head  = lines[0] || article.title || '';
    const body  = lines.slice(1).join('<br>') || article.body || '';
    const typeLabels = { weekly: 'تحديث أسبوعي', announcement: 'إعلان', opinion: 'رأي' };
    const typeLabelColors = { weekly: 'text-emerald-700 border-emerald-500', announcement: 'text-amber-700 border-amber-500', opinion: 'text-rose-700 border-rose-500' };
    const label = typeLabels[article.type] || '';
    const labelColor = typeLabelColors[article.type] || 'text-slate-700 border-slate-400';
    const byline = article.authorName
        ? `<p class="text-sm font-bold text-slate-500 mt-4 border-t border-slate-200/50 pt-3">${article.authorName}${article.authorBio ? ` — ${article.authorBio}` : ''}</p>`
        : '';

    document.getElementById('globalArticleModalBody').innerHTML = `
        <span class="text-xs font-bold px-3 py-1 rounded-full border ${labelColor} mb-4 inline-block">${label}</span>
        <h2 class="text-2xl font-black text-slate-900 mb-4 leading-snug">${head}</h2>
        <p class="text-slate-700 text-sm leading-relaxed font-medium whitespace-pre-line">${body}</p>
        ${byline}
    `;
    document.getElementById('globalArticleModal').style.display = 'flex';
}

function closeGlobalArticleModal(e) {
    if (e && e.target !== e.currentTarget) return;
    document.getElementById('globalArticleModal').style.display = 'none';
}

// ============================================================
// تحسين سرعة العرض (DOM Reflows Fix)
// ============================================================
function generateNewspaper() {
    const timelineContainer = document.getElementById('newsTimeline');
    timelineContainer.innerHTML = '';

    let allReports = [];

    for (let i = 1; i <= 6; i++) {
        const articles = branchArticles[i];
        if (articles && Array.isArray(articles)) {
            articles.forEach(art => {
                allReports.push({
                    branchId:  i,
                    type:      art.type || 'performance',
                    article:   art.text,
                    title:     null,
                    timestamp: art.timestamp,
                    dateStr:   art.dateStr,
                    snapshot:  art.snapshot || branchesData[i],
                    scores:    art.scores   || calcScores(branchesData[i])
                });
            });
        }
    }

    globalArticles.forEach(art => {
        allReports.push({
            branchId:   null,
            type:       art.type,
            article:    art.text,
            title:      art.title || null,
            timestamp:  art.timestamp,
            dateStr:    art.dateStr,
            authorName: art.authorName || null,
            authorBio:  art.authorBio  || null,
            snapshot:   null,
            scores:     null
        });
    });

    allReports.sort((a, b) => b.timestamp - a.timestamp);

    if (allReports.length === 0) {
        const displayDate = formatDateArabic(new Date().toISOString().split('T')[0]);
        timelineContainer.innerHTML = `
            <div class="relative">
                <div class="absolute -right-6 top-0 w-4 h-4 rounded-full bg-slate-800 border-4 border-white/60 shadow-sm"></div>
                <h3 class="text-xl font-black text-slate-800 mb-6 bg-white/60 backdrop-blur inline-block px-4 py-2 rounded-lg shadow-sm border border-white/80">${displayDate}</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <p class="col-span-full text-center text-slate-600 bg-white/40 rounded-xl py-8 font-bold border border-white/60 backdrop-blur">لا توجد تقارير</p>
                </div>
            </div>`;
        return;
    }

    const groupedReports = {};
    allReports.forEach(report => {
        if (!groupedReports[report.dateStr]) groupedReports[report.dateStr] = [];
        groupedReports[report.dateStr].push(report);
    });

    // استخدام DocumentFragment لتقليل العبء على الـ CPU
    const fragment = document.createDocumentFragment();

    Object.keys(groupedReports).sort((a, b) => new Date(b) - new Date(a)).forEach(dateKey => {
        const reports     = groupedReports[dateKey];
        const displayDate = formatDateArabic(dateKey);

        const dateSection = document.createElement('div');
        dateSection.className = "relative mb-12";
        dateSection.innerHTML = `
            <div class="absolute -right-6 top-0 w-4 h-4 rounded-full bg-slate-800 border-4 border-white/60 shadow-sm"></div>
            <h3 class="text-xl font-black text-slate-800 mb-6 bg-white/60 backdrop-blur inline-block px-4 py-2 rounded-lg shadow-sm border border-white/80">${displayDate}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="cardsGrid-${dateKey.replace(/[^a-z0-9]/gi,'_')}"></div>
        `;
        
        const container = dateSection.querySelector(`[id="cardsGrid-${dateKey.replace(/[^a-z0-9]/gi,'_')}"]`);

        reports.forEach(item => {
            const cardEl = document.createElement('div');
            cardEl.className = "glass-panel p-6 rounded-2xl flex flex-col justify-between hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition border border-white/60 newspaper-card hover:-translate-y-1";

            if (item.type === 'performance' && item.branchId) {
                const data   = item.snapshot;
                const scores = item.scores;
                const tier   = getPerformanceTier(scores);
                const lines  = item.article ? item.article.split('\n').map(l => l.trim()).filter(l => l) : [];
                const headLine = lines[0] || '';
                const leadLine = lines[1] || '';

                cardEl.innerHTML = `
                    <div>
                        <div class="flex justify-between items-start mb-3">
                            <span class="${tier.headerColor} border font-bold text-xs px-3 py-1.5 rounded-full">الأداء ◂ ${data.bName}</span>
                            ${isAdminLoggedIn ? `<button onclick="event.stopPropagation(); deleteArticle(${item.branchId}, ${item.timestamp})" class="w-7 h-7 flex items-center justify-center bg-rose-50/80 hover:bg-rose-100 border border-rose-300 text-rose-600 rounded-full transition" title="حذف المقال"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>` : ''}
                        </div>
                        <h3 onclick="openBulletinPage(${item.branchId}, ${item.timestamp})" class="font-black text-xl mt-5 mb-3 leading-snug text-slate-900 cursor-pointer hover:text-blue-700 transition drop-shadow-sm">${headLine}</h3>
                        <p class="text-slate-700 text-sm font-bold mb-4 leading-relaxed bg-white/30 p-2 rounded">${leadLine}</p>
                    </div>
                    <div class="mt-auto pt-5 border-t border-white/40">
                        <div class="flex justify-between items-center text-slate-800 font-black bg-white/40 px-3 py-2 rounded-lg backdrop-blur">
                            <span>النقاط</span>
                            <span class="bg-slate-800/90 backdrop-blur text-white px-3 py-1 rounded shadow text-sm border border-white/20">${scores.total} ◠</span>
                        </div>
                    </div>
                `;
            } else if (item.type === 'weekly') {
                const lines    = item.article ? item.article.split('\n').map(l => l.trim()).filter(l => l) : [];
                const headLine = lines[0] || 'التحديث الأسبوعي';
                const leadLine = lines[1] || '';
                cardEl.innerHTML = `
                    <div>
                        <div class="flex justify-between items-start mb-3">
                            <span class="text-emerald-700 border border-emerald-500 font-bold text-xs px-3 py-1.5 rounded-full">جميع الفروع</span>
                            ${isAdminLoggedIn ? `<button onclick="event.stopPropagation(); deleteGlobalArticle(${item.timestamp})" class="w-7 h-7 flex items-center justify-center bg-rose-50/80 hover:bg-rose-100 border border-rose-300 text-rose-600 rounded-full transition" title="حذف المقال"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>` : ''}
                        </div>
                        <h3 onclick="openGlobalArticleModal(${item.timestamp})" class="font-black text-xl mt-5 mb-3 leading-snug text-slate-900 cursor-pointer hover:text-blue-700 transition drop-shadow-sm">${headLine}</h3>
                        <p class="text-slate-700 text-sm font-bold mb-4 leading-relaxed bg-white/30 p-2 rounded">${leadLine}</p>
                    </div>
                    <div class="mt-auto pt-5 border-t border-white/40">
                        <div class="flex justify-between items-center bg-white/40 px-3 py-2 rounded-lg backdrop-blur text-sm font-bold text-slate-700">
                            <span>تحديث أسبوعي</span>
                            <span class="bg-emerald-700 text-white px-3 py-1 rounded shadow text-xs">شامل</span>
                        </div>
                    </div>
                `;
            } else if (item.type === 'announcement') {
                const lines    = item.article ? item.article.split('\n').map(l => l.trim()).filter(l => l) : [];
                const headLine = lines[0] || 'إعلان';
                const bodyLine = lines.slice(1).join(' ');
                const bodyLineShort = bodyLine.length > 150 ? bodyLine.substring(0, 150) : bodyLine;
                cardEl.innerHTML = `
                    <div>
                        <div class="flex justify-between items-start mb-3">
                            <span class="text-amber-700 border border-amber-500 font-bold text-xs px-3 py-1.5 rounded-full">إعلان</span>
                            ${isAdminLoggedIn ? `<button onclick="event.stopPropagation(); deleteGlobalArticle(${item.timestamp})" class="w-7 h-7 flex items-center justify-center bg-rose-50/80 hover:bg-rose-100 border border-rose-300 text-rose-600 rounded-full transition" title="حذف المقال"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>` : ''}
                        </div>
                        <h3 onclick="openGlobalArticleModal(${item.timestamp})" class="font-black text-xl mt-5 mb-3 leading-snug text-slate-900 cursor-pointer hover:text-blue-700 transition drop-shadow-sm">${headLine}</h3>
                        <p class="text-slate-700 text-sm font-bold mb-4 leading-relaxed bg-white/30 p-2 rounded">${bodyLineShort}${bodyLine.length > 150 ? '...' : ''}</p>
                    </div>
                    <div class="mt-auto pt-5 border-t border-white/40 bg-white/40 px-3 py-2 rounded-lg text-xs font-bold text-amber-700">إعلان رسمي</div>
                `;
            } else if (item.type === 'opinion') {
                const lines    = item.article ? item.article.split('\n').map(l => l.trim()).filter(l => l) : [];
                const headLine = lines[0] || 'مقال رأي';
                const bodyRaw  = lines.slice(1).join(' ');
                const bodyLine = bodyRaw.length > 150 ? bodyRaw.substring(0, 150) : bodyRaw;
                const byline   = item.authorName
                    ? `<div class="opinion-byline mt-3">${item.authorName}${item.authorBio ? ` — ${item.authorBio}` : ''}</div>`
                    : '';
                cardEl.innerHTML = `
                    <div>
                        <div class="flex justify-between items-start mb-3">
                            <span class="text-rose-700 border border-rose-500 font-bold text-xs px-3 py-1.5 rounded-full">رأي</span>
                            ${isAdminLoggedIn ? `<button onclick="event.stopPropagation(); deleteGlobalArticle(${item.timestamp})" class="w-7 h-7 flex items-center justify-center bg-rose-50/80 hover:bg-rose-100 border border-rose-300 text-rose-600 rounded-full transition" title="حذف المقال"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>` : ''}
                        </div>
                        <h3 onclick="openGlobalArticleModal(${item.timestamp})" class="font-black text-xl mt-5 mb-3 leading-snug text-slate-900 cursor-pointer hover:text-blue-700 transition drop-shadow-sm">${headLine}</h3>
                        <p class="text-slate-700 text-sm font-medium mb-3 leading-relaxed">${bodyLine}${bodyRaw.length > 150 ? '...' : ''}</p>
                        ${byline}
                    </div>
                    <div class="mt-auto pt-5 border-t border-white/40 bg-white/40 px-3 py-2 rounded-lg text-xs font-bold text-rose-700">مقال رأي خارجي</div>
                `;
            }
            container.appendChild(cardEl);
        });
        fragment.appendChild(dateSection);
    });
    
    timelineContainer.appendChild(fragment);
}

function showPage(pageId) {
    const isMain = pageId === 'main';
    document.getElementById('mainPageWrapper').style.display    = isMain ? 'flex' : 'none';
    document.getElementById('mainPageWrapper').style.flexDirection = 'column';
    document.getElementById('bulletinPage').style.display       = isMain ? 'none' : 'flex';
    document.getElementById('bulletinPage').style.flexDirection = 'column';
}

function goToMainPage() {
    showPage('main');
    history.pushState('', document.title, window.location.pathname);
    updateOGTags('التقارير - آي أم سبيشل', 'تقرير الأداء', window.location.href);
}

function updateOGTags(title, description, url) {
    ['og_title', 'twitter_title'].forEach(id => { const el = document.getElementById(id); if (el) el.setAttribute('content', title); });
    ['og_description', 'twitter_description', 'meta_description'].forEach(id => { const el = document.getElementById(id); if (el) el.setAttribute('content', description); });
    const urlEl = document.getElementById('og_url'); if (urlEl) urlEl.setAttribute('content', url);
    document.title = title;
}

function shareBulletinPage() {
    const url        = window.location.href;
    const branchName = currentBulletinData ? currentBulletinData.bName : '';
    const scoreLabel = currentBulletinData ? currentBulletinData.performanceLabel : '';
    const head       = currentBulletinData ? currentBulletinData.head : 'التقارير';
    const lead       = currentBulletinData ? currentBulletinData.lead : 'تقرير الأداء الدوري';
    const waText     = encodeURIComponent(`*تقرير أداء فرع ${branchName}*\nأي آم سبيشل\n\n${head}\n\n${lead}\n\nتصنيف: ${scoreLabel}\n\n${url}`);
    window.open(`https://api.whatsapp.com/send?text=${waText}`, '_blank');
}

function showCopyToast(msg) {
    const toast = document.getElementById('copyToast');
    toast.textContent = msg || 'تم النسخ';
    toast.classList.remove('hidden');
    toast.classList.add('copy-toast');
    setTimeout(() => { toast.classList.add('hidden'); toast.classList.remove('copy-toast'); }, 2500);
}

const SESSION_KEY = 'ispecial_admin_session';

function saveSession() {
    const today = new Date().toISOString().split('T')[0];
    sessionStorage.setItem(SESSION_KEY, today);
}

function checkSession() {
    const today   = new Date().toISOString().split('T')[0];
    const stored  = sessionStorage.getItem(SESSION_KEY);
    return stored === today;
}

const pinBoxes = document.querySelectorAll('.pin-box');

function handleBoxInput(el, idx) {
    el.value = el.value.replace(/[^0-9]/g, '');
    if (el.value !== '') {
        if (idx < 3) pinBoxes[idx + 1].focus();
        checkAdminPinLength();
    }
}

function handleBoxKey(e, idx) {
    if (e.key === 'Backspace' && e.target.value === '' && idx > 0) {
        pinBoxes[idx - 1].focus();
        pinBoxes[idx - 1].value = '';
    }
}

function checkAdminPinLength() {
    const pin = Array.from(pinBoxes).map(b => b.value).join('');
    if (pin.length === 4) verifyMaintenance(pin);
}

function verifyMaintenance(enteredPin) {
    const today    = new Date();
    const correctPin = today.getDate().toString().padStart(2, '0') + (today.getMonth() + 1).toString().padStart(2, '0');
    if (enteredPin === correctPin) {
        isAdminLoggedIn = true;
        saveSession();
        closeMaintenanceAuth();
        document.getElementById('adminModal').style.display = 'flex';
        loadAdminData();
        generateNewspaper();
        if (currentBulletinData && currentBulletinData.branchId) {
            openBulletinPage(currentBulletinData.branchId, currentArticleTimestamp);
        }
    } else {
        alert("غير صحيح!");
        pinBoxes.forEach(b => b.value = '');
        pinBoxes[0].focus();
    }
}

function openMaintenanceAuth() {
    if (checkSession()) {
        isAdminLoggedIn = true;
        document.getElementById('adminModal').style.display = 'flex';
        loadAdminData();
        generateNewspaper();
        return;
    }
    document.getElementById('maintenanceAuthModal').style.display = 'flex';
    pinBoxes.forEach(b => b.value = '');
    setTimeout(() => pinBoxes[0].focus(), 100);
}

function closeMaintenanceAuth() { document.getElementById('maintenanceAuthModal').style.display = 'none'; }
function closeAdmin() { document.getElementById('adminModal').style.display = 'none'; }

async function deleteArticle(branchId, timestamp) {
    if (!confirm('هل تريد حذف هذا المقال نهائياً؟')) return;
    if (!branchArticles[branchId]) return;
    branchArticles[branchId] = branchArticles[branchId].filter(a => a.timestamp !== timestamp);
    await saveArticlesToFirebase();
    generateNewspaper();
    initCarousel();
    if (currentBulletinData && currentBulletinData.branchId == branchId) goToMainPage();
    showCopyToast('تم حذف المقال');
}

async function deleteGlobalArticle(timestamp) {
    if (!confirm('هل تريد حذف هذا المقال نهائياً؟')) return;
    globalArticles = globalArticles.filter(a => a.timestamp !== timestamp);
    await saveGlobalArticlesToFirebase();
    generateNewspaper();
    showCopyToast('تم حذف المقال');
}

function loadAdminData() {
    const id = document.getElementById('branchSelector').value;
    const d  = branchesData[id];
    const fields = {
        admin_bName:          d.bName,
        admin_mName:          d.mName,
        admin_dName:          d.dName,
        admin_safety:         d.safety,
        admin_visitors:       d.visitors,
        admin_complaints:     d.complaints,
        admin_negative:       d.negative,
        admin_target:         d.target,
        admin_startReviews:   d.baseReviews,
        admin_currentReviews: d.baseReviews + d.positive,
        admin_baseRating:     d.baseRating
    };
    Object.entries(fields).forEach(([fId, val]) => {
        const el = document.getElementById(fId);
        if (el) el.value = val;
    });
}

async function saveAdminData() {
    const id  = document.getElementById('branchSelector').value;
    const num = (fieldId, def = 0) => parseFloat(document.getElementById(fieldId).value) || def;

    const startReviews   = num('admin_startReviews', branchesData[id].baseReviews);
    const currentReviews = num('admin_currentReviews', startReviews + branchesData[id].positive);
    const negativeCount  = num('admin_negative');
    let positiveReviews  = currentReviews - startReviews - negativeCount;
    if (positiveReviews < 0) positiveReviews = 0;

    branchesData[id] = {
        bName:       document.getElementById('admin_bName').value,
        mName:       document.getElementById('admin_mName').value,
        dName:       document.getElementById('admin_dName').value,
        safety:      num('admin_safety'),
        visitors:    num('admin_visitors', 1),
        complaints:  num('admin_complaints'),
        positive:    positiveReviews,
        negative:    negativeCount,
        target:      num('admin_target', 50),
        baseRating:  num('admin_baseRating', branchesData[id].baseRating),
        baseReviews: startReviews,
        iframeSrc:   branchesData[id].iframeSrc
    };

    closeAdmin();

    const today   = new Date();
    const dateKey = today.toISOString().split('T')[0];
    if (!branchHistory[id]) branchHistory[id] = [];
    const todayIdx = branchHistory[id].findIndex(r => r.date === dateKey);
    const scores   = calcScores(branchesData[id]);
    const latestArticle = getArticleData(id);
    const entry = {
        date:     dateKey,
        snapshot: { ...branchesData[id] },
        scores:   { ...scores },
        article:  latestArticle ? latestArticle.text : ''
    };
    if (todayIdx >= 0) branchHistory[id][todayIdx] = entry;
    else branchHistory[id].push(entry);

    await saveBranchesToFirebase();
    await saveHistoryToFirebase();
    generateNewspaper();
    initCarousel();
    updateBrandReviewsPanel();
}

function openHistoryModal(branchId) {
    const data    = branchesData[branchId];
    const history = branchHistory[branchId] || [];
    document.getElementById('historyModalTitle').textContent = `سجل فرع ${data.bName}`;
    const container = document.getElementById('historyContent');

    if (history.length === 0) {
        container.innerHTML = `<p class="text-slate-500 text-center font-bold py-8 bg-white/40 rounded-xl border border-white/50 backdrop-blur">لا يوجد سجل حتى الآن</p>`;
    } else {
        const sorted = [...history].reverse();
        container.innerHTML = sorted.map(entry => {
            const dateFormatted = formatFullDateArabic(new Date(entry.date));
            const tier = getPerformanceTier(entry.scores);
            return `
            <div class="history-item bg-white/60 border border-white/50 rounded-xl p-5 shadow-sm backdrop-blur">
                <div class="flex justify-between items-center mb-3">
                    <span class="font-black text-slate-800 text-base">${dateFormatted}</span>
                    <span class="text-sm font-bold px-3 py-1 rounded-full ${tier.labelBg} border">${tier.label}</span>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div class="bg-white/50 rounded-lg p-2 border border-white/60 shadow-sm"><p class="text-xs text-slate-600 font-bold mb-1">النقاط</p><p class="text-xl font-black text-slate-900">${entry.scores.total}</p><p class="text-xs text-slate-500">/ 11</p></div>
                    <div class="bg-emerald-50/50 rounded-lg p-2 border border-emerald-100 shadow-sm"><p class="text-xs text-slate-600 font-bold mb-1">إيجابي</p><p class="text-xl font-black text-emerald-700">${entry.snapshot.positive}</p></div>
                    <div class="bg-rose-50/50 rounded-lg p-2 border border-rose-100 shadow-sm"><p class="text-xs text-slate-600 font-bold mb-1">سلبي</p><p class="text-xl font-black text-rose-700">${entry.snapshot.negative}</p></div>
                    <div class="bg-amber-50/50 rounded-lg p-2 border border-amber-100 shadow-sm"><p class="text-xs text-slate-600 font-bold mb-1">شكاوى</p><p class="text-xl font-black text-amber-700">${entry.snapshot.complaints}</p></div>
                </div>
                ${entry.article ? `<div class="mt-4 bg-white/40 rounded-lg p-3 border border-white/60 shadow-sm"><p class="text-xs text-slate-600 font-bold mb-1.5">المقال المحفوظ:</p><p class="text-slate-700 text-sm leading-relaxed line-clamp-3 font-medium">${entry.article.substring(0, 200)}${entry.article.length > 200 ? '...' : ''}</p></div>` : ''}
            </div>`;
        }).join('');
    }
    document.getElementById('historyModal').style.display = 'flex';
}

function closeHistoryModal() { document.getElementById('historyModal').style.display = 'none'; }

function toggleTimeCalc() {
    isTimeCalcEnabled = !isTimeCalcEnabled;
    const btn  = document.getElementById('timeCalcToggleBtn');
    const note = document.getElementById('predictionNote');

    if (isTimeCalcEnabled) {
        btn.textContent = 'حاسبة زمنية';
        btn.className   = 'text-xs font-bold px-3 py-1.5 rounded-lg border transition bg-indigo-100/70 border-indigo-300 text-indigo-800 hover:bg-indigo-200';
        if (note) note.classList.remove('hidden');
    } else {
        btn.textContent = 'حاسبة';
        btn.className   = 'text-xs font-bold px-3 py-1.5 rounded-lg border transition bg-slate-100/70 border-slate-300 text-slate-600 hover:bg-slate-200';
        if (note) note.classList.add('hidden');
    }
    calculateTrial();
}

function openPredictionModal() {
    isTimeCalcEnabled = true;
    const btn  = document.getElementById('timeCalcToggleBtn');
    const note = document.getElementById('predictionNote');
    if (btn)  { btn.textContent = 'حاسبة زمنية'; btn.className = 'text-xs font-bold px-3 py-1.5 rounded-lg border transition bg-indigo-100/70 border-indigo-300 text-indigo-800 hover:bg-indigo-200'; }
    if (note) note.classList.remove('hidden');
    document.getElementById('predictionModal').style.display = 'flex';
    setupDateCalculator();
    loadTrialDataFromDB();
}

function closePredictionModal() { document.getElementById('predictionModal').style.display = 'none'; }

function setupDateCalculator() {
    const today       = new Date();
    const currentDay  = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    autoMultiplier = currentDay > 0 ? daysInMonth / currentDay : 1;
}

function loadTrialDataFromDB() {
    const data = branchesData[document.getElementById('trial_branch_select').value];
    document.getElementById('trial_positive').value = data.positive;
    document.getElementById('trial_negative').value = data.negative;
    calculateTrial();
}

function clearTrialData() {
    if (confirm("هل تريد إعادة ضبط الحقول للقيم الصفرية؟")) {
        document.getElementById('trial_positive').value = '';
        document.getElementById('trial_negative').value = '';
        calculateTrial();
    }
}

function calculateTrial() {
    const data       = branchesData[document.getElementById('trial_branch_select').value];
    const rawPositive = parseFloat(document.getElementById('trial_positive').value) || 0;
    const rawNegative = parseFloat(document.getElementById('trial_negative').value) || 0;
    const multiplier = isTimeCalcEnabled ? autoMultiplier : 1;
    const projData   = { ...data, positive: rawPositive * multiplier, negative: rawNegative };
    const scores     = calcScores(projData);

    let total = Math.round((scores.ptsSafety + scores.ptsComplaints + scores.ptsPositive + scores.ptsNegative) * 100) / 100;
    if (isNaN(total)) total = 0;

    document.getElementById('resSafety').innerText    = scores.ptsSafety.toFixed(2);
    document.getElementById('resComplaints').innerText = scores.ptsComplaints.toFixed(2);
    document.getElementById('resPos').innerText        = scores.ptsPositive.toFixed(2);
    document.getElementById('resNeg').innerText        = scores.ptsNegative.toFixed(2);
    document.getElementById('totalPoints').innerText   = total;
    document.getElementById('progressBar').style.width = `${Math.min(100, (total / 11) * 100)}%`;

    const levels = [
        { min: 9,         text: "أداء مرتفع ✓",  border: "#10b981", bar: "bg-emerald-500" },
        { min: 7,         text: "أداء متوسط ◬",  border: "#f59e0b", bar: "bg-amber-500"   },
        { min: 4,         text: "أداء منخفض ⚠",  border: "#f97316", bar: "bg-orange-500"  },
        { min: -Infinity, text: "أداء حرج ⨂",    border: "#ef4444", bar: "bg-rose-500"    }
    ];
    const level = levels.find(l => total >= l.min);
    const rewardBox = document.getElementById('rewardBox');
    document.getElementById('rewardText').innerText = level.text;
    document.getElementById('progressBar').className = `${level.bar} h-2.5 rounded-full transition-all`;
    rewardBox.style.borderColor       = level.border;
    rewardBox.style.backgroundColor   = `${level.border}18`;
}

// ============================================================
// تسريع التهيئة لتجاوز شاشة الانتظار بشكل استباقي ومضمون
// ============================================================
document.addEventListener('DOMContentLoaded', async function () {
    await loadAllDataFromFirebase();
    
    // إخفاء الـ Loading Screen حالما تصبح البيانات جاهزة
    const loadingOverlay = document.getElementById('loadingOverlay');
    if(loadingOverlay) loadingOverlay.style.display = 'none';

    if (checkSession()) {
        isAdminLoggedIn = true;
    }

    const hash = window.location.hash;

    if (hash && hash.startsWith('#opinion-')) {
        const payload = hash.replace('#opinion-', '');
        generateNewspaper();
        initCarousel();
        updateBrandReviewsPanel();
        autoSaveDailySnapshot();
        openOpinionWritePage(payload);
        return;
    }

    if (hash && hash.startsWith('#bulletin-')) {
        const parts     = hash.split('-');
        const branchId  = parseInt(parts[1]);
        const timestamp = parts.length > 2 ? parseInt(parts[2]) : null;
        if (branchId >= 1 && branchId <= 6) {
            generateNewspaper();
            initCarousel();
            updateBrandReviewsPanel();
            autoSaveDailySnapshot();
            setTimeout(() => openBulletinPage(branchId, timestamp), 100);
            return;
        }
    }

    generateNewspaper();
    initCarousel();
    updateBrandReviewsPanel();
    autoSaveDailySnapshot();
});