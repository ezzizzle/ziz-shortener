import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  OneToMany,
  UpdateDateColumn,
  JoinColumn,
} from 'typeorm';

import IShortenedUrl from './IShortenedUrl';
import IURLLogEntry from './IUrlLogEntry';

@Entity()
export default class ShortenedUrl implements IShortenedUrl {
  @PrimaryColumn()
  id!: string;

  @Column()
  original!: string;

  @Column()
  short!: string;

  @CreateDateColumn()
  created!: Date;

  @UpdateDateColumn()
  lastAccessed: Date | undefined;

  @OneToMany('URLLogEntry', 'url', {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'urlId' })
  logEntries?: IURLLogEntry[];
}
