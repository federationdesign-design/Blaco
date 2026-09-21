import { BedIcon, CheckIcon, HouseIcon, MailIcon, PeopleIcon, PhoneIcon, PinIcon } from '../Icons';
import type { IconName } from '../../lib/content';

// Stands in for the Divi icon font used by the live blurbs.
const ICONS = { pin: PinIcon, house: HouseIcon, people: PeopleIcon, phone: PhoneIcon, mail: MailIcon, check: CheckIcon, bed: BedIcon };

export function BlockIcon({ name, className }: { name: IconName; className?: string }) {
  const Icon = ICONS[name];
  return <Icon className={className} />;
}
