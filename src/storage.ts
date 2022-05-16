import { readFileSync, writeFileSync } from 'fs';

export class Storage<DB_DATA_T> {
  constructor(
    private readonly path: string,
  ) {
  }

  read(): DB_DATA_T {
    return JSON.parse(readFileSync(this.path, { encoding: 'utf-8' }));
  }

  write(data: DB_DATA_T): void {
    writeFileSync(this.path, JSON.stringify(data), { encoding: 'utf-8' });
  }
}
