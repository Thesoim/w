// --- قائمة الألعاب المحدثة ---
// تم إضافة الكلمات المفتاحية بدقة لضمان الظهور في البحث
const gamesData = [
    {                           
        title: "OMORI",
        images: ["omori1.png", "omori2.png", "omori3.png"],
        downloadLink: "https://github.com/Thesoim/me-games-/releases/download/1.2/OMORI.apk",
        version: "v1.0.8.1",
        size: "993MB",
        platform: "Android",
        story: "لعبة رعب نفسي سريالية. استكشف عالمًا غريبًا مليئًا بالأصدقاء والأعداء الملونين.",
        timeToBeat: "20 ساعة",
        endings: "4 نهايات",
        keywords: "تعريب لعبة أوموري, تحميل لعبة OMORI معربه, تعريب OMORI, لعبة OMORI معربه, OMORI ARABIC Android, تعريب OMORI للاندرويد, OMORI APK Arabic"
    },
    {
        title: "Loop Hero",
        images: ["loop1.png", "loop2.png", "loop3.png", "loop4.png"],
        downloadLink: "https://github.com/Thesoim/me-games-/releases/download/66.0/Loop.Hero.apk",
        version: "v1.0.5",
        size: "208MB",
        platform: "Android",
        story: "استخدم البطاقات الغامضة لوضع الأعداء والمباني في حلقة زمنية لا نهائية.",
        timeToBeat: "20 - 30 ساعة",
        endings: "3 نهايات",
        keywords: "تعريب لعبة Loop Hero, تحميل لعبة Loop Hero معربة, تعريب Loop Hero, لعبة Loop Hero معربه, Loop Hero ARABIC Android, تعريب Loop Hero للاندرويد"
    },
    {
        title: "Door Kickers",
        images: ["door1.png", "door2.png", "door3.png"],
        downloadLink: "https://github.com/Thesoim/me-games-/releases/download/22.4/Door.Kickers.apk",
        version: "v1.1.35",
        size: "467MB",
        platform: "Android",
        story: "لعبة استراتيجية تكتيكية تتحكم فيها بفريق SWAT لإنقاذ الرهائن.",
        timeToBeat: "غير محدد",
        endings: "نظام مراحل",
        keywords: "تعريب لعبة Door Kickers, تحميل لعبة Door Kickers معربة, تعريب Door Kickers, لعبة Door Kickers معربة, Door Kickers ARABIC Android"
    },
    {
        title: "Twilight Railway",
        images: ["twilight1.png", "twilight2.png", "twilight3.png"],
        downloadLink: "https://github.com/Thesoim/me-games-/releases/download/66.n/Twilight.Railway.apk",
        version: "v1.0.0",
        size: "187MB",
        platform: "Android",
        story: "رواية بصرية مؤثرة تدور أحداثها في قطار يسافر عبر عالم غامض عند الغسق.",
        timeToBeat: "2 - 4 ساعات",
        endings: "نهاية واحدة",
        keywords: "تعريب لعبة Twilight Railway, تحميل لعبة Twilight Railway معربة, تعريب Twilight Railway, رواية بصرية عربية"
    },
    {
        title: "The Wolf Among Us",
        images: ["wolf1.png", "wolf2.png", "wolf3.png"],
        downloadLink: "https://pixeldrain.com/u/5Goz2NnR",
        extraLink: "https://pixeldrain.com/u/homJHrvn",
        extraText: "ملف التعريب",
        hasInstructions: true,
        version: "v1.23",
        size: "2.34GB",
        platform: "Android",
        story: "حقق في جريمة قتل وحشية في عالم مظلم ومليء بالغموض.",
        timeToBeat: "8 - 10 ساعات",
        endings: "حسب الخيارات",
        keywords: "تعريب لعبة The Wolf Among Us, تحميل لعبة The Wolf Among Us معربة, تعريب The Wolf Among Us, لعبة الذئب بيننا معربة"
    },
    {
        title: "Seven Mysteries",
        images: ["sevenmysteries1.png", "sevenmysteries2.png", "sevenmysteries3.png"],
        downloadLink: "https://github.com/Thesoim/me-games-/releases/download/6yy.5/Seven.Mysteries.apk",
        version: "v1.7",
        size: "94MB",
        platform: "Android",
        story: "لعبة رعب أنمي خارقة للطبيعة في مدرسة غامضة.",
        timeToBeat: "3 - 5 ساعات",
        endings: "متعددة",
        keywords: "تعريب لعبة Seven Mysteries, تحميل لعبة Seven Mysteries معربة, تعريب Seven Mysteries, لعبة Seven Mysteries معربة"
    },
    {
        title: "Undertale Red",
        images: ["UndertaleRed1.png", "UndertaleRed2.png", "UndertaleRed3.png"],
        downloadLink: "https://github.com/Thesoim/me-games-/releases/download/222.2/Undertale.Red.apk",
        version: "v1.0.0",
        size: "27MB",
        platform: "Android",
        story: "معركة معجبين مشهورة تركز على قتال شخصية جديدة في عالم Undertale.",
        timeToBeat: "30 دقيقة",
        endings: "قتل/رحمة",
        keywords: "تعريب لعبة Undertale Red, تحميل لعبة Undertale Red معربة, تعريب Undertale Red, لعبة Undertale Red معربة"
    },
    {
        title: "Our Monsoon Balcony",
        images: ["OurMonsoonBalcony1.png", "OurMonsoonBalcony2.png", "OurMonsoonBalcony3.png", "OurMonsoonBalcony4.png"],
        downloadLink: "https://github.com/Thesoim/me-games-/releases/download/77u77/Our.Monsoon.Balcony.apk",
        version: "v2.2.2",
        size: "14MB",
        platform: "Android",
        story: "لعبة فيزيائية وتأملية بسيطة. استرخ في شرفتك أثناء المطر.",
        timeToBeat: "لا نهائية",
        endings: "لا يوجد",
        keywords: "تعريب لعبة Our Monsoon Balcony, تحميل لعبة Our Monsoon Balcony معربة, تعريب Our Monsoon Balcony, لعبة استرخاء عربية"
    },
    {
        title: "The Henry Stickmin Collection",
        images: ["TheHenryStickminCollection1.png", "TheHenryStickminCollection2.png"],
        downloadLink: "https://github.com/Thesoim/me-games-/releases/download/333.331/The.Henry.Stickmin.Collection.apk",
        version: "v0.2",
        size: "411MB",
        platform: "Android",
        story: "مجموعة ألعاب كوميدية حيث تتحكم بـ Henry وتقرر مصيره.",
        timeToBeat: "4 - 6 ساعات",
        endings: "كثيرة جداً",
        keywords: "تعريب لعبة Henry Stickmin, تحميل لعبة Henry Stickmin معربة, تعريب هنري ستيكمن, لعبة هنري ستيكمن معربة"
    },
    {
        title: "Completing the Mission",
        images: ["StickmanCompletingtheMission1.png", "StickmanCompletingtheMission2.png", "StickmanCompletingtheMission3.png"],
        downloadLink: "https://github.com/Thesoim/me-games-/releases/download/22.3/Stickman.Completing.the.Mission.apk",
        version: "v1.0",
        size: "269MB",
        platform: "Android",
        story: "الفصل الأخير من ملحمة Henry Stickmin.",
        timeToBeat: "2 - 3 ساعات",
        endings: "16 نهاية",
        keywords: "تعريب لعبة Completing the Mission, تحميل لعبة Completing the Mission معربة, تعريب هنري ستيكمن, لعبة Completing the Mission معربة"
    }
];
