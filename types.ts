import { getSpecialsArr } from './util/general';

export type ContextObject = {
  data: DataObj;
  setContext: <T extends keyof UserSettings>(
    prop: T,
    val: UserSettings[T]
  ) => void;
  setAllContext: (inp: UserSettings) => void;
};

export class UserSettings {
  color: string;
  pass_charNum: number;
  pass_numbers: boolean;
  pass_letters: boolean;
  pass_specials: boolean;
  pass_specialSet: Set<string>;
  pin_charNum: number;

  constructor() {
    this.color = '#d3d3d3';
    this.pass_charNum = 13;
    this.pass_numbers = true;
    this.pass_letters = true;
    this.pass_specials = true;
    this.pass_specialSet = new Set(getSpecialsArr());
    this.pin_charNum = 13;
  }
}

export class DataObj {
  dimensions: {
    win_H: number;
    win_W: number;
    scr_H: number;
    scr_W: number;
    nav_H: number;
    icon_S: number;
  };
  settings: UserSettings;

  constructor(windH: number, windW: number, scrH: number, scrW: number) {
    this.dimensions = {
      win_H: windH,
      win_W: windW,
      scr_H: scrH,
      scr_W: scrW,
      nav_H: scrH - windH,
      icon_S: 0.05 * scrH,
    };
    this.settings = new UserSettings();
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

export class PassSettings {
  charNum: number;
  numbers: boolean;
  letters: boolean;
  special: boolean;
  specialSet: Set<string>;

  constructor() {
    this.charNum = 13;
    this.numbers = true;
    this.letters = true;
    this.special = true;
    this.specialSet = new Set<string>(getSpecialsArr());
  }
}

export class PinSettings {
  charNum: number;

  constructor() {
    this.charNum = 13;
  }
}

// export class SettingsLB {
//   color: string;
//   pass: PassSettings;
//   pin: PinSettings;

//   constructor() {
//     this.color = '#d3d3d3';
//     this.pass = new PassSettings();
//     this.pin = new PinSettings();
//   }
// }

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
  usr_settings: string;
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
