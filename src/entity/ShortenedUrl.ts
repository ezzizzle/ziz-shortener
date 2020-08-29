import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  UpdateDateColumn,
  JoinColumn,
  getRepository,
  AfterLoad,
  AfterInsert,
} from 'typeorm';
import IShortenedUrl from './IShortenedUrl';
import IURLLogEntry from './IUrlLogEntry';
import { generateUrlId } from '../urlIds';
import URLSequence from './URLSequence';
import { URLNotFoundException, DBException } from './Errors';

@Entity()
export default class ShortenedUrl implements IShortenedUrl {
  @PrimaryColumn()
  id!: string;

  @Column()
  original!: string;

  @CreateDateColumn()
  created!: Date;

  @UpdateDateColumn()
  lastAccessed!: Date;

  @OneToMany('URLLogEntry', 'url', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'urlId' })
  logEntries?: IURLLogEntry[];

  short!: string;

  @AfterLoad()
  @AfterInsert()
  getShort(): void {
    this.short = `${process.env.BASE_URL}/${this.id}`;
  }

  static async getForId(urlId: string): Promise<ShortenedUrl> {
    let shortenedUrl: ShortenedUrl | undefined;
    const urlRepository = getRepository(ShortenedUrl);
    try {
      shortenedUrl = await urlRepository.findOne(urlId);
    } catch (err) {
      throw new DBException(err);
    }

    if (shortenedUrl === undefined) {
      throw new URLNotFoundException(`No URL for ID: ${urlId}`);
    }

    return Object.assign(new ShortenedUrl(), shortenedUrl);
  }

  static async create(url: string): Promise<ShortenedUrl> {
    const urlSequence = await getRepository(URLSequence).save({});
    const newID = generateUrlId(urlSequence.id);

    const newUrl = {
      id: newID,
      original: url,
      short: `${process.env.BASE_URL}/${newID}`,
    };

    let shortenedUrl: ShortenedUrl;

    try {
      shortenedUrl = await getRepository(ShortenedUrl).save(newUrl);
    } catch (err) {
      throw new DBException(err);
    }

    return shortenedUrl;
  }

  static async delete(urlId: string): Promise<void> {
    await getRepository(ShortenedUrl)
      .createQueryBuilder()
      .delete()
      .where('id = :id', { id: urlId })
      .execute();
  }
}
