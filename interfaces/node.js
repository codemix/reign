declare class Buffer {
  constructor(value: Array<number> | number | string | Buffer, encoding?: string): void;
  [i: number]: number;
  length: number;
  byteOffset: number;
  buffer: ArrayBuffer;
  write(string: string, offset?: number, length?: number, encoding?: string): void;
  copy(targetBuffer: Buffer, targetStart?: number, sourceStart?: number, sourceEnd?: number): number;
  equals(otherBuffer: Buffer): boolean;
  compare(otherBuffer: Buffer): number;
  slice(start?: number, end?: number): Buffer;
  fill(value: string | number, offset?: number, end?: number): void;
  inspect(): string;
  toString(encoding?: string, start?: number, end?: number): string;
  toJSON(): Array<number>;

  readUInt8(offset: number, noAssert?: boolean): number;
  readUInt16LE(offset: number, noAssert?: boolean): number;
  readUInt16BE(offset: number, noAssert?: boolean): number;
  readUInt32LE(offset: number, noAssert?: boolean): number;
  readUInt32BE(offset: number, noAssert?: boolean): number;
  readInt8(offset: number, noAssert?: boolean): number;
  readInt16LE(offset: number, noAssert?: boolean): number;
  readInt16BE(offset: number, noAssert?: boolean): number;
  readInt32LE(offset: number, noAssert?: boolean): number;
  readInt32BE(offset: number, noAssert?: boolean): number;
  readFloatLE(offset: number, noAssert?: boolean): number;
  readFloatBE(offset: number, noAssert?: boolean): number;
  readDoubleLE(offset: number, noAssert?: boolean): number;
  readDoubleBE(offset: number, noAssert?: boolean): number;
  writeUInt8(value: number, offset: number, noAssert?: boolean): number;
  writeUInt16LE(value: number, offset: number, noAssert?: boolean): number;
  writeUInt16BE(value: number, offset: number, noAssert?: boolean): number;
  writeUInt32LE(value: number, offset: number, noAssert?: boolean): number;
  writeUInt32BE(value: number, offset: number, noAssert?: boolean): number;
  writeInt8(value: number, offset: number, noAssert?: boolean): number;
  writeInt16LE(value: number, offset: number, noAssert?: boolean): number;
  writeInt16BE(value: number, offset: number, noAssert?: boolean): number;
  writeInt32LE(value: number, offset: number, noAssert?: boolean): number;
  writeInt32BE(value: number, offset: number, noAssert?: boolean): number;
  writeFloatLE(value: number, offset: number, noAssert?: boolean): number;
  writeFloatBE(value: number, offset: number, noAssert?: boolean): number;
  writeDoubleLE(value: number, offset: number, noAssert?: boolean): number;
  writeDoubleBE(value: number, offset: number, noAssert?: boolean): number;

  static isEncoding(encoding: string): boolean;
  static isBuffer(obj: any): boolean;
  static byteLength(string: string, encoding?: string): number;
  static concat(list: Array<Buffer>, totalLength?: number): Buffer;
  static compare(buf1: Buffer, buf2: Buffer): number;
}



declare module "fs" {
  declare class Stats {
    dev: number;
    ino: number;
    mode: number;
    nlink: number;
    uid: number;
    gid: number;
    rdev: number;
    size: number;
    blksize: number;
    blocks: number;
    atime: Date;
    mtime: Date;
    ctime: Date;

    isFile(): boolean;
    isDirectory(): boolean;
    isBlockDevice(): boolean;
    isCharacterDevice(): boolean;
    isSymbolicLink(): boolean;
    isFIFO(): boolean;
    isSocket(): boolean;
  }

  declare class FSWatcher extends events$EventEmitter {
    close(): void
  }

  declare class ReadStream extends stream$Readable {
    close(): void
  }

  declare class WriteStream extends stream$Writable {
    close(): void
  }

