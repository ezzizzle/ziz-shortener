import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export default class URLSequence {
  @PrimaryGeneratedColumn('increment')
  id!: number
}
