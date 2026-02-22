declare module "mailcheck" {
  export type MailcheckSuggestion = {
    address: string;
    domain: string;
    full: string;
  };

  export type MailcheckOptions = {
    email: string;
    domains?: string[];
    secondLevelDomains?: string[];
    topLevelDomains?: string[];
    distanceFunction?: (first: string, second: string) => number;
    suggested?: (suggestion: MailcheckSuggestion) => unknown;
    empty?: () => unknown;
  };

  export type MailcheckApi = {
    run: (options: MailcheckOptions) => unknown;
    suggest: (
      email: string,
      domains?: string[],
      secondLevelDomains?: string[],
      topLevelDomains?: string[],
      distanceFunction?: (first: string, second: string) => number
    ) => MailcheckSuggestion | false;
    sift3Distance: (first: string, second: string) => number;
  };

  const Mailcheck: MailcheckApi;
  export default Mailcheck;
}
