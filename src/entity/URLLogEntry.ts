import {
  Entity, Index, CreateDateColumn, ManyToOne, JoinColumn, PrimaryGeneratedColumn,
} from 'typeorm';

import IShortenedUrl from './IShortenedUrl';

@Entity()
@Index(['url', 'accessed'], { unique: true })
export default class URLLogEntry {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @CreateDateColumn()
  accessed!: Date;

  @ManyToOne('ShortenedUrl', 'logEntries')
  @JoinColumn([
    { name: 'urlId', referencedColumnName: 'id' },
  ])
  url!: IShortenedUrl;
}
