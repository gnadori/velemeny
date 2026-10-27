export const SAMPLE_QUESTIONS = [
  {
    title: "Melyik az a három szó, ami eszedbe jut a mai témáról?",
    type: "wordcloud",
    description: "Írj be 3 különálló szót vagy rövid kifejezést!",
  },
  {
    title: "Melyik módszert használod a legszívesebben a tanításban?",
    type: "choice",
    description: "Válassz egyet a lehetőségek közül!",
    options: [
      "Frontális magyarázat és vita",
      "Csoportmunka és kooperatív tanulás",
      "Projektalapú és kutatómunka",
      "Digitális és önálló feladatmegoldás"
    ],
    allowMultiple: false,
  },
  {
    title: "Mi a legnagyobb kihívás, amivel ma szembesülsz?",
    type: "text",
    description: "Fogalmazd meg tömören a gondolatodat!",
  },
  {
    title: "Mennyire volt hasznos és inspiráló a mai nap számodra?",
    type: "rating",
    description: "Értékeld 1-től 5-ig terjedő skálán!",
    scaleMax: 5,
    ratingIcon: "stars",
  },
  {
    title: "Oszd el a 100 pontot az alábbi fejlesztési prioritások között!",
    type: "points100",
    description: "A pontok összegének pontosan 100-nak kell lennie.",
    options: [
      "Digitális eszközök beszerzése",
      "Módszertani továbbképzések",
      "Közösségépítő programok",
      "Tananyagfejlesztés"
    ],
  },
  {
    title: "Helyezd el az ötleted a rácson!",
    type: "grid2x2",
    description: "Kattints a rácson a megfelelő pontra a két tengely alapján!",
    axisX: "Ráfordítás (Alacsony → Magas)",
    axisY: "Várható hatás (Kicsi → Óriási)",
  }
];