  declare function rename(oldPath: string, newPath: string, callback?: (err: ?Error) => void): void;
  declare function renameSync(oldPath: string, newPath: string): void;
  declare function ftruncate(fd: number, len: number, callback?: (err: ?Error) => void): void;
  declare function ftruncateSync(fd: number, len: number): void;
  declare function truncate(path: string, len: number, callback?: (err: ?Error) => void): void;
  declare function truncateSync(path: string, len: number): void;
  declare function chown(path: string, uid: number, gid: number, callback?: (err: ?Error) => void): void;
  declare function chownSync(path: string, uid: number, gid: number): void;
  declare function fchown(fd: number, uid: number, gid: number, callback?: (err: ?Error) => void): void;
  declare function fchownSync(fd: number, uid: number, gid: number): void;
  declare function lchown(path: string, uid: number, gid: number, callback?: (err: ?Error) => void): void;
  declare function lchownSync(path: string, uid: number, gid: number): void;
  declare function chmod(path: string, mode: number | string, callback?: (err: ?Error) => void): void;
  declare function chmodSync(path: string, mode: number | string): void;
  declare function fchmod(fd: number, mode: number | string, callback?: (err: ?Error) => void): void;
  declare function fchmodSync(fd: number, mode: number | string): void;
  declare function lchmod(path: string, mode: number | string, callback?: (err: ?Error) => void): void;
  declare function lchmodSync(path: string, mode: number | string): void;
  declare function stat(path: string, callback?: (err: ?Error, stats: Stats) => any): void;
  declare function statSync(path: string): Stats;
  declare function fstat(fd: number, callback?: (err: ?Error, stats: Stats) => any): void;
  declare function fstatSync(fd: number): Stats;
  declare function lstat(path: string, callback?: (err: ?Error, stats: Stats) => any): void;
  declare function lstatSync(path: string): Stats;
  declare function link(srcpath: string, dstpath: string, callback?: (err: ?Error) => void): void;
  declare function linkSync(srcpath: string, dstpath: string): void;
  declare function symlink(srcpath: string, dtspath: string, type?: string, callback?: (err: ?Error) => void): void;
  declare function symlinkSync(srcpath: string, dstpath: string, type: string): void;
  declare function readlink(path: string, callback: (err: ?Error, linkString: string) => void): void;
  declare function readlinkSync(path: string): string;
  declare function realpath(path: string, cache?: Object, callback?: (err: ?Error, resolvedPath: string) => void): void;
  declare function realpathSync(path: string, cache?: Object): string;
  declare function unlink(path: string, callback?: (err: ?Error) => void): void;
  declare function unlinkSync(path: string): void;
  declare function rmdir(path: string, callback?: (err: ?Error) => void): void;
  declare function rmdirSync(path: string): void;
  declare function mkdir(path: string, mode?: number, callback?: (err: ?Error) => void): void;
  declare function mkdirSync(path: string, mode?: number): void;
  declare function readdir(path: string, callback?: (err: ?Error, files: Array<string>) => void): void;
  declare function readdirSync(path: string): Array<string>;
  declare function close(fd: number, callback?: (err: ?Error) => void): void;
  declare function closeSync(fd: number): void;
  declare function open(path: string, flags: string, mode?: number, callback?: (err: ?Error, fd: number) => void): void;
  declare function openSync(path: string, flags: string, mode?: number): number;
  declare function utimes(path: string, atime: number, mtime: number, callback?: (err: ?Error) => void): void;
  declare function utimesSync(path: string, atime: number, mtime: number): void;
  declare function futimes(fd: number, atime: number, mtime: number, callback?: (err: ?Error) => void): void;
  declare function futimesSync(fd: number, atime: number, mtime: number): void;
  declare function fsync(fd: number, callback?: (err: ?Error) => void): void;
  declare function fsyncSync(fd: number): void;
  declare var write: (fd: number, buffer: Buffer, offset: number, length: number, position?: mixed, callback?: (err: ?Error, write: number, str: string) => void) => void
                   | (fd: number, data: mixed, position?: mixed, encoding?: string, callback?: (err: ?Error, write: number, str: string) => void) => void;
  declare var writeSync: (fd: number, buffer: Buffer, offset: number, length: number, position?: number) => number
                       | (fd: number, data: mixed, position?: mixed, encoding?: string) => number;
  declare function read(
    fd: number,
    buffer: Buffer,
    offset: number,
    length: number,
    position: ?number,
    callback?: (err: ?Error, bytesRead: number, buffer: Buffer) => void
  ): void;
  declare function readSync(
    fd: number,
    buffer: Buffer,
    offset: number,
    length: number,
    position: number
  ): number;
  declare function readFile(
    filename: string,
    callback: (err: ?Error, data: Buffer) => void
  ): void;
  declare function readFile(
    filename: string,
    encoding: string,
    callback: (err: ?Error, data: string) => void
  ): void;
  declare function readFile(
    filename: string,
    options: { encoding: string; flag?: string },
    callback: (err: ?Error, data: string) => void
  ): void;
  declare function readFile(
    filename: string,
    options: { flag?: string },
    callback: (err: ?Error, data: Buffer) => void
  ): void;
  declare function readFileSync(filename: string): Buffer;
  declare function readFileSync(filename: string, encoding: string): string;
  declare function readFileSync(filename: string, options: { encoding: string, flag?: string }): string;
  declare function readFileSync(filename: string, options: { flag?: string }): Buffer;
  declare function writeFile(
    filename: string,
    data: Buffer | string,
    options?: Object | string,
    callback?: (err: ?Error) => void
  ): void;
  declare function writeFileSync(
    filename: string,
    data: Buffer | string,
    options?: Object | string
  ): void;
  declare function appendFile(filename: string, data: string | Buffer, options?: Object, callback?: (err: ?Error) => void): void;
  declare function appendFileSync(filename: string, data: string | Buffer, options?: Object): void;
  declare function watchFile(filename: string, options?: Object, listener?: (curr: Stats, prev: Stats) => void): void;
  declare function unwatchFile(filename: string, listener?: (curr: Stats, prev: Stats) => void): void;
  declare function watch(filename: string, options?: Object, listener?: (event: string, filename: string) => void): FSWatcher;
  declare function exists(path: string, callback?: (exists: boolean) => void): void;
  declare function existsSync(path: string): boolean;
  declare function access(path: string, mode?: any, callback?: (err: ?Error) => void): void;
  declare function accessSync(path: string, mode?: any): void;
  declare function createReadStream(path: string, options?: Object): ReadStream;
  declare function createWriteStream(path: string, options?: Object): WriteStream;


