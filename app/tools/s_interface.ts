export interface StoreState { mainSlice: {
  logged: boolean;
  played: {
    id: string;
      gId: string;
      gTCountry: string;
      gSubtitle: string;
      mktT: string;
      mTime: string;
      hometeam: string;
      awayteam: string;
      odd: string;
      selection: string;
      mStatus: string;
      mResult: string;
      mOutcome: string;
      mScore: string;
  }[];
  me: {
    userID: string;
    fname: string;
    lname: string;
    email: string;
    mobile: string;
    accbal: string;
    currency: string;
    rating: string;
    sub: string;
    TGames: string;
    TWon: string;
    TLost: string;
    nickname: string;
    jdate: string;
  };
  buttonState: {[key: string]: boolean};
}}

export interface StoreState2 {
  logged: boolean;
  played: {
    id: string;
      gId: string;
      gTCountry: string;
      gSubtitle: string;
      mktT: string;
      mTime: string;
      hometeam: string;
      awayteam: string;
      odd: string;
      selection: string;
      mStatus: string;
      mResult: string;
      mOutcome: string;
      mScore: string;
  }[];
  me: {
    userID: string;
    fname: string;
    lname: string;
    email: string;
    mobile: string;
    accbal: string;
    currency: string;
    rating: string;
    sub: string;
    TGames: string;
    TWon: string;
    TLost: string;
    nickname: string;
    jdate: string;
  };
  buttonState: {[key: string]: boolean};
}

export interface PlayeD {
  id: string;
  gId: string;
  gTCountry: string;
  gSubtitle: string;
  mktT: string;
  mTime: string;
  hometeam: string;
  awayteam: string;
  odd: string;
  selection: string;
  mStatus: string;
  mResult: string;
  mOutcome: string;
  mScore: string;
}

export interface Bet {
  userID: string;
  gameID: string;
  returns: string;
  result: string;
  date: string;
  time: string;
  betamt: string;
  status: string;
  potwin: string;
  odds: string;
  bet: {
  id: string;
  gId: string;
  gTCountry: string;
  gSubtitle: string;
  mktT: string;
  mTime: string;
  hometeam: string;
  awayteam: string;
  odd: string;
  selection: string;
  mStatus: string;
  mResult: string;
  mOutcome: string;
  mScore: string;
}[];
}

export interface betS {
  betTab: string;
}