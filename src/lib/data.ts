export type Paper =
  | "plain"
  | "hanji"
  | "celadon"
  | "dawn"
  | "plum"
  | "moss"
  | "ink";

export type Comment = {
  id: string;
  author: string;
  color: string;
  text: string;
  time: string;
};

export type Message = {
  id: string;
  no: number;
  author: string;
  handle: string;
  color: string;
  verified?: boolean;
  time: string;
  text: string;
  paper: Paper;
  likes: number;
  liked: boolean;
  saved: boolean;
  comments: Comment[];
};

/** 아바타는 외부 이미지 없이 단색 + 이니셜 */
export const COLORS = {
  clay: "#a9705a",
  celadon: "#64907f",
  slate: "#6a7889",
  plum: "#9d6f7c",
  moss: "#7b8a67",
  sand: "#ab9268",
  ink: "#4d4945",
  rose: "#b07f76",
} as const;

export const PAPERS: { key: Paper; label: string; swatch: string }[] = [
  { key: "plain", label: "무지", swatch: "#fffdf9" },
  { key: "hanji", label: "한지", swatch: "#eadfc8" },
  { key: "celadon", label: "청자", swatch: "#cfded6" },
  { key: "dawn", label: "새벽", swatch: "#d5dae5" },
  { key: "plum", label: "매화", swatch: "#ecd7da" },
  { key: "moss", label: "이끼", swatch: "#d9dfc9" },
  { key: "ink", label: "먹", swatch: "#24211d" },
];

export const CURRENT_USER = {
  name: "나",
  handle: "me",
  color: COLORS.slate,
  bio: "아직 소개가 없어요",
};

export const TOTAL_ENTRIES = 1284;

export const INITIAL_MESSAGES: Message[] = [
  {
    id: "m1",
    no: 1284,
    author: "김서연",
    handle: "seoyeon_k",
    color: COLORS.clay,
    verified: true,
    time: "14분 전",
    text: "십 년째 같은 자리에 있는 카페에 오랜만에 들렀는데, 사장님이 아직도 제 주문을 기억하고 계셨어요. 변하지 않는 게 하나쯤 있다는 건 생각보다 큰 위로가 되네요.",
    paper: "hanji",
    likes: 1284,
    liked: false,
    saved: false,
    comments: [
      {
        id: "c1",
        author: "박지훈",
        color: COLORS.celadon,
        text: "골목 끝에 있는 그 집 말씀이시죠? 저도 지난주에 갔었어요.",
        time: "8분 전",
      },
      {
        id: "c2",
        author: "한소희",
        color: COLORS.rose,
        text: "이 문장 오래 기억할 것 같아요.",
        time: "3분 전",
      },
    ],
  },
  {
    id: "m2",
    no: 1283,
    author: "박지훈",
    handle: "jihoon.dev",
    color: COLORS.celadon,
    time: "1시간 전",
    text: "세 시간 동안 붙잡고 있던 버그가 세미콜론 하나였습니다. 오늘 하루는 이렇게 갑니다.",
    paper: "plain",
    likes: 342,
    liked: true,
    saved: false,
    comments: [
      {
        id: "c3",
        author: "정우진",
        color: COLORS.ink,
        text: "너무 현실적이라 웃음이 안 나옵니다",
        time: "40분 전",
      },
    ],
  },
  {
    id: "m3",
    no: 1282,
    author: "이하늘",
    handle: "haneul_lee",
    color: COLORS.plum,
    time: "3시간 전",
    text: "방명록 첫 글입니다.\n이 글을 보는 분들 모두, 오늘 하루가 조금은 수월했으면 좋겠어요.",
    paper: "celadon",
    likes: 5621,
    liked: false,
    saved: true,
    comments: [
      {
        id: "c4",
        author: "최민서",
        color: COLORS.sand,
        text: "덕분에 잘 받았습니다.",
        time: "2시간 전",
      },
      {
        id: "c5",
        author: "정우진",
        color: COLORS.ink,
        text: "하늘님도 수월한 하루 보내세요.",
        time: "1시간 전",
      },
      {
        id: "c6",
        author: "강예린",
        color: COLORS.moss,
        text: "마침 오늘 이 말이 필요했어요.",
        time: "22분 전",
      },
    ],
  },
  {
    id: "m4",
    no: 1281,
    author: "최민서",
    handle: "minseo.c",
    color: COLORS.sand,
    time: "5시간 전",
    text: "커튼을 밝은 미색으로 바꿨더니 방이 훨씬 환해졌어요. 삶이 달라지는 데 만 이천 원이면 충분할 때도 있네요.",
    paper: "plum",
    likes: 897,
    liked: false,
    saved: false,
    comments: [],
  },
  {
    id: "m5",
    no: 1280,
    author: "정우진",
    handle: "woojin_j",
    color: COLORS.ink,
    time: "어제",
    text: "새벽 두 시의 도시는 조용합니다. 편의점 불빛만 켜져 있고요.\n따뜻한 우유를 하나 사서 나오는데, 그제야 오늘 하루가 끝난 기분이었습니다.",
    paper: "ink",
    likes: 2410,
    liked: false,
    saved: false,
    comments: [
      {
        id: "c7",
        author: "김서연",
        color: COLORS.clay,
        text: "오늘은 일찍 주무세요.",
        time: "어제",
      },
    ],
  },
  {
    id: "m6",
    no: 1279,
    author: "한소희",
    handle: "sohee.h",
    color: COLORS.rose,
    time: "2일 전",
    text: "시험 끝났습니다. 진짜로 끝났습니다.\n이 문장 하나 쓰려고 로그인했어요.",
    paper: "moss",
    likes: 1893,
    liked: false,
    saved: false,
    comments: [
      {
        id: "c8",
        author: "이하늘",
        color: COLORS.plum,
        text: "고생 많으셨어요!! 푹 쉬세요",
        time: "2일 전",
      },
    ],
  },
];

export const REGULARS = [
  { id: "u1", name: "윤도현", handle: "dohyun.y", color: COLORS.moss, count: 42 },
  { id: "u2", name: "강예린", handle: "yerin_k", color: COLORS.rose, count: 38 },
  { id: "u3", name: "오세훈", handle: "sehun.o", color: COLORS.slate, count: 27 },
  { id: "u4", name: "배수진", handle: "sujin_bae", color: COLORS.clay, count: 19 },
];

export function formatCount(n: number): string {
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  return n.toLocaleString("ko-KR");
}
