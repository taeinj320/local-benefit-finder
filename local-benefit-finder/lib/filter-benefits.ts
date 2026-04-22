import {
  BENEFIT_ITEMS,
  type BenefitCategory,
  type BenefitItem,
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
  categories: BenefitCategory[];
};

const currentYear = new Date().getFullYear();

export function getAgeFromBirthYear(birthYear: number): number {
  return currentYear - birthYear + 1;
}

function isRegionMatched(item: BenefitItem, province: string, city: string): boolean {
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

export function filterBenefits(profile: UserProfile): BenefitItem[] {
  const age = getAgeFromBirthYear(profile.birthYear);

  return BENEFIT_ITEMS.filter((item) => {
    const isAgeMatched = age >= item.ageRange.min && age <= item.ageRange.max;
    const isMarriageMatched = item.eligibleMarriage.includes(profile.marriageStatus);
    const isChildMatched = item.eligibleChildStatus.includes(profile.childStatus);

    return (
      isRegionMatched(item, profile.province, profile.city) &&
      isCategoryMatched(item, profile.categories) &&
      isGenderMatched(item, profile.gender) &&
      isAgeMatched &&
      isMarriageMatched &&
      isChildMatched
    );
  });
}
