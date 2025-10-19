import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'isRolesArray', async: false })
export class IsRolesArray implements ValidatorConstraintInterface {
  validate(value: string, _: ValidationArguments) {
    try {
      const parsed = JSON.parse(value);
      if (!Array.isArray(parsed)) return false;
      if (parsed.length === 0) return false;
      return parsed.every((item: any) => {
        return typeof item === 'string';
      });
    } catch (e) {
      return false;
    }
  }

  defaultMessage(args: ValidationArguments) {
    return 'roles must be a array of string.';
  }
}
