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
  birthYear: number;
  gender: Exclude<Gender, "전체">;
  marriageStatus: MarriageStatus;
  childStatus: ChildStatus;
  childAgeGroup: ChildAgeGroup;
  categories: BenefitCategory[];
};

const currentYear = new Date().getFullYear();

export function getAgeFromBirthYear(birthYear: number): number {
  return currentYear - birthYear + 1;
}

function isRegionMatched(item: BenefitItem, province: string, city: string): boolean {
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

function isGenderMatched(item: BenefitItem, gender: Exclude<Gender, "전체">): boolean {
  return item.eligibleGender === "전체" || item.eligibleGender === gender;
}

function isChildAgeMatched(item: BenefitItem, profile: UserProfile): boolean {
  if (profile.childStatus !== "있음") {
    return true;
  }

  if (profile.childAgeGroup === "해당 없음") {
    return false;
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
  const age = getAgeFromBirthYear(profile.birthYear);

  return items.filter((item) => {
    const isAgeMatched = age >= item.ageRange.min && age <= item.ageRange.max;
    const isMarriageMatched = item.eligibleMarriage.includes(profile.marriageStatus);
    const isChildMatched = item.eligibleChildStatus.includes(profile.childStatus);

    return (
      isRegionMatched(item, profile.province, profile.city) &&
      isCategoryMatched(item, profile.categories) &&
      isGenderMatched(item, profile.gender) &&
      isAgeMatched &&
      isMarriageMatched &&
      isChildMatched &&
      isChildAgeMatched(item, profile)
    );
  });
}
