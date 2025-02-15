import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SnapshotArguments } from './entities';
import { Snapshot } from './schemas/snapshot.schema';
import { BalancesService } from './services/balances.service';
import { Balance } from './schemas/balance.schema';

@Injectable()
export class SnapshotsService {
  constructor(
    @InjectModel('Snapshot') private readonly snapshotModel: Model<Snapshot>,
    private readonly balancesService: BalancesService,
  ) {}

  async create(snapshotArguments: SnapshotArguments): Promise<Snapshot> {
    const createdSnapshot = new this.snapshotModel(snapshotArguments);
    return createdSnapshot.save();
  }

  async findAll(): Promise<Snapshot[]> {
    return this.snapshotModel.find().exec();
  }

  async findOne(id: string): Promise<Snapshot> {
    return this.snapshotModel.findById(id).exec();
  }

  async findLatest(tokenAddress: string, network: string): Promise<Snapshot> {
    return this.snapshotModel
      .findOne({ tokenAddress, network })
      .sort({ blockNumber: -1 })
      .exec();
  }

  async update(id: string, Snapshot: Snapshot): Promise<Snapshot> {
    return this.snapshotModel
      .findByIdAndUpdate(id, Snapshot, { new: true })
      .exec();
  }

  async delete(id: string): Promise<Snapshot> {
    return this.snapshotModel.findByIdAndDelete(id).exec();
  }

  async getLatestBalances(
    tokenAddress: string,
    network: string,
  ): Promise<Balance[]> {
    const latestSnapshot = await this.findLatest(tokenAddress, network);
    if (!latestSnapshot) {
      throw new Error(
        `No snapshot found for tokenAddress: ${tokenAddress} and network: ${network}`,
      );
    }
    return this.balancesService.getBalancesBySnapshot(
      latestSnapshot._id.toString(),
    );
  }
}
