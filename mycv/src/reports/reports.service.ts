import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateReportDto } from "./dtos/create-report.dto";
import { Report } from "./report.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../users/user.entity";
import { GetEstimateDto } from "./dtos/get-estimate.dto";

@Injectable()
export class ReportsService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}

  create(reportDto: CreateReportDto, user: User) {
    const report = this.repo.create(reportDto);

    report.user = user;

    return this.repo.save(report);
  }

  async changeApproval(id: string, approved: boolean) {
    const report = await this.repo.findOne({ where: { id: parseInt(id) } });

    if (!report) {
      throw new NotFoundException("Report not found");
    }

    report.approved = approved

    return this.repo.save(report);
  }

  getEstimate(estimateDto: GetEstimateDto) {
    return this.repo.createQueryBuilder()
    .select('AVG(price)', 'price')
    .where('make = :make', { make: estimateDto.make })
    .andWhere('model = :model', { model: estimateDto.model })
    .andWhere('year = :year BETWEEN -3 AND 3', { year: estimateDto.year })
    .andWhere('lng - :lng BETWEEN -5 AND 5', { lng: estimateDto.lng })
    .andWhere('lat - :lat BETWEEN -5 AND 5', { lat: estimateDto.lat })
    .orderBy('mileage - :mileage', 'DESC')
    .setParameters({ mileage: estimateDto.mileage })
    .limit(3)
    .getRawOne();
  }
}
