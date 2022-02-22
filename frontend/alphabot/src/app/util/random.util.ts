export class RandomUtil {

  private constructor() {
  }

  public static randomInteger(range: number, offset: number = 0): number {
    return Math.floor(Math.random() * range) + offset;
  }

  public static randomUppercaseCharacter(): string {
    return String.fromCharCode(RandomUtil.randomInteger(26, 65));
  }
}
