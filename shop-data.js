// Магазин · 22.10 — товары сайта. Кадры Figma: merts-draft, секция 235:140963 «Магазин · доводка · 22.10».
// Каталог — shop.html (?c=orig | print | merch), карточка — shop-item.html?id=<id>. Шаблон карточки — по k: orig · print · merch.
// ⚠ Все цены — заглушки (Антон 22.10 12:48: «можем мы их придумывать»); настоящие — вопрос Коле № 27.
// ⚠ Мерча в природе нет: картинки — макеты (заготовка вещи + знак М, shop/*-m.webp).
// Поля: t — название · tt — название с ручным переносом · type — подпись над названием · tile / tileM — подпись на плитке каталога (1920 / 360)
//   price — ₽ · img — картинка (w × h — её пропорция) · plate — на паспарту (принт) · rows — строки паспорта [подпись, значение]
//   ed — тираж {all, free} · sizes / size / color / mat — мерч · floors — этажи ниже · more — «Ещё в магазине» · work — id в works-data.js
window.SHOP = [
  { id: "cobain-original", k: "orig", work: "p-cobain", t: "Rather be dead than cool", tt: "Rather be dead\nthan cool",
    type: "Оригинал · холст, масло", tile: "Оригинал · холст, масло", tileM: "Оригинал",
    price: 180000,   // ⚠ цена-заглушка
    img: "w/p-cobain/01-1600.webp", img800: "w/p-cobain/01-800.webp", w: 1080, h: 1350,
    rows: [["Оригинал", "Холст, масло · 20 × 30"], ["Экземпляр", "Единственный — это сам холст"]],
    floors: ["detail", "process"], more: ["cobain-print", "tee", "hoodie"] },
  { id: "skull-original", k: "orig", work: "p-skull-2014", t: "Череп",   // ⚠ название согласовать с Колей
    type: "Оригинал · холст, масло", tile: "Оригинал · холст, масло", tileM: "Оригинал",
    price: 240000,   // ⚠ цена-заглушка
    img: "w/p-skull-2014/01-1600.webp", img800: "w/p-skull-2014/01-800.webp", w: 640, h: 640,
    rows: [["Оригинал", "Холст, масло"], ["Экземпляр", "Единственный — это сам холст"]],
    floors: [], more: ["skull-print", "tee", "hoodie"] },
  { id: "cobain-print", k: "print", work: "p-cobain", t: "Rather be dead than cool", tt: "Rather be dead\nthan cool",
    type: "Принт картины", tile: "Принт картины", tileM: "Принт картины",
    price: 15000,   // ⚠ цена-заглушка
    img: "w/p-cobain/01-1600.webp", img800: "w/p-cobain/01-800.webp", w: 1080, h: 1350, plate: 1,
    rows: [["Оригинал", "Холст, масло · 20 × 30"], ["Формат принта", "30 × 40 см"]],   // ⚠ формат — пример
    ed: { all: 50, free: 12 },   // ⚠ тираж — пример
    floors: ["wall", "detail", "process"], more: ["skull-print", "tee", "hoodie"] },
  { id: "skull-print", k: "print", work: "p-skull-2014", t: "Череп",   // ⚠ название согласовать с Колей
    type: "Принт картины", tile: "Принт картины", tileM: "Принт картины",
    price: 12000,   // ⚠ цена-заглушка
    img: "w/p-skull-2014/01-1600.webp", img800: "w/p-skull-2014/01-800.webp", w: 640, h: 640, plate: 1,
    rows: [["Оригинал", "Холст, масло"], ["Формат принта", "30 × 30 см"]],   // ⚠ формат — пример, кадра карточки нет
    ed: { all: 50, free: 31 },   // ⚠ тираж — пример
    floors: [], more: ["cobain-print", "tee", "hoodie"] },
  { id: "tee", k: "merch", t: "Футболка со знаком М", tt: "Футболка\nсо знаком М",
    type: "Мерч · футболка", tile: "Мерч · футболка", tileM: "Мерч · футболка",
    price: 4500,   // ⚠ цена-заглушка
    img: "shop/tee-m.webp", img800: "shop/tee-m-432.webp", w: 864, h: 1152,
    sizes: ["S", "M", "L", "XL", "XXL"], size0: "M", color: "Чёрный", mat: "Хлопок 100 % · 220 г/м²",   // ⚠ состав — заглушка
    table: "tee", floors: ["body", "sign"], more: ["skull-print", "hoodie", "cobain-print"] },
  { id: "hoodie", k: "merch", t: "Худи со знаком М", tt: "Худи\nсо знаком М",
    type: "Мерч · худи", tile: "Мерч · худи", tileM: "Мерч · худи",
    price: 8900,   // ⚠ цена-заглушка
    img: "shop/hoodie-m.webp", img800: "shop/hoodie-m-432.webp", w: 864, h: 1152,
    sizes: ["S", "M", "L", "XL", "XXL"], size0: "M", color: "Чёрный", mat: "Хлопок 80 % · полиэстер 20 %",   // ⚠ состав — заглушка
    table: "hoodie", floors: ["body"], more: ["tee", "tote", "cobain-print"] },
  { id: "tote", k: "merch", t: "Шоппер со знаком М", tt: "Шоппер\nсо знаком М",
    type: "Мерч · шоппер", tile: "Мерч · шоппер", tileM: "Мерч · шоппер",
    price: 2500,   // ⚠ цена-заглушка
    img: "shop/tote-m.webp", img800: "shop/tote-m-432.webp", w: 864, h: 1152,
    size: "38 × 42 см", color: "Чёрный", mat: "Хлопок, плотный канвас",   // ⚠ размер и состав — заглушки; 16:31 Антон: без размеров — строкой, без таблицы
    floors: ["body"], more: ["tee", "hoodie", "skull-print"] },
];
// Таблицы размеров (окно «Таблица размеров», кадры 237:162731 / 237:164816) — мерки изделия, см. ⚠ цифры-заглушки
window.SHOP_TABLES = {
  tee: { cols: ["Размер", "Обхват груди", "Длина", "Рукав"], colsM: ["Размер", "Грудь", "Длина", "Рукав"],
    rows: [["S", 96, 70, 20], ["M", 104, 72, 21], ["L", 112, 74, 22], ["XL", 120, 76, 23], ["XXL", 128, 78, 24]] },
  hoodie: { cols: ["Размер", "Обхват груди", "Длина", "Рукав"], colsM: ["Размер", "Грудь", "Длина", "Рукав"],
    rows: [["S", 104, 68, 60], ["M", 112, 70, 62], ["L", 120, 72, 64], ["XL", 128, 74, 66], ["XXL", 136, 76, 68]] },
};
// Каталог «Все» — колонки как в кадрах: 1920 (235:140964) и 360 (237:158253); h — высота плитки, px кадра
window.SHOP_ALL = {
  desk: [[["cobain-original", 510], ["tote", 702]], [["skull-original", 396], ["cobain-print", 396], ["skull-print", 396]], [["tee", 606], ["hoodie", 606]]],
  phone: [[["cobain-original", 198], ["tote", 272], ["tee", 227]], [["skull-original", 158], ["cobain-print", 158], ["skull-print", 158], ["hoodie", 211]]],
};
