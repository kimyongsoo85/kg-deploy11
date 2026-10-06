// 코코비 캐릭터 데이터 — 홈 타일과 캐릭터 페이지가 함께 쓴다.
// 이미지는 cocobi.net 공식 에셋(assets/cocobi), 소개 문구는 공식 정보를 바탕으로 정리.
(() => {
  const A = "assets/cocobi/";
  const thumb = (n) => `${A}characters_${n}.png`;
  const detail = (n) => `${A}characters_${n}_detail.png`;

  // 홈 타일 7명 (+ ETC). 색은 캐릭터 성격·옷 색에서 뽑았다.
  const main = [
    {
      slug: "coco", name: "코코", en: "COCO", tag: "6살 · 씩씩한 누나",
      bg: "#9b5de5", on: "#ffe3f0", deep: "#6f37b8",
      cutout: `${A}main_characters_coco_img.png`,
      facts: [["나이", "6살"], ["가족", "엄마 도나, 아빠 밥, 남동생 러비"], ["좋아하는 것", "노래, 춤"]],
      traits: ["골목대장", "리더십", "노래·춤"],
      story: [
        "코코는 동네 친구들을 이끄는 여섯 살 골목대장이에요.",
        "엄마, 아빠, 남동생 러비와 함께 살고, 신나는 노래가 나오면 언제든 춤을 춰요. 겁먹은 동생 앞에 가장 먼저 나서는 든든한 누나랍니다.",
      ],
    },
    {
      slug: "lovey", name: "러비", en: "LOBI", tag: "4살 · 귀염둥이 동생",
      bg: "#e8505b", on: "#ffe066", deep: "#b8323d",
      cutout: `${A}main_characters_lobi_img.png`,
      facts: [["나이", "4살"], ["가족", "누나 코코, 엄마 도나, 아빠 밥"], ["좋아하는 것", "맛있는 음식, 누나"]],
      traits: ["솔직함", "먹보", "누나바라기"],
      story: [
        "러비는 생각한 걸 그대로 말하는 솔직한 네 살 귀염둥이예요.",
        "가리는 음식 없이 무엇이든 맛있게 먹고, 늘 자기를 챙겨주는 누나 코코를 세상에서 제일 좋아해요.",
      ],
    },
    {
      slug: "donna", name: "도나", en: "DONNA", tag: "엄마 · 마이아사우라",
      bg: "#1fb39b", on: "#fff1b8", deep: "#14806f",
      thumb: thumb("01"), detail: detail("01"),
      facts: [["역할", "엄마"], ["종", "마이아사우라"], ["특기", "정리정돈"]],
      traits: ["현명함", "정리의 달인", "요리는 연습 중"],
      story: [
        "엄마 도나는 코코비 가족에서 가장 현명한 마이아사우라예요.",
        "집안 정리라면 누구보다 자신 있지만, 요리 솜씨만큼은 아직 연습이 필요하답니다.",
      ],
    },
    {
      slug: "bob", name: "밥", en: "BOB", tag: "아빠 · 알로사우루스",
      bg: "#5865f2", on: "#ffe14d", deep: "#3b46c4",
      thumb: thumb("02"), detail: detail("02"),
      facts: [["역할", "아빠"], ["종", "알로사우루스"], ["특기", "역할놀이, 연기"]],
      traits: ["분위기 메이커", "상상력 부자", "놀이 천재"],
      story: [
        "아빠 밥은 집안 분위기를 책임지는 알로사우루스예요.",
        "상상력이 풍부하고 연기도 실감 나서, 코코와 러비랑 놀아줄 때면 온 집안이 놀이터가 돼요.",
      ],
    },
    {
      slug: "lala", name: "라라", en: "LALA", tag: "막내 · 미스터리",
      bg: "#2f2a73", on: "#ffb36b", deep: "#1f1b52",
      thumb: thumb("03"), detail: detail("03"),
      facts: [["역할", "코코비 가족의 막내"], ["특징", "가족 중 혼자 몸 색깔이 달라요"], ["비밀", "아직 아무도 몰라요"]],
      traits: ["막내", "미스터리", "숨은 능력?"],
      story: [
        "라라는 코코비 가족의 막내예요. 가족 중에서 유일하게 몸 색깔이 다르답니다.",
        "수수께끼 같은 라라에게는 어떤 능력이 숨어 있을까요? 함께 지켜봐 주세요.",
      ],
    },
    {
      slug: "bell", name: "벨", en: "BELL", tag: "4살 · 벨로시랩터",
      bg: "#8ed12c", on: "#0f4f2a", deep: "#63a313",
      thumb: thumb("08"), detail: detail("08"),
      facts: [["나이", "4살"], ["종", "벨로시랩터"], ["가족", "오빠 니코"]],
      traits: ["보이시", "운동 만능", "그림은 어려워"],
      story: [
        "벨은 보이시한 매력이 넘치는 네 살 벨로시랩터예요.",
        "축구, 농구, 야구까지 공으로 하는 운동은 뭐든 잘하지만, 그림 그리기는 영 자신이 없대요.",
      ],
    },
    {
      slug: "jackjack", name: "잭잭", en: "JACK", tag: "4살 · 티라노사우루스",
      bg: "#ffb199", on: "#7a1f1f", deep: "#f28b6e",
      thumb: thumb("07"), detail: detail("07"),
      facts: [["나이", "4살"], ["종", "티라노사우루스"], ["가족", "형 잭슨"]],
      traits: ["수줍음", "소심함", "알고 보면 천하장사"],
      story: [
        "잭잭은 수줍음 많고 조심스러운 네 살 티라노사우루스예요.",
        "하지만 힘만큼은 누구보다 세서, 한번 화가 나면 아무도 말릴 수 없답니다.",
      ],
    },
  ];

  // ETC 페이지에서 모아 보는 친구들
  const others = [
    { slug: "george", name: "조지", en: "GEORGE", group: "family", tag: "할아버지 · 마이아사우라", thumb: thumb("04"), detail: detail("04"),
      story: "낚시터를 운영하는 할아버지예요. 손재주가 좋아서 코코비가 갖고 싶은 건 뚝딱뚝딱 만들어 주세요." },
    { slug: "martha", name: "마샤", en: "MARTHA", group: "family", tag: "할머니 · 마이아사우라", thumb: thumb("05"), detail: detail("05"),
      story: "지혜로운 할머니예요. 텃밭에서 직접 기른 채소로 가족들에게 맛있는 요리를 해 주세요." },
    { slug: "sean", name: "션", en: "SEAN", group: "family", tag: "삼촌 · 알로사우루스", thumb: thumb("06"), detail: detail("06"),
      story: "서핑샵을 운영하는 멋쟁이 삼촌이에요. 코코비를 데리고 캠핑도 자주 떠나요." },
    { slug: "rou", name: "루", en: "ROU", group: "friends", tag: "4살 · 브라키오사우루스", thumb: thumb("09"), detail: detail("09"),
      story: "행동은 느릿느릿하지만 마음이 착해서 친구들과 늘 사이좋게 지내요." },
    { slug: "tom", name: "톰", en: "TOM", group: "friends", tag: "6살 · 트리케라톱스", thumb: thumb("10"), detail: detail("10"),
      story: "기억력이 뛰어난 똑똑한 여자아이예요. 가수 방탄공룡단(BDS)의 열혈 팬이랍니다." },
    { slug: "nico", name: "니코", en: "NICO", group: "friends", tag: "6살 · 벨로시랩터", thumb: thumb("11"), detail: detail("11"),
      story: "벨의 오빠예요. 지적이고 시크한 성격 덕분에 학교에서 인기가 많아요." },
    { slug: "jackson", name: "잭슨", en: "JACKSON", group: "friends", tag: "6살 · 티라노사우루스", thumb: thumb("12"), detail: detail("12"),
      story: "잭잭의 형이에요. 단순하고 열정이 넘치고, 니코를 라이벌로 생각해요." },
    { slug: "elon", name: "엘론", en: "ELON", group: "friends", tag: "4살 · 스테고사우루스", thumb: thumb("13"), detail: detail("13"),
      story: "칭찬을 좋아하는 꼬마 발명가예요. 똑똑하고 자존심이 세서 지는 걸 싫어해요." },
    { slug: "pinky", name: "핑키", en: "PINKY", group: "friends", tag: "6살 · 시조새", thumb: thumb("14"), detail: detail("14"),
      story: "패션 감각이 남다른 시조새 수다쟁이예요." },
  ];

  const etc = {
    slug: "etc", name: "ETC", en: "MORE FRIENDS", tag: `${others.length}명의 가족과 친구들`,
    bg: "#43281a", on: "#fff3c4", deep: "#2c190f",
  };

  window.COCOBI = { main, others, etc, all: [...main, etc] };
})();
