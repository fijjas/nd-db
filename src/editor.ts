import { IBuilder, IEditExecutor } from './interfaces';

export class EditBuilder implements IBuilder<void> {
  constructor(
    private readonly dbRef: IEditExecutor,
    public readonly collectionName: string,
  ) {}

  // TODO: locate(), set()

  // locate(hyperPath) {
  //   // { kd1: {...}, kd2: {...}, ... }
  //   this.hyperPath = hyperPath;
  //   return this;
  // }
  //
  // set(hyperData) {
  //   // { kd1: {...}, kd2: {...}, ... }
  //   this.data = hyperData;
  //   return this;
  // }

  exec(): void {
    return this.dbRef.execEdit(this);
  }
}
