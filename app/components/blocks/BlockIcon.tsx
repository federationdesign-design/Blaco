import { BedIcon, CheckCircleIcon, HouseIcon, MailIcon, PeopleIcon, PhoneIcon, PinIcon } from '../Icons';
import type { IconName } from '../../lib/content';

// Stands in for the Divi icon font used by the live blurbs. The check is the
// live filled circle with a white tick (Divi icon_check_alt).
const ICONS = { pin: PinIcon, house: HouseIcon, people: PeopleIcon, phone: PhoneIcon, mail: MailIcon, check: CheckCircleIcon, bed: BedIcon };

export function BlockIcon({ name, className }: { name: IconName; className?: string }) {
  const Icon = ICONS[name];
  return <Icon className={className} />;
}
