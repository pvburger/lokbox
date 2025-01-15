export class ContextObj {
  screen_h: number;
  screen_w: number;

  constructor() {
    this.screen_h = 0;
    this.screen_w = 0;
  }
}

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

export class FListEntry {
  orgName: string;
  key: string;
  constructor() {
    this.orgName = '';
    this.key = '';
  }
}
