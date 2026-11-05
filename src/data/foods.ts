// Valeurs nutritionnelles pour 100 g (plats cuisinés : estimations de recettes maison typiques).
// Format : [nom, catégorie, kcal, protéines, glucides, lipides, fibres, portions "libellé:g|libellé:g", nom local]
export type Portion = { label: string; g: number };
export type Food = {
  id: string;
  name: string;
  local?: string;
  cat: string;
  kcal: number;
  p: number;
  c: number;
  f: number;
  fiber: number;
  portions: Portion[];
  custom?: boolean;
};

type Row = [string, string, number, number, number, number, number, string, string?];

const SL = "Sri Lanka / Inde du Sud";
const CUR = "Currys & accompagnements";
const SNK = "Snacks & street food";
const SWT = "Desserts & sucreries";
const STA = "Féculents & céréales";
const PRO = "Protéines";
const DAI = "Produits laitiers";
const FRU = "Fruits";
const VEG = "Légumes";
const FAT = "Matières grasses & oléagineux";
const DRK = "Boissons";
const SUP = "Compléments";
const OTH = "Divers & fast-food";

const rows: Row[] = [
  // ——— Sri Lanka / Inde du Sud : plats de base ———
  ["Idli", SL, 145, 4.5, 30, 0.4, 1.2, "1 idli:40|3 idlis:120", "இட்லி"],
  ["Dosa nature", SL, 165, 4, 28, 3.7, 1, "1 dosa:85|2 dosas:170", "தோசை"],
  ["Masala dosa", SL, 190, 4, 27, 7.5, 2, "1 masala dosa:200"],
  ["Ghee roast dosa", SL, 250, 4, 30, 12, 1, "1 dosa:120"],
  ["Rava dosa", SL, 200, 3.5, 28, 8, 1, "1 dosa:110"],
  ["Oeuf dosa (muttai dosa)", SL, 185, 7.5, 22, 7.5, 1, "1 dosa:130"],
  ["Uttapam", SL, 170, 4.5, 27, 4.5, 1.8, "1 uttapam:130"],
  ["Pesarattu", SL, 160, 8, 22, 4.5, 4, "1 pesarattu:120"],
  ["Appam / hopper nature", SL, 190, 3.5, 34, 4, 0.8, "1 appam:50|3 appams:150", "ஆப்பம்"],
  ["Egg hopper (appam à l'oeuf)", SL, 175, 7.5, 18, 8, 0.5, "1 egg hopper:100"],
  ["Pâlappam au lait de coco", SL, 210, 3.5, 32, 7.5, 1, "1 appam:60"],
  ["String hoppers / idiyappam", SL, 170, 3, 37, 0.5, 1, "1 galette:20|10 galettes:200", "இடியப்பம்"],
  ["Pittu (riz & coco)", SL, 230, 4, 38, 7, 3, "1 tasse:150|1 cylindre:100", "புட்டு"],
  ["Pittu farine de blé", SL, 240, 6, 40, 6.5, 3.5, "1 tasse:150"],
  ["Kottu roti poulet", SL, 200, 9, 22, 8.5, 1.5, "1 assiette:450|demi-assiette:250", "கொத்து"],
  ["Kottu roti fromage", SL, 230, 9, 22, 12, 1.2, "1 assiette:450"],
  ["Kottu roti oeuf", SL, 195, 8, 22, 8, 1.5, "1 assiette:450"],
  ["Kottu roti légumes", SL, 180, 5, 25, 7, 2, "1 assiette:400"],
  ["Pol roti", SL, 290, 6, 40, 12, 5, "1 pol roti:80"],
  ["Godamba roti", SL, 300, 7, 42, 11, 1.5, "1 roti:70"],
  ["Parotta (Kerala / Ceylon)", SL, 330, 7, 45, 14, 1.5, "1 parotta:90", "பரோட்டா"],
  ["Chapati", SL, 297, 9.8, 46, 7.5, 4.9, "1 chapati:40|3 chapatis:120"],
  ["Naan", SL, 290, 9, 50, 5.5, 2, "1 naan:90"],
  ["Puri", SL, 370, 7, 42, 19, 3, "1 puri:30|3 puris:90"],
  ["Upma (rava)", SL, 150, 3.5, 22, 5.5, 1.5, "1 bol:200"],
  ["Ven pongal", SL, 155, 4, 21, 6, 1, "1 bol:200"],
  ["Kiri bath (riz au lait de coco)", SL, 160, 2.8, 25, 5.5, 0.6, "1 losange:100|2 losanges:200"],
  ["Biryani poulet", SL, 175, 8, 22, 6, 1, "1 assiette:350|1 grosse assiette:500"],
  ["Biryani mouton", SL, 190, 8.5, 21, 8, 1, "1 assiette:350"],
  ["Biryani oeuf", SL, 165, 6, 23, 5.5, 1, "1 assiette:350"],
  ["Lamprais", SL, 180, 8, 18, 9, 1.5, "1 paquet:500"],
  ["Curd rice (thayir sadam)", SL, 125, 3.5, 20, 3.5, 0.4, "1 bol:250"],
  ["Lemon rice", SL, 165, 3, 28, 4.5, 1, "1 assiette:250"],
  ["Riz frit sri-lankais poulet", SL, 175, 7, 23, 6, 1, "1 assiette:350"],
  ["Riz frit sri-lankais légumes", SL, 160, 3.5, 26, 5, 1.2, "1 assiette:350"],
  ["Rice & curry (assiette complète)", SL, 150, 5.5, 20, 5.5, 2, "1 assiette:500|petite assiette:350"],
  ["Odiyal kool (soupe Jaffna)", SL, 70, 5, 6, 2.5, 1, "1 bol:300"],
  // ——— Currys & accompagnements ———
  ["Sambar", CUR, 65, 3, 9, 2, 2.5, "1 bol:200|1 louche:100", "சாம்பார்"],
  ["Rasam", CUR, 30, 1, 4.5, 1, 0.5, "1 bol:200", "ரசம்"],
  ["Dal / parippu curry (coco)", CUR, 120, 6, 13, 5, 3.5, "1 bol:150|1 louche:80", "பருப்பு"],
  ["Dal tadka", CUR, 105, 5.5, 13, 3.5, 3, "1 bol:150"],
  ["Chutney coco", CUR, 200, 2.5, 8, 18, 4.5, "2 c.à.s:40", "தேங்காய் சட்னி"],
  ["Chutney tomate", CUR, 90, 1.5, 9, 5.5, 1.5, "2 c.à.s:40"],
  ["Pol sambol", CUR, 280, 3, 10, 26, 7, "1 portion:30", "தேங்காய் சம்பல்"],
  ["Seeni sambol", CUR, 220, 2, 22, 14, 2.5, "1 portion:30"],
  ["Lunu miris", CUR, 120, 1.5, 6, 10, 2, "1 c.à.c:10"],
  ["Gotukola sambol", CUR, 110, 2.5, 6, 9, 3, "1 portion:40"],
  ["Mallum (feuilles & coco)", CUR, 110, 3, 7, 8, 4, "1 portion:60"],
  ["Wambatu moju (aubergine)", CUR, 230, 2, 18, 17, 3, "1 portion:50"],
  ["Kadala curry (pois chiches)", CUR, 150, 7, 18, 5.5, 6, "1 bol:150"],
  ["Curry de pommes de terre", CUR, 120, 2, 15, 6, 2, "1 portion:150"],
  ["Curry de potiron (wattakka)", CUR, 90, 1.5, 9, 5.5, 2, "1 portion:150"],
  ["Curry de jacquier (polos)", CUR, 130, 2, 14, 7.5, 3.5, "1 portion:150"],
  ["Curry de haricots verts", CUR, 80, 2, 7, 5, 3, "1 portion:100"],
  ["Curry d'okra (bandakka)", CUR, 85, 2, 8, 5, 3, "1 portion:100"],
  ["Curry de murunga (drumstick)", CUR, 90, 2.5, 8, 5.5, 3, "1 portion:120"],
  ["Curry de soja (soya meat)", CUR, 150, 13, 9, 7, 4, "1 portion:120"],
  ["Kiri hodi", CUR, 110, 1, 4, 10, 0.5, "1 louche:100"],
  ["Avial", CUR, 110, 2.5, 8, 8, 3, "1 portion:120"],
  ["Poriyal / thoran (chou, haricots)", CUR, 90, 2, 8, 5.5, 3, "1 portion:100"],
  ["Kootu", CUR, 95, 4, 10, 4, 3, "1 portion:150"],
  ["Curry de poulet sri-lankais", CUR, 165, 15, 4, 10, 1, "1 bol:150|1 morceau + sauce:120"],
  ["Curry de poulet Jaffna", CUR, 170, 16, 4, 10, 1, "1 bol:150"],
  ["Butter chicken", CUR, 150, 12, 6, 9, 1, "1 bol:200"],
  ["Chicken 65", CUR, 250, 20, 10, 15, 0.5, "1 portion:150"],
  ["Poulet tandoori", CUR, 150, 24, 3, 5, 0.5, "1 cuisse:150"],
  ["Devilled chicken", CUR, 200, 16, 10, 11, 1, "1 portion:150"],
  ["Curry de mouton", CUR, 190, 15, 4, 13, 1, "1 bol:150"],
  ["Curry de boeuf", CUR, 180, 17, 4, 11, 1, "1 bol:150"],
  ["Curry de poisson (coco)", CUR, 140, 14, 4, 8, 1, "1 portion:150"],
  ["Ambul thiyal (thon aigre)", CUR, 160, 25, 3, 5, 1, "1 portion:80"],
  ["Poisson frit épicé", CUR, 220, 22, 5, 12, 0.5, "1 tranche:100"],
  ["Curry de crevettes", CUR, 130, 14, 4, 6.5, 1, "1 portion:150"],
  ["Curry de crabe Jaffna", CUR, 120, 13, 4, 6, 1, "1 portion:200"],
  ["Calamar / seiche devilled", CUR, 170, 15, 9, 8, 1, "1 portion:150"],
  ["Curry d'oeufs", CUR, 150, 9, 4, 11, 1, "1 oeuf + sauce:120"],
  ["Curry de poisson séché (karuvadu)", CUR, 180, 22, 5, 8, 1, "1 portion:80"],
  ["Paneer butter masala", CUR, 230, 9, 8, 18, 1.5, "1 bol:200"],
  ["Palak paneer", CUR, 160, 8, 6, 12, 2, "1 bol:200"],
  ["Chana masala", CUR, 140, 6, 18, 5, 5, "1 bol:200"],
  ["Rajma", CUR, 130, 6, 17, 4, 5, "1 bol:200"],
  ["Achcharu (pickle)", CUR, 120, 1, 20, 4, 2, "1 c.à.s:20"],
  ["Pickle de citron / mangue", CUR, 180, 1, 8, 16, 2, "1 c.à.c:10"],
  ["Papadam frit", CUR, 450, 18, 45, 22, 8, "1 papadam:10"],
  // ——— Snacks ———
  ["Medu vada / ulundu vadai", SNK, 290, 9, 30, 15, 4, "1 vada:45|2 vadas:90", "உளுந்து வடை"],
  ["Parippu vadai (masala vada)", SNK, 300, 12, 30, 15, 6, "1 vadai:40"],
  ["Isso vadai (vadai crevettes)", SNK, 290, 13, 26, 15, 5, "1 vadai:60"],
  ["Samosa", SNK, 260, 5, 30, 13, 3, "1 samosa:70"],
  ["Fish bun (maalu paan)", SNK, 280, 10, 40, 9, 2, "1 bun:90"],
  ["Fish roll (pané)", SNK, 250, 10, 26, 12, 1.5, "1 roll:80"],
  ["Fish cutlet", SNK, 230, 11, 20, 12, 2, "1 cutlet:40"],
  ["Patties", SNK, 300, 7, 32, 16, 1.5, "1 patty:50"],
  ["Murukku", SNK, 520, 9, 55, 29, 4, "1 poignée:30"],
  ["Mixture", SNK, 540, 13, 45, 35, 6, "1 poignée:30"],
  ["Bonda", SNK, 270, 5, 30, 14, 2.5, "1 bonda:50"],
  ["Bajji / pakora", SNK, 280, 6, 28, 16, 3, "1 bajji:35"],
  ["Thalitha kadala (pois chiches sautés)", SNK, 170, 9, 25, 4, 7, "1 bol:100"],
  ["Sundal", SNK, 150, 8, 20, 4.5, 6, "1 bol:100"],
  // ——— Desserts ———
  ["Payasam", SWT, 160, 3.5, 25, 5, 0.5, "1 bol:150"],
  ["Kesari", SWT, 330, 3, 50, 13, 0.5, "1 portion:80"],
  ["Gulab jamun", SWT, 330, 5, 50, 12, 0.5, "1 pièce:40"],
  ["Laddu", SWT, 420, 7, 55, 19, 2, "1 laddu:40"],
  ["Mysore pak", SWT, 520, 5, 45, 36, 1, "1 morceau:30"],
  ["Watalappan", SWT, 220, 5, 30, 9, 0.5, "1 portion:120"],
  ["Kavum", SWT, 420, 4, 55, 20, 1, "1 kavum:40"],
  ["Kokis", SWT, 520, 5, 50, 33, 1, "1 kokis:20"],
  ["Halwa / dodol", SWT, 400, 3, 55, 19, 1, "1 morceau:40"],
  ["Jalebi", SWT, 380, 3, 60, 15, 0.5, "1 jalebi:30"],
  ["Sakkarai pongal", SWT, 230, 4, 40, 6.5, 1, "1 bol:150"],
  ["Kozhukattai / modak", SWT, 200, 3, 35, 5, 2, "1 pièce:40"],
  ["Vattalappam au jaggery", SWT, 230, 5.5, 31, 9.5, 0.5, "1 ramequin:120"],
  // ——— Féculents ———
  ["Riz blanc cuit", STA, 130, 2.7, 28, 0.3, 0.4, "1 assiette:250|1 tasse:160|1 louche:80"],
  ["Riz basmati cuit", STA, 121, 3.5, 25, 0.4, 0.4, "1 assiette:250|1 tasse:160"],
  ["Riz rouge (kekulu) cuit", STA, 116, 2.6, 24, 0.9, 1.8, "1 assiette:250|1 tasse:160"],
  ["Riz samba cuit", STA, 125, 2.6, 27, 0.4, 0.6, "1 assiette:250|1 tasse:160"],
  ["Riz complet cuit", STA, 123, 2.7, 26, 1, 1.6, "1 assiette:250"],
  ["Pâtes cuites", STA, 158, 5.8, 31, 0.9, 1.8, "1 assiette:250"],
  ["Nouilles instantanées préparées", STA, 140, 3, 19, 5.5, 1, "1 paquet préparé:260"],
  ["Pain de mie blanc", STA, 265, 9, 49, 3.2, 2.7, "1 tranche:30"],
  ["Pain complet", STA, 250, 12, 41, 3.5, 7, "1 tranche:35"],
  ["Baguette", STA, 270, 9, 55, 1.5, 2.5, "1/4 baguette:60"],
  ["Flocons d'avoine (crus)", STA, 380, 13, 60, 7, 10, "1 portion:40|1 grosse portion:80"],
  ["Corn flakes", STA, 378, 7, 84, 0.9, 3, "1 bol:40"],
  ["Muesli", STA, 370, 10, 66, 6, 8, "1 bol:50"],
  ["Pomme de terre cuite", STA, 87, 1.9, 20, 0.1, 1.8, "1 moyenne:170"],
  ["Patate douce cuite", STA, 90, 2, 21, 0.2, 3.3, "1 moyenne:150"],
  ["Manioc bouilli", STA, 160, 1.4, 38, 0.3, 1.8, "1 portion:150"],
  ["Quinoa cuit", STA, 120, 4.4, 21, 1.9, 2.8, "1 tasse:185"],
  ["Semoule cuite", STA, 112, 3.8, 23, 0.2, 1.4, "1 assiette:200"],
  // ——— Protéines ———
  ["Blanc de poulet cuit", PRO, 165, 31, 0, 3.6, 0, "1 filet:150|1 portion:120"],
  ["Cuisse de poulet cuite sans peau", PRO, 180, 25, 0, 9, 0, "1 cuisse:120"],
  ["Oeuf entier", PRO, 143, 12.6, 0.7, 9.5, 0, "1 oeuf:50|2 oeufs:100|3 oeufs:150"],
  ["Blanc d'oeuf", PRO, 52, 11, 0.7, 0.2, 0, "1 blanc:33|100 ml:100"],
  ["Oeuf au plat", PRO, 196, 13.6, 0.9, 15, 0, "1 oeuf:46"],
  ["Omelette", PRO, 154, 11, 0.6, 12, 0, "2 oeufs:120|3 oeufs:180"],
  ["Boeuf haché 5% cuit", PRO, 164, 26, 0, 6.5, 0, "1 steak:100"],
  ["Boeuf haché 15% cuit", PRO, 250, 26, 0, 16, 0, "1 steak:100"],
  ["Steak de boeuf cuit", PRO, 200, 29, 0, 9, 0, "1 steak:150"],
  ["Mouton / agneau cuit", PRO, 250, 25, 0, 16, 0, "1 portion:120"],
  ["Saumon cuit", PRO, 206, 22, 0, 12, 0, "1 pavé:125"],
  ["Thon en conserve (eau)", PRO, 116, 26, 0, 0.8, 0, "1 boîte égouttée:112"],
  ["Thon frais cuit", PRO, 132, 28, 0, 1.3, 0, "1 steak:150"],
  ["Sardines à l'huile", PRO, 208, 25, 0, 11.5, 0, "1 boîte:85"],
  ["Maquereau cuit", PRO, 230, 21, 0, 16, 0, "1 filet:100"],
  ["Crevettes cuites", PRO, 99, 24, 0.2, 0.3, 0, "1 portion:100"],
  ["Poisson blanc cuit", PRO, 105, 23, 0, 0.9, 0, "1 filet:150"],
  ["Dinde (blanc) cuite", PRO, 135, 30, 0, 1, 0, "1 portion:120"],
  ["Jambon blanc", PRO, 115, 19, 1, 3.5, 0, "1 tranche:40"],
  ["Paneer", PRO, 265, 18, 1.2, 21, 0, "1 portion:100"],
  ["Tofu ferme", PRO, 144, 15.6, 2.8, 8.7, 2.3, "1 portion:100"],
  ["Protéines de soja sèches (soya chunks)", PRO, 345, 52, 33, 0.5, 13, "1 portion:30|1 grosse portion:50"],
  ["Lentilles cuites", PRO, 116, 9, 20, 0.4, 7.9, "1 bol:200"],
  ["Pois chiches cuits", PRO, 164, 8.9, 27, 2.6, 7.6, "1 bol:150"],
  ["Haricots rouges cuits", PRO, 127, 8.7, 23, 0.5, 6.4, "1 bol:150"],
  ["Moong dal cuit", PRO, 105, 7, 19, 0.4, 7.6, "1 bol:150"],
  ["Urad dal cuit", PRO, 105, 7.5, 18, 0.6, 5, "1 bol:150"],
  // ——— Laitiers ———
  ["Yaourt nature / curd entier", DAI, 61, 3.5, 4.7, 3.3, 0, "1 pot:125|1 bol:200"],
  ["Yaourt de bufflonne (meekiri)", DAI, 105, 4.5, 5, 7.5, 0, "1 pot:200"],
  ["Yaourt grec 0%", DAI, 59, 10, 3.6, 0.4, 0, "1 pot:150"],
  ["Skyr", DAI, 63, 11, 4, 0.2, 0, "1 pot:150"],
  ["Fromage blanc 0%", DAI, 45, 7.5, 4, 0.2, 0, "1 portion:200"],
  ["Cottage cheese", DAI, 98, 11, 3.4, 4.3, 0, "1 pot:200"],
  ["Cheddar", DAI, 403, 25, 1.3, 33, 0, "1 tranche:20"],
  ["Mozzarella", DAI, 254, 18, 2, 19, 0, "1 boule:125"],
  ["Emmental", DAI, 380, 28, 0, 30, 0, "1 portion:30"],
  ["Lait entier", DAI, 61, 3.2, 4.8, 3.3, 0, "1 verre:250"],
  ["Lait demi-écrémé", DAI, 46, 3.3, 4.8, 1.6, 0, "1 verre:250"],
  ["Lait de soja", DAI, 40, 3.3, 2, 1.8, 0.5, "1 verre:250"],
  // ——— Fruits ———
  ["Banane", FRU, 89, 1.1, 23, 0.3, 2.6, "1 banane:120"],
  ["Mangue", FRU, 60, 0.8, 15, 0.4, 1.6, "1 mangue:200"],
  ["Papaye", FRU, 43, 0.5, 11, 0.3, 1.7, "1 tranche:150"],
  ["Ananas", FRU, 50, 0.5, 13, 0.1, 1.4, "1 tranche:100"],
  ["Jacquier frais (pala)", FRU, 95, 1.7, 23, 0.6, 1.5, "1 portion:150"],
  ["Goyave", FRU, 68, 2.6, 14, 1, 5.4, "1 goyave:100"],
  ["Ramboutan", FRU, 82, 0.7, 21, 0.2, 0.9, "5 fruits:100"],
  ["Mangoustan", FRU, 73, 0.4, 18, 0.6, 1.8, "3 fruits:100"],
  ["Pomme", FRU, 52, 0.3, 14, 0.2, 2.4, "1 pomme:180"],
  ["Orange", FRU, 47, 0.9, 12, 0.1, 2.4, "1 orange:150"],
  ["Raisin", FRU, 69, 0.7, 18, 0.2, 0.9, "1 grappe:150"],
  ["Pastèque", FRU, 30, 0.6, 7.6, 0.2, 0.4, "1 tranche:300"],
  ["Fraises", FRU, 32, 0.7, 7.7, 0.3, 2, "1 barquette:250"],
  ["Avocat", FRU, 160, 2, 8.5, 15, 6.7, "1/2 avocat:80"],
  ["Dattes", FRU, 282, 2.5, 75, 0.4, 8, "1 datte:8|5 dattes:40"],
  ["Kiwi", FRU, 61, 1.1, 15, 0.5, 3, "1 kiwi:75"],
  // ——— Légumes ———
  ["Brocoli", VEG, 34, 2.8, 7, 0.4, 2.6, "1 portion:150"],
  ["Épinards", VEG, 23, 2.9, 3.6, 0.4, 2.2, "1 portion:150"],
  ["Carotte", VEG, 41, 0.9, 10, 0.2, 2.8, "1 carotte:80"],
  ["Tomate", VEG, 18, 0.9, 3.9, 0.2, 1.2, "1 tomate:120"],
  ["Concombre", VEG, 15, 0.7, 3.6, 0.1, 0.5, "1/2 concombre:150"],
  ["Oignon", VEG, 40, 1.1, 9, 0.1, 1.7, "1 oignon:110"],
  ["Haricots verts", VEG, 31, 1.8, 7, 0.2, 2.7, "1 portion:150"],
  ["Chou", VEG, 25, 1.3, 5.8, 0.1, 2.5, "1 portion:150"],
  ["Aubergine", VEG, 25, 1, 6, 0.2, 3, "1 portion:150"],
  ["Okra (gombo)", VEG, 33, 1.9, 7.5, 0.2, 3.2, "1 portion:100"],
  ["Courge / potiron", VEG, 26, 1, 6.5, 0.1, 0.5, "1 portion:150"],
  ["Salade verte", VEG, 15, 1.4, 2.9, 0.2, 1.3, "1 bol:80"],
  ["Poivron", VEG, 31, 1, 6, 0.3, 2.1, "1 poivron:150"],
  ["Champignons", VEG, 22, 3.1, 3.3, 0.3, 1, "1 portion:100"],
  ["Maïs", VEG, 86, 3.3, 19, 1.4, 2.7, "1 boîte égouttée:140"],
  ["Petits pois", VEG, 81, 5.4, 14, 0.4, 5.1, "1 portion:100"],
  ["Gotukola cru", VEG, 20, 2, 3, 0.2, 2, "1 poignée:30"],
  // ——— Matières grasses ———
  ["Huile de coco", FAT, 862, 0, 0, 100, 0, "1 c.à.s:14|1 c.à.c:5"],
  ["Huile d'olive", FAT, 884, 0, 0, 100, 0, "1 c.à.s:14|1 c.à.c:5"],
  ["Huile de tournesol", FAT, 884, 0, 0, 100, 0, "1 c.à.s:14"],
  ["Ghee", FAT, 900, 0, 0, 100, 0, "1 c.à.c:5|1 c.à.s:14"],
  ["Beurre", FAT, 717, 0.9, 0.1, 81, 0, "1 noix:10"],
  ["Lait de coco épais", FAT, 230, 2.3, 6, 24, 2.2, "100 ml:100|1 boîte:400"],
  ["Lait de coco léger", FAT, 70, 0.7, 2, 7, 0, "100 ml:100"],
  ["Noix de coco râpée fraîche", FAT, 354, 3.3, 15, 33, 9, "1 tasse:80|2 c.à.s:15"],
  ["Amandes", FAT, 579, 21, 22, 50, 12.5, "1 poignée:30"],
  ["Noix de cajou", FAT, 553, 18, 30, 44, 3.3, "1 poignée:30"],
  ["Cacahuètes", FAT, 567, 26, 16, 49, 8.5, "1 poignée:30"],
  ["Beurre de cacahuète", FAT, 588, 25, 20, 50, 6, "1 c.à.s:16"],
  ["Noix", FAT, 654, 15, 14, 65, 6.7, "1 poignée:30"],
  ["Graines de chia", FAT, 486, 17, 42, 31, 34, "1 c.à.s:12"],
  ["Crème fraîche 30%", FAT, 292, 2.4, 3, 30, 0, "1 c.à.s:15"],
  // ——— Boissons ———
  ["Thé au lait sucré (kiri thé)", DRK, 60, 1.5, 9, 1.8, 0, "1 tasse:200"],
  ["Thé noir sucré", DRK, 25, 0, 6, 0, 0, "1 tasse:200"],
  ["Café filtre sud-indien", DRK, 65, 1.8, 9, 2.3, 0, "1 tasse:150"],
  ["Lassi sucré", DRK, 90, 3, 14, 2.5, 0, "1 verre:250"],
  ["Mor / babeurre épicé", DRK, 25, 1.5, 2, 1, 0, "1 verre:250"],
  ["Eau de coco (thambili)", DRK, 19, 0.7, 3.7, 0.2, 1.1, "1 noix:300"],
  ["Faluda", DRK, 120, 2.5, 20, 3, 0.5, "1 verre:300"],
  ["Milo / chocolat au lait", DRK, 75, 2.5, 11, 2, 0.5, "1 tasse:250"],
  ["Soda (cola)", DRK, 42, 0, 10.6, 0, 0, "1 canette:330"],
  ["Jus d'orange", DRK, 45, 0.7, 10, 0.2, 0.2, "1 verre:250"],
  ["Ginger beer", DRK, 40, 0, 10, 0, 0, "1 bouteille:400"],
  // ——— Compléments ———
  ["Whey protéine", SUP, 400, 78, 8, 6, 0, "1 dose:30"],
  ["Caséine", SUP, 360, 80, 5, 2, 0, "1 dose:30"],
  ["Barre protéinée", SUP, 360, 33, 35, 12, 8, "1 barre:60"],
  ["Gainer", SUP, 380, 20, 70, 3, 2, "1 dose:100"],
  // ——— Divers ———
  ["Sucre", OTH, 400, 0, 100, 0, 0, "1 c.à.c:5|1 morceau:5"],
  ["Miel", OTH, 304, 0.3, 82, 0, 0, "1 c.à.c:7"],
  ["Jaggery / kithul / vellam", OTH, 380, 0.4, 95, 0.1, 0, "1 morceau:10"],
  ["Pani / mélasse de kithul", OTH, 290, 0, 72, 0, 0, "1 c.à.s:20"],
  ["Confiture", OTH, 250, 0.4, 60, 0.1, 1, "1 c.à.s:20"],
  ["Chocolat noir 70%", OTH, 600, 7.8, 46, 43, 11, "1 carré:10"],
  ["Chocolat au lait", OTH, 535, 7.6, 59, 30, 3.4, "1 carré:10"],
  ["Chips", OTH, 536, 7, 53, 34, 4.8, "1 paquet:45"],
  ["Biscuits Marie", OTH, 440, 7, 74, 13, 2, "1 biscuit:7|5 biscuits:35"],
  ["Pizza", OTH, 266, 11, 33, 10, 2.3, "1 part:110|1 pizza:450"],
  ["Burger", OTH, 250, 13, 25, 11, 1.5, "1 burger:220"],
  ["Frites", OTH, 312, 3.4, 41, 15, 3.8, "1 portion moyenne:120"],
  ["Shawarma poulet", OTH, 210, 13, 20, 9, 1.5, "1 sandwich:300"],
  ["Ketchup", OTH, 110, 1, 26, 0.1, 0, "1 c.à.s:15"],
  ["Mayonnaise", OTH, 680, 1, 0.6, 75, 0, "1 c.à.s:15"],
];

function slug(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const FOODS: Food[] = rows.map(([name, cat, kcal, p, c, f, fiber, portions, local]) => ({
  id: slug(name),
  name,
  local,
  cat,
  kcal,
  p,
  c,
  f,
  fiber,
  portions: portions.split("|").map((x) => {
    const [label, g] = x.split(":");
    return { label, g: Number(g) };
  }),
}));

export const CATEGORIES = [SL, CUR, SNK, SWT, STA, PRO, DAI, FRU, VEG, FAT, DRK, SUP, OTH];

export function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}