  declare function renameAsync(oldPath: string, newPath: string): Promise<void>;
  declare function ftruncateAsync(fd: number, len: number): Promise<void>;
  declare function truncateAsync(path: string, len: number): Promise<void>;
  declare function chownAsync(path: string, uid: number, gid: number): Promise<void>;
  declare function fchownAsync(fd: number, uid: number, gid: number): Promise<void>;
  declare function lchownAsync(path: string, uid: number, gid: number): Promise<void>;
  declare function chmodAsync(path: string, mode: number | string): Promise<void>;
  declare function fchmodAsync(fd: number, mode: number | string): Promise<void>;
  declare function lchmodAsync(path: string, mode: number | string): Promise<void>;
  declare function statAsync(path: string): Promise<Stats>;
  declare function fstatAsync(fd: number): Promise<Stats>;
  declare function lstatAsync(path: string): Promise<Stats>;
  declare function linkAsync(srcpath: string, dstpath: string): Promise<void>;
  declare function symlinkAsync(srcpath: string, dstpath: string, type: string): Promise<void>;
  declare function readlinkAsync(path: string): Promise<string>;
  declare function realpathAsync(path: string, cache?: Object): Promise<string>;
  declare function unlinkAsync(path: string): Promise<void>;
  declare function rmdirAsync(path: string): Promise<void>;
  declare function mkdirAsync(path: string, mode?: number): Promise<void>;
  declare function readdirAsync(path: string): Promise<string[]>;
  declare function closeAsync(fd: number): Promise<void>;
  declare function openAsync(path: string, flags: string, mode?: number): Promise<number>;
  declare function utimesAsync(path: string, atime: number, mtime: number): Promise<void>;
  declare function futimesAsync(fd: number, atime: number, mtime: number): Promise<void>;
  declare function fsyncAsync(fd: number): Promise<void>;

}


