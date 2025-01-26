export class ContextObj {
  window_h: number;
  window_w: number;
  screen_h: number;
  screen_w: number;
  navBar_h: number;
  icon_size: number;

  constructor(windH: number, windW: number, scrH: number, scrW: number) {
    this.window_h = windH;
    this.window_w = windW;
    this.screen_h = scrH;
    this.screen_w = scrW;
    this.navBar_h = scrH - windH;
    this.icon_size = 0.05 * scrH;
  }
}

export type Props = {
  changePage?: (inp: number) => void;
  widget?: string;
  setWidget?: (inp: string) => void;
  keeboard?: boolean;
  userControl?: {
    get: () => number;
    set: (inp: number) => void;
  };
};

export class EntryForm {
  org: string;
  login: string;
  passwordA: string;
  passwordB: string;
  email: string;
  url: string;
  pinA: string;
  pinB: string;
  misc: string;

  constructor() {
    this.org = '';
    this.login = '';
    this.passwordA = '';
    this.passwordB = '';
    this.email = '';
    this.url = '';
    this.pinA = '';
    this.pinB = '';
    this.misc = '';
  }
}

export type EntryFormKey = keyof EntryForm;

export type DBUser = {
  usr_id: number;
  usr_login: string;
  usr_email: string | null;
  usr_password: string;
  usr_salt: string;
  usr_created: string;
};

export class DBEntry {
  data_id: number | null = null;
  usr_id: number | null = null;
  data_org: string | null = null;
  data_login: string | null = null;
  data_password: string | null = null;
  data_pin: string | null = null;
  data_email: string | null = null;
  data_url: string | null = null;
  data_misc: string | null = null;
  data_created: string | null = null;
  data_modified: string | null = null;

  constructor() {}
}
export type DBEntryKey = keyof DBEntry;
// export type DBEntrySub = Partial<Omit<DBEntry, 'data_id' | 'usr_id'>>;
// export type DBEntrySubKey = keyof DBEntrySub;

export type DBEntryColObj = {
  data_id: number;
  data_val: string | number;
};

// type based on DBEntry with index keys omitted
export type CSVEntry = Omit<DBEntry, 'data_id' | 'usr_id'>;

export class FListEntry {
  orgName: string;
  key: string;
  constructor() {
    this.orgName = '';
    this.key = '';
  }
}
