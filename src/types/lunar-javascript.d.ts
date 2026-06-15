declare module "lunar-javascript" {
  type EightCharLike = {
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
    getYearGan(): string;
    getMonthGan(): string;
    getDayGan(): string;
    getTimeGan(): string;
    getYearZhi(): string;
    getMonthZhi(): string;
    getDayZhi(): string;
    getTimeZhi(): string;
    getYearWuXing(): string;
    getMonthWuXing(): string;
    getDayWuXing(): string;
    getTimeWuXing(): string;
    getYearShiShenGan(): string;
    getMonthShiShenGan(): string;
    getDayShiShenGan(): string;
    getTimeShiShenGan(): string;
    getYearNaYin(): string;
    getMonthNaYin(): string;
    getDayNaYin(): string;
    getTimeNaYin(): string;
  };

  type SolarLike = {
    getLunar(): LunarLike;
    toYmdHms(): string;
  };

  type LunarLike = {
    getSolar(): SolarLike;
    getEightChar(): EightCharLike;
    toString(): string;
  };

  export const Solar: {
    fromYmdHms(
      year: string | number,
      month: string | number,
      day: string | number,
      hour: string | number,
      minute: string | number,
      second: string | number,
    ): SolarLike;
  };

  export const Lunar: {
    fromYmdHms(
      year: string | number,
      month: string | number,
      day: string | number,
      hour: string | number,
      minute: string | number,
      second: string | number,
    ): LunarLike;
  };
}
