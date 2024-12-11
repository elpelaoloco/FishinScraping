import { BaseRodHandlingException } from "./BaseRodHandlingException";
export class RodHandling extends BaseRodHandlingException {
    constructor(message: string) {
        super(message);
        this.name = "Rod Error";
        
    }
}