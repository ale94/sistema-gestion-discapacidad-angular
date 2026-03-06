import { CivilStatus } from '../enums/civil-status';
import { Gender } from '../enums/gender';
import { Status } from '../enums/status';
import { Address } from './address';
import { Benefit } from './benefit';
import { Education } from './education';
import { Health } from './health';
import { Work } from './work';

export interface Person {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  civilStatus: CivilStatus;
  dateBirth: Date;
  tutor: string;
  phone: string;
  gender: Gender;
  registrationDate: Date;
  status: Status;
  indicatorType: string;
  consultationDate: Date;
  education: Education;
  work: Work;
  health: Health;
  address: Address;
  benefit: Benefit;
}
