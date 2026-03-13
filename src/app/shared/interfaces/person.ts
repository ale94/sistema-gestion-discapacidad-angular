
import { Address } from './address';
import { Benefit } from './benefit';
import { Education } from './education';
import { FamilyMember } from './family-member';
import { Health } from './health';
import { Work } from './work';

export interface Person {
  id: number;
  firstName: string;
  lastName: string;
  dni: string;
  civilStatus: string;
  dateBirth: Date;
  tutor: string;
  phone: string;
  gender: string;
  registrationDate: Date;
  education: Education;
  work: Work;
  health: Health;
  address: Address;
  benefit: Benefit;

  familyMembers: FamilyMember[];
}
