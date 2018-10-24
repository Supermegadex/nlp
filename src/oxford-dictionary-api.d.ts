declare module "oxford-dictionary-api" {
  interface IDictionary {
    constructor (appId: string, appKey: string): IDictionary;
    find (word: string, callback: (err: any, data: any) => null): null;
  }
  export var Dictionary: IDictionary;
}