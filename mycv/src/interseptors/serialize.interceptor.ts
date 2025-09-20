import {
    UseInterceptors,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from "@nestjs/common";

import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { plainToClass } from "class-transformer";

interface ClassContructor {
    new (...args: any[]): {};
}

export function Serialize(dto: ClassContructor) {
    return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor implements NestInterceptor {
    constructor(private dto: any) {
    }

    intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
        console.log('Before the request is handled');
        // Run something before the request is handled by the next handler
        return handler.handle().pipe(
            map((data) => {
                return plainToClass(this.dto, data, {
                    excludeExtraneousValues: true,
                });
            })
        );
    }
}