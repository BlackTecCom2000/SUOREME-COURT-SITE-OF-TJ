export interface PortalLink {
  url: string;
  labelTj: string;
  labelRu: string;
  labelEn: string;
}

export const PRESIDENT_MESSAGE: PortalLink = {
  url: "https://president.tj",
  labelTj: "Паёми Президенти ҶТ",
  labelRu: "Послание Президента РТ",
  labelEn: "Message of the President of RT",
};

export const USEFUL_LINKS: PortalLink[] = [
  { url: "https://president.tj", labelTj: "Президенти ҶТ", labelRu: "Президент РТ", labelEn: "President of RT" },
  { url: "https://majmilli.tj", labelTj: "Маҷлиси миллӣ", labelRu: "Маджлиси милли", labelEn: "Majlisi Milli" },
  { url: "https://parlament.tj", labelTj: "Маҷлиси намояндагон", labelRu: "Маджлиси намояндагон", labelEn: "Majlisi Namoyandagon" },
  { url: "https://constcourt.tj", labelTj: "Суди конститутсионӣ", labelRu: "Конституционный суд", labelEn: "Constitutional Court" },
  { url: "https://mmih.tj", labelTj: "Маркази миллии қонунгузорӣ", labelRu: "Национальный центр законодательства", labelEn: "National Legislation Centre" },
  { url: "https://khovar.tj", labelTj: "АМИТ Ховар", labelRu: "НИАТ Ховар", labelEn: "NIAT Khovar" },
  { url: "https://jumhuriyat.tj", labelTj: "«Ҷумҳурият»", labelRu: "«Джумхурият»", labelEn: "Jumhuriyat" },
];

export const NEWS_REGIONS = [
  { id: "all", labelTj: "Ҳама", labelRu: "Все", labelEn: "All" },
  { id: "dushanbe_rrp", labelTj: "Душанбе ва НТҶ", labelRu: "Душанбе и РРП", labelEn: "Dushanbe and RRP" },
  { id: "sugd", labelTj: "Суғд", labelRu: "Согд", labelEn: "Sughd" },
  { id: "khatlon", labelTj: "Хатлон", labelRu: "Хатлон", labelEn: "Khatlon" },
  { id: "gbao", labelTj: "ВМКБ", labelRu: "ГБАО", labelEn: "GBAO" },
];
