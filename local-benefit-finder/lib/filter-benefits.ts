import {
  BENEFIT_ITEMS,
  type BenefitCategory,
  type BenefitItem,
  type ChildAgeGroup,
  type ChildStatus,
  type Gender,
  type MarriageStatus,
} from "@/data/benefits";

export type UserProfile = {
  province: string;
  city: string;
  birthYear: number | null;
  genders: Exclude<Gender, "전체">[];
  marriageStatuses: MarriageStatus[];
  childStatuses: ChildStatus[];
  childAgeGroup: ChildAgeGroup;
  categories: BenefitCategory[];
};

const currentYear = new Date().getFullYear();

export function getAgeFromBirthYear(birthYear: number): number {
  return currentYear - birthYear + 1;
}

function isRegionMatched(item: BenefitItem, province: string, city: string): boolean {
  if (!province) {
    return false;
  }

  if (item.regions.some((region) => region.province === "전국")) {
    return true;
  }

  return item.regions.some(
    (region) =>
      region.province === province &&
      (region.city === city || region.city === "전체" || city === "전체"),
  );
}

function isCategoryMatched(item: BenefitItem, categories: BenefitCategory[]): boolean {
  if (categories.length === 0) {
    return true;
  }
  return categories.some((category) => item.categories.includes(category));
}

function isGenderMatched(item: BenefitItem, genders: Exclude<Gender, "전체">[]): boolean {
  if (genders.length === 0) {
    return true;
  }
  return item.eligibleGender === "전체" || genders.includes(item.eligibleGender);
}

function isChildAgeMatched(item: BenefitItem, profile: UserProfile): boolean {
  if (profile.childAgeGroup === "해당 없음") {
    return true;
  }

  return (
    item.eligibleChildAgeTargets.includes("전체") ||
    item.eligibleChildAgeTargets.includes(profile.childAgeGroup)
  );
}

export function filterBenefits(profile: UserProfile): BenefitItem[] {
  return filterBenefitsFromItems(profile, BENEFIT_ITEMS);
}

export function filterBenefitsFromItems(profile: UserProfile, items: BenefitItem[]): BenefitItem[] {
  if (!profile.province) {
    return [];
  }

  const age = profile.birthYear ? getAgeFromBirthYear(profile.birthYear) : null;

  return items.filter((item) => {
    const isAgeMatched = age ? age >= item.ageRange.min && age <= item.ageRange.max : true;
    const isMarriageMatched =
      profile.marriageStatuses.length === 0 ||
      profile.marriageStatuses.some((status) => item.eligibleMarriage.includes(status));
    const isChildMatched =
      profile.childStatuses.length === 0 ||
      profile.childStatuses.some((status) => item.eligibleChildStatus.includes(status));

    return (
      isRegionMatched(item, profile.province, profile.city) &&
      isCategoryMatched(item, profile.categories) &&
      isGenderMatched(item, profile.genders) &&
      isAgeMatched &&
      isMarriageMatched &&
      isChildMatched &&
      isChildAgeMatched(item, profile)
    );
  });
}
