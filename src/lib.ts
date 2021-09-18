import axios from "axios";
import { JSDOM } from "jsdom";

function nameof(arg:{[key:string]:any}){
  return Object.keys(arg)[0];
}

/**
 * weather advisory and warning jp client
 * クライアントを表します
 */
export class WeatherAdvisoryWarningClient {
  private readonly endpoint = null as string;
  private lastFetched = null as Date;
  private entries = [] as WeatherAdvisoryWarningItem[];

  /**
   * Initialize weather advisory and warning jp client
   * クライアントを初期化します
   * acodeは`CPS-IIPリスクウォッチャー`の詳細ページのURLのパラメーターです。
   * 例えば`http://agora.ex.nii.ac.jp/cgi-bin/cps/warning_list.pl?acode=130000`の場合`acode`は`130000`となります
   * @param acode target acode / 対象地域のacode
   */
  constructor(acode:string){
    if(!acode.match(/^\d+$/)){
      throw new Error("Invalid acode was provided");
    }
    this.endpoint = `http://agora.ex.nii.ac.jp/cgi-bin/cps/warning_list.pl?acode=${acode}`;
  }

  /**
   * fetch weather advisory and warning entries
   * 気象注意報・警報・特別警報の情報を取得します
   * @param update wether it's necessary to update or not / 情報を更新するかどうか
   * @returns weather advisory and warning entries / 取得されたエントリ
   */
  async fetch(update:boolean = false){
    if(update && (this.lastFetched && new Date().getTime() - this.lastFetched.getTime() < 1 * 60 * 1000)){
      throw new Error("Too short time interval(s) to update");
    }
    if(!update && this.entries.length > 0){
      return this.entries;
    }
    const response = (await axios.get<string>(this.endpoint)).data;
    this.lastFetched = new Date();
    const parser = new (new JSDOM()).window.DOMParser();
    const document = parser.parseFromString(response, "text/html");
    document.querySelectorAll("div.report table tr").forEach((value) => {
      if(value.nodeName === "TR"){
        const childlen = value.children;
        const entry = new WeatherAdvisoryWarningItemBase();
        entry["id"] = childlen.item(1).textContent;
        entry["name"] = childlen.item(2).textContent;
        entry["areaName"] = childlen.item(3).textContent;
        entry["issuedDate"] = new Date(childlen.item(4).textContent);
        const rawCanceledDate = childlen.item(5).textContent
        if(rawCanceledDate !== "発表中") 
          entry["canceledDate"] = new Date(rawCanceledDate);
        entry["type"] = 
          entry.name.endsWith("注意報") ? "advisory" :
          entry.name.endsWith("特別警報") ? "emergency" :
          entry.name.endsWith("警報") ? "warning" : "unknown";
        if(this.entries.some(e => e.id === entry.id)){
          this.entries[this.entries.findIndex(e => e.id === entry.id)]["updateProperty"](entry);
        }else{
          this.entries.push(new WeatherAdvisoryWarningItem(entry, this));
        }
      }
    });
    return this.entries;
  }

  /**
   * get weather advisory and warning entries that have already fetched
   * すでに取得されている気象注意報・警報・特別警報の情報を返します
   * @param index index which of the entry you wanted, if any / 取得したいインデックス
   * @returns entries if there're pre-fetched entrie(s). if not, null / エントリ
   */
  get(index:number = undefined){
    if(this.entries.length <= 0){
      return null;
    }
    if(typeof index === "number"){
      return this.entries[index];
    }
    return this.entries;
  }
}

/**
 * determine a type of item
 * 気象注意報・警報・特別警報の情報の種類を示します
 */
export type WAWType = "advisory"|"warning"|"emergency"|"unknown";

/**
 * Base class of WeatherAdvisoryWarningItem
 * WeatherAdvisoryWarningItemのベースクラスです
 */
export class WeatherAdvisoryWarningItemBase {
  private _type:WAWType;
  /**
   * Type of entry
   * エントリのタイプ
   */
  get type():WAWType{
    return this._type
  }
  protected set type(value:WAWType){
    this._type = value;
  }

  private _id:string;
  /**
   * Unique ID of entry
   * エントリの固有のIDを示します
   */
  get id():string{
    return this._id;
  }
  protected set id(value:string){
    this._id = value;
  }

  private _areaName:string;
  /**
   * area name that was issued advisory or warning or emergency info that is this entry of
   * 発令されているエリアを示します
   */
  get areaName():string{
    return this._areaName;
  }
  protected set areaName(value:string){
    this._areaName = value;
  }

  private _issuedDate:Date;
  /**
   * Date when this issued
   * 発令された日付時刻を示します
   */
  get issuedDate():Date{
    return this._issuedDate
  }
  protected set issuedDate(value:Date){
    this._issuedDate = value;
  }

  private _canceledDate:Date|null;
  /**
   * Date when this canceled
   * 解除されたエリアを示します
   */
  get canceledDate():Date|null{
    return this._canceledDate;
  }
  protected set canceledDate(value:Date|null){
    this._canceledDate = value;
  }

  private _name:string;
  /**
   * Name of this entry
   * エントリの名前。たとえば`洪水警報`などです
   */
  get name():string {
    return this._name;
  }
  protected set name(value:string){
    this._name = value;
  }
}

/**
 * Entry of either of weather advisory, warning, emergency information.
 * 気象注意報・警報・特別警報のいずれかの情報
 */
export class WeatherAdvisoryWarningItem extends WeatherAdvisoryWarningItemBase {

  /**
   * Initialize an entry from given data
   * 与えられたデータからエントリを初期化します
   * @param data entry data / エントリのデータ
   * @param client client bound of this / 紐づけられたクライアント
   */
  constructor(data:WeatherAdvisoryWarningItemBase, private client:WeatherAdvisoryWarningClient){
    super();
    if(!client) {
      throw new Error(`Argument '${nameof({client})} was invalid`);
    }
    this.updateProperty(data);
  }

  private updateProperty(data:WeatherAdvisoryWarningItemBase){
    Object.assign(this, data);
  }

  /**
   * fetch weather advisory and warning entries
   * 気象注意報・警報・特別警報の情報を再取得して更新します
   * @returns this
   */
  async fetch(){
    await this.client.fetch(true);
    return this;
  }
}